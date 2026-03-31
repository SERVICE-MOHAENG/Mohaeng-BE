import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlogAssetsAndRoadmapRelation1773300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('travel_blog_table'))) {
      return;
    }

    if (
      !(await queryRunner.hasColumn('travel_blog_table', 'travel_course_id'))
    ) {
      await queryRunner.query(`
        ALTER TABLE travel_blog_table
        ADD COLUMN travel_course_id VARCHAR(36) NULL
      `);
    }

    await queryRunner.query(`
      ALTER TABLE travel_blog_table
      ADD CONSTRAINT fk_travel_blog_travel_course
      FOREIGN KEY (travel_course_id) REFERENCES travel_course(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE travel_blog_table
      ADD UNIQUE KEY uq_travel_blog_travel_course (travel_course_id)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS blog_image_table (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        image_url VARCHAR(500) NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        travel_blog_id VARCHAR(36) NOT NULL,
        CONSTRAINT fk_blog_image_travel_blog
          FOREIGN KEY (travel_blog_id) REFERENCES travel_blog_table(id) ON DELETE CASCADE,
        KEY idx_blog_image_travel_blog (travel_blog_id),
        KEY idx_blog_image_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS blog_hashtag_table (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        tag_name VARCHAR(50) NOT NULL,
        travel_blog_id VARCHAR(36) NOT NULL,
        CONSTRAINT fk_blog_hashtag_travel_blog
          FOREIGN KEY (travel_blog_id) REFERENCES travel_blog_table(id) ON DELETE CASCADE,
        UNIQUE KEY uq_blog_hashtag_blog_tag (travel_blog_id, tag_name),
        KEY idx_blog_hashtag_travel_blog (travel_blog_id),
        KEY idx_blog_hashtag_tag_name (tag_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS blog_hashtag_table`);
    await queryRunner.query(`DROP TABLE IF EXISTS blog_image_table`);

    if (await queryRunner.hasTable('travel_blog_table')) {
      if (
        await queryRunner.hasColumn('travel_blog_table', 'travel_course_id')
      ) {
        await queryRunner.query(`
          ALTER TABLE travel_blog_table
          DROP INDEX uq_travel_blog_travel_course
        `);

        await queryRunner.query(`
          ALTER TABLE travel_blog_table
          DROP FOREIGN KEY fk_travel_blog_travel_course
        `);

        await queryRunner.query(`
          ALTER TABLE travel_blog_table
          DROP COLUMN travel_course_id
        `);
      }
    }
  }
}
