const prisma = require("../config/database");

const COHORT_SELECT = {
  id: true,
  name: true,
  examType: true,
  performanceTier: true,
  mentorId: true,
  startDate: true,
  examDate: true,
  mentor: { select: { id: true, name: true, email: true } },
  _count: { select: { members: true } },
};

const getCohorts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const examType = req.query.examType || "";
    const skip = (page - 1) * limit;

    const where = {};
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (examType) where.examType = examType;

    const [cohorts, total] = await Promise.all([
      prisma.cohort.findMany({ where, select: COHORT_SELECT, skip, take: limit, orderBy: { startDate: "desc" } }),
      prisma.cohort.count({ where }),
    ]);

    res.json({ success: true, data: { cohorts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } });
  } catch (error) {
    console.error("[admin] getCohorts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch cohorts." });
  }
};

const getCohort = async (req, res) => {
  try {
    const cohort = await prisma.cohort.findUnique({
      where: { id: req.params.id },
      select: {
        ...COHORT_SELECT,
        members: {
          select: { id: true, name: true, email: true, phone: true, examPrimary: true, classYear: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!cohort) return res.status(404).json({ success: false, message: "Cohort not found." });
    res.json({ success: true, data: cohort });
  } catch (error) {
    console.error("[admin] getCohort error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch cohort." });
  }
};

const createCohort = async (req, res) => {
  try {
    const { name, examType, performanceTier, mentorId, startDate, examDate } = req.body;

    if (!name || !examType || !performanceTier || !mentorId || !startDate || !examDate) {
      return res.status(400).json({ success: false, message: "Name, exam type, performance tier, mentor, start date, and exam date are required." });
    }

    const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
    if (!mentor || !["MENTOR", "ADMIN"].includes(mentor.role)) {
      return res.status(400).json({ success: false, message: "Invalid mentor. Must be a mentor or admin." });
    }

    const cohort = await prisma.cohort.create({
      data: { name, examType, performanceTier, mentorId, startDate: new Date(startDate), examDate: new Date(examDate) },
      select: COHORT_SELECT,
    });

    res.status(201).json({ success: true, message: "Cohort created.", data: cohort });
  } catch (error) {
    console.error("[admin] createCohort error:", error);
    res.status(500).json({ success: false, message: "Failed to create cohort." });
  }
};

const updateCohort = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, examType, performanceTier, mentorId, startDate, examDate } = req.body;

    const existing = await prisma.cohort.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Cohort not found." });

    if (mentorId && mentorId !== existing.mentorId) {
      const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
      if (!mentor || !["MENTOR", "ADMIN"].includes(mentor.role)) {
        return res.status(400).json({ success: false, message: "Invalid mentor." });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (examType !== undefined) updateData.examType = examType;
    if (performanceTier !== undefined) updateData.performanceTier = performanceTier;
    if (mentorId !== undefined) updateData.mentorId = mentorId;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (examDate !== undefined) updateData.examDate = new Date(examDate);

    const cohort = await prisma.cohort.update({ where: { id }, data: updateData, select: COHORT_SELECT });
    res.json({ success: true, message: "Cohort updated.", data: cohort });
  } catch (error) {
    console.error("[admin] updateCohort error:", error);
    res.status(500).json({ success: false, message: "Failed to update cohort." });
  }
};

const deleteCohort = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.cohort.findUnique({ where: { id }, include: { _count: { select: { members: true } } } });
    if (!existing) return res.status(404).json({ success: false, message: "Cohort not found." });

    if (existing._count.members > 0) {
      return res.status(400).json({ success: false, message: "Cannot delete cohort with members. Remove members first." });
    }

    await prisma.cohort.delete({ where: { id } });
    res.json({ success: true, message: "Cohort deleted." });
  } catch (error) {
    console.error("[admin] deleteCohort error:", error);
    res.status(500).json({ success: false, message: "Failed to delete cohort." });
  }
};

module.exports = { getCohorts, getCohort, createCohort, updateCohort, deleteCohort };
