-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "TemplateState" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "daily_task_exceptions" ADD COLUMN     "frequency_snapshot" "RecurrenceFrequency" NOT NULL DEFAULT 'DAILY';

-- AlterTable
ALTER TABLE "daily_task_instances" ADD COLUMN     "frequency_snapshot" "RecurrenceFrequency" NOT NULL DEFAULT 'DAILY';

-- AlterTable
ALTER TABLE "daily_task_templates" ADD COLUMN     "frequency" "RecurrenceFrequency" NOT NULL DEFAULT 'DAILY';

-- CreateTable
CREATE TABLE "recurring_task_frequency_history" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "effectiveDate" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurring_task_frequency_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_task_lifecycle_history" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "state" "TemplateState" NOT NULL,
    "effectiveDate" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurring_task_lifecycle_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recurring_task_frequency_history_template_id_effectiveDate_idx" ON "recurring_task_frequency_history"("template_id", "effectiveDate");

-- CreateIndex
CREATE INDEX "recurring_task_lifecycle_history_template_id_effectiveDate_idx" ON "recurring_task_lifecycle_history"("template_id", "effectiveDate");

-- AddForeignKey
ALTER TABLE "recurring_task_frequency_history" ADD CONSTRAINT "recurring_task_frequency_history_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "daily_task_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_task_frequency_history" ADD CONSTRAINT "recurring_task_frequency_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_task_lifecycle_history" ADD CONSTRAINT "recurring_task_lifecycle_history_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "daily_task_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_task_lifecycle_history" ADD CONSTRAINT "recurring_task_lifecycle_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
