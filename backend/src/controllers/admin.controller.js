const prisma = require("../config/database");

/**
 * GET /api/v1/admin/stats
 * Dashboard statistics
 */
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalMentors, studentsWithoutMentor, totalCohorts, totalTests, totalAttempts] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.user.count({ where: { role: "MENTOR" } }),
        prisma.user.count({ where: { role: "STUDENT", mentorId: null } }),
        prisma.cohort.count(),
        prisma.test.count(),
        prisma.attempt.count(),
      ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStudents,
        totalMentors,
        studentsWithoutMentor,
        totalCohorts,
        totalTests,
        totalAttempts,
      },
    });
  } catch (error) {
    console.error("[admin] Stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = { getStats };
