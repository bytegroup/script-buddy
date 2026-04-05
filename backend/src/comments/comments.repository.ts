import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CommentLike } from './entities/comment-like.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)     private readonly commentRepo: Repository<Comment>,
    @InjectRepository(CommentLike) private readonly likeRepo:    Repository<CommentLike>,
    private readonly dataSource: DataSource,
  ) {}

  async findByPostId(postId: string, currentUserId: string): Promise<Comment[]> {
    return this.commentRepo
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.replies', 'reply')
      .leftJoinAndSelect('reply.author', 'replyAuthor')
      .leftJoinAndSelect(
        'comment.likes', 'like',
        'like.userId = :currentUserId', { currentUserId },
      )
      .leftJoinAndSelect(
        'reply.likes', 'replyLike',
        'replyLike.userId = :currentUserId', { currentUserId },
      )
      .where('comment.postId = :postId', { postId })
      .orderBy('comment.createdAt', 'ASC')
      .addOrderBy('reply.createdAt', 'ASC')
      .getMany();
  }

  async create(data: Partial<Comment>): Promise<Comment> {
    const comment = this.commentRepo.create(data);
    const saved   = await this.commentRepo.save(comment);
    return this.commentRepo.findOne({
      where: { id: saved.id },
      relations: ['author', 'replies'],
    }) as Promise<Comment>;
  }

  async findById(id: string): Promise<Comment | null> {
    return this.commentRepo.findOne({ where: { id }, relations: ['author'] });
  }

  async findLike(userId: string, commentId: string): Promise<CommentLike | null> {
    return this.likeRepo.findOne({ where: { userId, commentId } });
  }

  async addLike(userId: string, commentId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.save(CommentLike, { userId, commentId });
      await manager.increment(Comment, { id: commentId }, 'likesCount', 1);
    });
  }

  async removeLike(userId: string, commentId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(CommentLike, { userId, commentId });
      await manager.decrement(Comment, { id: commentId }, 'likesCount', 1);
    });
  }

  async findLikers(commentId: string) {
    return this.likeRepo.find({
      where: { commentId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }
}
