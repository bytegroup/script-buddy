import { ApiProperty } from '@nestjs/swagger';

class AuthUserDto {
  @ApiProperty() id: string;
  @ApiProperty() first_name: string;
  @ApiProperty() last_name: string;
  @ApiProperty() email: string;
  @ApiProperty({ nullable: true }) avatar_url: string | null;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token (15 min)' })
  access_token: string;

  @ApiProperty({ description: 'Refresh token (24 h)' })
  refresh_token: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
