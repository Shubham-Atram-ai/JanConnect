import { University, Faculty, Facility, UniversityProject } from '@prisma/client';

export const MATCH_WEIGHTS = {
  domain: 0.30,
  expertise: 0.20,
  skills: 0.15,
  facilities: 0.15,
  previousProjects: 0.10,
  geography: 0.05,
  capacity: 0.05,
};

export const MIN_MATCH_SCORE = 50;

export interface ChallengeRequirements {
  domain: string | null;
  subdomain: string | null;
  requiredSkills: string[];
  tags: string[];
  state: string | null;
  district: string | null;
}

export interface UniversityCapability {
  university: University;
  faculties: Faculty[];
  facilities: Facility[];
  projects: UniversityProject[];
}

export interface MatchBreakdown {
  domain: number;
  expertise: number;
  skills: number;
  facilities: number;
  previousProjects: number;
  geography: number;
  capacity: number;
}

export interface MatchResult {
  universityId: string;
  totalScore: number;
  breakdown: MatchBreakdown;
  explanation: string;
}

export class MatchingScorer {
  calculateScore(
    requirements: ChallengeRequirements,
    capability: UniversityCapability,
  ): MatchResult {
    const bDomain = this.scoreDomain(requirements, capability);
    const bExpertise = this.scoreExpertise(requirements, capability);
    const bSkills = this.scoreSkills(requirements, capability);
    const bFacilities = this.scoreFacilities(requirements, capability);
    const bProjects = this.scoreProjects(requirements, capability);
    const bGeography = this.scoreGeography(requirements, capability);
    const bCapacity = this.scoreCapacity(capability);

    const totalScore = Math.round(
      bDomain * MATCH_WEIGHTS.domain +
      bExpertise * MATCH_WEIGHTS.expertise +
      bSkills * MATCH_WEIGHTS.skills +
      bFacilities * MATCH_WEIGHTS.facilities +
      bProjects * MATCH_WEIGHTS.previousProjects +
      bGeography * MATCH_WEIGHTS.geography +
      bCapacity * MATCH_WEIGHTS.capacity
    );

    const breakdown: MatchBreakdown = {
      domain: Math.round(bDomain),
      expertise: Math.round(bExpertise),
      skills: Math.round(bSkills),
      facilities: Math.round(bFacilities),
      previousProjects: Math.round(bProjects),
      geography: Math.round(bGeography),
      capacity: Math.round(bCapacity),
    };

    const explanation = this.generateExplanation(breakdown, capability, requirements);

    return {
      universityId: capability.university.id,
      totalScore,
      breakdown,
      explanation,
    };
  }

  private scoreDomain(req: ChallengeRequirements, cap: UniversityCapability): number {
    if (!req.domain) return 50; // Neutral if no domain specified
    
    // Check if university strength domains include the challenge domain
    const hasMainDomain = cap.university.strengthDomains.some(d => d.toLowerCase() === req.domain?.toLowerCase());
    if (hasMainDomain) return 100;

    // Check faculties for domains
    const facultyMatch = cap.faculties.some(f => f.domains.some(d => d.toLowerCase() === req.domain?.toLowerCase()));
    if (facultyMatch) return 80;

    // Check facilities for domains
    const facilityMatch = cap.facilities.some(f => f.domains.some(d => d.toLowerCase() === req.domain?.toLowerCase()));
    if (facilityMatch) return 70;

    return 0;
  }

  private scoreExpertise(req: ChallengeRequirements, cap: UniversityCapability): number {
    if (!req.requiredSkills || req.requiredSkills.length === 0) return 50;

    const matchedFaculty = cap.faculties.filter(f => 
      f.researchAreas.some(area => 
        req.requiredSkills.some(skill => area.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(area.toLowerCase()))
      )
    );

    if (matchedFaculty.length >= 3) return 100;
    if (matchedFaculty.length > 0) return 60 + (matchedFaculty.length * 10);
    
    return 0;
  }

  private scoreSkills(req: ChallengeRequirements, cap: UniversityCapability): number {
    if (!req.requiredSkills || req.requiredSkills.length === 0) return 50;
    
    let matchedSkills = 0;
    for (const skill of req.requiredSkills) {
      const found = cap.faculties.some(f => f.skills.some(s => s.toLowerCase() === skill.toLowerCase()));
      if (found) matchedSkills++;
    }

    const percentage = matchedSkills / req.requiredSkills.length;
    return percentage * 100;
  }

