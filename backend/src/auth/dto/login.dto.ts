import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(4)
  password: string;
}
