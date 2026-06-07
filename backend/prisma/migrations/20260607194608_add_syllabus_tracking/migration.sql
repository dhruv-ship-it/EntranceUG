-- CreateEnum
CREATE TYPE "TopicSubject" AS ENUM ('QA', 'VARC', 'LRDI', 'GK');

-- CreateEnum
CREATE TYPE "TopicPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "TopicProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REVISION_PENDING');

-- CreateTable
CREATE TABLE "syllabus_topics" (
    "id" TEXT NOT NULL,
    "topic_name" TEXT NOT NULL,
    "subject" "TopicSubject" NOT NULL,
    "exam_type" "ExamType" NOT NULL,
    "priority" "TopicPriority" NOT NULL,
    "topic_order" INTEGER NOT NULL,

    CONSTRAINT "syllabus_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_syllabus_progress" (
    "status" "TopicProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "student_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,

    CONSTRAINT "student_syllabus_progress_pkey" PRIMARY KEY ("student_id","topic_id")
);

-- AddForeignKey
ALTER TABLE "student_syllabus_progress" ADD CONSTRAINT "student_syllabus_progress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_syllabus_progress" ADD CONSTRAINT "student_syllabus_progress_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "syllabus_topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
