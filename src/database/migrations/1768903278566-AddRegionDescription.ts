import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRegionDescription1768903278566 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`region_table\` ADD \`region_description\` text NULL COMMENT '지역 설명하는 요약 글'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`region_table\` DROP COLUMN \`region_description\``);
    }

}
