/**
 * Módulo de Avaliação Psicométrica
 * Implementação da Escala de Ajustamento de Fisher (FDAS-SF) e Angústia de Término (BDS).
 */

export const assessments = {
    FDAS_SF: {
        name: 'Escala de Ajustamento de Fisher',
        description: 'Mede o desvencilhamento, raiva e autoestima pós-término.',
        questions: [
            'Sinto que ainda faço parte da vida dela.',
            'Sinto uma raiva intensa pelo que aconteceu.',
            'Minha autoestima depende da opinião dela sobre mim.'
        ]
    },
    BDS: {
        name: 'Escala de Angústia de Término',
        description: 'Avalia o nível de sofrimento agudo e obsessão.',
        questions: [
            'Tenho pensamentos intrusivos constantes sobre o ex.',
            'Sinto uma dor física no peito ao pensar no término.'
        ]
    }
};

export const processAssessmentResults = (results) => {
    // Scoring logic for FDAS and BDS
    const totalScore = Object.values(results).reduce((a, b) => a + b, 0);

    // Determine grief phase based on score
    let phase = 1;
    if (totalScore < 20) phase = 3;
    else if (totalScore < 50) phase = 2;
    else phase = 1;

    return {
        score: totalScore,
        phase: phase,
        timestamp: new Date().toISOString()
    };
};
