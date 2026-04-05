import {
  Entity, ManyToOne, JoinColumn, PrimaryColumn,
  CreateDateColumn, Index,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Reply } from './reply.entity';

@Entity('reply_likes')
@Index(['userId', 'replyId'], { unique: true })
export class ReplyLike {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @PrimaryColumn({ name: 'reply_id' })
  replyId: string;

  @ManyToOne(() => User, (user) => user.replyLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Reply, (reply) => reply.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reply_id' })
  reply: Reply;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
