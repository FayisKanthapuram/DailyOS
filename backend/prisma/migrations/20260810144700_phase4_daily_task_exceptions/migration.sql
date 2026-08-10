-- CreateEnum
CREATE TYPE "ExceptionType" AS ENUM ('SKIP');

-- CreateTable
CREATE TABLE "daily_task_exceptions" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" "ExceptionType" NOT NULL DEFAULT 'SKIP',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_task_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_task_exceptions_template_id_date_key" ON "daily_task_exceptions"("template_id", "date");

-- AddForeignKey
ALTER TABLE "daily_task_exceptions" ADD CONSTRAINT "daily_task_exceptions_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "daily_task_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_task_exceptions" ADD CONSTRAINT "daily_task_exceptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
