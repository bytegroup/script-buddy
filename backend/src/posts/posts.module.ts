import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostLike])],
  providers: [PostsRepository, PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
