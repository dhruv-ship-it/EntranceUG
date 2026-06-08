const { Router } = require("express");
const {
  getDashboard, getTests, getTasks, getTask, updateTask,
  getDoubts, getDoubt, createDoubt,
} = require("../controllers/student.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = Router();

// Protected (student only)
router.use(authenticate);
router.use(authorize("STUDENT"));

// Dashboard
router.get("/dashboard", getDashboard);

// Tests
router.get("/tests", getTests);

// Tasks
router.get("/tasks", getTasks);
router.get("/tasks/:id", getTask);
router.put("/tasks/:id", updateTask);

// Doubts
router.get("/doubts", getDoubts);
router.get("/doubts/:id", getDoubt);
router.post("/doubts", createDoubt);

module.exports = router;
