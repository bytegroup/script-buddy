import {
  Injectable, NotFoundException,
  ConflictException, BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepo: PostsRepository) {}

  async getFeed(currentUserId: string, query: PostQueryDto) {
    const { posts, hasNextPage } = await this.postsRepo.findFeed(
      currentUserId,
      query.limit,
      query.cursor,
    );

    const data = posts.map((p) => this.serializePost(p, currentUserId));

    return {
      data,
      total: data.length,
      hasNextPage,
      limit: query.limit,
    };
  }

  async createPost(userId: string, dto: CreatePostDto): Promise<object> {
    if (!dto.content?.trim() && !dto.image_url) {
      throw new BadRequestException('Post must have text content or an image.');
    }

    const post = await this.postsRepo.create({
      content:    dto.content?.trim() || null,
      imageUrl:   dto.image_url || null,
      visibility: dto.visibility,
      userId,
    });

    const full = await this.postsRepo.findById(post.id);
    return this.serializePost(full!, userId);
  }

  async likePost(userId: string, postId: string) {
    const post = await this.postsRepo.findById(postId);
    if (!post) throw new NotFoundException('Post not found.');
    if (!this.canView(post, userId)) throw new ForbiddenException();

    const existing = await this.postsRepo.findLike(userId, postId);
    if (existing) throw new ConflictException('Already liked.');

    await this.postsRepo.addLike(userId, postId);
    return { liked: true, likes_count: post.likesCount + 1 };
  }

  async unlikePost(userId: string, postId: string) {
    const post = await this.postsRepo.findById(postId);
    if (!post) throw new NotFoundException('Post not found.');

    const existing = await this.postsRepo.findLike(userId, postId);
    if (!existing) throw new ConflictException('Not liked yet.');

    await this.postsRepo.removeLike(userId, postId);
    return { liked: false, likes_count: Math.max(0, post.likesCount - 1) };
  }

  async getLikers(postId: string, currentUserId: string) {
    const post = await this.postsRepo.findById(postId);
    if (!post) throw new NotFoundException('Post not found.');
    if (!this.canView(post, currentUserId)) throw new ForbiddenException();

    const likes = await this.postsRepo.findLikers(postId);
    return likes.map((l) => ({
      id:         l.user.id,
      first_name: l.user.firstName,
      last_name:  l.user.lastName,
      avatar_url: l.user.avatarUrl ?? null,
    }));
  }

  async getPostOrFail(postId: string, currentUserId: string): Promise<Post> {
    const post = await this.postsRepo.findById(postId);
    if (!post) throw new NotFoundException('Post not found.');
    if (!this.canView(post, currentUserId)) throw new ForbiddenException();
    return post;
  }

  async incrementCommentsCount(postId: string): Promise<void> {
    await this.postsRepo.incrementCommentsCount(postId);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private canView(post: Post, userId: string): boolean {
    return post.visibility === 'public' || post.userId === userId;
  }

  private serializePost(post: Post, currentUserId: string) {
    const likedByMe = Array.isArray(post.likes)
      ? post.likes.some((l) => l.userId === currentUserId)
      : false;

    return {
      id:             post.id,
      content:        post.content,
      image_url:      post.imageUrl,
      visibility:     post.visibility,
      likes_count:    post.likesCount,
      comments_count: post.commentsCount,
      liked_by_me:    likedByMe,
      created_at:     post.createdAt,
      updated_at:     post.updatedAt,
      author: post.author ? {
        id:         post.author.id,
        first_name: post.author.firstName,
        last_name:  post.author.lastName,
        avatar_url: post.author.avatarUrl ?? null,
      } : null,
    };
  }
}
