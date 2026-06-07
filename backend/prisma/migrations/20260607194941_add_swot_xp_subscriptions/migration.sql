-- CreateEnum
CREATE TYPE "XPEventType" AS ENUM ('TASK_COMPLETE', 'MOCK_ATTEMPT', 'DOUBT_RAISED', 'CHECKIN', 'STREAK_BONUS', 'BADGE_EARNED');

-- CreateEnum
CREATE TYPE "SubscriptionStatusRecord" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "swot_analyses" (
    "id" TEXT NOT NULL,
    "exam_type" "ExamType" NOT NULL,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "opportunities" TEXT[],
    "threats" TEXT[],
    "mentor_notes_s" TEXT,
    "mentor_notes_w" TEXT,
    "mentor_notes_o" TEXT,
    "mentor_notes_t" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_auto_generated" BOOLEAN NOT NULL DEFAULT false,
    "student_id" TEXT NOT NULL,

    CONSTRAINT "swot_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_ledger" (
    "id" TEXT NOT NULL,
    "event_type" "XPEventType" NOT NULL,
    "xp_amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "student_id" TEXT NOT NULL,

    CONSTRAINT "xp_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "razorpay_subscription_id" TEXT,
    "razorpay_order_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "SubscriptionStatusRecord" NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "student_id" TEXT NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "swot_analyses" ADD CONSTRAINT "swot_analyses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_ledger" ADD CONSTRAINT "xp_ledger_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
