import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './global/logger/Logger.module';
import { GlobalModule } from './global/GlobalModule';
import { AuthModule } from './domain/auth/AuthModule';
import { UserModule } from './domain/user/UserModule';
import { CourseModule } from './domain/course/CourseModule';
import { BlogModule } from './domain/blog/BlogModule';
import { VisitedCountryModule } from './domain/visited-country/VisitedCountryModule';
import { User } from './domain/user/entity/User.entity';
import { TravelCourse } from './domain/course/entity/TravelCourse.entity';
import { CoursePlace } from './domain/course/entity/CoursePlace.entity';
import { CourseHashTag } from './domain/course/entity/CourseHashTag.entity';
import { CourseLike } from './domain/course/entity/CourseLike.entity';
import { CourseBookmark } from './domain/course/entity/CourseBookmark.entity';
import { CourseCountry } from './domain/course/entity/CourseCountry.entity';
import { TravelBlog } from './domain/blog/entity/TravelBlog.entity';
import { BlogLike } from './domain/blog/entity/BlogLike.entity';
import { Country } from './domain/country/entity/Country.entity';
import { Region } from './domain/country/entity/Region.entity';
import { Place } from './domain/place/entity/Place.entity';
import { UserVisitedCountry } from './domain/visited-country/entity/UserVisitedCountry.entity';
import { Notification } from './domain/notification/entity/Notification.entity';
import { UserPreference } from './domain/preference/entity/UserPreference.entity';
import { UserPreferenceWeather } from './domain/preference/entity/UserPreferenceWeather.entity';
import { UserPreferenceTravelRange } from './domain/preference/entity/UserPreferenceTravelRange.entity';
import { UserPreferenceEnvironment } from './domain/preference/entity/UserPreferenceEnvironment.entity';
import { UserPreferenceFoodPersonality } from './domain/preference/entity/UserPreferenceFoodPersonality.entity';
import { UserPreferenceMainInterest } from './domain/preference/entity/UserPreferenceMainInterest.entity';
import { UserPreferenceBudget } from './domain/preference/entity/UserPreferenceBudget.entity';
import { RegionCategory } from './domain/country/entity/RegionCategory.entity';
import { RegionEnvironment } from './domain/country/entity/RegionEnvironment.entity';
import { RegionFoodPersonality } from './domain/country/entity/RegionFoodPersonality.entity';
import { RegionMainInterest } from './domain/country/entity/RegionMainInterest.entity';
import { RegionTravelStyle } from './domain/country/entity/RegionTravelStyle.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: parseInt(configService.get('DB_PORT') || '3306'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [
          User,
          TravelCourse,
          CoursePlace,
          CourseHashTag,
          CourseLike,
          CourseBookmark,
          CourseCountry,
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
          UserPreferenceEnvironment,
          UserPreferenceFoodPersonality,
          UserPreferenceMainInterest,
          UserPreferenceBudget,
          // Region mapping entities
          RegionCategory,
          RegionEnvironment,
          RegionFoodPersonality,
          RegionMainInterest,
          RegionTravelStyle,
        ],
        synchronize:
          configService.get('SYNC_AUTO_DDL') === 'true' &&
          configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        timezone: '+09:00',
        charset: 'utf8mb4',
      }),
    }),
    LoggerModule,
    GlobalModule,
    AuthModule,
    UserModule,
    CourseModule,
    BlogModule,
    VisitedCountryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
