import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig';
import {
  Globe2, Lock, Mail, ShieldCheck, ArrowRight,
  Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const StaffSetup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitedUser, setInvitedUser] = useState<any>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      // Robust token extraction for HashRouter
      let cleanToken = token?.trim();
      
      if (!cleanToken) {
        const hashParts = window.location.hash.split('?');
        if (hashParts.length > 1) {
          const params = new URLSearchParams(hashParts[1]);
          cleanToken = params.get('token')?.trim();
        }
      }

      if (!cleanToken) {
        setError('Invalid or missing invitation token.');
        setLoading(false);
        return;
      }

      console.log('Verifying invitation token:', cleanToken);

      try {
        const userDocRef = doc(db, 'users', cleanToken);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.status !== 'PENDING') {
            setError('This invitation has already been processed or is no longer valid.');
          } else {
            setInvitedUser({ id: userDoc.id, ...userData });
          }
        } else {
          console.warn('Invitation record not found in Firestore:', cleanToken);
          setError('Invitation record not found. Please verify the link or contact your administrator.');
        }
      } catch (err: any) {
        console.error('Token verification error:', err);
        if (err.code === 'permission-denied') {
          setError('Access denied. This record might be restricted. Please contact your administrator.');
        } else {
          setError('Error verifying invitation. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSubmitting(true);
    try {
      let finalUser = invitedUser;

      // Fallback: If invitedUser wasn't found by token, try finding by email
      if (!finalUser) {
        const { query, collection, where, getDocs, limit } = await import('firebase/firestore');
        const q = query(collection(db, 'users'), where('email', '==', email.trim()), where('status', '==', 'PENDING'), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          finalUser = { id: snap.docs[0].id, ...snap.docs[0].data() };
        }
      }

      if (!finalUser || finalUser.email !== email.trim()) {
        showToast('No pending invitation found for this email address.', 'error');
        setSubmitting(false);
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters.', 'error');
        setSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        setSubmitting(false);
        return;
      }

      // Create Auth account
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // Update user status if needed? 
      // Note: The Auth listener or Onboarding wizard should handle status update to ACTIVE
      
      showToast('Account created successfully! Welcome to the team.', 'success');
      navigate('/admin/onboarding'); 
    } catch (err: any) {
      console.error('Account creation error:', err);
      if (err.code === 'auth/email-already-in-use') {
        showToast('This email is already registered. Try logging in instead.', 'error');
      } else {
        showToast(err.message || 'Failed to complete registration.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const [manualMode, setManualMode] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error && !manualMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Invitation Setup</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => { setError(null); setManualMode(true); }}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Verify with Email
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const PageTitle = manualMode ? "Find Your Invitation" : "Complete Your Setup";
  const PageSubtitle = manualMode 
    ? "Enter the email address where you received the invitation to continue."
    : <>Hi <strong>{invitedUser?.displayName}</strong>, please verify your email and set a secure password.</>;

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
        <div className="relative z-10 max-w-lg">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-black mb-6 leading-tight">Secure Onboarding</h1>
          <p className="text-lg text-slate-400 leading-relaxed">
            Welcome to the Lingland administrative team. Please finalize your account security to begin your journey.
          </p>
          <div className="mt-12 space-y-4">
             <div className="flex items-center space-x-3 text-slate-300">
                <CheckCircle2 size={20} className="text-green-500" />
                <span>Encrypted Data Protection</span>
             </div>
             <div className="flex items-center space-x-3 text-slate-300">
                <CheckCircle2 size={20} className="text-green-500" />
                <span>Custom Role Permissions</span>
             </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-20 xl:px-32 py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden mb-8 text-blue-600"><Globe2 size={40} /></div>
          <h2 className="text-3xl font-black tracking-tight mb-2">{PageTitle}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10">
            {PageSubtitle}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Verification</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email to verify"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Create Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Finish Setup</span> <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