  private scoreFacilities(req: ChallengeRequirements, cap: UniversityCapability): number {
    if (cap.facilities.length === 0) return 0;
    
    // Simple heuristic: if any facility matches domain or skills
    let matchScore = 20; // Base score for having facilities
    
    const domainMatch = cap.facilities.some(f => 
      (req.domain && f.domains.some(d => d.toLowerCase() === req.domain?.toLowerCase())) ||
      (req.subdomain && f.domains.some(d => d.toLowerCase() === req.subdomain?.toLowerCase()))
    );

    if (domainMatch) matchScore += 50;

    const skillMatch = cap.facilities.some(f => 
      req.requiredSkills.some(skill => f.capabilities.some(c => c.toLowerCase().includes(skill.toLowerCase())))
    );

    if (skillMatch) matchScore += 30;

    return Math.min(matchScore, 100);
  }

  private scoreProjects(req: ChallengeRequirements, cap: UniversityCapability): number {
    if (cap.projects.length === 0) return 0;

    let relevantProjects = 0;
    for (const p of cap.projects) {
      const matchesDomain = req.domain && p.domains.some(d => d.toLowerCase() === req.domain?.toLowerCase());
      const matchesTags = req.tags.some(tag => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
      const matchesSkills = req.requiredSkills.some(skill => p.skills.some(s => s.toLowerCase() === skill.toLowerCase()));

      if (matchesDomain || matchesTags || matchesSkills) {
        relevantProjects++;
      }
    }

    if (relevantProjects >= 3) return 100;
    if (relevantProjects > 0) return 50 + (relevantProjects * 15);
    return 20; // Base score for having projects
  }

  private scoreGeography(req: ChallengeRequirements, cap: UniversityCapability): number {
    if (!req.state && !req.district) return 50; // Neutral

    let score = 0;
    if (req.state && cap.university.state?.toLowerCase() === req.state.toLowerCase()) {
      score += 50;
    }
    if (req.district && cap.university.district?.toLowerCase() === req.district.toLowerCase()) {
      score += 50;
    }
    
    // Return max 100. Or 0 if entirely different state.
    return score;
  }

  private scoreCapacity(cap: UniversityCapability): number {
    // If activeAssignments < capacity, good.
    const capacity = cap.university.capacity || 10; // Default capacity to 10 if 0
    const active = cap.university.activeAssignments || 0;
    
    if (active >= capacity) return 0; // At or over capacity
    
    const utilization = active / capacity;
    if (utilization < 0.5) return 100;
    if (utilization < 0.8) return 80;
    return 50;
  }

  private generateExplanation(breakdown: MatchBreakdown, cap: UniversityCapability, req: ChallengeRequirements): string {
    const reasons: string[] = [];
    
    if (breakdown.domain >= 80) {
      reasons.push(`• Strong ${req.domain} domain expertise.`);
    }

    if (breakdown.expertise >= 70) {
      const relevantFacultyCount = cap.faculties.filter(f => 
        f.researchAreas.some(area => 
          req.requiredSkills.some(skill => area.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(area.toLowerCase()))
        )
      ).length;
      reasons.push(`• ${relevantFacultyCount} faculty members have relevant expertise.`);
    }

    if (breakdown.facilities >= 70) {
      const relevantFacility = cap.facilities.find(f => 
        (req.domain && f.domains.some(d => d.toLowerCase() === req.domain?.toLowerCase())) ||
        req.requiredSkills.some(skill => f.capabilities.some(c => c.toLowerCase().includes(skill.toLowerCase())))
      );
      if (relevantFacility) {
        reasons.push(`• Relevant facility: ${relevantFacility.name}.`);
      }
    }

    if (breakdown.previousProjects >= 50) {
      const relevantProjectsCount = cap.projects.filter(p => 
        (req.domain && p.domains.some(d => d.toLowerCase() === req.domain?.toLowerCase())) ||
        req.tags.some(tag => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
      ).length;
      if (relevantProjectsCount > 0) {
        reasons.push(`• ${relevantProjectsCount} previous projects related to the problem scope.`);
      }
    }

    if (breakdown.geography >= 50) {
      reasons.push(`• Geographically relevant to the problem area.`);
    }

    if (breakdown.capacity >= 50) {
      reasons.push(`• Existing capacity available to take on this challenge.`);
    }

    if (reasons.length === 0) {
      reasons.push(`• Meets baseline matching criteria for the challenge.`);
    }

    return `Why this university?\n\n${reasons.join('\n')}`;
  }
}
