import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUrl, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export enum PostVisibility {
  PUBLIC  = 'public',
  PRIVATE = 'private',
}

export class CreatePostDto {
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
  visibility: PostVisibility;

  // Cross-field validation handled in service
  // (content OR image_url must be present)
}
