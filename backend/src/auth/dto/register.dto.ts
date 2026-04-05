import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  last_name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({ example: 'secret123', minLength: 4 })
  @IsString()
  @MinLength(4)
  @MaxLength(128)
  password: string;
}
