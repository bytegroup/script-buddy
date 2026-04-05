import {
  Controller, Get, Post, Delete, Body,
  Param, UseGuards, HttpCode, HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
  ApiResponse, ApiParam,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';

@ApiTags('comments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // GET /api/posts/:postId/comments
  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'Get all comments (with nested replies) for a post' })
  @ApiParam({ name: 'postId', type: 'string' })
  @ApiResponse({ status: 200, description: 'List of comments with replies.' })
  getComments(
    @CurrentUser() user: User,
    @Param('postId', ParseUUIDPipe) postId: string,
  ) {
    return this.commentsService.getComments(postId, user.id);
  }

  // POST /api/posts/:postId/comments
  @Post('posts/:postId/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to a post (text only)' })
  @ApiParam({ name: 'postId', type: 'string' })
  @ApiResponse({ status: 201, description: 'Comment created.' })
  createComment(
    @CurrentUser() user: User,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(user.id, postId, dto);
  }

  // POST /api/comments/:id/like
  @Post('comments/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a comment' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Comment liked.' })
  @ApiResponse({ status: 409, description: 'Already liked.' })
  likeComment(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.commentsService.likeComment(user.id, id);
  }

  // DELETE /api/comments/:id/like
  @Delete('comments/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlike a comment' })
  @ApiParam({ name: 'id', type: 'string' })
  unlikeComment(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.commentsService.unlikeComment(user.id, id);
  }

  // GET /api/comments/:id/likes
  @Get('comments/:id/likes')
  @ApiOperation({ summary: 'Get users who liked a comment' })
  @ApiParam({ name: 'id', type: 'string' })
  getLikers(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.getLikers(id);
  }
}
