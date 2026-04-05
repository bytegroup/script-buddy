import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reply } from './entities/reply.entity';
import { ReplyLike } from './entities/reply-like.entity';
import { RepliesRepository } from './replies.repository';
import { RepliesService } from './replies.service';
import { RepliesController } from './replies.controller';
import { CommentsModule } from '@/comments/comments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reply, ReplyLike]),
    CommentsModule,
  ],
  providers: [RepliesRepository, RepliesService],
  controllers: [RepliesController],
})
export class RepliesModule {}
