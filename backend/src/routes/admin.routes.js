const { Router } = require("express");
const { adminLogin } = require("../controllers/auth.controller");
const { getStats } = require("../controllers/admin.controller");
const { getUsers, getUser, createUser, updateUser, deleteUser, getMentors, assignMentor } = require("../controllers/user.controller");
const { getCohorts, getCohort, createCohort, updateCohort, deleteCohort } = require("../controllers/cohort.controller");
const { getTests, getTest, createTest, updateTest, deleteTest } = require("../controllers/test.controller");
const { getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion } = require("../controllers/question.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = Router();

// Public
router.post("/login", adminLogin);

// Protected (admin only)
router.use(authenticate);
router.use(authorize("ADMIN"));

// Stats
router.get("/stats", getStats);

// Users CRUD
router.get("/users", getUsers);
router.post("/users", createUser);
router.get("/users/:id", getUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/mentors", getMentors);
router.put("/students/:id/mentor", assignMentor);

// Cohorts CRUD
router.get("/cohorts", getCohorts);
router.post("/cohorts", createCohort);
router.get("/cohorts/:id", getCohort);
router.put("/cohorts/:id", updateCohort);
router.delete("/cohorts/:id", deleteCohort);

// Tests CRUD
router.get("/tests", getTests);
router.post("/tests", createTest);
router.get("/tests/:id", getTest);
router.put("/tests/:id", updateTest);
router.delete("/tests/:id", deleteTest);

// Questions CRUD
router.get("/questions", getQuestions);
router.post("/questions", createQuestion);
router.get("/questions/:id", getQuestion);
router.put("/questions/:id", updateQuestion);
router.delete("/questions/:id", deleteQuestion);

module.exports = router;
