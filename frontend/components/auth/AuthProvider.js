import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Check if user is active
            if (!userData.active) {
              setError('Your account has been deactivated. Please contact your administrator.');
              await signOut(auth);
              setUser(null);
              setUserProfile(null);
              setLoading(false);
              return;
            }

            setUser(firebaseUser);
            setUserProfile(userData);
          } else {
            setError('User profile not found. Please contact your administrator.');
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setError('Failed to load user profile. Please try again.');
          setUser(null);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const hasRole = (role) => {
    return userProfile?.role === role;
  };

  const hasPermission = (permission) => {
    return userProfile?.permissions?.includes(permission);
  };

  const isAdmin = () => hasRole('admin');
  const isManager = () => hasRole('manager');
  const isStaff = () => hasRole('staff');

  const canRead = () => isAdmin() || isManager() || isStaff();
  const canWrite = () => isAdmin() || isManager();
  const canDelete = () => isAdmin();

  const value = {
    user,
    userProfile,
    loading,
    error,
    logout,
    hasRole,
    hasPermission,
    isAdmin,
    isManager,
    isStaff,
    canRead,
    canWrite,
    canDelete,
    isAuthenticated: !!user && !!userProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 