const prisma = require("../config/database");

const QUESTION_SELECT = {
  id: true,
  questionText: true,
  optionA: true,
  optionB: true,
  optionC: true,
  optionD: true,
  correctOption: true,
  section: true,
  topicTag: true,
  difficulty: true,
  examType: true,
  explanation: true,
  questionOrder: true,
  testId: true,
  test: { select: { id: true, title: true, examType: true } },
};

const getQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const examType = req.query.examType || "";
    const section = req.query.section || "";
    const difficulty = req.query.difficulty || "";
    const testId = req.query.testId || "";
    const skip = (page - 1) * limit;

    const where = {};
    if (search) where.questionText = { contains: search, mode: "insensitive" };
    if (examType) where.examType = examType;
    if (section) where.section = section;
    if (difficulty) where.difficulty = difficulty;
    if (testId) where.testId = testId;

    const [questions, total] = await Promise.all([
      prisma.question.findMany({ where, select: QUESTION_SELECT, skip, take: limit, orderBy: [{ testId: "asc" }, { questionOrder: "asc" }] }),
      prisma.question.count({ where }),
    ]);

    res.json({ success: true, data: { questions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } });
  } catch (error) {
    console.error("[admin] getQuestions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch questions." });
  }
};

const getQuestion = async (req, res) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: req.params.id },
      select: QUESTION_SELECT,
    });
    if (!question) return res.status(404).json({ success: false, message: "Question not found." });
    res.json({ success: true, data: question });
  } catch (error) {
    console.error("[admin] getQuestion error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch question." });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { questionText, optionA, optionB, optionC, optionD, correctOption, section, topicTag, difficulty, examType, explanation, questionOrder, testId } = req.body;

    if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctOption || !section || !difficulty || !examType || !testId || questionOrder === undefined) {
      return res.status(400).json({ success: false, message: "Question text, all options, correct option, section, difficulty, exam type, test ID, and order are required." });
    }

    const test = await prisma.test.findUnique({ where: { id: testId } });
    if (!test) return res.status(404).json({ success: false, message: "Test not found." });

    const question = await prisma.question.create({
      data: {
        questionText, optionA, optionB, optionC, optionD, correctOption, section,
        topicTag: topicTag || null, difficulty, examType, explanation: explanation || null,
        questionOrder: parseInt(questionOrder), testId,
      },
      select: QUESTION_SELECT,
    });

    res.status(201).json({ success: true, message: "Question created.", data: question });
  } catch (error) {
    console.error("[admin] createQuestion error:", error);
    res.status(500).json({ success: false, message: "Failed to create question." });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionText, optionA, optionB, optionC, optionD, correctOption, section, topicTag, difficulty, examType, explanation, questionOrder, testId } = req.body;

    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Question not found." });

    if (testId && testId !== existing.testId) {
      const test = await prisma.test.findUnique({ where: { id: testId } });
      if (!test) return res.status(404).json({ success: false, message: "Target test not found." });
    }

    const updateData = {};
    if (questionText !== undefined) updateData.questionText = questionText;
    if (optionA !== undefined) updateData.optionA = optionA;
    if (optionB !== undefined) updateData.optionB = optionB;
    if (optionC !== undefined) updateData.optionC = optionC;
    if (optionD !== undefined) updateData.optionD = optionD;
    if (correctOption !== undefined) updateData.correctOption = correctOption;
    if (section !== undefined) updateData.section = section;
    if (topicTag !== undefined) updateData.topicTag = topicTag || null;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (examType !== undefined) updateData.examType = examType;
    if (explanation !== undefined) updateData.explanation = explanation || null;
    if (questionOrder !== undefined) updateData.questionOrder = parseInt(questionOrder);
    if (testId !== undefined) updateData.testId = testId;

    const question = await prisma.question.update({ where: { id }, data: updateData, select: QUESTION_SELECT });
    res.json({ success: true, message: "Question updated.", data: question });
  } catch (error) {
    console.error("[admin] updateQuestion error:", error);
    res.status(500).json({ success: false, message: "Failed to update question." });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: "Question not found." });

    await prisma.question.delete({ where: { id } });
    res.json({ success: true, message: "Question deleted." });
  } catch (error) {
    console.error("[admin] deleteQuestion error:", error);
    res.status(500).json({ success: false, message: "Failed to delete question." });
  }
};

module.exports = { getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion };
