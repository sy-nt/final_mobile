import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserNames20261007124456 implements MigrationInterface {
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users
                DROP COLUMN first_name,
                DROP COLUMN last_name,
                DROP COLUMN last_login_at;
        `);
    }

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users
                ADD COLUMN first_name VARCHAR(255) NOT NULL DEFAULT '',
                ADD COLUMN last_name VARCHAR(255) NOT NULL DEFAULT '',
                ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
        `);
        await queryRunner.query(`
            ALTER TABLE users
                ALTER COLUMN first_name DROP DEFAULT,
                ALTER COLUMN last_name DROP DEFAULT;
        `);
    }
}
