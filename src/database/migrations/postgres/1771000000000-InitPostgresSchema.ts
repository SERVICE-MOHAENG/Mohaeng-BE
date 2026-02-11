import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitPostgresSchema1771000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.connection.synchronize(false);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.options.type !== 'postgres') {
      return;
    }

    await queryRunner.query('DROP SCHEMA IF EXISTS public CASCADE');
    await queryRunner.query('CREATE SCHEMA public');
  }
}
