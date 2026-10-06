import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFlashcardDomain20261006143756 implements MigrationInterface {
    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.dropCourseReportsTable(queryRunner);
        await this.dropUserStatsTable(queryRunner);
        await this.dropFolderTables(queryRunner);
        await this.dropHomeworkAttemptAnswersTable(queryRunner);
        await this.dropHomeworkAttemptsTable(queryRunner);
        await this.dropHomeworksTable(queryRunner);
        await this.dropCourseSharesTable(queryRunner);
        await this.dropTagTables(queryRunner);
        await this.dropFlashcardsTable(queryRunner);
        await this.dropCoursesTable(queryRunner);
        await this.dropUserRoleColumn(queryRunner);
        await this.dropEnums(queryRunner);
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.createEnums(queryRunner);
        await this.addUserRoleColumn(queryRunner);
        await this.createCoursesTable(queryRunner);
        await this.createFlashcardsTable(queryRunner);
        await this.createTagTables(queryRunner);
        await this.createCourseSharesTable(queryRunner);
        await this.createHomeworksTable(queryRunner);
        await this.createHomeworkAttemptsTable(queryRunner);
        await this.createHomeworkAttemptAnswersTable(queryRunner);
        await this.createFolderTables(queryRunner);
        await this.createUserStatsTable(queryRunner);
        await this.createCourseReportsTable(queryRunner);
    }

    private async addUserRoleColumn(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'USER';
        `);
    }

    private async createCourseReportsTable(
        queryRunner: QueryRunner,
    ): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE course_reports (
                id UUID PRIMARY KEY NOT NULL,
                course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                reported_by_user_id UUID NOT NULL REFERENCES users(id),
                reason report_reason NOT NULL,
                detail TEXT,
                status report_status NOT NULL DEFAULT 'PENDING',
                reviewed_by_user_id UUID REFERENCES users(id),
                review_note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP
            );
        `);
        await queryRunner.query(`
            CREATE INDEX idx_course_reports_course_id ON course_reports(course_id);
        `);
        await queryRunner.query(`
            CREATE INDEX idx_course_reports_status ON course_reports(status);
        `);
    }

    private async createCourseSharesTable(
        queryRunner: QueryRunner,
    ): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE course_shares (
                id UUID PRIMARY KEY NOT NULL,
                course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                shared_by_user_id UUID NOT NULL REFERENCES users(id),
                share_type share_type NOT NULL,
                shared_with_email VARCHAR(255),
                status share_status NOT NULL DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP
            );
        `);
        await queryRunner.query(`
            CREATE INDEX idx_course_shares_course_id ON course_shares(course_id);
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX uq_course_shares_email_active ON course_shares(course_id, shared_with_email)
                WHERE share_type = 'EMAIL' AND status = 'ACTIVE';
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX uq_course_shares_all_active ON course_shares(course_id)
                WHERE share_type = 'ALL' AND status = 'ACTIVE';
        `);
    }

    private async createCoursesTable(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE courses (
                id UUID PRIMARY KEY NOT NULL,
                owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description VARCHAR(1000),
                visibility course_visibility NOT NULL DEFAULT 'PRIVATE',
                source_course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
                clone_count SMALLINT NOT NULL DEFAULT 0,
                is_suspended BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP
            );
        `);
        await queryRunner.query(`
            CREATE INDEX idx_courses_owner_id ON courses(owner_id);
        `);
        await queryRunner.query(`
            CREATE INDEX idx_courses_visibility ON courses(visibility);
        `);
    }

    private async createEnums(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE course_visibility AS ENUM ('PRIVATE', 'SHARED');
        `);
        await queryRunner.query(`
            CREATE TYPE share_type AS ENUM ('EMAIL', 'ALL');
        `);
        await queryRunner.query(`
            CREATE TYPE share_status AS ENUM ('ACTIVE', 'REVOKED');
        `);
        await queryRunner.query(`
            CREATE TYPE homework_type AS ENUM ('MULTIPLE_CHOICE', 'WRITE_WORD');
        `);
        await queryRunner.query(`
            CREATE TYPE homework_direction AS ENUM ('EN_TO_VI', 'VI_TO_EN', 'MIXED');
        `);
        await queryRunner.query(`
            CREATE TYPE attempt_status AS ENUM ('IN_PROGRESS', 'COMPLETED');
        `);
        await queryRunner.query(`
            CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
        `);
        await queryRunner.query(`
            CREATE TYPE report_reason AS ENUM ('INAPPROPRIATE_CONTENT', 'SPAM', 'COPYRIGHT', 'OTHER');
        `);
        await queryRunner.query(`
            CREATE TYPE report_status AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED', 'ACTION_TAKEN');
        `);
    }

    private async createFlashcardsTable(
        queryRunner: QueryRunner,
    ): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE flashcards (
                id UUID PRIMARY KEY NOT NULL,
                course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                word_en VARCHAR(255) NOT NULL,
                word_vi VARCHAR(255) NOT NULL,
                example TEXT,
                position SMALLINT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP,
                UNIQUE (course_id, word_en)
            );
        `);
        await queryRunner.query(`
            CREATE INDEX idx_flashcards_course_id ON flashcards(course_id);
        `);
    }

    private async createFolderTables(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE folders (
                id UUID PRIMARY KEY NOT NULL,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP
            );
        `);
        await queryRunner.query(`
            CREATE INDEX idx_folders_user_id ON folders(user_id);
        `);
        await queryRunner.query(`
            CREATE TABLE folder_courses (
                id UUID PRIMARY KEY NOT NULL,
                folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
                course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP,
                UNIQUE (folder_id, course_id)
            );
        `);
    }

    private async createHomeworkAttemptAnswersTable(
        queryRunner: QueryRunner,
    ): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE homework_attempt_answers (
                id UUID PRIMARY KEY NOT NULL,
                attempt_id UUID NOT NULL REFERENCES homework_attempts(id) ON DELETE CASCADE,
                flashcard_id UUID REFERENCES flashcards(id) ON DELETE SET NULL,
                question_direction homework_direction NOT NULL,
                user_answer TEXT NOT NULL,
                is_correct BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP
            );
        `);
        await queryRunner.query(`
            CREATE INDEX idx_homework_attempt_answers_attempt_id ON homework_attempt_answers(attempt_id);
        `);
    }

    private async createHomeworkAttemptsTable(
        queryRunner: QueryRunner,
    ): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE homework_attempts (
                id UUID PRIMARY KEY NOT NULL,
                homework_id UUID NOT NULL REFERENCES homeworks(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id),
                status attempt_status NOT NULL DEFAULT 'IN_PROGRESS',
                total_questions SMALLINT NOT NULL,
                correct_count SMALLINT NOT NULL DEFAULT 0,
                score NUMERIC(5,2),
                started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP
            );
        `);
        await queryRunner.query(`
            CREATE INDEX idx_homework_attempts_homework_user ON homework_attempts(homework_id, user_id);
        `);
        await queryRunner.query(`
            CREATE INDEX idx_homework_attempts_started_at ON homework_attempts(started_at);
        `);
    }

    private async createHomeworksTable(
        queryRunner: QueryRunner,
    ): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE homeworks (
                id UUID PRIMARY KEY NOT NULL,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                type homework_type NOT NULL,
                title VARCHAR(255),
                direction homework_direction NOT NULL DEFAULT 'MIXED',
                question_count SMALLINT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP
            );
        `);
        await queryRunner.query(`
            CREATE INDEX idx_homeworks_user_id ON homeworks(user_id);
        `);
        await queryRunner.query(`
            CREATE INDEX idx_homeworks_course_id ON homeworks(course_id);
        `);
    }

    private async createTagTables(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE tags (
                id UUID PRIMARY KEY NOT NULL,
                name VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP
            );
        `);
        await queryRunner.query(`
            CREATE TABLE course_tags (
                id UUID PRIMARY KEY NOT NULL,
                course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP,
                UNIQUE (course_id, tag_id)
            );
        `);
    }

    private async createUserStatsTable(
        queryRunner: QueryRunner,
    ): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE user_stats (
                id UUID PRIMARY KEY NOT NULL,
                user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                current_streak SMALLINT NOT NULL DEFAULT 0,
                longest_streak SMALLINT NOT NULL DEFAULT 0,
                last_activity_date DATE,
                total_points INT NOT NULL DEFAULT 0,
                total_correct_answers INT NOT NULL DEFAULT 0,
                total_attempts_completed INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP
            );
        `);
    }

    private async dropCourseReportsTable(
        queryRunner: QueryRunner,
    ): Promise<void> {
        await queryRunner.query(`
            DROP TABLE course_reports;
        `);
    }

    private async dropCourseSharesTable(
        queryRunner: QueryRunner,
    ): Promise<void> {
        await queryRunner.query(`
            DROP TABLE course_shares;
        `);
    }

    private async dropCoursesTable(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE courses;
        `);
    }

    private async dropEnums(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TYPE report_status;
        `);
        await queryRunner.query(`
            DROP TYPE report_reason;
        `);
        await queryRunner.query(`
            DROP TYPE user_role;
        `);
        await queryRunner.query(`
            DROP TYPE attempt_status;
        `);
        await queryRunner.query(`
            DROP TYPE homework_direction;
        `);
        await queryRunner.query(`
            DROP TYPE homework_type;
        `);
        await queryRunner.query(`
            DROP TYPE share_status;
        `);
        await queryRunner.query(`
            DROP TYPE share_type;
        `);
        await queryRunner.query(`
            DROP TYPE course_visibility;
        `);
    }

    private async dropFlashcardsTable(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE flashcards;
        `);
    }

    private async dropFolderTables(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE folder_courses;
        `);
        await queryRunner.query(`
            DROP TABLE folders;
        `);
    }

    private async dropHomeworkAttemptAnswersTable(
        queryRunner: QueryRunner,
    ): Promise<void> {
        await queryRunner.query(`
            DROP TABLE homework_attempt_answers;
        `);
    }

    private async dropHomeworkAttemptsTable(
        queryRunner: QueryRunner,
    ): Promise<void> {
        await queryRunner.query(`
            DROP TABLE homework_attempts;
        `);
    }

    private async dropHomeworksTable(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE homeworks;
        `);
    }

    private async dropTagTables(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE course_tags;
        `);
        await queryRunner.query(`
            DROP TABLE tags;
        `);
    }

    private async dropUserRoleColumn(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users DROP COLUMN role;
        `);
    }

    private async dropUserStatsTable(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE user_stats;
        `);
    }
}
