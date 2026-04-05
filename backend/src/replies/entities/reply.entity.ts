import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Comment } from '@/comments/entities/comment.entity';
import { ReplyLike } from './reply-like.entity';

@Entity('replies')
export class Reply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'likes_count', default: 0 })
  likesCount: number;

  @Index()
  @Column({ name: 'comment_id' })
  commentId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Comment, (comment) => comment.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @ManyToOne(() => User, (user) => user.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  author: User;

  @OneToMany(() => ReplyLike, (like) => like.reply)
  likes: ReplyLike[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
