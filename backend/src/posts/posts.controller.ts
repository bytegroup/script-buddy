import {
  Controller, Get, Post, Body, Param, Delete,
  UseGuards, Query, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';

@ApiTags('posts')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // GET /api/posts
  @Get()
  @ApiOperation({ summary: 'Get paginated feed (cursor-based, newest first)' })
  @ApiResponse({ status: 200, description: 'Paginated list of posts.' })
  getFeed(@CurrentUser() user: User, @Query() query: PostQueryDto) {
    return this.postsService.getFeed(user.id, query);
  }

  // POST /api/posts
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new post (text and/or image)' })
  @ApiResponse({ status: 201, description: 'Post created.' })
  @ApiResponse({ status: 400, description: 'Content or image required.' })
  createPost(@CurrentUser() user: User, @Body() dto: CreatePostDto) {
    return this.postsService.createPost(user.id, dto);
  }

  // POST /api/posts/:id/like
  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like a post' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Post liked.' })
  @ApiResponse({ status: 409, description: 'Already liked.' })
  likePost(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.postsService.likePost(user.id, id);
  }

  // DELETE /api/posts/:id/like
  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: 200, description: 'Post unliked.' })
  unlikePost(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.postsService.unlikePost(user.id, id);
  }

  // GET /api/posts/:id/likes
  @Get(':id/likes')
  @ApiOperation({ summary: 'Get list of users who liked a post' })
  @ApiParam({ name: 'id', type: 'string' })
  getLikers(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.postsService.getLikers(id, user.id);
  }
}
