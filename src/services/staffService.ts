import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc, setDoc, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { User, StaffProfile, Department, JobTitle, UserRole, LevelPermission } from '../types';
import { convertDoc, safeFetch } from './utils';
import { UserService } from './userService';

export const StaffService = {
  // --- Departments ---
  getDepartments: async (): Promise<Department[]> => {
    return safeFetch(async () => {
      const snap = await getDocs(collection(db, 'departments'));
      return snap.docs.map(d => convertDoc<Department>(d));
    }, []);
  },

  createDepartment: async (data: Omit<Department, 'id' | 'createdAt'>) => {
    const docRef = doc(collection(db, 'departments'));
    const dept = { ...data, id: docRef.id, createdAt: new Date().toISOString() };
    await setDoc(docRef, dept);
    return dept;
  },

  updateDepartment: async (id: string, data: Partial<Department>) => {
    await updateDoc(doc(db, 'departments', id), data);
  },

  deleteDepartment: async (id: string) => {
    await deleteDoc(doc(db, 'departments', id));
  },

  // --- Job Titles ---
  getJobTitles: async (departmentId?: string): Promise<JobTitle[]> => {
    return safeFetch(async () => {
      const coll = collection(db, 'jobTitles');
      const q = departmentId ? query(coll, where('departmentId', '==', departmentId)) : coll;
      const snap = await getDocs(q);
      return snap.docs.map(d => convertDoc<JobTitle>(d));
    }, []);
  },

  createJobTitle: async (data: Omit<JobTitle, 'id' | 'createdAt'>) => {
    const docRef = doc(collection(db, 'jobTitles'));
    const job = { ...data, id: docRef.id, createdAt: new Date().toISOString() };
    await setDoc(docRef, job);
    return job;
  },

  updateJobTitle: async (id: string, data: Partial<JobTitle>) => {
    await updateDoc(doc(db, 'jobTitles', id), data);
  },

  deleteJobTitle: async (id: string) => {
    await deleteDoc(doc(db, 'jobTitles', id));
  },

  // --- Staff Profiles ---
  getProfile: async (userId: string): Promise<StaffProfile | null> => {
    const q = query(collection(db, 'staff_profiles'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return convertDoc<StaffProfile>(snap.docs[0]);
  },

  getStaffProfileByUserId: async (userId: string): Promise<StaffProfile | null> => {
    const q = query(collection(db, 'staff_profiles'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return convertDoc<StaffProfile>(snap.docs[0]);
  },

  updateProfile: async (id: string, data: Partial<StaffProfile>) => {
    const docRef = doc(db, 'staff_profiles', id);
    await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  },

  createProfile: async (data: Omit<StaffProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const docRef = doc(collection(db, 'staff_profiles'));
    const profile = { 
      ...data, 
      id: docRef.id, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString() 
    };
    await setDoc(docRef, profile);
    
    // Update the User document with the new staffProfileId
    await UserService.update(data.userId, { staffProfileId: docRef.id });
    
    return profile;
  },

  // --- Staff Directory ---
  getStaffMembers: async (): Promise<User[]> => {
    // Filter users by role ADMIN or SUPER_ADMIN
    const allUsers = await UserService.getAll();
    return allUsers.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN);
  },

  getAllAdminUsers: async (): Promise<User[]> => {
    return StaffService.getStaffMembers();
  },

  async getLevelPermissions(): Promise<LevelPermission[]> {
    const snap = await getDocs(collection(db, 'level_permissions'));
    return snap.docs.map(d => d.data() as LevelPermission);
  },

  async updateLevelPermissions(permissions: LevelPermission[]): Promise<void> {
    const batch = writeBatch(db);
    permissions.forEach(p => {
      const ref = doc(db, 'level_permissions', `level-${p.level}`);
      batch.set(ref, p);
    });
    await batch.commit();
  }
};
