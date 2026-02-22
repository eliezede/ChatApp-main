export const calculateProfile = (answers) => {
    // Simplified formulas based on identified logic

    // Risk Score (0-100)
    const q4 = answers.q4_weight || 0;
    const q6 = answers.q6_weight || 0;
    const q7 = answers.q7_weight || 0;
    const contactPts = answers.contactPts || 0;
    const crisesPts = answers.crisesPts || 0;
    const riskScore = (q6 * 6 + q7 * 6 + contactPts * 0.8 + q4 * 4 + crisesPts) / 2;

    // Stability Score (0-100)
    const q8 = answers.q8 || 0;
    const q9 = answers.q9 || 0;
    const q11 = answers.q11 || 0;
    const q10 = answers.q10 || 0;
    const q22 = answers.q22 || 0;
    const stabilityScore = (q8 * 10 + q9 * 10 + q11 * 12 + (10 - q10) * 10 + q22 * 10) / 5;

    // Structure Score (0-100)
    const q14 = answers.q14_weight || 0;
    const q16 = answers.q16_weight || 0;
    const workPts = answers.workPts || 0;
    const trainingPts = answers.trainingPts || 0;
    const structureScore = (workPts * 0.35 + q14 * 10 * 0.25 + q16 * 10 * 0.25 + trainingPts * 0.15);

    // Discipline Score (0-100)
    const challengePts = answers.challengePts || 0;
    const timePts = answers.timePts || 0;
    const commitPts = answers.commitPts || 0;
    const disciplineScore = (challengePts * 0.35 + timePts * 0.25 + trainingPts * 0.20 + commitPts * 0.20);

    // Phase Decision
    let phase = 2;
    if (riskScore >= 65 || stabilityScore <= 45) {
        phase = 1; // Stabilization
    } else if (stabilityScore >= 70 && disciplineScore >= 65 && riskScore < 40) {
        phase = 3; // Mastery
    }

    return {
        riskScore,
        stabilityScore,
        structureScore,
        disciplineScore,
        phase,
        focus: answers.goal || 'General'
    };
};
