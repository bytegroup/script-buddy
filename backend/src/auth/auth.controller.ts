import {
  Controller, Post, Body, UseGuards,
  HttpCode, HttpStatus, Get,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── POST /api/auth/register ─────────────────────────────────────────────────
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  @ApiResponse({ status: 422, description: 'Validation failed.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ── POST /api/auth/login ────────────────────────────────────────────────────
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive JWT tokens' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  login(@CurrentUser() user: User) {
    return this.authService.login(user);
  }

  // ── POST /api/auth/refresh ──────────────────────────────────────────────────
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate access and refresh tokens' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'New token pair issued.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token.' })
  refresh(@CurrentUser() user: User) {
    return this.authService.refresh(user);
  }

  // ── POST /api/auth/logout ───────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout — invalidates refresh token on server' })
  @ApiResponse({ status: 200, description: 'Logged out.' })
  logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }

  // ── GET /api/auth/me ────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile.' })
  me(@CurrentUser() user: User) {
    return {
      id:         user.id,
      first_name: user.firstName,
      last_name:  user.lastName,
      email:      user.email,
      avatar_url: user.avatarUrl ?? null,
      created_at: user.createdAt,
    };
  }
}
