import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1788455510914 implements MigrationInterface {
  name = 'InitialSchema1788455510914';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" text NOT NULL, "password" text NOT NULL, "fullName" text NOT NULL, "phone" text, "isActive" boolean NOT NULL DEFAULT true, "roles" text array NOT NULL DEFAULT '{client}', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "appointments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "startTime" text NOT NULL, "endTime" text NOT NULL, "status" text NOT NULL DEFAULT 'pending', "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "serviceId" uuid, "userId" uuid, CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0239be264fb7385ca6907153b6" ON "appointments" ("date", "startTime") `,
    );
    await queryRunner.query(
      `CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "price" double precision NOT NULL DEFAULT '0', "description" text, "category" text NOT NULL, "durationMin" integer NOT NULL DEFAULT '60', "image" text, "slug" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_019d74f7abcdcb5a0113010cb03" UNIQUE ("name"), CONSTRAINT "UQ_02cf0d0f46e11d22d952f623670" UNIQUE ("slug"), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "availability_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "weekday" integer NOT NULL, "startTime" text NOT NULL, "endTime" text NOT NULL, "slotIntervalMin" integer NOT NULL DEFAULT '30', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_37dd3738c54ba3243cca374c2a1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "time_off" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "startTime" text, "endTime" text, "reason" text, CONSTRAINT "PK_e80a790cc96026d0f557a78f83d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_f77953c373efb8ab146d98e90c3" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_01733651151c8a1d6d980135cc4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_01733651151c8a1d6d980135cc4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_f77953c373efb8ab146d98e90c3"`,
    );
    await queryRunner.query(`DROP TABLE "time_off"`);
    await queryRunner.query(`DROP TABLE "availability_rules"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0239be264fb7385ca6907153b6"`,
    );
    await queryRunner.query(`DROP TABLE "appointments"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
