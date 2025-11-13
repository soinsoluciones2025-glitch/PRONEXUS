import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, doc, deleteDoc, QuerySnapshot, DocumentData, QueryDocumentSnapshot, FirestoreError } from 'firebase/firestore';
import type { SavedMarketAnalysis, MarketAnalysis, InitialQuery, SearchArea } from '../types';
import { db } from '../services/firebase';

export const useReports = (userId?: string) => {
  const [savedReports, setSavedReports] = useState<SavedMarketAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setSavedReports([]);
      setIsLoading(false);
      return () => {};
    }

    setIsLoading(true);
    const reportsCollectionRef = collection(db, 'users', userId, 'reports');

    const unsubscribe = onSnapshot(reportsCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
        const reportsFromDb: SavedMarketAnalysis[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          ...(doc.data() as Omit<SavedMarketAnalysis, 'id'>),
          id: doc.id,
        }));
        setSavedReports(reportsFromDb);
        setIsLoading(false);
      }, (error: FirestoreError) => {
        console.error("Error fetching reports from Firestore:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const saveReport = useCallback(async (
    analysis: MarketAnalysis, 
    context: { query: InitialQuery; area: SearchArea; categories: string[] }
  ) => {
    if (!userId) return;
    
    const newReport: Omit<SavedMarketAnalysis, 'id'> = {
      timestamp: new Date().toISOString(),
      context,
      analysis,
    };
    
    try {
      const reportsCollectionRef = collection(db, 'users', userId, 'reports');
      await addDoc(reportsCollectionRef, newReport);
    } catch (error) {
        console.error("Error saving report to Firestore:", error);
    }
  }, [userId]);

  const deleteReport = useCallback(async (reportId: string) => {
    if (!userId) return;
    try {
        const reportDocRef = doc(db, 'users', userId, 'reports', reportId);
        await deleteDoc(reportDocRef);
    } catch (error) {
        console.error("Error deleting report from Firestore:", error);
    }
  }, [userId]);

  return { savedReports, isLoading, saveReport, deleteReport };
};
