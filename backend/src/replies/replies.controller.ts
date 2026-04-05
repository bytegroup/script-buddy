import {
  Controller, Post, Delete, Get, Body,
  Param, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
  ApiResponse, ApiParam,
} from '@nestjs/swagger';
import { RepliesService } from './replies.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';

@ApiTags('replies')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class RepliesController {
  constructor(private readonly repliesService: RepliesService) {}

  // POST /api/comments/:commentId/replies
  @Post('comments/:commentId/replies')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a reply to a comment (text only)' })
  @ApiParam({ name: 'commentId', type: 'string' })
  @ApiResponse({ status: 201, description: 'Reply created.' })
  createReply(
    @CurrentUser() user: User,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: CreateReplyDto,
  ) {
    return this.repliesService.createReply(user.id, commentId, dto);
  }

  // POST /api/replies/:id/like
  @Post('replies/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a reply' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Reply liked.' })
  @ApiResponse({ status: 409, description: 'Already liked.' })
  likeReply(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.repliesService.likeReply(user.id, id);
  }

  // DELETE /api/replies/:id/like
  @Delete('replies/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlike a reply' })
  @ApiParam({ name: 'id', type: 'string' })
  unlikeReply(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.repliesService.unlikeReply(user.id, id);
  }

  // GET /api/replies/:id/likes
  @Get('replies/:id/likes')
  @ApiOperation({ summary: 'Get users who liked a reply' })
  @ApiParam({ name: 'id', type: 'string' })
  getLikers(@Param('id', ParseUUIDPipe) id: string) {
    return this.repliesService.getLikers(id);
  }
}
