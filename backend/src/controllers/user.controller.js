const bcrypt = require("bcryptjs");
const prisma = require("../config/database");

const SALT_ROUNDS = 10;

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  examPrimary: true,
  examSecondary: true,
  classYear: true,
  subscriptionStatus: true,
  subscriptionPlan: true,
  mentorId: true,
  cohortId: true,
  createdAt: true,
};

/**
 * GET /api/v1/admin/users
 * List all users with pagination and search
 */
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const skip = (page - 1) * limit;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("[admin] getUsers error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
};

/**
 * GET /api/v1/admin/users/:id
 * Get single user by ID
 */
const getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: USER_SELECT,
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("[admin] getUser error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user." });
  }
};

/**
 * POST /api/v1/admin/users
 * Create user (admin can create any role)
 */
const createUser = async (req, res) => {
  try {
    const {
      name, email, password, phone, role,
      examPrimary, examSecondary, classYear,
      subscriptionStatus, subscriptionPlan, mentorId, cohortId,
    } = req.body;

    if (!name || !email || !password || !phone || !role || !examPrimary || !classYear) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, phone, role, exam, and class year are required.",
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        examPrimary,
        examSecondary: examSecondary || null,
        classYear,
        subscriptionStatus: subscriptionStatus || "TRIAL",
        subscriptionPlan: subscriptionPlan || "BASIC",
        mentorId: mentorId || null,
        cohortId: cohortId || null,
      },
      select: USER_SELECT,
    });

    res.status(201).json({ success: true, message: "User created.", data: user });
  } catch (error) {
    console.error("[admin] createUser error:", error);
    res.status(500).json({ success: false, message: "Failed to create user." });
  }
};

/**
 * PUT /api/v1/admin/users/:id
 * Update user details
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, email, phone, role,
      examPrimary, examSecondary, classYear,
      subscriptionStatus, subscriptionPlan, mentorId, cohortId, password,
    } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // If email changed, check uniqueness
    if (email && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return res.status(409).json({ success: false, message: "Email already in use." });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (examPrimary !== undefined) updateData.examPrimary = examPrimary;
    if (examSecondary !== undefined) updateData.examSecondary = examSecondary || null;
    if (classYear !== undefined) updateData.classYear = classYear;
    if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;
    if (subscriptionPlan !== undefined) updateData.subscriptionPlan = subscriptionPlan;
    if (mentorId !== undefined) updateData.mentorId = mentorId || null;
    if (cohortId !== undefined) updateData.cohortId = cohortId || null;
    if (password) updateData.password = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_SELECT,
    });

    res.json({ success: true, message: "User updated.", data: user });
  } catch (error) {
    console.error("[admin] updateUser error:", error);
    res.status(500).json({ success: false, message: "Failed to update user." });
  }
};

/**
 * DELETE /api/v1/admin/users/:id
 * Delete user
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (existing.role === "ADMIN" && id === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot delete your own admin account." });
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: "User deleted." });
  } catch (error) {
    console.error("[admin] deleteUser error:", error);
    res.status(500).json({ success: false, message: "Failed to delete user. User may have related records." });
  }
};

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };
