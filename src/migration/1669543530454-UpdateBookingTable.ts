import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateBookingTable1669543530454 implements MigrationInterface {
    name = 'UpdateBookingTable1669543530454'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "firstName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "booking" ADD "lastName" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "booking" DROP COLUMN "email"`);
    }

}
