const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const env = require("../config/env");

const SALT_ROUNDS = 10;

/**
 * POST /api/v1/auth/signup
 * Student registration
 */
const signup = async (req, res) => {
  try {
    const { name, email, password, phone, examPrimary, examSecondary, classYear } = req.body;

    // Validation
    if (!name || !email || !password || !phone || !examPrimary || !classYear) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, phone, primary exam, and class year are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: "STUDENT",
        examPrimary,
        examSecondary: examSecondary || null,
        classYear,
        subscriptionStatus: "TRIAL",
        subscriptionPlan: "BASIC",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        examPrimary: true,
        examSecondary: true,
        classYear: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: { user, token },
    });
  } catch (error) {
    console.error("[auth] Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * POST /api/v1/auth/login
 * Student login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user with password
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );

    res.json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("[auth] Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * POST /api/v1/admin/login
 * Admin-only login
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "ADMIN") {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials.",
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials.",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );

    res.json({
      success: true,
      message: "Admin login successful.",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("[auth] Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * POST /api/v1/mentor/login
 * Mentor-only login
 */
const mentorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "MENTOR") {
      return res.status(401).json({ success: false, message: "Invalid mentor credentials." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid mentor credentials." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );

    res.json({
      success: true,
      message: "Mentor login successful.",
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token,
      },
    });
  } catch (error) {
    console.error("[auth] Mentor login error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = { signup, login, adminLogin, mentorLogin };
