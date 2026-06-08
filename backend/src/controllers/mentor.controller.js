const prisma = require("../config/database");

// GET /api/v1/mentor/stats
const getStats = async (req, res) => {
  try {
    const mentorId = req.user.id;

    const [totalStudents, pendingDoubts, pendingTasks, recentCheckins] = await Promise.all([
      prisma.user.count({ where: { mentorId } }),
      prisma.doubt.count({
        where: { mentorId, status: "OPEN" },
      }),
      prisma.task.count({
        where: { student: { mentorId }, isCompleted: false },
      }),
      prisma.checkin.count({
        where: { student: { mentorId } },
      }),
    ]);

    const totalTasksAssigned = await prisma.task.count({
      where: { student: { mentorId } },
    });

    const completedTasks = await prisma.task.count({
      where: { student: { mentorId }, isCompleted: true },
    });

    const resolvedDoubts = await prisma.doubt.count({
      where: { mentorId, status: "RESOLVED" },
    });

    const ledCohorts = await prisma.cohort.count({
      where: { mentorId },
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        pendingDoubts,
        pendingTasks,
        recentCheckins,
        totalTasksAssigned,
        completedTasks,
        resolvedDoubts,
        ledCohorts,
      },
    });
  } catch (error) {
    console.error("[mentor] getStats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch stats." });
  }
};

// GET /api/v1/mentor/students
const getStudents = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const where = { mentorId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true,
          examPrimary: true, examSecondary: true, classYear: true,
          subscriptionStatus: true, createdAt: true,
          cohort: { select: { id: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: { students, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    console.error("[mentor] getStudents error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch students." });
  }
};

// GET /api/v1/mentor/students/:id
const getStudentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const mentorId = req.user.id;

    const student = await prisma.user.findUnique({
      where: { id, mentorId },
      select: {
        id: true, name: true, email: true, phone: true,
        examPrimary: true, examSecondary: true, classYear: true,
        subscriptionStatus: true, subscriptionPlan: true, createdAt: true,
        cohort: { select: { id: true, name: true, examType: true, performanceTier: true, startDate: true, examDate: true } },
      },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found or not assigned to you." });
    }

    const [tasks, doubts, checkins, attempts] = await Promise.all([
      prisma.task.findMany({
        where: { studentId: id },
        orderBy: { dueDate: "desc" },
        take: 20,
      }),
      prisma.doubt.findMany({
        where: { studentId: id, mentorId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.checkin.findMany({
        where: { studentId: id },
        orderBy: { date: "desc" },
        take: 10,
      }),
      prisma.attempt.findMany({
        where: { studentId: id },
        include: { test: { select: { title: true, examType: true, testType: true, totalMarks: true } } },
        orderBy: { startedAt: "desc" },
        take: 10,
      }),
    ]);

    res.json({ success: true, data: { student, tasks, doubts, checkins, attempts } });
  } catch (error) {
    console.error("[mentor] getStudentDetail error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch student detail." });
  }
};

// GET /api/v1/mentor/tasks
const getTasks = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const studentId = req.query.studentId || "";
    const skip = (page - 1) * limit;

    const where = { student: { mentorId } };
    if (studentId) where.studentId = studentId;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, email: true } },
          assignedBy: { select: { id: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { dueDate: "desc" },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      success: true,
      data: { tasks, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    console.error("[mentor] getTasks error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks." });
  }
};

// POST /api/v1/mentor/tasks
const createTask = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { studentId, title, description, taskType, resourceUrl, dueDate, xpReward } = req.body;

    if (!studentId || !title || !description || !taskType || !dueDate) {
      return res.status(400).json({ success: false, message: "Student, title, description, task type, and due date are required." });
    }

    // Verify student is assigned to this mentor
    const student = await prisma.user.findUnique({ where: { id: studentId, mentorId } });
    if (!student) {
      return res.status(403).json({ success: false, message: "Student not assigned to you." });
    }

    const task = await prisma.task.create({
      data: {
        title, description, taskType,
        resourceUrl: resourceUrl || null,
        dueDate: new Date(dueDate),
        xpReward: xpReward || 10,
        studentId,
        assignedById: mentorId,
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, message: "Task created.", data: task });
  } catch (error) {
    console.error("[mentor] createTask error:", error);
    res.status(500).json({ success: false, message: "Failed to create task." });
  }
};

// PUT /api/v1/mentor/tasks/:id
const updateTask = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;
    const { title, description, taskType, resourceUrl, dueDate, xpReward, isCompleted } = req.body;

    const existing = await prisma.task.findFirst({
      where: { id, student: { mentorId } },
    });
    if (!existing) return res.status(404).json({ success: false, message: "Task not found." });

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (taskType !== undefined) updateData.taskType = taskType;
    if (resourceUrl !== undefined) updateData.resourceUrl = resourceUrl || null;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (xpReward !== undefined) updateData.xpReward = xpReward;
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      updateData.completedAt = isCompleted ? new Date() : null;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: { student: { select: { id: true, name: true, email: true } } },
    });

    res.json({ success: true, message: "Task updated.", data: task });
  } catch (error) {
    console.error("[mentor] updateTask error:", error);
    res.status(500).json({ success: false, message: "Failed to update task." });
  }
};

// GET /api/v1/mentor/doubts
const getDoubts = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || "";
    const skip = (page - 1) * limit;

    const where = { mentorId };
    if (status) where.status = status;

    const [doubts, total] = await Promise.all([
      prisma.doubt.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.doubt.count({ where }),
    ]);

    res.json({
      success: true,
      data: { doubts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    console.error("[mentor] getDoubts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch doubts." });
  }
};

// PUT /api/v1/mentor/doubts/:id
const respondDoubt = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;
    const { mentorResponse } = req.body;

    if (!mentorResponse) {
      return res.status(400).json({ success: false, message: "Response text is required." });
    }

    const doubt = await prisma.doubt.findFirst({ where: { id, mentorId } });
    if (!doubt) return res.status(404).json({ success: false, message: "Doubt not found." });

    const updated = await prisma.doubt.update({
      where: { id },
      data: { mentorResponse, status: "RESOLVED" },
      include: { student: { select: { id: true, name: true, email: true } } },
    });

    res.json({ success: true, message: "Doubt resolved.", data: updated });
  } catch (error) {
    console.error("[mentor] respondDoubt error:", error);
    res.status(500).json({ success: false, message: "Failed to respond to doubt." });
  }
};

module.exports = {
  getStats, getStudents, getStudentDetail,
  getTasks, createTask, updateTask,
  getDoubts, respondDoubt,
};
