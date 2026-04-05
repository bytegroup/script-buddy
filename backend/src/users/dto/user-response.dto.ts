import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-123' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'John' })
  @Expose()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @Expose()
  lastName: string;

  @ApiProperty({ example: 'john@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/...', nullable: true })
  @Expose()
  avatarUrl: string | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
