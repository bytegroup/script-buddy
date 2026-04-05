import {
  Entity, ManyToOne, JoinColumn, PrimaryColumn,
  CreateDateColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';

@Entity('comment_likes')
@Index(['userId', 'commentId'], { unique: true })
export class CommentLike {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @PrimaryColumn({ name: 'comment_id' })
  commentId: string;

  @ManyToOne(() => User, (user) => user.commentLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
