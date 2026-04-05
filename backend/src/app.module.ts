import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { RepliesModule } from './replies/replies.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { User } from './users/entities/user.entity';
import { Post } from './posts/entities/post.entity';
import { Comment } from './comments/entities/comment.entity';
import { Reply } from './replies/entities/reply.entity';
import { PostLike } from './posts/entities/post-like.entity';
import { CommentLike } from './comments/entities/comment-like.entity';
import { ReplyLike } from './replies/entities/reply-like.entity';
import {LoggerMiddleware} from "@/common/middleware/logger.middleware";

@Module({
  imports: [
    // ── Config (global, .env loaded once) ─────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // ── Database ───────────────────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host:     config.get<string>('DB_HOST', 'localhost'),
        port:     config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'appifylab_social'),
        entities: [User, Post, Comment, Reply, PostLike, CommentLike, ReplyLike],
        synchronize: config.get<boolean>('DB_SYNC', false), // false in production
        logging: config.get<string>('NODE_ENV') === 'development',
        ssl: {
          rejectUnauthorized: false,
        }
      }),
    }),

    // ── Feature modules ────────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    RepliesModule,
    CloudinaryModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware)
        .forRoutes('*');
  }
}
