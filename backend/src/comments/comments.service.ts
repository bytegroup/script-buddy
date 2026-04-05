import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { PostsService } from '@/posts/posts.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { Reply } from '@/replies/entities/reply.entity';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepo: CommentsRepository,
    private readonly postsService: PostsService,
  ) {}

  async getComments(postId: string, currentUserId: string) {
    // Validates post exists and user can view it
    await this.postsService.getPostOrFail(postId, currentUserId);

    const comments = await this.commentsRepo.findByPostId(postId, currentUserId);
    return comments.map((c) => this.serializeComment(c, currentUserId));
  }

  async createComment(
    userId: string,
    postId: string,
    dto: CreateCommentDto,
  ) {
    // Validate post is accessible
    await this.postsService.getPostOrFail(postId, userId);

    const comment = await this.commentsRepo.create({
      content: dto.content,
      postId,
      userId,
    });

    // Increment denormalized counter atomically
    await this.postsService.incrementCommentsCount(postId);

    return this.serializeComment(comment, userId);
  }

  async likeComment(userId: string, commentId: string) {
    const comment = await this.commentsRepo.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found.');

    const existing = await this.commentsRepo.findLike(userId, commentId);
    if (existing) throw new ConflictException('Already liked.');

    await this.commentsRepo.addLike(userId, commentId);
    return { liked: true, likes_count: comment.likesCount + 1 };
  }

  async unlikeComment(userId: string, commentId: string) {
    const comment = await this.commentsRepo.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found.');

    const existing = await this.commentsRepo.findLike(userId, commentId);
    if (!existing) throw new ConflictException('Not liked yet.');

    await this.commentsRepo.removeLike(userId, commentId);
    return { liked: false, likes_count: Math.max(0, comment.likesCount - 1) };
  }

  async getLikers(commentId: string) {
    const comment = await this.commentsRepo.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found.');

    const likes = await this.commentsRepo.findLikers(commentId);
    return likes.map((l) => ({
      id:         l.user.id,
      first_name: l.user.firstName,
      last_name:  l.user.lastName,
      avatar_url: l.user.avatarUrl ?? null,
    }));
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  serializeComment(comment: Comment, currentUserId: string) {
    const likedByMe = Array.isArray(comment.likes)
      ? comment.likes.some((l) => l.userId === currentUserId)
      : false;

    return {
      id:          comment.id,
      post_id:     comment.postId,
      content:     comment.content,
      likes_count: comment.likesCount,
      liked_by_me: likedByMe,
      created_at:  comment.createdAt,
      author: comment.author ? {
        id:         comment.author.id,
        first_name: comment.author.firstName,
        last_name:  comment.author.lastName,
        avatar_url: comment.author.avatarUrl ?? null,
      } : null,
      replies: (comment.replies ?? []).map((r) =>
        this.serializeReply(r, currentUserId),
      ),
    };
  }

  private serializeReply(reply: Reply, currentUserId: string) {
    const likedByMe = Array.isArray(reply.likes)
      ? reply.likes.some((l) => l.userId === currentUserId)
      : false;

    return {
      id:          reply.id,
      comment_id:  reply.commentId,
      content:     reply.content,
      likes_count: reply.likesCount,
      liked_by_me: likedByMe,
      created_at:  reply.createdAt,
      author: reply.author ? {
        id:         reply.author.id,
        first_name: reply.author.firstName,
        last_name:  reply.author.lastName,
        avatar_url: reply.author.avatarUrl ?? null,
      } : null,
    };
  }
}
