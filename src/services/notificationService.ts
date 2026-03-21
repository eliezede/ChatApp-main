import { collection, query, where, onSnapshot, updateDoc, doc, writeBatch, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Notification, NotificationType } from '../types';

export const NotificationService = {
  subscribe: (userId: string, callback: (notifications: Notification[]) => void) => {
    // Removemos o orderBy para evitar a necessidade de índice composto no Firestore
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      // Ordenação em memória para contornar limitações de índice
      const sortedNotes = notes.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      callback(sortedNotes);
    });
  },

  markAsRead: async (notificationId: string) => {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
  },

  markAllAsRead: async (notifications: Notification[]) => {
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  },

  notify: async (userId: string, title: string, message: string, type: NotificationType, link?: string) => {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      read: false,
      link,
      createdAt: new Date().toISOString()
    });
  },

  notifyAdmins: async (title: string, message: string, type: NotificationType, link?: string) => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const admins = usersSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .filter((u: any) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');

      const batch = writeBatch(db);
      admins.forEach((admin: any) => {
        const newDocRef = doc(collection(db, 'notifications'));
        batch.set(newDocRef, {
          userId: admin.id,
          title,
          message,
          type,
          read: false,
          link,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
      console.log(`[NotificationService] Broadcasted to ${admins.length} admins.`);
    } catch (e) {
      console.error("Failed to notify admins", e);
    }
  },

  requestPermission: async () => {
    if (!('Notification' in window)) return false;
    const permission = await window.Notification.requestPermission();
    return permission === 'granted';
  }
};