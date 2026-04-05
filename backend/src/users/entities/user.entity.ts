import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  OneToMany, Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Post } from '@/posts/entities/post.entity';
import { Comment } from '@/comments/entities/comment.entity';
import { Reply } from '@/replies/entities/reply.entity';
import { PostLike } from '@/posts/entities/post-like.entity';
import { CommentLike } from '@/comments/entities/comment-like.entity';
import { ReplyLike } from '@/replies/entities/reply-like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 255 })
  email: string;

  @Exclude()
  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'avatar_url', nullable: true, type: 'text' })
  avatarUrl: string | null;

  @Exclude()
  @Column({ name: 'refresh_token_hash', nullable: true, type: 'text' })
  refreshTokenHash: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ── Relations ──────────────────────────────────────────────────────────────
  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Reply, (reply) => reply.author)
  replies: Reply[];

  @OneToMany(() => PostLike, (like) => like.user)
  postLikes: PostLike[];

  @OneToMany(() => CommentLike, (like) => like.user)
  commentLikes: CommentLike[];

  @OneToMany(() => ReplyLike, (like) => like.user)
  replyLikes: ReplyLike[];
}
