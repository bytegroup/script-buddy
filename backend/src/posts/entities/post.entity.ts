import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Comment } from '@/comments/entities/comment.entity';
import { PostLike } from './post-like.entity';

export type PostVisibility = 'public' | 'private';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({
    type: 'enum',
    enum: ['public', 'private'],
    default: 'public',
  })
  visibility: PostVisibility;

  @Column({ name: 'likes_count', default: 0 })
  likesCount: number;

  @Column({ name: 'comments_count', default: 0 })
  commentsCount: number;

  // ── Author ──────────────────────────────────────────────────────────────────
  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  author: User;

  // ── Relations ───────────────────────────────────────────────────────────────
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostLike, (like) => like.post)
  likes: PostLike[];

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
