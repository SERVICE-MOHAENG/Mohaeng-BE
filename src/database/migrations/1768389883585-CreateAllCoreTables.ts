import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAllCoreTables1768389883585 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. User 테이블 생성 (외래키 없음, 다른 테이블에서 참조됨)
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS user_table (
                id VARCHAR(36) PRIMARY KEY,
                created_at DATETIME(6) NOT NULL,
                updated_at DATETIME(6) NOT NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NULL,
                provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
                provider_id VARCHAR(255) NULL,
                profile_image VARCHAR(500) NULL COMMENT '프로필 이미지 URL',
                visited_countries INT NOT NULL DEFAULT 0 COMMENT '방문한 국가 수',
                is_activate BOOLEAN NOT NULL DEFAULT true,
                INDEX idx_email (email),
                INDEX idx_provider (provider)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 2. Country 테이블 생성 (외래키 없음, User와 독립적)
        await queryRunner.query(`
            CREATE TABLE country_table (
                id VARCHAR(36) PRIMARY KEY,
                created_at DATETIME(6) NOT NULL,
                updated_at DATETIME(6) NOT NULL,
                country_name VARCHAR(100) NOT NULL UNIQUE,
                country_code VARCHAR(10) NOT NULL UNIQUE COMMENT 'ISO 3166-1 alpha-2 국가 코드 (예: KR, US, JP)',
                country_image_url VARCHAR(500) NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 3. Region 테이블 생성 (Country 참조)
        await queryRunner.query(`
            CREATE TABLE region_table (
                id VARCHAR(36) PRIMARY KEY,
                created_at DATETIME(6) NOT NULL,
                updated_at DATETIME(6) NOT NULL,
                region_name VARCHAR(100) NOT NULL,
                latitude DECIMAL(10, 7) NULL COMMENT '위도',
                longitude DECIMAL(10, 7) NULL COMMENT '경도',
                region_image_url VARCHAR(500) NULL,
                country_id VARCHAR(36) NOT NULL,
                FOREIGN KEY (country_id) REFERENCES country_table(id) ON DELETE CASCADE,
                INDEX idx_country_id (country_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 4. Place 테이블 생성 (Region 참조)
        await queryRunner.query(`
            CREATE TABLE place_table (
                id VARCHAR(36) PRIMARY KEY,
                created_at DATETIME(6) NOT NULL,
                updated_at DATETIME(6) NOT NULL,
                place_name VARCHAR(200) NOT NULL,
                place_description TEXT NULL,
                place_image_url VARCHAR(500) NULL,
                latitude DECIMAL(10, 7) NULL,
                longitude DECIMAL(10, 7) NULL,
                address VARCHAR(500) NULL,
                opening_hours VARCHAR(255) NULL COMMENT '영업시간',
                category VARCHAR(50) NULL COMMENT '장소 카테고리 (음식점, 관광지, 숙박 등)',
                region_id VARCHAR(36) NULL,
                FOREIGN KEY (region_id) REFERENCES region_table(id) ON DELETE SET NULL,
                INDEX idx_region_id (region_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 5. TravelCourse 테이블 생성 (User 참조)
        await queryRunner.query(`
            CREATE TABLE travel_course_table (
                id VARCHAR(36) PRIMARY KEY,
                created_at DATETIME(6) NOT NULL,
                updated_at DATETIME(6) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NULL,
                course_image_url VARCHAR(255) NULL,
                view_count INT NOT NULL DEFAULT 0 COMMENT '조회수',
                nights INT NOT NULL COMMENT '숙박 일수 (몇 박)',
                days INT NOT NULL COMMENT '여행 일수 (몇 일)',
                is_public BOOLEAN NOT NULL DEFAULT true COMMENT '공개 여부',
                like_count INT NOT NULL DEFAULT 0 COMMENT '좋아요 수',
                bookmark_count INT NOT NULL DEFAULT 0 COMMENT '북마크 수',
                user_id VARCHAR(36) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user_table(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_is_public (is_public)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 6. CourseCountry 테이블 생성 (TravelCourse, Country 참조)
        await queryRunner.query(`
            CREATE TABLE course_country_table (
                id VARCHAR(36) PRIMARY KEY,
                created_at DATETIME(6) NOT NULL,
                updated_at DATETIME(6) NOT NULL,
                course_id VARCHAR(36) NOT NULL,
                country_id VARCHAR(36) NOT NULL,
                FOREIGN KEY (course_id) REFERENCES travel_course_table(id) ON DELETE CASCADE,
                FOREIGN KEY (country_id) REFERENCES country_table(id) ON DELETE CASCADE,
                UNIQUE KEY unique_course_country (course_id, country_id),
                INDEX idx_course_id (course_id),
                INDEX idx_country_id (country_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 7. CoursePlace 테이블 생성 (TravelCourse, Place 참조)
        await queryRunner.query(`
            CREATE TABLE course_place_table (
                id VARCHAR(36) PRIMARY KEY,
                created_at DATETIME(6) NOT NULL,
                updated_at DATETIME(6) NOT NULL,
                visit_order INT NOT NULL COMMENT '방문 순서',
                day_number INT NOT NULL DEFAULT 1 COMMENT '여행 일차',
                memo TEXT NULL COMMENT '장소 방문 메모',
                travel_course_id VARCHAR(36) NOT NULL,
                place_id VARCHAR(36) NOT NULL,
                FOREIGN KEY (travel_course_id) REFERENCES travel_course_table(id) ON DELETE CASCADE,
                FOREIGN KEY (place_id) REFERENCES place_table(id) ON DELETE CASCADE,
                INDEX idx_travel_course_id (travel_course_id),
                INDEX idx_place_id (place_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 8. CourseHashTag 테이블 생성 (TravelCourse 참조)
        await queryRunner.query(`
            CREATE TABLE course_hashtag_table (
                id VARCHAR(36) PRIMARY KEY,
                created_at DATETIME(6) NOT NULL,
                updated_at DATETIME(6) NOT NULL,
                tag_name VARCHAR(50) NOT NULL,
                travel_course_id VARCHAR(36) NOT NULL,
                FOREIGN KEY (travel_course_id) REFERENCES travel_course_table(id) ON DELETE CASCADE,
                INDEX idx_travel_course_id (travel_course_id),
                INDEX idx_tag_name (tag_name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 9. CourseLike 테이블 생성 (TravelCourse, User 참조)
        await queryRunner.query(`
            CREATE TABLE course_like_table (
                id VARCHAR(36) PRIMARY KEY,
                created_at DATETIME(6) NOT NULL,
                updated_at DATETIME(6) NOT NULL,
                travel_course_id VARCHAR(36) NOT NULL,
                user_id VARCHAR(36) NOT NULL,
                FOREIGN KEY (travel_course_id) REFERENCES travel_course_table(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES user_table(id) ON DELETE CASCADE,
                UNIQUE KEY unique_course_like (travel_course_id, user_id),
                INDEX idx_travel_course_id (travel_course_id),
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 10. CourseBookmark 테이블 생성 (TravelCourse, User 참조)
        await queryRunner.query(`
            CREATE TABLE course_bookmark_table (
                id VARCHAR(36) PRIMARY KEY,
                created_at DATETIME(6) NOT NULL,
                updated_at DATETIME(6) NOT NULL,
                travel_course_id VARCHAR(36) NOT NULL,
                user_id VARCHAR(36) NOT NULL,
                FOREIGN KEY (travel_course_id) REFERENCES travel_course_table(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES user_table(id) ON DELETE CASCADE,
                UNIQUE KEY unique_course_bookmark (travel_course_id, user_id),
                INDEX idx_travel_course_id (travel_course_id),
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 11. TravelBlog 테이블 생성 (User 참조)
        await queryRunner.query(`
            CREATE TABLE travel_blog_table (
                id VARCHAR(36) PRIMARY KEY,
                created_at DATETIME(6) NOT NULL,
                updated_at DATETIME(6) NOT NULL,
                blog_title VARCHAR(255) NOT NULL,
                blog_content TEXT NOT NULL,
                blog_image_url VARCHAR(500) NULL,
                is_public BOOLEAN NOT NULL DEFAULT true COMMENT '공개 여부',
                view_count INT NOT NULL DEFAULT 0 COMMENT '조회수',
                like_count INT NOT NULL DEFAULT 0 COMMENT '좋아요 수',
                user_id VARCHAR(36) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user_table(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_is_public (is_public)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 12. BlogLike 테이블 생성 (TravelBlog, User 참조)
        await queryRunner.query(`
            CREATE TABLE blog_like_table (
                id VARCHAR(36) PRIMARY KEY,
                created_at DATETIME(6) NOT NULL,
                updated_at DATETIME(6) NOT NULL,
                travel_blog_id VARCHAR(36) NOT NULL,
                user_id VARCHAR(36) NOT NULL,
                FOREIGN KEY (travel_blog_id) REFERENCES travel_blog_table(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES user_table(id) ON DELETE CASCADE,
                UNIQUE KEY unique_blog_like (travel_blog_id, user_id),
                INDEX idx_travel_blog_id (travel_blog_id),
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 13. UserVisitedCountry 테이블 생성 (User, Country 참조)
        await queryRunner.query(`
            CREATE TABLE user_visited_country_table (
                id VARCHAR(36) PRIMARY KEY,
                created_at DATETIME(6) NOT NULL,
                updated_at DATETIME(6) NOT NULL,
                visit_date DATE NULL COMMENT '방문 날짜',
                user_id VARCHAR(36) NOT NULL,
                country_id VARCHAR(36) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user_table(id) ON DELETE CASCADE,
                FOREIGN KEY (country_id) REFERENCES country_table(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_country (user_id, country_id),
                INDEX idx_user_id (user_id),
                INDEX idx_country_id (country_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // 14. Notification 테이블 생성 (User 참조)
        await queryRunner.query(`
            CREATE TABLE notification_table (
                id VARCHAR(36) PRIMARY KEY,
                created_at DATETIME(6) NOT NULL,
                updated_at DATETIME(6) NOT NULL,
                notification_title VARCHAR(200) NOT NULL,
                notification_content TEXT NOT NULL,
                notification_type ENUM('LIKE', 'COMMENT', 'FOLLOW', 'SYSTEM') NOT NULL,
                is_read BOOLEAN NOT NULL DEFAULT false COMMENT '읽음 여부',
                reference_id VARCHAR(36) NULL COMMENT '참조 ID (블로그 ID, 코스 ID 등)',
                user_id VARCHAR(36) NOT NULL,
                sender_id VARCHAR(36) NULL,
                FOREIGN KEY (user_id) REFERENCES user_table(id) ON DELETE CASCADE,
                FOREIGN KEY (sender_id) REFERENCES user_table(id) ON DELETE SET NULL,
                INDEX idx_user_id (user_id),
                INDEX idx_sender_id (sender_id),
                INDEX idx_is_read (is_read)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 역순으로 삭제 (외래키 제약조건 때문에)
        await queryRunner.query(`DROP TABLE IF EXISTS notification_table`);
        await queryRunner.query(`DROP TABLE IF EXISTS user_visited_country_table`);
        await queryRunner.query(`DROP TABLE IF EXISTS blog_like_table`);
        await queryRunner.query(`DROP TABLE IF EXISTS travel_blog_table`);
        await queryRunner.query(`DROP TABLE IF EXISTS course_bookmark_table`);
        await queryRunner.query(`DROP TABLE IF EXISTS course_like_table`);
        await queryRunner.query(`DROP TABLE IF EXISTS course_hashtag_table`);
        await queryRunner.query(`DROP TABLE IF EXISTS course_place_table`);
        await queryRunner.query(`DROP TABLE IF EXISTS course_country_table`);
        await queryRunner.query(`DROP TABLE IF EXISTS travel_course_table`);
        await queryRunner.query(`DROP TABLE IF EXISTS place_table`);
        await queryRunner.query(`DROP TABLE IF EXISTS region_table`);
        await queryRunner.query(`DROP TABLE IF EXISTS country_table`);
        await queryRunner.query(`DROP TABLE IF EXISTS user_table`);
    }

}
