import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { RepliesRepository } from './replies.repository';
import { CommentsService } from '@/comments/comments.service';
import { CreateReplyDto } from './dto/create-reply.dto';

@Injectable()
export class RepliesService {
  constructor(
    private readonly repliesRepo: RepliesRepository,
    private readonly commentsService: CommentsService,
  ) {}

  async createReply(userId: string, commentId: string, dto: CreateReplyDto) {
    // Validate comment exists
    const reply = await this.repliesRepo.create({
      content: dto.content,
      commentId,
      userId,
    });
    if (!reply) throw new NotFoundException('Comment not found.');

    return {
      id:          reply.id,
      comment_id:  reply.commentId,
      content:     reply.content,
      likes_count: reply.likesCount,
      liked_by_me: false,
      created_at:  reply.createdAt,
      author: reply.author ? {
        id:         reply.author.id,
        first_name: reply.author.firstName,
        last_name:  reply.author.lastName,
        avatar_url: reply.author.avatarUrl ?? null,
      } : null,
    };
  }

  async likeReply(userId: string, replyId: string) {
    const reply = await this.repliesRepo.findById(replyId);
    if (!reply) throw new NotFoundException('Reply not found.');

    const existing = await this.repliesRepo.findLike(userId, replyId);
    if (existing) throw new ConflictException('Already liked.');

    await this.repliesRepo.addLike(userId, replyId);
    return { liked: true, likes_count: reply.likesCount + 1 };
  }

  async unlikeReply(userId: string, replyId: string) {
    const reply = await this.repliesRepo.findById(replyId);
    if (!reply) throw new NotFoundException('Reply not found.');

    const existing = await this.repliesRepo.findLike(userId, replyId);
    if (!existing) throw new ConflictException('Not liked yet.');

    await this.repliesRepo.removeLike(userId, replyId);
    return { liked: false, likes_count: Math.max(0, reply.likesCount - 1) };
  }

  async getLikers(replyId: string) {
    const reply = await this.repliesRepo.findById(replyId);
    if (!reply) throw new NotFoundException('Reply not found.');

    const likes = await this.repliesRepo.findLikers(replyId);
    return likes.map((l) => ({
      id:         l.user.id,
      first_name: l.user.firstName,
      last_name:  l.user.lastName,
      avatar_url: l.user.avatarUrl ?? null,
    }));
  }
}
