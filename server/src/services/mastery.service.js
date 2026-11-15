/**
 * Mastery Service
 * Implements exponential moving average mastery tracking and student status transitions.
 * 
 * Rules:
 * 1. First attempt: mastery = score
 * 2. Later attempts: mastery = 0.6 * score + 0.4 * old_mastery
 * 3. Status is 'in_progress' once opened; becomes 'completed' once any attempt scores >= 60 (never reverts).
 * 4. Labels: weak (< 50), average (50 to 74), strong (>= 75).
 */

/**
 * Calculates updated mastery score and status.
 * 
 * @param {number} newScore - Score from current quiz attempt (0 - 100)
 * @param {number | null} currentMastery - Existing mastery score from topic_progress (or null if first attempt)
 * @param {string} currentStatus - Current progress status ('not_started' | 'in_progress' | 'completed')
 * @returns {{ mastery: number, status: string, label: 'weak' | 'average' | 'strong' }}
 */
export const calculateMastery = (newScore, currentMastery = null, currentStatus = 'in_progress') => {
  let updatedMastery;

  if (currentMastery == null || Number.isNaN(Number(currentMastery)) || currentMastery === 0) {
    // First attempt takes the raw score
    updatedMastery = newScore;
  } else {
    // Weighted formula: 60% new performance + 40% historical mastery
    updatedMastery = 0.6 * newScore + 0.4 * Number(currentMastery);
  }

  // Round to one decimal place
  updatedMastery = Math.round(updatedMastery * 10) / 10;

  // Status transitions: once completed (score >= 60), it never reverts
  let updatedStatus = currentStatus;
  if (newScore >= 60 || currentStatus === 'completed') {
    updatedStatus = 'completed';
  } else if (currentStatus === 'not_started') {
    updatedStatus = 'in_progress';
  }

  // Determine category label
  let label = 'average';
  if (updatedMastery < 50) {
    label = 'weak';
  } else if (updatedMastery >= 75) {
    label = 'strong';
  }

  return {
    mastery: updatedMastery,
    status: updatedStatus,
    label
  };
};

export default { calculateMastery };
