import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlogAssetsAndRoadmapRelationPostgres1773300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('travel_blog_table'))) {
      return;
    }

    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    if (
      !(await queryRunner.hasColumn('travel_blog_table', 'travel_course_id'))
    ) {
      await queryRunner.query(`
        ALTER TABLE "travel_blog_table"
        ADD COLUMN "travel_course_id" uuid NULL
      `);
    }

    await queryRunner.query(`
      ALTER TABLE "travel_blog_table"
      ADD CONSTRAINT "FK_travel_blog_travel_course"
      FOREIGN KEY ("travel_course_id") REFERENCES "travel_course"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_travel_blog_travel_course"
      ON "travel_blog_table" ("travel_course_id")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "blog_image_table" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "image_url" character varying(500) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "travel_blog_id" uuid NOT NULL,
        CONSTRAINT "PK_blog_image_table" PRIMARY KEY ("id"),
        CONSTRAINT "FK_blog_image_travel_blog"
          FOREIGN KEY ("travel_blog_id") REFERENCES "travel_blog_table"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_blog_image_travel_blog"
      ON "blog_image_table" ("travel_blog_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_blog_image_sort_order"
      ON "blog_image_table" ("sort_order")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "blog_hashtag_table" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "tag_name" character varying(50) NOT NULL,
        "travel_blog_id" uuid NOT NULL,
        CONSTRAINT "PK_blog_hashtag_table" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_blog_hashtag_blog_tag" UNIQUE ("travel_blog_id", "tag_name"),
        CONSTRAINT "FK_blog_hashtag_travel_blog"
          FOREIGN KEY ("travel_blog_id") REFERENCES "travel_blog_table"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_blog_hashtag_travel_blog"
      ON "blog_hashtag_table" ("travel_blog_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_blog_hashtag_tag_name"
      ON "blog_hashtag_table" ("tag_name")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "blog_hashtag_table"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "blog_image_table"`);

    if (await queryRunner.hasTable('travel_blog_table')) {
      await queryRunner.query(`
        DROP INDEX IF EXISTS "UQ_travel_blog_travel_course"
      `);

      await queryRunner.query(`
        ALTER TABLE "travel_blog_table"
        DROP CONSTRAINT IF EXISTS "FK_travel_blog_travel_course"
      `);

      if (
        await queryRunner.hasColumn('travel_blog_table', 'travel_course_id')
      ) {
        await queryRunner.query(`
          ALTER TABLE "travel_blog_table"
          DROP COLUMN "travel_course_id"
        `);
      }
    }
  }
}
