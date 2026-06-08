const prisma = require("../config/database");

// GET /api/v1/student/dashboard
const getDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        examPrimary: true,
        examSecondary: true,
        classYear: true,
        mentorId: true,
        cohortId: true,
        mentor: { select: { id: true, name: true, email: true } },
        cohort: { select: { id: true, name: true, examType: true, performanceTier: true, startDate: true, examDate: true } },
      },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    // Count tasks
    const assignedTasksCount = await prisma.task.count({
      where: { studentId },
    });

    const completedTasksCount = await prisma.task.count({
      where: { studentId, isCompleted: true },
    });

    const pendingTasksCount = await prisma.task.count({
      where: { studentId, isCompleted: false },
    });

    // Count test attempts
    const testsAttemptedCount = await prisma.attempt.count({
      where: { studentId },
    });

    // Recent tests (last 5 attempts)
    const recentTests = await prisma.attempt.findMany({
      where: { studentId },
      include: { test: { select: { id: true, title: true, examType: true, testType: true, totalMarks: true } } },
      orderBy: { startedAt: "desc" },
      take: 5,
    });

    // Recent tasks (last 5 tasks)
    const recentTasks = await prisma.task.findMany({
      where: { studentId },
      orderBy: { dueDate: "desc" },
      take: 5,
    });

    res.json({
      success: true,
      data: {
        student,
        assignedTasksCount,
        pendingTasksCount,
        completedTasksCount,
        testsAttemptedCount,
        recentTests,
        recentTasks,
      },
    });
  } catch (error) {
    console.error("[student] getDashboard error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard." });
  }
};

// GET /api/v1/student/tests
const getTests = async (req, res) => {
  try {
    const studentId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get all published tests (simple approach - no filtering)
    const [tests, total] = await Promise.all([
      prisma.test.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          examType: true,
          testType: true,
          durationMinutes: true,
          totalMarks: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.test.count({ where: { isPublished: true } }),
    ]);

    // Get attempt status for each test
    const testIds = tests.map((t) => t.id);
    const attempts = await prisma.attempt.findMany({
      where: { studentId, testId: { in: testIds } },
      select: { testId: true, submittedAt: true, totalScore: true },
    });

    const attemptMap = {};
    attempts.forEach((a) => {
      attemptMap[a.testId] = {
        attempted: true,
        submittedAt: a.submittedAt,
        totalScore: a.totalScore,
      };
    });

    // Enrich tests with attempt status
    const testsWithStatus = tests.map((t) => ({
      ...t,
      attempted: attemptMap[t.id]?.attempted || false,
      submittedAt: attemptMap[t.id]?.submittedAt || null,
      score: attemptMap[t.id]?.totalScore || null,
    }));

    res.json({
      success: true,
      data: {
        tests: testsWithStatus,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("[student] getTests error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tests." });
  }
};

// GET /api/v1/student/tasks
const getTasks = async (req, res) => {
  try {
    const studentId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || "";
    const skip = (page - 1) * limit;

    const where = { studentId };
    if (status === "PENDING") where.isCompleted = false;
    if (status === "COMPLETED") where.isCompleted = true;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignedBy: { select: { id: true, name: true, email: true } },
        },
        skip,
        take: limit,
        orderBy: { dueDate: "asc" },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("[student] getTasks error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks." });
  }
};

// GET /api/v1/student/tasks/:id
const getTask = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: { id, studentId },
      include: {
        assignedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found." });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error("[student] getTask error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch task." });
  }
};

// PUT /api/v1/student/tasks/:id
const updateTask = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const { isCompleted } = req.body;

    // Verify ownership
    const existing = await prisma.task.findFirst({
      where: { id, studentId },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Task not found or not assigned to you." });
    }

    const updateData = {};
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      updateData.completedAt = isCompleted ? new Date() : null;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: { assignedBy: { select: { id: true, name: true, email: true } } },
    });

    res.json({ success: true, message: "Task updated.", data: task });
  } catch (error) {
    console.error("[student] updateTask error:", error);
    res.status(500).json({ success: false, message: "Failed to update task." });
  }
};

module.exports = { getDashboard, getTests, getTasks, getTask, updateTask };
