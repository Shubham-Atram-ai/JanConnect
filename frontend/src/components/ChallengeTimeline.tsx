
import { CheckCircle, Circle, Clock, Loader } from 'lucide-react';

interface TimelineStep {
  id: string;
  label: string;
  description: string;
  status: 'done' | 'current' | 'upcoming';
  timestamp?: string;
}

interface ChallengeTimelineProps {
  auditLogs?: Array<{ action: string; createdAt: string }>;
  status: 'DRAFT' | 'SUBMITTED' | 'WITHDRAWN';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ChallengeTimeline({ auditLogs = [], status }: ChallengeTimelineProps) {
  const findLog = (action: string) => auditLogs.find((l) => l.action === action);

  const steps: TimelineStep[] = [
    {
      id: 'created',
      label: 'Problem created',
      description: 'Challenge draft created',
      status: findLog('CHALLENGE_CREATED') ? 'done' : status === 'DRAFT' ? 'current' : 'done',
      timestamp: findLog('CHALLENGE_CREATED')?.createdAt,
    },
    {
      id: 'analyzed',
      label: 'AI analysis completed',
      description: 'Problem structured by AI',
      status: findLog('AI_ANALYSIS_CREATED') ? 'done' : status === 'SUBMITTED' ? 'done' : 'upcoming',
      timestamp: findLog('AI_ANALYSIS_CREATED')?.createdAt,
    },
    {
      id: 'submitted',
      label: 'Problem submitted',
      description: 'Submitted for university matching',
      status: status === 'SUBMITTED' ? 'done' : status === 'WITHDRAWN' ? 'upcoming' : 'upcoming',
      timestamp: findLog('CHALLENGE_SUBMITTED')?.createdAt,
    },
    {
      id: 'matching',
      label: 'AI university matching',
      description: 'Finding the best universities — Phase 3',
      status: 'upcoming',
    },
    {
      id: 'responses',
      label: 'University responses',
      description: 'Universities review your problem — Phase 4',
      status: 'upcoming',
    },
    {
      id: 'solutions',
      label: 'Research solutions',
      description: 'Teams propose solutions — Phase 5',
      status: 'upcoming',
    },
  ];

  return (
    <div className="space-y-0">
      {steps.map((step, idx) => (
        <div key={step.id} className="flex gap-4">
          {/* Icon column */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
              step.status === 'done'
                ? 'bg-green-500/20 border-2 border-green-500/60'
                : step.status === 'current'
                ? 'bg-blue-500/20 border-2 border-blue-500/60'
                : 'bg-slate-800/50 border-2 border-slate-700/50'
            }`}>
              {step.status === 'done' ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : step.status === 'current' ? (
                <Loader className="w-4 h-4 text-blue-400 animate-spin" />
              ) : (
                <Circle className="w-4 h-4 text-slate-600" />
              )}
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-0.5 h-full mt-1 ${
                step.status === 'done' ? 'bg-green-500/30' : 'bg-slate-700/40'
              }`} style={{ minHeight: '2rem' }} />
            )}
          </div>

          {/* Content */}
          <div className="pb-6 flex-1 min-w-0">
            <p className={`text-sm font-medium ${
              step.status === 'done' ? 'text-white' :
              step.status === 'current' ? 'text-blue-300' : 'text-slate-500'
            }`}>
              {step.label}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
            {step.timestamp && (
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatDate(step.timestamp)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
