import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Módulo de Contato Zero (Desintoxicação Neurológica)
 * Baseado no princípio da extinção neural e regulação de dopamina/oxitocina.
 */

export const getContactZeroStatus = async (userId) => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return null;

    const data = userDoc.data();
    return data.contactZero || {
        startDate: null,
        lastBreach: null,
        currentStreak: 0,
        bestStreak: 0,
        totalBreaches: 0
    };
};

export const startContactZero = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const now = new Date();
    await updateDoc(userRef, {
        'contactZero.startDate': serverTimestamp(),
        'contactZero.lastBreach': null,
        'contactZero.currentStreak': 0,
        'contactZero.status': 'ACTIVE'
    });
};

export const reportBreach = async (userId, type) => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const cz = userDoc.data().contactZero || {};

    const newBreach = {
        timestamp: new Date().toISOString(),
        type: type, // 'stalking', 'message', 'meeting', 'mutual_friends'
        impact: 'CORTISOL_SPIKE'
    };

    const currentStreak = 0;
    const totalBreaches = (cz.totalBreaches || 0) + 1;

    await updateDoc(userRef, {
        'contactZero.lastBreach': serverTimestamp(),
        'contactZero.currentStreak': 0,
        'contactZero.totalBreaches': totalBreaches,
        'contactZero.history': [newBreach, ...(cz.history || [])].slice(0, 50)
    });

    return {
        message: "O cortisol subiu, mas a extinção neural recomeça agora. Não se culpe, apenas retome o silêncio.",
        neuroscience: "Cada quebra de contato reforça as vias neurais do vício emocional. O silêncio é a única forma de 'desmamar' o cérebro da dopamina do ex."
    };
};

export const calculateStreak = (startDate) => {
    if (!startDate) return 0;
    const start = startDate.toDate ? startDate.toDate() : new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};
