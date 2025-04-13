interface ReviewParams {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

interface ReviewResult extends ReviewParams {
  dueDate: Date;
}

/**
 * Calculates the next review date and parameters using the SM-2 spaced repetition algorithm
 * 
 * @param rating The user's rating of how well they knew the card (easy, medium, hard)
 * @param params The current review parameters
 * @returns New review parameters including next due date
 */
export function calculateNextReview(
  rating: 'easy' | 'medium' | 'hard',
  params: ReviewParams
): ReviewResult {
  const { easeFactor, interval, repetitions } = params;
  
  // Convert rating to a quality score (0-5)
  // SM-2 uses a scale of 0-5, where:
  // - 0-2 is a failure (we use 'hard' for this)
  // - 3 is barely successful (we use 'medium' for this)
  // - 4-5 is perfect recall (we use 'easy' for this)
  const quality = rating === 'easy' ? 5 : rating === 'medium' ? 3 : 1;
  
  // Calculate new parameters based on SM-2 algorithm
  let newEaseFactor = easeFactor;
  let newInterval = interval;
  let newRepetitions = repetitions;
  
  // Update ease factor
  newEaseFactor = Math.max(
    130, // Minimum ease factor (1.3)
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  if (quality >= 3) { // Successful recall
    // Update interval based on current repetition count
    if (newRepetitions === 0) {
      newInterval = 1; // First successful repetition: 1 day
    } else if (newRepetitions === 1) {
      newInterval = 6; // Second successful repetition: 6 days
    } else {
      // For subsequent repetitions, multiply by ease factor
      newInterval = Math.round(interval * (easeFactor / 100));
    }
    newRepetitions += 1;
  } else { // Failed recall
    newRepetitions = 0;
    newInterval = 1;
  }
  
  // Calculate the next due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + newInterval);
  
  return {
    easeFactor: Math.round(newEaseFactor),
    interval: newInterval,
    repetitions: newRepetitions,
    dueDate
  };
}
