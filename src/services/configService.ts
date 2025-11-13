import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { AppConfig } from '../types';

const CONFIG_COLLECTION = 'app-config';
const SINGLETON_DOC_ID = 'main';

export const DEVELOPER_UIDS = ['i6gLgde32ZcSp0a3y2p51p0u1f2']; 
export const WHATSAPP_NUMBER = '5492615184234';

const defaultConfig: AppConfig = {
  initialCredits: 10,
  freeWorkspaceSlots: 15,
  slotsPerPurchase: 5,
  searchResultLimit: 5,
  creditPackages: [
    { id: 'p1', credits: 10, price: 2000, currency: 'ARS', description: 'Paquete de inicio' },
    { id: 'p2', credits: 50, price: 8000, currency: 'ARS', description: 'Mediano' },
    { id: 'p3', credits: 100, price: 15000, currency: 'ARS', description: 'Mejor Valor' },
    { id: 'p4', credits: 250, price: 35000, currency: 'ARS', description: 'Profesional' },
    { id: 'p5', credits: 500, price: 60000, currency: 'ARS', description: 'Paquete Agencia' },
    { id: 'p6', credits: 1000, price: 100000, currency: 'ARS', description: 'Alto Volumen' },
    { id: 'p7', credits: 5000, price: 400000, currency: 'ARS', description: 'Empresarial' },
  ],
  creditCosts: {
    findCategories: 1,
    findLeadsOrJobs: 1,
    saveLead: 1,
    performMarketAnalysis: 3,
    performDeepDiveAnalysis: 2,
    generateContactScript: 1,
    analyzeEmailReply: 1,
    generateCV: 1,
    generateCoverLetter: 1,
    generateInterviewPrep: 1,
    generateDynamicFilters: 2,
    generateProposal: 3,
    performCompetitorAnalysis: 2,
    analyzeLeadOpportunity: 1,
  },
  googleAnalyticsId: undefined,
};

let configCache: AppConfig | null = null;

export const getAppConfig = async (): Promise<AppConfig> => {
    if (configCache) {
        return configCache;
    }

    try {
        const configDocRef = doc(db, CONFIG_COLLECTION, SINGLETON_DOC_ID);
        const configDoc = await getDoc(configDocRef);
        if (configDoc.exists()) {
            const data = configDoc.data() as AppConfig;
            configCache = { 
                ...defaultConfig, 
                ...data, 
                creditCosts: { ...defaultConfig.creditCosts, ...data.creditCosts },
                googleAnalyticsId: data.googleAnalyticsId ?? defaultConfig.googleAnalyticsId,
            };
            return configCache;
        } else {
            await setDoc(configDocRef, defaultConfig);
            configCache = defaultConfig;
            return configCache;
        }
    } catch (error) {
        console.error("Error fetching app config, using default:", error);
        return defaultConfig;
    }
};

export const updateAppConfig = async (newConfig: AppConfig): Promise<void> => {
    try {
        const configDocRef = doc(db, CONFIG_COLLECTION, SINGLETON_DOC_ID);
        await setDoc(configDocRef, newConfig);
        configCache = newConfig;
    } catch (error) {
        console.error("Error updating app config:", error);
        throw error;
    }
};