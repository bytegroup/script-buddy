import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUrl, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import {UUID} from "node:crypto";

export enum PostVisibility {
  PUBLIC  = 'public',
  PRIVATE = 'private',
}

export class CreatePostDto {
  @ApiPropertyOptional({ example: '00000001-0000-0000-0000-000000000002' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || null)
  user_id?: string | UUID;

  @ApiPropertyOptional({ example: 'Just shipped a new feature! 🚀' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || null)
  content?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' })
  @IsOptional()
  @IsUrl()
  image_url?: string;

  @ApiProperty({ enum: PostVisibility, default: PostVisibility.PUBLIC })
  @IsEnum(PostVisibility)
  visibility: PostVisibility | undefined;

  // Cross-field validation handled in service
  // (content OR image_url must be present)
}
