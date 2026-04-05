import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface CloudinarySignResponse {
  cloud_name:  string;
  api_key:     string;
  timestamp:   number;
  signature:   string;
  folder:      string;
  upload_url:  string;
}

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {}

  generateSignedUploadConfig(): CloudinarySignResponse {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey    = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    const folder    = this.config.get<string>(
      'CLOUDINARY_UPLOAD_FOLDER',
      'appifylab-social/posts',
    );

    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      );
    }

    // Short-lived timestamp — Cloudinary rejects signatures older than 1 hour
    const timestamp = Math.round(Date.now() / 1000);

    // Params MUST be sorted alphabetically before signing
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature    = crypto
      .createHash('sha256')
      .update(paramsToSign + apiSecret)
      .digest('hex');

    return {
      cloud_name: cloudName,
      api_key:    apiKey,   // public key — safe to expose
      timestamp,
      signature,            // derived from secret — safe to expose
      folder,
      upload_url: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    };
    // NOTE: api_secret is NEVER included in this response
  }
}
