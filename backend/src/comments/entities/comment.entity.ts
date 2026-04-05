import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Post } from '@/posts/entities/post.entity';
import { Reply } from '@/replies/entities/reply.entity';
import { CommentLike } from './comment-like.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'likes_count', default: 0 })
  likesCount: number;

  @Index()
  @Column({ name: 'post_id' })
  postId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  author: User;

  @OneToMany(() => Reply, (reply) => reply.comment)
  replies: Reply[];

  @OneToMany(() => CommentLike, (like) => like.comment)
  likes: CommentLike[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
