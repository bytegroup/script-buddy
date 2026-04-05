import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great work!', minLength: 1, maxLength: 2000 })
  @IsString()
  @MinLength(1, { message: 'Comment cannot be empty.' })
  @MaxLength(2000)
  @Transform(({ value }) => value?.trim())
  content: string;
}
