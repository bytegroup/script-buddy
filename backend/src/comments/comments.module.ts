import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentLike } from './entities/comment-like.entity';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PostsModule } from '@/posts/posts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentLike]),
    PostsModule,
  ],
  providers: [CommentsRepository, CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
