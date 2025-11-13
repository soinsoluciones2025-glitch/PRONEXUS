import { useState, useEffect, useCallback } from 'react';
import { collection, doc, onSnapshot, query, where, getDocs, setDoc, updateDoc, deleteDoc, QuerySnapshot, DocumentData, QueryDocumentSnapshot, FirestoreError } from 'firebase/firestore';
import type { Lead, LeadStatus, Job, JobStatus } from '../types';
import { db } from '../services/firebase';

export const useWorkspace = (userId?: string) => {
  const [savedLeads, setSavedLeads] = useState<Lead[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) {
      setSavedLeads([]);
      setSavedJobs([]);
      setIsLoading(false);
      return () => {};
    }

    setIsLoading(true);
    const leadsCollectionRef = collection(db, 'users', userId, 'workspace_leads');
    const unsubscribeLeads = onSnapshot(leadsCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
        const leadsFromDb: Lead[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          ...(doc.data() as Omit<Lead, 'id'>),
          id: doc.id,
        }));
        setSavedLeads(leadsFromDb);
        setIsLoading(false);
      }, (error: FirestoreError) => {
        console.error("Error fetching workspace leads from Firestore:", error);
        setIsLoading(false);
      }
    );
    
    const jobsCollectionRef = collection(db, 'users', userId, 'workspace_jobs');
    const unsubscribeJobs = onSnapshot(jobsCollectionRef, (snapshot: QuerySnapshot<DocumentData>) => {
        const jobsFromDb: Job[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          ...(doc.data() as Omit<Job, 'id'>),
          id: doc.id,
        }));
        setSavedJobs(jobsFromDb);
      }, (error: FirestoreError) => {
        console.error("Error fetching workspace jobs from Firestore:", error);
      }
    );

    return () => {
      unsubscribeLeads();
      unsubscribeJobs();
    };
  }, [userId]);

  const saveLead = useCallback(async (leadToSave: Lead, status: LeadStatus = 'pending') => {
    if (!userId) return;
    
    const leadsCollectionRef = collection(db, 'users', userId, 'workspace_leads');
    const q = query(leadsCollectionRef, where('id', '==', leadToSave.id));
    const existingLeadDocs = await getDocs(q);

    if (!existingLeadDocs.empty) {
        console.warn(`Lead with ID ${leadToSave.id} already exists in workspace. Not saving.`);
        return; 
    }

    const activityHistory = leadToSave.activityHistory || [];
    const statusEvent = `Cliente potencial guardado en el espacio de trabajo como '${status}'`;
    const newActivityHistory = [...activityHistory, { date: new Date().toISOString(), event: statusEvent }];
    
    const leadWithStatus = { ...leadToSave, status, activityHistory: newActivityHistory };

    try {
      const leadDocRef = doc(leadsCollectionRef, leadToSave.id);
      await setDoc(leadDocRef, leadWithStatus);
    } catch (error) {
      console.error("Error saving lead to Firestore:", error);
    }
  }, [userId]);

  const updateLead = useCallback(async (leadId: string, updates: Partial<Omit<Lead, 'id'>>) => {
    if (!userId) return;

    const currentLead = savedLeads.find(lead => lead.id === leadId);
    let updatedHistory = currentLead?.activityHistory ? [...currentLead.activityHistory] : [];

    if (updates.status && updates.status !== currentLead?.status) {
        updatedHistory.push({ date: new Date().toISOString(), event: `Estado cambiado a '${updates.status}'` });
    }
    if (updates.notes && updates.notes !== currentLead?.notes) {
        updatedHistory.push({ date: new Date().toISOString(), event: `Notas actualizadas` });
    }
    if (updates.deepDiveAnalysis && !currentLead?.deepDiveAnalysis) {
        updatedHistory.push({ date: new Date().toISOString(), event: `Diagnóstico 360° generado` });
    }
    if (updates.contactScript && !currentLead?.contactScript) {
        updatedHistory.push({ date: new Date().toISOString(), event: `Guion de contacto generado` });
    }
    if (updates.replyAnalysis && !currentLead?.replyAnalysis) {
        updatedHistory.push({ date: new Date().toISOString(), event: `Respuesta del cliente analizada por IA` });
    }
    if (updates.lastReply && updates.lastReply !== currentLead?.lastReply) {
        updatedHistory.push({ date: new Date().toISOString(), event: `Última respuesta del cliente registrada` });
    }
    if (updates.proposal && !currentLead?.proposal) {
        updatedHistory.push({ date: new Date().toISOString(), event: `Propuesta generada` });
    }
    if (updates.competitorAnalysis && !currentLead?.competitorAnalysis) {
        updatedHistory.push({ date: new Date().toISOString(), event: `Análisis de competencia generado` });
    }
    
    const finalUpdates = { ...updates, activityHistory: updatedHistory };

    try {
      const leadDocRef = doc(db, 'users', userId, 'workspace_leads', leadId);
      await updateDoc(leadDocRef, finalUpdates);
    } catch (error) {
      console.error("Error updating lead in Firestore:", error);
    }
  }, [userId, savedLeads]);

  const removeLead = useCallback(async (leadId: string) => {
    if (!userId) return;
    try {
      const leadDocRef = doc(db, 'users', userId, 'workspace_leads', leadId);
      await deleteDoc(leadDocRef);
    } catch (error) {
      console.error("Error removing lead from Firestore:", error);
    }
  }, [userId]);

  const saveJob = useCallback(async (jobToSave: Job, status: JobStatus = 'saved') => {
    if (!userId) return;

    const jobsCollectionRef = collection(db, 'users', userId, 'workspace_jobs');
    const q = query(jobsCollectionRef, where('id', '==', jobToSave.id));
    const existingJobDocs = await getDocs(q);

    if (!existingJobDocs.empty) {
        console.warn(`Job with ID ${jobToSave.id} already exists in workspace. Not saving.`);
        return; 
    }

    const activityHistory = jobToSave.activityHistory || [];
    activityHistory.push({ date: new Date().toISOString(), event: `Empleo guardado como '${status}'` });
    const jobWithStatus = { ...jobToSave, activityHistory, status };
    try {
      const jobDocRef = doc(jobsCollectionRef, jobToSave.id);
      await setDoc(jobDocRef, jobWithStatus);
    } catch (error) {
      console.error("Error saving job to Firestore:", error);
    }
  }, [userId]);

  const updateJob = useCallback(async (jobId: string, updates: Partial<Omit<Job, 'id'>>) => {
    if (!userId) return;

    const currentJob = savedJobs.find(job => job.id === jobId);
    let updatedHistory = currentJob?.activityHistory ? [...currentJob.activityHistory] : [];

    if (updates.status && updates.status !== currentJob?.status) {
        updatedHistory.push({ date: new Date().toISOString(), event: `Estado cambiado a '${updates.status}'` });
    }
    if (updates.cv && !currentJob?.cv) {
        updatedHistory.push({ date: new Date().toISOString(), event: `CV adaptado generado` });
    }
    if (updates.coverLetter && !currentJob?.coverLetter) {
        updatedHistory.push({ date: new Date().toISOString(), event: `Carta de presentación generada` });
    }
    if (updates.interviewPrep && !currentJob?.interviewPrep) {
        updatedHistory.push({ date: new Date().toISOString(), event: `Preparación de entrevista generada` });
    }

    const finalUpdates = { ...updates, activityHistory: updatedHistory };

    try {
      const jobDocRef = doc(db, 'users', userId, 'workspace_jobs', jobId);
      await updateDoc(jobDocRef, finalUpdates);
    } catch (error) {
      console.error("Error updating job in Firestore:", error);
    }
  }, [userId, savedJobs]);

  const removeJob = useCallback(async (jobId: string) => {
    if (!userId) return;
    try {
      const jobDocRef = doc(db, 'users', userId, 'workspace_jobs', jobId);
      await deleteDoc(jobDocRef);
    } catch (error) {
      console.error("Error removing job from Firestore:", error);
    }
  }, [userId]);


  return { savedLeads, savedJobs, isLoading, saveLead, updateLead, removeLead, saveJob, updateJob, removeJob };
};