import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)    private readonly postRepo: Repository<Post>,
    @InjectRepository(PostLike) private readonly likeRepo: Repository<PostLike>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Cursor-based paginated feed.
   * Enforces visibility: public posts OR the requesting user's own private posts.
   * Uses QueryBuilder with single JOIN to avoid N+1.
   */
  async findFeed(currentUserId: string, limit: number, cursor?: string) {
    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect(
        'post.likes',
        'like',
        'like.userId = :currentUserId',
        { currentUserId },
      )
      // Privacy filter
      .where(
        '(post.visibility = :public OR post.userId = :currentUserId)',
        { public: 'public', currentUserId },
      )
      .orderBy('post.createdAt', 'DESC')
      .take(limit + 1); // fetch one extra to determine hasNextPage

    if (cursor) {
      // Get createdAt of cursor post for efficient keyset pagination
      const cursorPost = await this.postRepo.findOne({ where: { id: cursor } });
      if (cursorPost) {
        qb.andWhere(
          '(post.createdAt < :cursorDate OR (post.createdAt = :cursorDate AND post.id < :cursorId))',
          { cursorDate: cursorPost.createdAt, cursorId: cursor },
        );
      }
    }

    const posts = await qb.getMany();
    const hasNextPage = posts.length > limit;
    if (hasNextPage) posts.pop();

    return { posts, hasNextPage };
  }

  async create(data: Partial<Post>): Promise<Post> {
    const post = this.postRepo.create(data);
    return this.postRepo.save(post);
  }

  async findById(id: string): Promise<Post | null> {
    return this.postRepo.findOne({
      where: { id },
      relations: ['author'],
    });
  }

  // ── Likes ──────────────────────────────────────────────────────────────────

  async findLike(userId: string, postId: string): Promise<PostLike | null> {
    return this.likeRepo.findOne({ where: { userId, postId } });
  }

  async addLike(userId: string, postId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.save(PostLike, { userId, postId });
      await manager.increment(Post, { id: postId }, 'likesCount', 1);
    });
  }

  async removeLike(userId: string, postId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(PostLike, { userId, postId });
      await manager.decrement(Post, { id: postId }, 'likesCount', 1);
    });
  }

  async findLikers(postId: string) {
    return this.likeRepo.find({
      where: { postId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async incrementCommentsCount(postId: string): Promise<void> {
    await this.postRepo.increment({ id: postId }, 'commentsCount', 1);
  }
}
