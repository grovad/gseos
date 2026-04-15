import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        setUser(userDoc.data() as UserProfile);
                    } else {
                        // This case is handled in Auth.tsx but as a fallback:
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className= "min-h-screen flex items-center justify-center bg-gray-50" >
            <div className="flex flex-col items-center gap-4" >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" > </div>
                    < p className = "text-gray-500 font-medium animate-pulse" > Loading GROVAD OS...</p>
                        </div>
                        </div>
    );
    }

    return (
        <ErrorBoundary>
        {!user ? <Auth /> : <Dashboard user={user} / >}
</ErrorBoundary>
  );
}