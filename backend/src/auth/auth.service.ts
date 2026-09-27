import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private db: PrismaService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };

    // JWT module is configured with secret and expiresIn at registration time
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
      },
    };
  }

  async refresh(rawRefreshToken: string) {
    const tokenHash = this.hashToken(rawRefreshToken);

    const stored = await this.db.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      // Delete expired token if found
      if (stored) {
        await this.db.refreshToken.delete({ where: { id: stored.id } });
      }
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    // Rotate: delete old, issue new
    await this.db.refreshToken.delete({ where: { id: stored.id } });

    const user = stored.user;
    const payload = { email: user.email, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload);

    const newRefreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        preferredLanguage: user.preferredLanguage,
      },
    };
  }

  async logout(rawRefreshToken: string): Promise<void> {
    if (!rawRefreshToken) return;
    const tokenHash = this.hashToken(rawRefreshToken);
    await this.db.refreshToken
      .delete({ where: { tokenHash } })
      .catch(() => {/* Token may not exist — ignore */});
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const raw = crypto.randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(raw);

    const expiresAt = new Date();
    const days = parseInt(process.env.JWT_REFRESH_TTL_DAYS || '7', 10);
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.db.refreshToken.create({
      data: { tokenHash, userId, expiresAt },
    });

    return raw;
  }

  private hashToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }
}
