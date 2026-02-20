import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
// import { BullModule } from '@nestjs/bullmq'; // Redis removed
// import { AuthModule } from './modules/auth/auth.module'; // Auth removed
// import { UsersModule } from './modules/users/users.module'; // Users removed
import { ProjectsModule } from './modules/projects/projects.module';
import { CrawlerModule } from './modules/crawler/crawler.module';
import { PagesModule } from './modules/pages/pages.module';
import { ContentBlocksModule } from './modules/content-blocks/content-blocks.module';
import { SeoModule } from './modules/seo/seo.module';
// import { AiModule } from './modules/ai/ai.module'; // AI optional
// import { JobsModule } from './modules/jobs/jobs.module'; // Jobs removed (needs Redis)
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { MediaModule } from './modules/media/media.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{
          ttl: config.get('THROTTLE_TTL', 60) * 1000,
          limit: config.get('THROTTLE_LIMIT', 100),
        }],
      }),
    }),

    // Core
    PrismaModule,

    // Feature modules (Auth, Users, Jobs removed)
    ProjectsModule,
    CrawlerModule,
    PagesModule,
    ContentBlocksModule,
    SeoModule,
    AnalyticsModule,
    MediaModule,
  ],
})
export class AppModule {}
