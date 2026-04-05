import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsString, MinLength, MaxLength, IsOptional} from 'class-validator';
import { Transform } from 'class-transformer';
import {UUID} from "node:crypto";

export class CreateCommentDto {
  @ApiPropertyOptional({ example: '00000001-0000-0000-0000-000000000002' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || null)
  user_id?: string | UUID;

  @ApiProperty({ example: 'Great work!', minLength: 1, maxLength: 2000 })
  @IsString()
  @MinLength(1, { message: 'Comment cannot be empty.' })
  @MaxLength(2000)
  @Transform(({ value }) => value?.trim())
  content: string;
}
