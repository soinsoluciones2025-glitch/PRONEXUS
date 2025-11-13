import { signInWithPopup, signOut, onAuthStateChanged as onAuthStateChangedFirebase } from 'firebase/auth';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { auth, db, GoogleAuthProvider, serverTimestamp, increment } from "./firebase";
import type { User } from '../types';

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<void> => {
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error signing in with Google: ", error);
        throw error;
    }
};

export const signOutUser = async (): Promise<void> => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
        throw error;
    }
};

export const onAuthStateChanged = onAuthStateChangedFirebase;

export const getUserProfile = async (uid: string): Promise<User | null> => {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
};

export const createUserProfile = async (firebaseUser: FirebaseAuthUser, initialCredits: number): Promise<User> => {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const newUser: Omit<User, 'id'> = {
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'Anonymous',
        credits: initialCredits,
        hasUnlimitedWorkspace: false,
        createdAt: serverTimestamp(),
    };
    await setDoc(userDocRef, newUser);
    return { id: firebaseUser.uid, ...newUser } as User;
};

export const updateUserProfile = async (uid: string, updates: Partial<User>): Promise<void> => {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    });
};

// --- Developer/Admin Functions ---

export const getAllUsers = async (): Promise<User[]> => {
    const usersCollectionRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollectionRef);
    return usersSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() } as User));
};

export const addCreditsToUser = async (uid: string, amount: number): Promise<void> => {
    if (amount <= 0) return;
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
        credits: increment(amount)
    });
};