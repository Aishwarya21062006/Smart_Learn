/**
 * Scoring Service
 * Handles server-side quiz grading, score calculation, and review preparation.
 * 
 * Formula: score = (correct ÷ total) * 100, rounded to one decimal place.
 * suggestExplainer is true when score < 50.
 */

/**
 * Grades user quiz answers against the true questions retrieved from the database.
 * 
 * @param {Array<{ id: string, question: string, options: string[], correct_index: number, explanation: string }>} dbQuestions
 * @param {Array<{ questionId: string, selectedIndex: number }>} userAnswers
 * @returns {{ score: number, correct: number, total: number, suggestExplainer: boolean, review: Array }}
 */
export const gradeQuiz = (dbQuestions, userAnswers) => {
  const answerMap = new Map();
  for (const ans of userAnswers || []) {
    answerMap.set(ans.questionId, ans.selectedIndex);
  }

  let correctCount = 0;
  const total = dbQuestions.length;

  const review = dbQuestions.map((q) => {
    const userSelected = answerMap.has(q.id) ? answerMap.get(q.id) : null;
    const isCorrect = userSelected === q.correct_index;

    if (isCorrect) {
      correctCount += 1;
    }

    return {
      questionId: q.id,
      question: q.question,
      options: q.options,
      selectedIndex: userSelected,
      correctIndex: q.correct_index,
      correct: isCorrect,
      explanation: q.explanation || 'No explanation provided for this question.'
    };
  });

  // Calculate score percentage (rounded to 1 decimal place)
  const rawScore = total > 0 ? (correctCount / total) * 100 : 0;
  const score = Math.round(rawScore * 10) / 10;
  const suggestExplainer = score < 50;

  return {
    score,
    correct: correctCount,
    total,
    suggestExplainer,
    review
  };
};

export default { gradeQuiz };
