import {
  Injectable, ConflictException, NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { User } from './entities/user.entity';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) {}

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<User> {
    const existing = await this.usersRepo.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already in use.');

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    return this.usersRepo.create({
      firstName: data.firstName,
      lastName:  data.lastName,
      email:     data.email,
      passwordHash,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findByEmail(email);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async setRefreshTokenHash(userId: string, refreshToken: string): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await this.usersRepo.updateRefreshTokenHash(userId, hash);
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.usersRepo.updateRefreshTokenHash(userId, null);
  }

  async verifyRefreshTokenHash(userId: string, token: string): Promise<boolean> {
    const user = await this.usersRepo.findById(userId);
    if (!user?.refreshTokenHash) return false;
    return bcrypt.compare(token, user.refreshTokenHash);
  }
}
