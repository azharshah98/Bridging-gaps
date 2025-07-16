import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Collections
export const COLLECTIONS = {
  CARERS: 'carers',
  REFERRALS: 'referrals',
  AUDIT_LOGS: 'audit_logs'
};

// Carer Management
export const carerService = {
  // Create new carer
  async create(carerData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.CARERS), {
        ...carerData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      });
      return { id: docRef.id, ...carerData };
    } catch (error) {
      console.error('Error creating carer:', error);
      throw error;
    }
  },

  // Get all carers
  async getAll() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.CARERS), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching carers:', error);
      throw error;
    }
  },

  // Get carer by ID
  async getById(id) {
    try {
      const docRef = doc(db, COLLECTIONS.CARERS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Carer not found');
      }
    } catch (error) {
      console.error('Error fetching carer:', error);
      throw error;
    }
  },

  // Update carer
  async update(id, updates) {
    try {
      const docRef = doc(db, COLLECTIONS.CARERS, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { id, ...updates };
    } catch (error) {
      console.error('Error updating carer:', error);
      throw error;
    }
  },

  // Delete carer
  async delete(id) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.CARERS, id));
      return id;
    } catch (error) {
      console.error('Error deleting carer:', error);
      throw error;
    }
  },

  // Get available carers for matching
  async getAvailable(criteria = {}) {
    try {
      let q = query(
        collection(db, COLLECTIONS.CARERS),
        where('status', '==', 'active'),
        where('availability', '==', 'available')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching available carers:', error);
      throw error;
    }
  }
};

// Referral Management
export const referralService = {
  // Create new referral
  async create(referralData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.REFERRALS), {
        ...referralData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending'
      });
      return { id: docRef.id, ...referralData };
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  },

  // Get all referrals
  async getAll() {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.REFERRALS), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching referrals:', error);
      throw error;
    }
  },

  // Get referral by ID
  async getById(id) {
    try {
      const docRef = doc(db, COLLECTIONS.REFERRALS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Referral not found');
      }
    } catch (error) {
      console.error('Error fetching referral:', error);
      throw error;
    }
  },

  // Update referral
  async update(id, updates) {
    try {
      const docRef = doc(db, COLLECTIONS.REFERRALS, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { id, ...updates };
    } catch (error) {
      console.error('Error updating referral:', error);
      throw error;
    }
  },

  // Get pending referrals
  async getPending() {
    try {
      const q = query(
        collection(db, COLLECTIONS.REFERRALS),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching pending referrals:', error);
      throw error;
    }
  },

  // Delete referral
  async delete(id) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.REFERRALS, id));
      return id;
    } catch (error) {
      console.error('Error deleting referral:', error);
      throw error;
    }
  }
};



// Dashboard Statistics
export const dashboardService = {
  async getStats() {
    try {
      const [carers, referrals] = await Promise.all([
        carerService.getAll(),
        referralService.getAll()
      ]);

      const activeReferrals = referrals.filter(r => r.status === 'pending' || r.status === 'processing');
      const assignedReferrals = referrals.filter(r => r.status === 'assigned');

      return {
        totalCarers: carers.length,
        activeReferrals: activeReferrals.length,
        assignedReferrals: assignedReferrals.length
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default stats if error
      return {
        totalCarers: 0,
        activeReferrals: 0,
        assignedReferrals: 0
      };
    }
  },

  // Get daily referrals summary
  async getDailyReferralsSummary() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const referrals = await referralService.getAll();
      const todayReferrals = referrals.filter(r => {
        const createdDate = new Date(r.createdAt.seconds * 1000);
        return createdDate >= today;
      });

      return {
        totalToday: todayReferrals.length,
        urgentToday: todayReferrals.filter(r => r.urgency === 'urgent').length,
        matchedToday: todayReferrals.filter(r => r.status === 'matched').length
      };
    } catch (error) {
      console.error('Error fetching daily referrals summary:', error);
      return {
        totalToday: 0,
        urgentToday: 0,
        matchedToday: 0
      };
    }
  }
}; 