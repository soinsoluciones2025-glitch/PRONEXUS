import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import type { SearchMode, InitialQuery, SearchArea, Lead, Job, LeadStatus, JobStatus, DraggableItem, User, AppConfig, MarketAnalysis, DeepDiveAnalysis, ContactScript, ReplyAnalysis, CV, CoverLetter, InterviewPrep, DynamicFilter, Proposal, CompetitorAnalysis, AnalyticsData } from './types';

// Services
import { signInWithGoogle, signOutUser, getUserProfile, createUserProfile, updateUserProfile, onAuthStateChanged } from './services/authService';
import { getAppConfig } from './services/configService';
import { findBusinessCategories, findLeadsOrJobs, performMarketAnalysis, generateDynamicFilters, analyzeEmailReply, analyzeLeadOpportunity } from './services/geminiService';
import { deductCredits as deductCreditsService } from './services/backendService';
import { checkForReplies, sendEmail } from './services/emailService';
import { DEVELOPER_UIDS } from './services/configService';
import { auth } from './services/firebase';

// Hooks
import { useTheme } from './hooks/useTheme';
import { useWorkspace } from './hooks/useWorkspace';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useReports } from './hooks/useReports';
import { useAnalytics } from './hooks/useAnalytics';

// Components
import LoginScreen from './components/LoginScreen';
import LoadingSpinner from './components/LoadingSpinner';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import CategorySelectionStep from './components/CategorySelectionStep';
import ResultsDisplay from './components/ResultsDisplay';
import Workspace from './components/Workspace';
import Footer from './components/Footer';
import Modal from './components/Modal';
import Settings from './components/Settings';
import BuyCreditsModal from './components/BuyCreditsModal';
import WorkspaceLimitModal from './components/WorkspaceLimitModal';
import { PhilosophyModal } from './components/PhilosophyModal';
import MarketAnalysisModal from './components/MarketAnalysisModal';
import { ReportsModal } from './components/ReportsModal';
import { DeepDiveModal } from './components/DeepDiveModal';
import ContactScriptModal from './components/ContactScriptModal';
import EmailComposerModal from './components/EmailComposerModal';
import { CVModal } from './components/CVModal';
import CoverLetterModal from './components/CoverLetterModal';
import { InterviewPrepModal } from './components/InterviewPrepModal';
import { DynamicFiltersModal } from './components/DynamicFiltersModal';
import ProposalModal from './components/ProposalModal';
import { CompetitorAnalysisModal } from './components/CompetitorAnalysisModal';
import DeveloperSettingsModal from './components/DeveloperSettingsModal';
import ApiKeyModal from './components/ApiKeyModal';
import { AnalyticsDashboardModal } from './components/AnalyticsDashboardModal';
import { TTSContext } from './contexts/TTSContext';

export type ActiveModal =
  | 'settings' | 'buyCredits' | 'workspaceLimit' | 'philosophy' | 'marketAnalysis'
  | 'reports' | 'deepDive' | 'contactScript' | 'emailComposer' | 'cv'
  | 'coverLetter' | 'interviewPrep' | 'dynamicFilters' | 'proposal'
  | 'competitorAnalysis' | 'devSettings' | 'apiKeySetup' | 'analytics' | null;


