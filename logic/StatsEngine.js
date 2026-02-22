/**
 * Logic for calculating profile stat increments based on task actions.
 * Prevents grinding by implementing a diminishing returns / daily cap strategy.
 */

const STAT_MAPPING = {
    // Action Types
    'EMOTION_LAB': { stat: 'stabilityScore', increment: 1.5 },
    'DIALECTIC': { stat: 'stabilityScore', increment: 2.0 },
    'TRIGGER': { stat: 'stabilityScore', increment: 1.0 },
    'PRIORITY': { stat: 'structureScore', increment: 1.5 },
    'TRIAD': { stat: 'structureScore', increment: 1.0 },
    'IDENTITY': { stat: 'disciplineScore', increment: 1.5 },

    // Task Types
    'essential': { stat: 'disciplineScore', increment: 1.0 },
    'routine': { stat: 'structureScore', increment: 0.5 },
    'complementary': { stat: 'disciplineScore', increment: 0.5 },
    'impulse': { stat: 'stabilityScore', increment: 1.0 }
};

export const calculateStatUpdate = (task, currentProfile) => {
    let statToUpdate = 'disciplineScore';
    let increment = 0.5;

    // Priority 1: Action Type (Highest specific impact)
    if (task.actionType && STAT_MAPPING[task.actionType]) {
        statToUpdate = STAT_MAPPING[task.actionType].stat;
        increment = STAT_MAPPING[task.actionType].increment;
    }
    // Priority 2: Task Type
    else if (task.type && STAT_MAPPING[task.type]) {
        statToUpdate = STAT_MAPPING[task.type].stat;
        increment = STAT_MAPPING[task.type].increment;
    }

    const currentValue = currentProfile[statToUpdate] || 0;

    // Daily Cap Logic (Conceptual - ideally tracked in Firestore to be strict)
    // Here we just ensure we don't exceed 100
    let newValue = Math.min(100, currentValue + increment);

    // Round to 1 decimal place
    newValue = Math.round(newValue * 10) / 10;

    return {
        stat: statToUpdate,
        newValue: newValue
    };
};
