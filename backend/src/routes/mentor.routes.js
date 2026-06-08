const { Router } = require("express");
const { mentorLogin } = require("../controllers/auth.controller");
const {
  getStats, getStudents, getStudentDetail,
  getTasks, getTask, createTask, updateTask, deleteTask,
  getDoubts, respondDoubt,
} = require("../controllers/mentor.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = Router();

// Public
router.post("/login", mentorLogin);

// Protected (mentor only)
router.use(authenticate);
router.use(authorize("MENTOR"));

// Dashboard
router.get("/stats", getStats);

// Students
router.get("/students", getStudents);
router.get("/students/:id", getStudentDetail);

// Tasks
router.get("/tasks", getTasks);
router.get("/tasks/:id", getTask);
router.post("/tasks", createTask);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

// Doubts
router.get("/doubts", getDoubts);
router.put("/doubts/:id", respondDoubt);

module.exports = router;
