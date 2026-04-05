import {
  Controller, Post, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,
} from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('cloudinary')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * POST /api/cloudinary/sign
   *
   * Generates a short-lived signed upload config for the client.
   * The API secret NEVER leaves the server.
   *
   * Flow:
   *   1. Client calls this endpoint (authenticated)
   *   2. Server returns { timestamp, signature, api_key, cloud_name, upload_url }
   *   3. Client uploads directly to Cloudinary using these params
   *   4. Cloudinary returns { secure_url }
   *   5. Client sends secure_url to POST /api/posts as image_url
   */
  @Post('sign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a short-lived Cloudinary upload signature',
    description:
      'Returns a signed upload configuration. The client uses this to upload ' +
      'directly to Cloudinary. The API secret never leaves this server.',
  })
  @ApiResponse({
    status: 200,
    description: 'Signed upload config.',
    schema: {
      example: {
        data: {
          cloud_name: 'your_cloud_name',
          api_key:    '123456789012345',
          timestamp:  1712000000,
          signature:  'a1b2c3d4e5f6...',
          folder:     'appifylab-social/posts',
          upload_url: 'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
        },
      },
    },
  })
  @ApiResponse({ status: 503, description: 'Cloudinary not configured.' })
  sign() {
    return this.cloudinaryService.generateSignedUploadConfig();
  }
}
