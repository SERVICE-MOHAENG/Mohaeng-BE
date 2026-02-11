import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from './global/logger/Logger.module';
import { GlobalModule } from './global/GlobalModule';
import { AuthModule } from './domain/auth/AuthModule';
import { UserModule } from './domain/user/UserModule';
import { CourseModule } from './domain/course/CourseModule';
import { BlogModule } from './domain/blog/BlogModule';
import { VisitedCountryModule } from './domain/visited-country/VisitedCountryModule';
import { ItineraryModule } from './domain/itinerary/ItineraryModule';
import { PlaceModule } from './domain/place/PlaceModule';
import { NotificationModule } from './domain/notification/NotificationModule';
import { CountryModule } from './domain/country/CountryModule';
import { User } from './domain/user/entity/User.entity';
import { TravelCourse } from './domain/course/entity/TravelCourse.entity';
import { CoursePlace } from './domain/course/entity/CoursePlace.entity';
import { CourseDay } from './domain/course/entity/CourseDay.entity';
import { CourseHashTag } from './domain/course/entity/CourseHashTag.entity';
import { CourseLike } from './domain/course/entity/CourseLike.entity';
import { CourseBookmark } from './domain/course/entity/CourseBookmark.entity';
import { CourseCountry } from './domain/course/entity/CourseCountry.entity';
import { CourseRegion } from './domain/course/entity/CourseRegion.entity';
import { CourseSurvey } from './domain/course/entity/CourseSurvey.entity';
import { CourseSurveyDestination } from './domain/course/entity/CourseSurveyDestination.entity';
import { CourseSurveyCompanion } from './domain/course/entity/CourseSurveyCompanion.entity';
import { CourseSurveyTheme } from './domain/course/entity/CourseSurveyTheme.entity';
import { TravelBlog } from './domain/blog/entity/TravelBlog.entity';
import { BlogLike } from './domain/blog/entity/BlogLike.entity';
import { Country } from './domain/country/entity/Country.entity';
import { Region } from './domain/country/entity/Region.entity';
import { Place } from './domain/place/entity/Place.entity';
import { UserVisitedCountry } from './domain/visited-country/entity/UserVisitedCountry.entity';
import { Notification } from './domain/notification/entity/Notification.entity';
import { ItineraryJob } from './domain/itinerary/entity/ItineraryJob.entity';
import { UserPreference } from './domain/preference/entity/UserPreference.entity';
import { UserPreferenceWeather } from './domain/preference/entity/UserPreferenceWeather.entity';
import { UserPreferenceTravelRange } from './domain/preference/entity/UserPreferenceTravelRange.entity';
import { UserPreferenceTravelStyle } from './domain/preference/entity/UserPreferenceTravelStyle.entity';
import { UserPreferenceFoodPersonality } from './domain/preference/entity/UserPreferenceFoodPersonality.entity';
import { UserPreferenceMainInterest } from './domain/preference/entity/UserPreferenceMainInterest.entity';
import { UserPreferenceBudget } from './domain/preference/entity/UserPreferenceBudget.entity';
import { RegionCategory } from './domain/country/entity/RegionCategory.entity';
import { RegionFoodPersonality } from './domain/country/entity/RegionFoodPersonality.entity';
import { RegionMainInterest } from './domain/country/entity/RegionMainInterest.entity';
import { RegionTravelStyle } from './domain/country/entity/RegionTravelStyle.entity';
import { RegionWeather } from './domain/country/entity/RegionWeather.entity';
import { RegionBudget } from './domain/country/entity/RegionBudget.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbTypeRaw = (configService.get('DB_TYPE') || 'mysql')
          .toString()
          .toLowerCase();
        const dbType = (dbTypeRaw === 'postgres' || dbTypeRaw === 'postgresql'
          ? 'postgres'
          : 'mysql') as 'mysql' | 'postgres';

        const port = parseInt(
          configService.get('DB_PORT') || (dbType === 'postgres' ? '5432' : '3306'),
        );

        const entities = [
          User,
          TravelCourse,
          CoursePlace,
          CourseDay,
          CourseHashTag,
          CourseLike,
          CourseBookmark,
          CourseCountry,
          CourseRegion,
          CourseSurvey,
          CourseSurveyDestination,
          CourseSurveyCompanion,
          CourseSurveyTheme,
          ItineraryJob,
          TravelBlog,
          BlogLike,
          Country,
          Region,
          Place,
          UserVisitedCountry,
          Notification,
          // User Preference entities
          UserPreference,
          UserPreferenceWeather,
          UserPreferenceTravelRange,
          UserPreferenceTravelStyle,
          UserPreferenceFoodPersonality,
          UserPreferenceMainInterest,
          UserPreferenceBudget,
          // Region mapping entities
          RegionCategory,
          RegionFoodPersonality,
          RegionMainInterest,
          RegionTravelStyle,
          RegionWeather,
          RegionBudget,
        ];

        const common = {
          host: configService.get('DB_HOST'),
          port,
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities,
          synchronize:
            configService.get('SYNC_AUTO_DDL') === 'true' &&
            configService.get('NODE_ENV') !== 'production',
          logging: configService.get('NODE_ENV') === 'development',
        };

        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            ...common,
          } as TypeOrmModuleOptions;
        }

        return {
          type: 'mysql',
          ...common,
          timezone: '+09:00',
          charset: 'utf8mb4',
        } as TypeOrmModuleOptions;
      },
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: Number(configService.get<number>('REDIS_PORT') || 6379),
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
          db: Number(configService.get<number>('REDIS_DB') || 0),
        },
      }),
    }),
    LoggerModule,
    GlobalModule,
    AuthModule,
    UserModule,
    CourseModule,
    BlogModule,
    CountryModule,
    PlaceModule,
    NotificationModule,
    VisitedCountryModule,
    ItineraryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
