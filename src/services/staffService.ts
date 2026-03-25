import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc, setDoc, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { User, StaffProfile, Department, JobTitle, UserRole, LevelPermission } from '../types';
import { convertDoc, safeFetch } from './utils';
import { UserService } from './userService';
import { EmailService } from './emailService';
import { NotificationService } from './notificationService';

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
    // RIGOR: Check if department has any assigned job titles or staff before deleting
    const jobs = await StaffService.getJobTitles(id);
    if (jobs.length > 0) {
      throw new Error(`Cannot delete department: It still has ${jobs.length} associated job titles.`);
    }

    const staffQuery = query(collection(db, 'staff_profiles'), where('departmentId', '==', id));
    const staffSnap = await getDocs(staffQuery);
    if (!staffSnap.empty) {
      throw new Error(`Cannot delete department: It still has ${staffSnap.size} assigned staff members.`);
    }

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

  inviteStaffMember: async (data: { name: string, email: string, departmentId: string, jobTitleId: string, role: UserRole }) => {
    // 1. Create the User document with PENDING status
    const userRef = doc(collection(db, 'users'));
    const userData: User = {
      id: userRef.id,
      email: data.email,
      displayName: data.name,
      role: data.role,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(userRef, userData);

    // 2. Create the Staff Profile
    const profile = await StaffService.createProfile({
      userId: userRef.id,
      departmentId: data.departmentId,
      jobTitleId: data.jobTitleId,
      onboardingCompleted: false,
      preferences: { theme: 'system', language: 'en', notifications: true }
    });

    // 3. Trigger Invitation Email (In a real app, this generates a link)
    // For this prototype, we simulate sending the email via our email service
    const depts = await StaffService.getDepartments();
    const jobs = await StaffService.getJobTitles();
    const deptName = depts.find(d => d.id === data.departmentId)?.name || 'Unknown';
    const jobName = jobs.find(j => j.id === data.jobTitleId)?.name || 'Staff Member';

    // We use the production URL for invitations to ensure consistency
    const productionUrl = 'https://lingland-2e52f.web.app';
    const inviteLink = `${productionUrl}/#/setup?token=${userRef.id}`;

    // Note: We call EmailService manually for the prototype/demonstration
    await EmailService.sendApplicationEmail({
        id: userRef.id,
        name: data.name,
        email: data.email,
        status: 'PENDING'
    } as any, 'STAFF_INVITED', 'admin@lingland.com', {
        applicantName: data.name,
        departmentName: deptName,
        jobTitle: jobName,
        role: data.role,
        inviteLink
    });

    return { user: userData, profile, inviteLink };
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
