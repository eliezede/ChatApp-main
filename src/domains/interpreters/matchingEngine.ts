import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { Interpreter } from '../../types';
import { Job } from '../jobs/types';
import { MOCK_INTERPRETERS } from '../../services/mockData';

export const calculateInterpreterScore = (interpreter: Interpreter, job: Job): number => {
    let score = 0;

    // 1. Language Match (Required)
    const speaksLanguage = interpreter.languages.some(
        l => l.toLowerCase().trim() === job.languageTo.toLowerCase().trim()
    );
    if (!speaksLanguage) return 0; // Deal breaker
    score += 50;

    // 2. Status
    if (interpreter.status !== 'ACTIVE') return 0;

    // 3. Availability Flag
    if (!interpreter.isAvailable) return 0;

    // 4. DBS Validity
    if (interpreter.dbsExpiry) {
        const dbsDate = new Date(interpreter.dbsExpiry);
        const jobDate = new Date(job.date);
        if (dbsDate > jobDate) {
            score += 10;
        }
    }

    // 5. Direct Assignment Preference
    if (interpreter.acceptsDirectAssignment) {
        score += 5;
    }

    // 6. Postcode Proximity (Naive check for now)
    if (interpreter.postcode && job.postcode) {
        const intPrefix = interpreter.postcode.split(' ')[0].toUpperCase();
        const jobPrefix = job.postcode.split(' ')[0].toUpperCase();
        if (intPrefix === jobPrefix) {
            score += 20;
        }
    }

    // 7. Reliability (Placeholder: assign generic score, later fetch from ratings)
    score += 10;

    return score;
};

export const findBestInterpreters = async (job: Job, limitCount: number = 5): Promise<Interpreter[]> => {
    let allInterpreters: Interpreter[] = [];
    try {
        const q = query(collection(db, 'interpreters'), where('status', '==', 'ACTIVE'));
        const snap = await getDocs(q);
        allInterpreters = snap.docs.map(d => ({ id: d.id, ...d.data() } as Interpreter));
    } catch (error) {
        allInterpreters = MOCK_INTERPRETERS.filter(i => i.status === 'ACTIVE');
    }

    const scored = allInterpreters
        .map(interpreter => ({
            interpreter,
            score: calculateInterpreterScore(interpreter, job)
        }))
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score);

    return scored.slice(0, limitCount).map(r => r.interpreter);
};
