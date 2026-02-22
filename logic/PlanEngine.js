import { db } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const generateDailyPlan = async (userId, profile) => {
    if (!userId || !profile) return null;

    const today = new Date().toISOString().split('T')[0];
    const planDocRef = doc(db, 'plans', userId, 'daily', today);

    // Determine Suggested Workout based on history
    const history = profile.workoutHistory || [];
    const lastWorkout = history[0]?.workoutId;

    // Check if today is a scheduled training day
    const dayMap = { 0: 'dom', 1: 'seg', 2: 'ter', 3: 'qua', 4: 'qui', 5: 'sex', 6: 'sab' };
    const todayTyped = dayMap[new Date().getDay()];
    const trainingDays = profile.trainingDays || ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
    const isTrainingDay = trainingDays.includes(todayTyped);

    let suggestedTitle = 'Treino Físico';
    let suggestedDescription = 'Ritual de força e disciplina';
    let finalActionType = 'PHYSICAL_TRAINING';

    if (!isTrainingDay) {
        suggestedTitle = 'Recuperação Ativa';
        suggestedDescription = 'Movimento leve e restauração';
        finalActionType = 'SIMPLE'; // No action modal for recovery yet
    } else {
        if (lastWorkout === 'calisthenics') {
            suggestedDescription = 'Variação: Foco em Resistência (Cardio)';
        } else if (lastWorkout === 'cardio') {
            suggestedDescription = 'Variação: Foco em Explosão (HIIT)';
        } else if (lastWorkout === 'high_intensity') {
            suggestedDescription = 'Variação: Foco em Recuperação (Mobilidade)';
        } else if (lastWorkout === 'mobility') {
            suggestedDescription = 'Variação: Foco em Força (Calistenia)';
        }
    }

    const planData = {
        phase: profile.phase || 1,
        tasks: [
            {
                id: 'task_1',
                title: 'Planejamento do Dia',
                description: 'Defina suas 3 prioridades inegociáveis',
                type: 'essential',
                period: 'morning',
                actionType: 'PRIORITY',
                rationale: 'Onde não há plano, há caos. Definir suas prioridades protege sua energia do trivial.',
                isCompleted: false
            },
            {
                id: 'task_2',
                title: suggestedTitle,
                description: suggestedDescription,
                type: 'essential',
                period: 'afternoon',
                actionType: finalActionType,
                lastWorkoutId: lastWorkout || null,
                rationale: 'O corpo é a ferramenta da alma. Um corpo forte sustenta uma mente resiliente.',
                isCompleted: false
            },
            {
                id: 'task_3',
                title: 'Rotular Emoção',
                description: 'Identifique o que está sentindo',
                type: 'essential',
                period: 'morning',
                actionType: 'EMOTION_LAB',
                rationale: 'Nomear a dor é o primeiro passo para retirá-la do centro da sua visão.',
                isCompleted: false
            },
            {
                id: 'task_4',
                title: 'Reflexão Noturna',
                description: 'Revisão do dia sob a ótica estoica',
                type: 'essential',
                period: 'evening',
                actionType: 'TRIAD',
                rationale: 'Nenhum dia deve passar sem que você preste contas a si mesmo.',
                isCompleted: false
            },
            {
                id: 'task_5',
                title: 'Diário Estruturado',
                description: 'Fato vs Narrativa',
                type: 'complementary',
                period: 'afternoon',
                actionType: 'DIALECTIC',
                rationale: 'A maioria dos nossos problemas reside na nossa imaginação, não na realidade.',
                isCompleted: false
            },
        ],
        createdAt: serverTimestamp()
    };

    try {
        await setDoc(planDocRef, planData);
        return planData;
    } catch (error) {
        console.error("Error generating daily plan:", error);
        return null;
    }
};
