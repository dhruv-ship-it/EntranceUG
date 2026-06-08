const prisma = require("../config/database");

const TEST_SELECT = {
  id: true,
  title: true,
  examType: true,
  testType: true,
  section: true,
  durationMinutes: true,
  totalMarks: true,
  negativeMarking: true,
  scheduledAt: true,
  isPublished: true,
  createdAt: true,
  creator: { select: { id: true, name: true, email: true } },
  _count: { select: { questions: true, attempts: true } },
};

const getTests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const examType = req.query.examType || "";
    const testType = req.query.testType || "";
    const skip = (page - 1) * limit;

    const where = {};
    if (search) where.title = { contains: search, mode: "insensitive" };
    if (examType) where.examType = examType;
    if (testType) where.testType = testType;

    const [tests, total] = await Promise.all([
      prisma.test.findMany({ where, select: TEST_SELECT, skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.test.count({ where }),
    ]);

    res.json({ success: true, data: { tests, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } });
  } catch (error) {
    console.error("[admin] getTests error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tests." });
  }
};

const getTest = async (req, res) => {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      select: {
        ...TEST_SELECT,
        questions: {
          select: { id: true, questionText: true, section: true, difficulty: true, correctOption: true, questionOrder: true },
          orderBy: { questionOrder: "asc" },
        },
      },
    });
    if (!test) return res.status(404).json({ success: false, message: "Test not found." });
    res.json({ success: true, data: test });
  } catch (error) {
    console.error("[admin] getTest error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch test." });
  }
};

const createTest = async (req, res) => {
  try {
    const { title, examType, testType, section, durationMinutes, totalMarks, negativeMarking, scheduledAt, isPublished } = req.body;

    if (!title || !examType || !testType || !durationMinutes || !totalMarks || negativeMarking === undefined) {
      return res.status(400).json({ success: false, message: "Title, exam type, test type, duration, total marks, and negative marking are required." });
    }

    if (testType === "SECTIONAL" && !section) {
      return res.status(400).json({ success: false, message: "Section is required for sectional tests." });
    }

    const test = await prisma.test.create({
      data: {
        title, examType, testType, section: section || null,
        durationMinutes: parseInt(durationMinutes), totalMarks: parseInt(totalMarks),
        negativeMarking: parseFloat(negativeMarking),
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        isPublished: isPublished || false, createdById: req.user.id,
      },
      select: TEST_SELECT,
    });

    res.status(201).json({ success: true, message: "Test created.", data: test });
  } catch (error) {
    console.error("[admin] createTest error:", error);
    res.status(500).json({ success: false, message: "Failed to create test." });
  }
};

const updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, examType, testType, section, durationMinutes, totalMarks, negativeMarking, scheduledAt, isPublished } = req.body;

    const existing = await prisma.test.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Test not found." });

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (examType !== undefined) updateData.examType = examType;
    if (testType !== undefined) updateData.testType = testType;
    if (section !== undefined) updateData.section = section || null;
    if (durationMinutes !== undefined) updateData.durationMinutes = parseInt(durationMinutes);
    if (totalMarks !== undefined) updateData.totalMarks = parseInt(totalMarks);
    if (negativeMarking !== undefined) updateData.negativeMarking = parseFloat(negativeMarking);
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const test = await prisma.test.update({ where: { id }, data: updateData, select: TEST_SELECT });
    res.json({ success: true, message: "Test updated.", data: test });
  } catch (error) {
    console.error("[admin] updateTest error:", error);
    res.status(500).json({ success: false, message: "Failed to update test." });
  }
};

const deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.test.findUnique({ where: { id }, include: { _count: { select: { questions: true, attempts: true } } } });
    if (!existing) return res.status(404).json({ success: false, message: "Test not found." });

    if (existing._count.attempts > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete test with existing attempts." });
    }

    await prisma.$transaction([
      prisma.question.deleteMany({ where: { testId: id } }),
      prisma.test.delete({ where: { id } }),
    ]);

    res.json({ success: true, message: "Test deleted." });
  } catch (error) {
    console.error("[admin] deleteTest error:", error);
    res.status(500).json({ success: false, message: "Failed to delete test." });
  }
};

module.exports = { getTests, getTest, createTest, updateTest, deleteTest };
