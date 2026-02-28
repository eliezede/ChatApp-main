import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { generateCBTTask } from './CBTModule';
import { getStoicExercise, bdnfMeta } from './StoicModule';

export const generateDailyPlan = async (userId, profile, targetDate = null) => {
    if (!userId || !profile) return null;

    const dateObj = targetDate ? new Date(targetDate + 'T12:00:00') : new Date();
    const dateStr = dateObj.toISOString().split('T')[0];

    const phase = profile.phase || 1;
    const focus = profile.focus || 'General';
    const planDocRef = doc(db, 'plans', userId, 'daily', dateStr);

    // 1. Contact Zero (Permanent Challenge)
    const czTask = {
        id: 'origin_contact_zero',
        title: 'Desafio Contato Zero',
        description: 'Mantenha a desintoxicação dopaminérgica. O silêncio é sua cura.',
        type: 'essential',
        period: 'morning',
        actionType: 'CHALLENGE',
        rationale: 'Princípio da Extinção Neural: Negar o estímulo desativa as vias do vício emocional.',
        isCompleted: false
    };

    // 2. CBT Task (Negative Reappraisal)
    const cbt = generateCBTTask(phase);
    const cbtTask = {
        id: `origin_cbt_${cbt.id}`,
        title: cbt.title,
        description: cbt.description,
        type: 'essential',
        period: 'afternoon',
        actionType: 'JOURNAL',
        rationale: cbt.neuroscience,
        isCompleted: false
    };

    // 3. Stoic & BDNF Tasks
    const stoic = getStoicExercise();
    const stoicTask = {
        id: `origin_stoic_${stoic.id}`,
        title: stoic.title,
        description: stoic.description,
        type: 'complementary',
        period: 'evening',
        actionType: 'AUDIO',
        duration: '5 min',
        isCompleted: false
    };

    const bdnfTask = {
        ...bdnfMeta,
        period: 'afternoon',
        actionType: 'PHYSICAL_TRAINING',
        isCompleted: false
    };

    const tasks = [czTask, cbtTask, bdnfTask, stoicTask];

    // Phase 1 SOS Task
    if (phase === 1) {
        tasks.push({
            id: 'origin_sos',
            title: 'Protocolo de Emergência',
            description: 'Técnica de distanciamento cognitivo.',
            type: 'essential',
            period: 'morning',
            actionType: 'SOS',
            rationale: 'Fundamental para conter picos de cortisol e impulsos de quebra de contato.',
            isCompleted: false
        });
    }

    const planData = {
        phase,
        focus,
        date: dateStr,
        tasks,
        createdAt: serverTimestamp()
    };

    try {
        const existingDoc = await getDoc(planDocRef);
        let finalTasks = [...planData.tasks];

        if (existingDoc.exists()) {
            const existingTasks = existingDoc.data().tasks || [];

            // 1. Keep all manual/user tasks
            const userTasks = existingTasks.filter(t => (t.isUserCreated || t.id.startsWith('user_task_')));

            // 2. Preserve completion status of system tasks, and avoid adding duplicates if ID matches
            finalTasks = finalTasks.map(newTask => {
                const match = existingTasks.find(et => et.id === newTask.id);
                if (match) {
                    return { ...newTask, isCompleted: match.isCompleted || false, actionData: match.actionData || {} };
                }
                return newTask;
            });

            // 3. Combine - but be absolutely sure we don't duplicate
            const filteredUserTasks = userTasks.filter(ut => !finalTasks.some(ft => ft.id === ut.id));
            finalTasks = [...finalTasks, ...filteredUserTasks];
        }

        planData.tasks = finalTasks;
        await setDoc(planDocRef, planData, { merge: true });
        return planData;
    } catch (error) {
        console.error("Error generating daily plan:", error);
        return null;
    }
};

/**
 * Centrally manages adding a user-created task to a specific date.
 * Ensures the basic plan for that date exists before adding.
 */
export const addUserTaskToPlan = async (userId, profile, targetDate, taskData) => {
    if (!userId || !profile || !targetDate) return null;

    const planDocRef = doc(db, 'plans', userId, 'daily', targetDate);

    try {
        // 1. Ensure the plan document exists (generate skeleton if needed)
        const docSnap = await getDoc(planDocRef);
        let plan;

        if (!docSnap.exists()) {
            // Generate basic structural plan for the day
            plan = await generateDailyPlan(userId, profile, targetDate);
        } else {
            plan = docSnap.data();
        }

        if (!plan) return null;

        // 2. Prepare the new task
        const newTask = {
            id: taskData.id || `user_task_${Date.now()}`,
            title: taskData.title || 'Nova Tarefa',
            description: taskData.description || 'Adicionada manualmente',
            type: taskData.type || 'complementary',
            isUserCreated: true,
            isCompleted: !!taskData.isCompleted,
            period: taskData.period || 'other',
            isImpulse: !!taskData.isImpulse,
            actionData: taskData.actionData || {},
            createdAt: new Date().toISOString()
        };

        // 3. Add to existing tasks, preventing duplicates
        const currentTasks = plan.tasks || [];
        if (!currentTasks.some(t => t.id === newTask.id)) {
            const updatedTasks = [...currentTasks, newTask];
            await setDoc(planDocRef, { tasks: updatedTasks }, { merge: true });
            return { ...plan, tasks: updatedTasks };
        }

        return plan;
    } catch (error) {
        console.error("Error adding user task to plan:", error);
        return null;
    }
};

/**
 * Updates an existing user task in a specific plan.
 */
export const updateUserTask = async (userId, targetDate, taskId, updatedData) => {
    if (!userId || !targetDate || !taskId) return null;

    const planDocRef = doc(db, 'plans', userId, 'daily', targetDate);

    try {
        const docSnap = await getDoc(planDocRef);
        if (!docSnap.exists()) return null;

        const plan = docSnap.data();
        const updatedTasks = (plan.tasks || []).map(task => {
            if (task.id === taskId) {
                return { ...task, ...updatedData, updatedAt: new Date().toISOString() };
            }
            return task;
        });

        await updateDoc(planDocRef, { tasks: updatedTasks });
        return { ...plan, tasks: updatedTasks };
    } catch (error) {
        console.error("Error updating user task:", error);
        return null;
    }
};

/**
 * Deletes a user task from a specific plan.
 */
export const deleteUserTask = async (userId, targetDate, taskId) => {
    if (!userId || !targetDate || !taskId) return false;

    const planDocRef = doc(db, 'plans', userId, 'daily', targetDate);

    try {
        const docSnap = await getDoc(planDocRef);
        if (!docSnap.exists()) return false;

        const plan = docSnap.data();
        const updatedTasks = (plan.tasks || []).filter(task => task.id !== taskId);

        await updateDoc(planDocRef, { tasks: updatedTasks });
        return true;
    } catch (error) {
        console.error("Error deleting user task:", error);
        return false;
    }
};


export const generateWeeklyPlan = async (userId, profile) => {
    if (!userId || !profile) return;

    const today = new Date();
    const promises = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        promises.push(generateDailyPlan(userId, profile, dateStr));
    }

    await Promise.all(promises);
};