const App: React.FC = () => {
    // --- State Management ---
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

    // Search & Results State
    const [searchMode, setSearchMode] = useState<SearchMode>('sales');
    const [view, setView] = useState<'search' | 'categories' | 'results'>('search');
    const [initialQuery, setInitialQuery] = useState<InitialQuery>({ userOfferingOrProfession: '', targetAudienceOrIndustry: '' });
    const [searchArea, setSearchArea] = useState<SearchArea>({ location: '', useUserLocation: false });
    const [searchRadius, setSearchRadius] = useState<number>(5);
    const [categories, setCategories] = useState<string[]>([]);
    const [dynamicFilters, setDynamicFilters] = useState<DynamicFilter[]>([]);
    const [activeDynamicFilters, setActiveDynamicFilters] = useState<DynamicFilter[]>([]);
    const [results, setResults] = useState<(Lead | Job)[]>([]);

    // Loading & UI State
    const [isLoading, setIsLoading] = useState(false);
    const [progressMessage, setProgressMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [marketAnalysisResult, setMarketAnalysisResult] = useState<MarketAnalysis | null>(null);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

    // Custom Hooks
    const { theme, toggleTheme } = useTheme();
    const { savedLeads, savedJobs, saveLead, updateLead, removeLead, saveJob, updateJob, removeJob } = useWorkspace(user?.id);
    const { isDragging, draggedItem, onDragStart, onDragEnd } = useDragAndDrop();
    const { savedReports, saveReport, deleteReport } = useReports(user?.id);
    const { speak } = useContext(TTSContext);
    useAnalytics(appConfig?.googleAnalyticsId);

    // Derived State
    const isDeveloper = useMemo(() => user ? DEVELOPER_UIDS.includes(user.id) : false, [user]);
    const isPremium = useMemo(() => user?.hasUnlimitedWorkspace || false, [user]);
    const savedItemCount = useMemo(() => savedLeads.length + savedJobs.length, [savedLeads, savedJobs]);

    // --- Effects ---

    // App Initialization: Auth & Config
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
            if (firebaseUser) {
                let userProfile = await getUserProfile(firebaseUser.uid);
                if (!userProfile) {
                    userProfile = await createUserProfile(firebaseUser, appConfig?.initialCredits ?? 10);
                }
                setUser(userProfile);
                if (!userProfile.apiKey) {
                    setActiveModal('apiKeySetup');
                }
            } else {
                setUser(null);
            }
            setAuthLoading(false);
        });

        const fetchConfig = async () => {
            const config = await getAppConfig();
            setAppConfig(config);
        };

        fetchConfig();
        return () => unsubscribe();
    }, [appConfig?.initialCredits]);

    // Email Reply Checker
    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (user && savedLeads.length > 0) {
                const leadsWithContactedStatus = savedLeads.filter(l => l.status === 'contacted' && l.contactInfo?.email);
                if (leadsWithContactedStatus.length > 0) {
                    const replies = await checkForReplies(leadsWithContactedStatus);
                    replies.forEach(reply => {
                        updateLead(reply.leadId, { lastReply: reply.replyBody });
                    });
                }
            }
        }, 60000); // Check every 60 seconds

        return () => clearInterval(intervalId);
    }, [user, savedLeads, updateLead]);

    // --- Handlers ---

    const handleDeductCredits = useCallback(async (amount: number): Promise<boolean> => {
        if (!user || !appConfig || amount === 0) return true;
        if (isDeveloper || isPremium) return true;
        if (user.credits < amount) {
            setActiveModal('buyCredits');
            return false;
        }
        try {
            await deductCreditsService(user.id, amount);
            setUser(prevUser => prevUser ? { ...prevUser, credits: prevUser.credits - amount } : null);
            return true;
        } catch (error) {
            console.error("Failed to deduct credits:", error);
            setError("Hubo un problema al procesar los créditos. Inténtalo de nuevo.");
            return false;
        }
    }, [user, appConfig, isDeveloper, isPremium]);

    const handleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Sign in failed", error);
            setError("No se pudo iniciar sesión con Google.");
        }
    };

    const handleSignOut = async () => {
        await signOutUser();
        setUser(null);
    };

    const handleUpdateUser = async (updates: Partial<User>) => {
        if (!user) return;
        await updateUserProfile(user.id, updates);
        setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
    };
    
    const handleSaveApiKey = async (key: string) => {
        if (!user) return;
        await handleUpdateUser({ apiKey: key });
        setActiveModal(null);
    };

    const handleSearch = async (query: InitialQuery, area: SearchArea, radius: number) => {
        const apiKey = user?.apiKey;
        if (!apiKey) {
             setActiveModal('apiKeySetup');
             return;
        }
        if (!(await handleDeductCredits(appConfig?.creditCosts.findCategories ?? 1))) return;

        speak("Iniciando análisis de tu oferta. Un momento mientras buscamos los mejores nichos de mercado para ti.");
        setIsLoading(true);
        setProgressMessage('Identificando nichos de mercado...');
        setError(null);
        setInitialQuery(query);
        setSearchArea(area);
        setSearchRadius(radius);
        setActiveDynamicFilters([]);
        try {
            const foundCategories = await findBusinessCategories(query, area, searchMode, apiKey);
            setCategories(foundCategories);
            setView('categories');
            speak(`Análisis completado. Encontramos ${foundCategories.length} nichos de mercado. Por favor, selecciona los más relevantes para continuar.`);
        } catch (err: any) {
            setError(err.message || 'Error al buscar categorías.');
            speak("Hubo un error al buscar categorías. Por favor, revisa tu consulta y la configuración, e intenta de nuevo.");
        } finally {
            setIsLoading(false);
            setProgressMessage(null);
        }
    };

    const handleGenerateDynamicFilters = async (selectedCategories: string[]) => {
        const apiKey = user?.apiKey;
        if (!apiKey) {
            setActiveModal('apiKeySetup');
            return;
        }
        setActiveModal('dynamicFilters');
        setIsLoading(true);
        speak("Generando filtros inteligentes con IA. Esto puede tomar un momento.");
        try {
            const filters = await generateDynamicFilters(initialQuery, selectedCategories, searchMode, apiKey);
            setDynamicFilters(filters);
            speak("Filtros inteligentes generados. Activa los que desees aplicar.");
        } catch (err: any) {
            setError(err.message || "Error al generar filtros de IA.");
            speak("Error al generar los filtros de IA.");
            setActiveModal(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyDynamicFilters = async (appliedFilters: DynamicFilter[]) => {
        const activeFilters = appliedFilters.filter(f => f.isActive);
        const cost = activeFilters.length > 0 ? (appConfig?.creditCosts.findLeadsOrJobs ?? 1) : 0;
        if (!(await handleDeductCredits(cost))) {
            return;
        }
        setActiveDynamicFilters(activeFilters);
        const selectedCategories = categories.filter(c => appliedFilters.some(f => f.label === c));
        await handleSelectCategories(selectedCategories, activeFilters);
        setActiveModal(null);
    };


    const handleSelectCategories = async (selectedCategories: string[], appliedFilters: DynamicFilter[] = []) => {
        const apiKey = user?.apiKey;
        if (!apiKey) {
            setActiveModal('apiKeySetup');
            return;
        }
        const cost = appliedFilters.length === 0 ? (appConfig?.creditCosts.findLeadsOrJobs ?? 1) : 0;
        if (!(await handleDeductCredits(cost))) return;
        
        const itemType = searchMode === 'sales' ? 'clientes potenciales' : 'ofertas de empleo';
        speak(`Iniciando búsqueda de ${itemType} en las categorías seleccionadas. Esto puede tardar unos segundos.`);
        setIsLoading(true);
        setProgressMessage(`Buscando ${itemType}...`);
        setError(null);
        setView('results');
        try {
            const limit = appConfig?.searchResultLimit ?? 5;
            const foundResults = await findLeadsOrJobs(initialQuery, searchArea, searchRadius, selectedCategories, appliedFilters, searchMode, limit, apiKey);
            setResults(foundResults);
            speak(`Búsqueda finalizada. Se encontraron ${foundResults.length} resultados. Ahora puedes analizar los resultados o arrastrarlos a tu espacio de trabajo a la derecha.`);
        } catch (err: any) {
            setError(err.message || `Error al buscar ${itemType}.`);
            speak(`Hubo un error al buscar ${itemType}. Por favor, intenta de nuevo.`);
        } finally {
            setIsLoading(false);
            setProgressMessage(null);
        }
    };
    
    const handleAnalyzeLeadOpportunity = async (lead: Lead) => {
        const apiKey = user?.apiKey;
        if (!apiKey) {
            setActiveModal('apiKeySetup');
            return lead;
        }
        if (!(await handleDeductCredits(appConfig?.creditCosts.analyzeLeadOpportunity ?? 1))) return lead;
        
        try {
            const analysis = await analyzeLeadOpportunity(lead, apiKey);
            return { ...lead, ...analysis };
        } catch (error: any) {
            console.error("Error analyzing opportunity:", error);
            return { ...lead, detailError: error.message || "Failed to analyze opportunity" };
        }
    };

    const handleAnalyzeMarket = async () => {
         const apiKey = user?.apiKey;
         if (!apiKey) {
            setActiveModal('apiKeySetup');
            return;
        }
        if (!isPremium && !isDeveloper) {
            setActiveModal('buyCredits');
            return;
        }
        if (!(await handleDeductCredits(appConfig?.creditCosts.performMarketAnalysis ?? 3))) return;

        setActiveModal('marketAnalysis');
        setIsLoading(true);
        setMarketAnalysisResult(null);
        try {
            const analysis = await performMarketAnalysis(initialQuery, searchArea, searchMode, apiKey);
            setMarketAnalysisResult(analysis);
            if (categories.length > 0) {
              await saveReport(analysis, { query: initialQuery, area: searchArea, categories });
            }
        } catch (err: any) {
            setError(err.message || 'Error al analizar el mercado.');
            setActiveModal(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveItem = async (item: DraggableItem, status?: LeadStatus | JobStatus) => {
        if (!isPremium && savedItemCount >= (appConfig?.freeWorkspaceSlots ?? 15)) {
            setActiveModal('workspaceLimit');
            return;
        }
        if (!(await handleDeductCredits(appConfig?.creditCosts.saveLead ?? 1))) return;
        
        if (item.type === 'lead') {
            let leadToSave = item.data as Lead;
            // Analyze opportunity on save
            leadToSave = await handleAnalyzeLeadOpportunity(leadToSave);
            saveLead(leadToSave, status as LeadStatus);
        } else {
            saveJob(item.data as Job, status as JobStatus);
        }
    };


    const handleDrop = (item: DraggableItem, targetStatus: string) => {
        const isAlreadySaved = item.type === 'lead'
            ? savedLeads.some(l => l.id === item.id)
            : savedJobs.some(j => j.id === item.id);

        if (isAlreadySaved) {
            if (item.type === 'lead') {
                updateLead(item.id, { status: targetStatus as LeadStatus });
            } else {
                updateJob(item.id, { status: targetStatus as JobStatus });
            }
        } else {
            handleSaveItem(item, targetStatus as LeadStatus | JobStatus);
        }
    };
    
    const handleSendEmail = async (content: { subject: string, body: string }) => {
        if (!selectedLead) return;
        await sendEmail(selectedLead, content);
        updateLead(selectedLead.id, { status: 'contacted' });
    };

    const handleAnalyzeReply = async (leadId: string, replyBody: string) => {
        const apiKey = user?.apiKey;
        if (!apiKey) {
            setActiveModal('apiKeySetup');
            return;
        }
        const lead = savedLeads.find(l => l.id === leadId);
        if (!lead || !(await handleDeductCredits(appConfig?.creditCosts.analyzeEmailReply ?? 1))) return;
        
        setIsLoading(true); // Maybe use a different loading state for this
        try {
            const analysis: ReplyAnalysis = await analyzeEmailReply(replyBody, lead, apiKey);
            updateLead(leadId, { replyAnalysis: analysis, lastReply: replyBody });
        } catch (err: any) {
             setError(err.message || "Error al analizar la respuesta.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAnalytics = useCallback(() => {
        const salesFunnel: { [key in LeadStatus]?: number } = {};
        savedLeads.forEach(lead => {
            salesFunnel[lead.status] = (salesFunnel[lead.status] || 0) + 1;
        });

        const jobFunnel: { [key in JobStatus]?: number } = {};
        savedJobs.forEach(job => {
            jobFunnel[job.status] = (jobFunnel[job.status] || 0) + 1;
        });

        setAnalyticsData({
            totalLeads: savedLeads.length,
            totalJobs: savedJobs.length,
            salesFunnel,
            jobFunnel
        });
        setActiveModal('analytics');
    }, [savedLeads, savedJobs]);

    // --- Render Logic ---

    if (authLoading || !appConfig) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <LoginScreen onSignIn={handleSignIn} />;
    }

    return (
        <div className="flex flex-col h-screen bg-slate-100 dark:bg-gray-950 text-slate-900 dark:text-white">
            <Header
                user={user}
                onSignOut={handleSignOut}
                toggleTheme={toggleTheme}
                theme={theme}
                onSettingsClick={() => setActiveModal('settings')}
                onAnalyticsClick={handleOpenAnalytics}
                isDevMode={isDeveloper}
                onDevSettingsClick={() => setActiveModal('devSettings')}
                mode={searchMode}
                onModeChange={setSearchMode}
            />

            <main className="flex-grow p-4 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Left Column */}
                    <div className="flex flex-col gap-6">
                        {view === 'search' && (
                            <SearchForm
                                mode={searchMode}
                                initialQuery={initialQuery}
                                setInitialQuery={setInitialQuery}
                                searchArea={searchArea}
                                setSearchArea={setSearchArea}
                                searchRadius={searchRadius}
                                setSetSearchRadius={setSearchRadius}
                                onSearch={handleSearch}
                                isLoading={isLoading && view === 'search'}
                                progressMessage={progressMessage}
                                freeSearchesRemaining={user.credits}
                                isDeveloper={isDeveloper}
                                onGetCurrentLocation={(coords) => setSearchArea(prev => ({...prev, coordinates: coords}))}
                                onAnalyzeMarket={handleAnalyzeMarket}
                                isPremium={isPremium}
                                appConfig={appConfig}
                            />
                        )}
                        {view === 'categories' && (
                            <CategorySelectionStep
                                categories={categories}
                                isLoading={isLoading}
                                onBack={() => setView('search')}
                                onSelectCategories={handleSelectCategories}
                                onGenerateDynamicFilters={handleGenerateDynamicFilters}
                                query={initialQuery}
                                area={searchArea}
                            />
                        )}
                        {view === 'results' && (
                            <ResultsDisplay
                                mode={searchMode}
                                results={results}
                                isLoading={isLoading}
                                error={error}
                                progressMessage={progressMessage}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                                activeDynamicFilters={activeDynamicFilters}
                                onClearDynamicFilters={() => {
                                    setActiveDynamicFilters([]);
                                    handleSelectCategories(categories); // Re-search with no filters
                                }}
                            />
                        )}
                    </div>
                    {/* Right Column */}
                    <div className="h-full">
                        <Workspace
                            mode={searchMode}
                            savedLeads={savedLeads}
                            savedJobs={savedJobs}
                            onUpdateLead={updateLead}
                            onRemoveLead={removeLead}
                            onUpdateJob={updateJob}
                            onRemoveJob={removeJob}
                            onDrop={handleDrop}
                            isDragging={isDragging}
                            draggedItemType={draggedItem?.type || null}
                            setActiveModal={setActiveModal}
                            setSelectedLead={setSelectedLead}
                            setSelectedJob={setSelectedJob}
                            onAnalyzeReply={handleAnalyzeReply}
                            isPremium={isPremium}
                            userInfo={user.userCVInfo}
                            appConfig={appConfig}
                            whatsAppNumber={user.whatsAppNumber}
                        />
                    </div>
                </div>
            </main>

            <Footer
                userCredits={user.credits}
                savedItemCount={savedItemCount}
                onNewSearch={() => { setView('search'); setResults([]); setCategories([]); }}
                onShowPhilosophy={() => setActiveModal('philosophy')}
                onShowReports={() => setActiveModal('reports')}
                onGoPremium={() => setActiveModal('buyCredits')}
                isPremium={isPremium}
                appConfig={appConfig}
            />

            {/* --- Modals --- */}
            {activeModal === 'settings' && (
                <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Ajustes">
                    <Settings user={user} onUpdateUser={handleUpdateUser} onClose={() => setActiveModal(null)} />
                </Modal>
            )}
             {activeModal === 'apiKeySetup' && (
                <Modal isOpen={true} onClose={() => {}} title="Configuración Requerida" size="lg">
                    <ApiKeyModal onSave={handleSaveApiKey} />
                </Modal>
            )}
            {activeModal === 'buyCredits' && (
                <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Adquirir Créditos">
                    <BuyCreditsModal appConfig={appConfig} />
                </Modal>
            )}
            {activeModal === 'workspaceLimit' && (
                 <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Límite Alcanzado">
                    <WorkspaceLimitModal appConfig={appConfig} onClose={() => setActiveModal(null)} onUpgrade={() => setActiveModal('buyCredits')} />
                </Modal>
            )}
            {activeModal === 'philosophy' && (
                <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Nuestra Filosofía" size="2xl">
                    <PhilosophyModal onClose={() => setActiveModal(null)} />
                </Modal>
            )}
            {activeModal === 'marketAnalysis' && (
                <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Análisis de Mercado IA" size="2xl">
                    <MarketAnalysisModal analysis={marketAnalysisResult} isLoading={isLoading} />
                </Modal>
            )}
            {activeModal === 'reports' && (
                <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Mis Informes Guardados" size="3xl">
                    <ReportsModal 
                        marketReports={savedReports} 
                        diagnosticReports={savedLeads.filter(l => l.deepDiveAnalysis)}
                        proposalReports={savedLeads.filter(l => l.proposal)}
                        onDeleteReport={deleteReport} 
                    />
                </Modal>
            )}
            {activeModal === 'devSettings' && isDeveloper && (
                <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Panel de Desarrollador" size="4xl">
                    <DeveloperSettingsModal currentConfig={appConfig} onConfigSave={setAppConfig} />
                </Modal>
            )}
            {activeModal === 'dynamicFilters' && (
                 <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Filtros Inteligentes" size="lg">
                    <DynamicFiltersModal 
                        filters={dynamicFilters} 
                        isLoading={isLoading}
                        onApplyFilters={handleApplyDynamicFilters}
                        appConfig={appConfig}
                    />
                </Modal>
            )}
            {activeModal === 'analytics' && (
                <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Dashboard de Analíticas" size="3xl">
                    <AnalyticsDashboardModal data={analyticsData} />
                </Modal>
            )}

            {/* Inlined Lead Modals */}
            {activeModal === 'deepDive' && selectedLead && user.apiKey && (
                <Modal isOpen={true} onClose={() => setActiveModal(null)} title={`Diagnóstico 360° para ${selectedLead.name}`} size="2xl">
                   <DeepDiveModal 
                     lead={selectedLead} 
                     onAnalysisComplete={(analysis: DeepDiveAnalysis) => updateLead(selectedLead.id, { deepDiveAnalysis: analysis })}
                     onDeductCredits={handleDeductCredits}
                     userApiKey={user.apiKey}
                   />
                </Modal>
            )}
            {activeModal === 'contactScript' && selectedLead && user.apiKey && (
                <Modal isOpen={true} onClose={() => setActiveModal(null)} title={`Guion de Contacto para ${selectedLead.name}`} size="xl">
                    <ContactScriptModal 
                        lead={selectedLead}
                        onScriptGenerated={(script: ContactScript) => updateLead(selectedLead.id, { contactScript: script })}
                        onOpenEmailComposer={() => setActiveModal('emailComposer')}
                        onDeductCredits={handleDeductCredits}
                        userApiKey={user.apiKey}
                    />
                </Modal>
            )}
            {activeModal === 'emailComposer' && selectedLead && selectedLead.contactInfo?.email && (
                 <Modal isOpen={true} onClose={() => setActiveModal(null)} title="Redactar Email" size="2xl">
                   <EmailComposerModal lead={selectedLead} onSend={handleSendEmail} onClose={() => setActiveModal(null)} />
                </Modal>
            )}
            {activeModal === 'proposal' && selectedLead && user.apiKey && (
                <Modal isOpen={true} onClose={() => setActiveModal(null)} title={`Propuesta para ${selectedLead.name}`} size="2xl">
                   <ProposalModal
                        lead={selectedLead}
                        onProposalGenerated={(proposal: Proposal) => updateLead(selectedLead.id, { proposal: proposal })}
                        onDeductCredits={handleDeductCredits}
                        userApiKey={user.apiKey}
                   />
                </Modal>
            )}
            {activeModal === 'competitorAnalysis' && selectedLead && user.apiKey && (
                <Modal isOpen={true} onClose={() => setActiveModal(null)} title={`Análisis de Competencia para ${selectedLead.name}`} size="2xl">
                    <CompetitorAnalysisModal
                        lead={selectedLead}
                        onAnalysisComplete={(analysis: CompetitorAnalysis) => updateLead(selectedLead.id, { competitorAnalysis: analysis })}
                        onDeductCredits={handleDeductCredits}
                        userApiKey={user.apiKey}
                    />
                </Modal>
            )}

            {/* Inlined Job Modals */}
            {activeModal === 'cv' && selectedJob && user.userCVInfo && user.apiKey && (
                <Modal isOpen={true} onClose={() => setActiveModal(null)} title={`Adaptar CV para ${selectedJob.jobTitle}`} size="2xl">
                    <CVModal 
                        job={selectedJob} 
                        userInfo={user.userCVInfo} 
                        onSave={(cv: CV) => updateJob(selectedJob.id, { cv: cv })}
                        onDeductCredits={handleDeductCredits}
                        userApiKey={user.apiKey}
                    />
                </Modal>
           )}
           {activeModal === 'coverLetter' && selectedJob && user.userCVInfo && user.apiKey && (
               <Modal isOpen={true} onClose={() => setActiveModal(null)} title={`Carta de Presentación para ${selectedJob.jobTitle}`} size="xl">
                   <CoverLetterModal
                        job={selectedJob}
                        userInfo={user.userCVInfo}
                        onSave={(cl: CoverLetter) => updateJob(selectedJob.id, { coverLetter: cl })}
                        onDeductCredits={handleDeductCredits}
                        userApiKey={user.apiKey}
                   />
               </Modal>
           )}
           {activeModal === 'interviewPrep' && selectedJob && user.userCVInfo && user.apiKey && (
               <Modal isOpen={true} onClose={() => setActiveModal(null)} title={`Preparación de Entrevista para ${selectedJob.jobTitle}`} size="2xl">
                    <InterviewPrepModal
                        job={selectedJob}
                        userInfo={user.userCVInfo}
                        onPrepGenerated={(prep: InterviewPrep) => updateJob(selectedJob.id, { interviewPrep: prep })}
                        onDeductCredits={handleDeductCredits}
                        userApiKey={user.apiKey}
                    />
               </Modal>
           )}

        </div>
    );
};

export default App;