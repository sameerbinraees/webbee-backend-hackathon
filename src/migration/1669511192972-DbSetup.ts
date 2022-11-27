import { MigrationInterface, QueryRunner } from 'typeorm';
import { format, addDays } from 'date-fns';

export class UpdateDb1669511192972 implements MigrationInterface {
  name = 'UpdateDb1669511192972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "event" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "advanceBookingDays" integer NOT NULL, "duration" integer NOT NULL, "holidayDates" TIMESTAMP WITH TIME ZONE array NOT NULL, "cleanUpBreak" integer NOT NULL, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."booking_status_enum" AS ENUM('PENDING', 'COMPLETED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "booking" ("id" SERIAL NOT NULL, "startTime" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."booking_status_enum" NOT NULL, "eventId" integer, CONSTRAINT "PK_49171efc69702ed84c812f33540" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."config_dayofweek_enum" AS ENUM('1', '2', '3', '4', '5', '6')`,
    );
    await queryRunner.query(
      `CREATE TABLE "config" ("id" SERIAL NOT NULL, "dayOfWeek" "public"."config_dayofweek_enum" NOT NULL, "openingTime" TIMESTAMP WITH TIME ZONE NOT NULL, "closingTime" TIMESTAMP WITH TIME ZONE NOT NULL, "workBreaks" text array NOT NULL, "totalClientsPerSlot" integer NOT NULL, "eventId" integer, CONSTRAINT "PK_d0ee79a681413d50b0a4f98cf7b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" ADD CONSTRAINT "FK_161ef84a823b75f741862a77138" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "config" ADD CONSTRAINT "FK_3a5c66f11194b9197e0ea71c3c0" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    {
      const publicHolidayDate = format(addDays(new Date(), 3), 'y-MM-dd HH:mm:ss');

      await queryRunner.query(`
                INSERT INTO event (name, "advanceBookingDays", duration, "holidayDates", "cleanUpBreak")
                VALUES
                ('Men Haircut', 7, 10, '{${publicHolidayDate}}', 5),
                ('Women Haircut', 7, 60, '{${publicHolidayDate}}', 10)
         `);
      // await queryRunner.commitTransaction();

      const lunchBreak = `${format(
        new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 12),
        'y-MM-dd HH:mm:ss',
      )} -- ${format(
        new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 13),
        'y-MM-dd HH:mm:ss',
      )}`;

      const cleaningBreak = `${format(
        new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 15),
        'y-MM-dd HH:mm:ss',
      )} -- ${format(
        new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 16),
        'y-MM-dd HH:mm:ss',
      )}`;

      const openingTimeOnNormalDays = format(
        new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 8),
        'y-MM-dd HH:mm:ss',
      );

      const closingTimeOnNormalDays = format(
        new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 20),
        'y-MM-dd HH:mm:ss',
      );

      const openingTimeOnSaturday = format(
        new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 10),
        'y-MM-dd HH:mm:ss',
      );
      const closingTimeOnSaturday = format(
        new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 22),
        'y-MM-dd HH:mm:ss',
      );

      await queryRunner.query(`
        INSERT INTO config ("eventId", "dayOfWeek", "openingTime", "closingTime", "workBreaks", "totalClientsPerSlot")
        VALUES
        (1, '1', '${openingTimeOnNormalDays}', '${closingTimeOnNormalDays}', '{"${lunchBreak}", "${cleaningBreak}"}', 3),
        (1, '2', '${openingTimeOnNormalDays}', '${closingTimeOnNormalDays}', '{"${lunchBreak}", "${cleaningBreak}"}', 3),
        (1, '3', '${openingTimeOnNormalDays}', '${closingTimeOnNormalDays}', '{"${lunchBreak}", "${cleaningBreak}"}', 3),
        (1, '4', '${openingTimeOnNormalDays}', '${closingTimeOnNormalDays}', '{"${lunchBreak}", "${cleaningBreak}"}', 3),
        (1, '5', '${openingTimeOnNormalDays}', '${closingTimeOnNormalDays}', '{"${lunchBreak}", "${cleaningBreak}"}', 3),
        (1, '6', '${openingTimeOnSaturday}', '${closingTimeOnSaturday}', '{"${lunchBreak}", "${cleaningBreak}"}', 3),
        (2, '1', '${openingTimeOnNormalDays}', '${closingTimeOnNormalDays}', '{"${lunchBreak}", "${cleaningBreak}"}', 3),
        (2, '2', '${openingTimeOnNormalDays}', '${closingTimeOnNormalDays}', '{"${lunchBreak}", "${cleaningBreak}"}', 3),
        (2, '3', '${openingTimeOnNormalDays}', '${closingTimeOnNormalDays}', '{"${lunchBreak}", "${cleaningBreak}"}', 3),
        (2, '4', '${openingTimeOnNormalDays}', '${closingTimeOnNormalDays}', '{"${lunchBreak}", "${cleaningBreak}"}', 3),
        (2, '5', '${openingTimeOnNormalDays}', '${closingTimeOnNormalDays}', '{"${lunchBreak}", "${cleaningBreak}"}', 3),
        (2, '6', '${openingTimeOnSaturday}', '${closingTimeOnSaturday}', '{"${lunchBreak}", "${cleaningBreak}"}', 3)
    `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "config" DROP CONSTRAINT "FK_3a5c66f11194b9197e0ea71c3c0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking" DROP CONSTRAINT "FK_161ef84a823b75f741862a77138"`,
    );
    await queryRunner.query(`DROP TABLE "config"`);
    await queryRunner.query(`DROP TYPE "public"."config_dayofweek_enum"`);
    await queryRunner.query(`DROP TABLE "booking"`);
    await queryRunner.query(`DROP TYPE "public"."booking_status_enum"`);
    await queryRunner.query(`DROP TABLE "event"`);
  }
}
