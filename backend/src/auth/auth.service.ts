import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { User } from '@/users/entities/user.entity';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // Called by LocalStrategy
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const valid = await this.usersService.validatePassword(user, password);
    return valid ? user : null;
  }

  // Called by JwtRefreshStrategy
  async validateRefreshToken(userId: string, token: string): Promise<User | null> {
    const valid = await this.usersService.verifyRefreshTokenHash(userId, token);
    if (!valid) return null;
    return this.usersService.findById(userId);
  }

  async register(dto: RegisterDto): Promise<{ message: string }> {
    await this.usersService.create({
      firstName: dto.first_name,
      lastName:  dto.last_name,
      email:     dto.email,
      password:  dto.password,
    });
    return { message: 'Registration successful.' };
  }

  async login(user: User) {
    const tokens = await this.generateTokens(user);
    await this.usersService.setRefreshTokenHash(user.id, tokens.refresh_token);
    return {
      ...tokens,
      user: this.serializeUser(user),
    };
  }

  async refresh(user: User) {
    const tokens = await this.generateTokens(user);
    // Rotate: invalidate old hash, store new one
    await this.usersService.setRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.usersService.clearRefreshToken(userId);
    return { message: 'Logged out successfully.' };
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private async generateTokens(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret:    this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret:    this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '24h'),
      }),
    ]);

    return { access_token, refresh_token };
  }

  private serializeUser(user: User) {
    return {
      id:         user.id,
      first_name: user.firstName,
      last_name:  user.lastName,
      email:      user.email,
      avatar_url: user.avatarUrl ?? null,
    };
  }
}
