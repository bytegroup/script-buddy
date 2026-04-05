import {
  Entity, ManyToOne, JoinColumn,
  PrimaryColumn, CreateDateColumn, Index,
} from 'typeorm';
import { User } from '@/users/entities/user.entity';
import { Post } from './post.entity';

@Entity('post_likes')
@Index(['userId', 'postId'], { unique: true })
export class PostLike {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @PrimaryColumn({ name: 'post_id' })
  postId: string;

  @ManyToOne(() => User, (user) => user.postLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
