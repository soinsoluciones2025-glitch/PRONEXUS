// --- Core Types ---
import type { FieldValue, Timestamp } from 'firebase/firestore';

export type SearchMode = 'sales' | 'job';

export interface InitialQuery {
  userOfferingOrProfession: string;
  targetAudienceOrIndustry: string;
}

export interface SearchArea {
  location: string;
  useUserLocation: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// --- Sales Mode Specific Types ---

export type LeadStatus = 'pending' | 'contacted' | 'interested' | 'proposal' | 'won' | 'lost' | 'discarded';

export interface Lead {
  id: string;
  name: string;
  details: string;
  businessType?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  mapUri?: string;
  potentialScore: number;
  opportunityAnalysis?: string;
  painPoint?: string;
  suggestedHook?: string;
  status: LeadStatus;
  notes?: string;
  userOffering: string;
  contactScript?: ContactScript;
  deepDiveAnalysis?: DeepDiveAnalysis;
  replyAnalysis?: ReplyAnalysis;
  lastReply?: string;
  competitorAnalysis?: CompetitorAnalysis;
  proposal?: Proposal;
  activityHistory?: ActivityEntry[];
  detailError?: string; // Added for graceful degradation
}

// --- Job Search Mode Specific Types ---

export type JobStatus = 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'accepted';

export interface Job {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  description: string;
  requirements: string[];
  source?: string;
  salaryRange?: string;
  status: JobStatus;
  requiredTechnologies?: string[];
  companySize?: string;
  profileFitScore?: number;
  cv?: CV;
  coverLetter?: CoverLetter;
  interviewPrep?: InterviewPrep;
  activityHistory?: ActivityEntry[];
  detailError?: string; // Added for graceful degradation
}


// --- User & App Configuration ---
export interface UserCVInfo {
  professionalSummary?: string;
  workExperience?: string;
  skills?: string;
}
export interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
  hasUnlimitedWorkspace: boolean;
  userCVInfo?: UserCVInfo;
  whatsAppNumber?: string;
  apiKey?: string; // New: User's Gemini API Key
  createdAt?: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;
}

export interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  currency: string;
  description: string;
}
export interface AppConfig {
  initialCredits: number;
  freeWorkspaceSlots: number;
  slotsPerPurchase: number;
  searchResultLimit: number;
  creditPackages: CreditPackage[];
  creditCosts: {
    findCategories: number;
    findLeadsOrJobs: number;
    saveLead: number;
    performMarketAnalysis: number;
    performDeepDiveAnalysis: number;
    generateContactScript: number;
    analyzeEmailReply: number;
    generateCV: number;
    generateCoverLetter: number;
    generateInterviewPrep: number;
    generateDynamicFilters: number;
    generateProposal: number;
    performCompetitorAnalysis: number;
    analyzeLeadOpportunity: number;
  };
  googleAnalyticsId?: string;
}

// --- Drag & Drop ---

export interface DraggableItem {
  id: string;
  type: 'lead' | 'job';
  data: Lead | Job;
}

// --- AI Generated Content Types ---

export interface MarketAnalysis {
  marketSize: string;
  keyStrengths: string[];
  commonWeaknesses: string[];
  unmetNeeds: string[];
  strategicOpportunities: string;
}

export interface DeepDiveAnalysis {
  strategicSummary: string;
  reviewAnalysis: {
    positivePoints: string[];
    areasForImprovement: string[];
  };
  visualAnalysis: {
    summary: string;
    imageTags: string[];
  };
  onlineVisibilityAudit?: {
    googleBusinessProfileOptimized: boolean;
    directoryPresence: string;
    reputationManagement: string;
    performanceScore?: number;
    seoScore?: number;
    keyOpportunity: string;
  };
  socialMediaAnalysis?: {
    presence: string[];
    activityLevel: string;
    engagement: string;
    keyOpportunity: string;
  };
}

export type ScriptTone = 'amigable' | 'formal' | 'directo';
export type ScriptFocus = 'valor' | 'precio' | 'urgencia';

export interface ContactScript {
  subject: string;
  body: string;
  tone: ScriptTone;
  focus: ScriptFocus;
}

export interface ReplyAnalysis {
  sentiment: 'positivo' | 'negativo' | 'neutral';
  summary: string;
  suggestedNextStep: string;
}

export interface CompetitorAnalysis {
  strategicAdvantage: string;
  competitors: {
    name: string;
    strength: string;
    weakness: string;
  }[];
}

export interface Proposal {
  introduction: string;
  solution: string;
  investment: string;
  nextSteps: string;
}

export interface CV {
  summary: string;
  highlightedSkills: string[];
  tailoredExperience: {
    title: string;
    company: string;
    description: string;
  }[];
}

export interface CoverLetter {
  subject: string;
  body: string;
}

export interface InterviewPrep {
    commonQuestions: string[];
    technicalQuestions: string[];
    behavioralQuestions: string[];
    closingStatement: string;
}

export interface DynamicFilter {
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean';
    value?: string | number | boolean;
    isActive?: boolean; // New property to track if the filter is enabled by the user
}

// --- Analytics & Reports ---

export interface AnalyticsData {
  totalLeads: number;
  totalJobs: number;
  salesFunnel: { [key in LeadStatus]?: number };
  jobFunnel: { [key in JobStatus]?: number };
}

export interface ActivityEntry {
    date: string; // ISO string
    event: string;
}

export interface SavedMarketAnalysis {
    id: string;
    timestamp: string; // ISO string
    context: {
        query: InitialQuery;
        area: SearchArea;
        categories: string[];
    },
    analysis: MarketAnalysis;
}