import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Reply } from './entities/reply.entity';
import { ReplyLike } from './entities/reply-like.entity';

@Injectable()
export class RepliesRepository {
  constructor(
    @InjectRepository(Reply)     private readonly replyRepo: Repository<Reply>,
    @InjectRepository(ReplyLike) private readonly likeRepo:  Repository<ReplyLike>,
    private readonly dataSource: DataSource,
  ) {}

  async create(data: Partial<Reply>): Promise<Reply> {
    const reply = this.replyRepo.create(data);
    const saved = await this.replyRepo.save(reply);
    return this.replyRepo.findOne({
      where: { id: saved.id },
      relations: ['author'],
    }) as Promise<Reply>;
  }

  async findById(id: string): Promise<Reply | null> {
    return this.replyRepo.findOne({ where: { id }, relations: ['author'] });
  }

  async findLike(userId: string, replyId: string): Promise<ReplyLike | null> {
    return this.likeRepo.findOne({ where: { userId, replyId } });
  }

  async addLike(userId: string, replyId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.save(ReplyLike, { userId, replyId });
      await manager.increment(Reply, { id: replyId }, 'likesCount', 1);
    });
  }

  async removeLike(userId: string, replyId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(ReplyLike, { userId, replyId });
      await manager.decrement(Reply, { id: replyId }, 'likesCount', 1);
    });
  }

  async findLikers(replyId: string) {
    return this.likeRepo.find({
      where: { replyId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }
}
