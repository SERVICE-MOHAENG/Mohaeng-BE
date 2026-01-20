import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveStyleScoreFromRegionTravelStyle1768895603512 implements MigrationInterface {
    name = 'RemoveStyleScoreFromRegionTravelStyle1768895603512'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`region_travel_style_table\` DROP COLUMN \`style_score\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`region_travel_style_table\` ADD \`style_score\` int NOT NULL COMMENT '해당 스타일의 적합도 점수 (0-100)' DEFAULT '50'`);
    }

}
