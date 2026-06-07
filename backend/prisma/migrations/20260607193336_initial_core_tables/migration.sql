/*
  Warnings:

  - You are about to drop the `health_checks` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'MENTOR', 'ADMIN', 'PARENT');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('IPMAT_INDORE', 'IPMAT_ROHTAK', 'JIPMAT', 'CUET');

-- CreateEnum
CREATE TYPE "ClassYear" AS ENUM ('CLASS_11', 'CLASS_12', 'DROPPER');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'TRIAL');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('BASIC', 'PRO', 'ELITE');

-- CreateEnum
CREATE TYPE "PerformanceTier" AS ENUM ('ADVANCED', 'REGULAR', 'FOUNDATION');

-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('FULL_MOCK', 'SECTIONAL', 'TOPIC_TEST');

-- CreateEnum
CREATE TYPE "QuestionOption" AS ENUM ('A', 'B', 'C', 'D');

-- CreateEnum
CREATE TYPE "QuestionSection" AS ENUM ('QA', 'VARC', 'LRDI', 'GK');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- DropTable
DROP TABLE "health_checks";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "examPrimary" "ExamType" NOT NULL,
    "examSecondary" "ExamType",
    "classYear" "ClassYear" NOT NULL,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL,
    "subscriptionPlan" "SubscriptionPlan" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mentor_id" TEXT,
    "parent_id" TEXT,
    "cohort_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohorts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "exam_type" "ExamType" NOT NULL,
    "performance_tier" "PerformanceTier" NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "exam_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "exam_type" "ExamType" NOT NULL,
    "test_type" "TestType" NOT NULL,
    "section" "QuestionSection",
    "duration_minutes" INTEGER NOT NULL,
    "total_marks" INTEGER NOT NULL,
    "negative_marking" DOUBLE PRECISION NOT NULL,
    "scheduled_at" TIMESTAMP(3),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "option_a" TEXT NOT NULL,
    "option_b" TEXT NOT NULL,
    "option_c" TEXT NOT NULL,
    "option_d" TEXT NOT NULL,
    "correct_option" "QuestionOption" NOT NULL,
    "section" "QuestionSection" NOT NULL,
    "topic_tag" TEXT,
    "difficulty" "Difficulty" NOT NULL,
    "exam_type" "ExamType" NOT NULL,
    "explanation" TEXT,
    "question_order" INTEGER NOT NULL,
    "test_id" TEXT NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "total_score" DOUBLE PRECISION NOT NULL,
    "total_attempted" INTEGER NOT NULL,
    "total_correct" INTEGER NOT NULL,
    "total_incorrect" INTEGER NOT NULL,
    "percentile" DOUBLE PRECISION,
    "section_scores" JSONB,
    "section_attempted" JSONB,
    "section_correct" JSONB,
    "time_per_question" JSONB,
    "section_ranks" JSONB,
    "test_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cohorts" ADD CONSTRAINT "cohorts_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
