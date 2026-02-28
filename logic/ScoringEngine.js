export const calculateProfile = (answers) => {
    // Risk Score (0-100) - Based on Pain Points and Timeframe
    const painPoints = answers.pain_points || [];
    const painScore = painPoints.length * 15; // More pain points = higher risk
    const timeframeScore = answers.timeframe_weight || 0;
    const riskScore = Math.min(100, (painScore + timeframeScore * 5));

    // Stability Score (0-100) - Inversely proportional to Risk
    const stabilityScore = Math.max(0, 100 - riskScore);

    // Structure Score (0-100) - Focus on discipline
    const structureScore = answers.main_goal === 'Manter o Contato Zero com sucesso' ? 80 : 60;

    // Discipline Score (0-100)
    const disciplineScore = (answers.main_goal_weight || 0) * 10;

    // Phase Decision
    let phase = 2;
    if (riskScore >= 60 || answers.timeframe === 'Menos de 1 mês') {
        phase = 1; // Stabilization
    } else if (stabilityScore >= 75 && disciplineScore >= 70) {
        phase = 3; // Mastery
    }

    return {
        riskScore,
        stabilityScore,
        structureScore,
        disciplineScore,
        phase,
        focus: answers.main_goal || 'General'
    };
};
