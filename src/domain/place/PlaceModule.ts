import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entity/Place.entity';
import { PlaceRepository } from './persistence/PlaceRepository';
import { PlaceService } from './service/PlaceService';

/**
 * Place Module
 * @description
 * - 장소 도메인 모듈
 */
@Module({
  imports: [TypeOrmModule.forFeature([Place])],
  providers: [PlaceRepository, PlaceService],
  exports: [PlaceService],
})
export class PlaceModule {}
