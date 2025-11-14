import { GoogleGenAI, Type } from "@google/genai";
import type { InitialQuery, SearchArea, SearchMode, Lead, Job, ScriptTone, ScriptFocus, ReplyAnalysis, UserCVInfo, DynamicFilter, MarketAnalysis, ContactScript, DeepDiveAnalysis, CompetitorAnalysis, Proposal, CV, CoverLetter, InterviewPrep } from '../types';

// --- Helper Functions ---

/**
 * A robust, centralized AI client validator.
 * Throws a specific error if the API key is missing or empty.
 * This is the core of the fix to prevent type errors.
 * @param apiKey The user's API key, which could be undefined.
 * @returns A validated GoogleGenAI client instance.
 * @throws {Error} If the apiKey is falsy (null, undefined, or empty string).
 */
const getValidatedAiClient = (apiKey: string | undefined): GoogleGenAI => {
    if (!apiKey) {
        throw new Error("API key is missing or empty. Please configure it in your settings.");
    }
    // CORRECCIÓN: Usamos la aserción no-nula (!) DESPUÉS de la validación.
    // Esto le dice a TypeScript que, en este punto, sabemos que apiKey es un string.
    return new GoogleGenAI({ apiKey: apiKey! });
};

const safelyParseJson = <T>(jsonString: string, context: string): T => {
    try {
        // Attempt to remove Markdown code fences if they exist
        const cleanedString = jsonString.replace(/^```json\s*|```$/g, '').trim();
        return JSON.parse(cleanedString);
    } catch (error) {
        console.error(`Error parsing JSON for ${context}:`, error);
        console.error("Invalid JSON string:", jsonString);
        throw new Error(`La IA devolvió un formato inesperado para ${context}. Por favor, intenta de nuevo.`);
    }
};

// --- Geocoding ---

export const reverseGeocode = async (lat: number, lon: number): Promise<{ locationName: string }> => {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=es`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'ProspectNexusAI/1.0 (https://prospect-nexus-ai.web.app)'
            }
        });

        if (!response.ok) {
            throw new Error(`La API de OpenStreetMap devolvió el estado ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        const address = data.address;
        const localidad = address.city || address.town || address.village || address.suburb;
        const provincia = address.state;
        const pais = address.country;

        const parts: string[] = [];
        if (localidad) parts.push(localidad);
        if (provincia) parts.push(provincia);
        if (parts.length < 2 && pais && !parts.includes(pais)) parts.push(pais);

        const locationName = parts.join(', ');
        
        if (!locationName) {
            throw new Error("No se pudo determinar un nombre de ubicación.");
        }

        return { locationName };
    } catch (error: any) {
        console.error("Reverse geocoding with OpenStreetMap failed:", error);
        throw new Error("No se pudo obtener el nombre de la ubicación desde las coordenadas a través de OpenStreetMap.");
    }
};


// --- Search Flow ---

export const findBusinessCategories = async (query: InitialQuery, area: SearchArea, mode: SearchMode, apiKey: string | undefined): Promise<string[]> => {
    try {
        const ai = getValidatedAiClient(apiKey);
        const context = mode === 'sales'
            ? `un vendedor de "${query.userOfferingOrProfession}" enfocado en la industria de "${query.targetAudienceOrIndustry || 'cualquiera'}"`
            : `un profesional buscando trabajo como "${query.userOfferingOrProfession}" con experiencia en "${query.targetAudienceOrIndustry || 'cualquiera'}"`;

        const prompt = `Soy ${context}. Busco oportunidades en la zona de "${area.location}". 
        Sugiere 5 a 7 categorías de negocios de Google Maps (o tipos de empleo) que sean nichos de mercado ideales para mí. 
        Sé específico y creativo. Devuelve SÓLO un array de strings en formato JSON.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        // CORRECCIÓN: Validamos que response.text exista antes de pasarlo.
        if (!response.text) {
            throw new Error("La IA no devolvió texto para business categories.");
        }
        return safelyParseJson(response.text, "business categories");
    } catch (error: any) {
        console.error("findBusinessCategories failed:", error);
        throw new Error(error.message || "Error al buscar categorías.");
    }
};

export const generateDynamicFilters = async (query: InitialQuery, categories: string[], mode: SearchMode, apiKey: string | undefined): Promise<DynamicFilter[]> => {
    try {
        const ai = getValidatedAiClient(apiKey);
        const prompt = `
        Contexto: Soy un ${mode === 'sales' ? `vendedor de '${query.userOfferingOrProfession}'` : `profesional buscando ser '${query.userOfferingOrProfession}'`}.
        Mis categorías objetivo son: ${categories.join(', ')}.
        Tarea: Genera 3 a 5 "filtros inteligentes" para encontrar los ${mode === 'sales' ? 'clientes más calificados' : 'empleos más adecuados'}.
        Estos filtros deben ser hipótesis de "puntos de dolor" o "requisitos clave" que mi oferta soluciona. Deben ser preguntas de sí/no o características específicas.
        Formato de Salida: Devuelve un array de objetos JSON con las claves "key" (string en camelCase), "label" (string descriptiva y amigable), y "type" ('boolean').
        Ejemplo para un vendedor de "Sitios Web para Restaurantes": [{ "key": "hasOutdatedWebsite", "label": "Tiene sitio web anticuado", "type": "boolean" }, { "key": "lowOnlineReviews", "label": "Pocas reseñas online", "type": "boolean" }]
        Ejemplo para un "Desarrollador React": [{ "key": "usesLegacyStack", "label": "Usa stack tecnológico antiguo", "type": "boolean" }, { "key": "seekingFrontendModernization", "label": "Busca modernizar su frontend", "type": "boolean" }]
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            key: { type: Type.STRING },
                            label: { type: Type.STRING },
                            type: { type: Type.STRING }
                        },
                        required: ["key", "label", "type"]
                    }
                }
            }
        });
        
        // CORRECCIÓN: Validamos que response.text exista antes de pasarlo.
        if (!response.text) {
            throw new Error("La IA no devolvió texto para dynamic filters.");
        }
        return safelyParseJson(response.text, "dynamic filters");
    } catch (error: any) {
        console.error("generateDynamicFilters failed:", error);
        throw new Error(error.message || "Error al generar filtros dinámicos.");
    }
};

export const findLeadsOrJobs = async (
    query: InitialQuery, area: SearchArea, radius: number, categories: string[],
    filters: DynamicFilter[], mode: SearchMode, limit: number, apiKey: string | undefined
): Promise<(Lead | Job)[]> => {
    try {
        const ai = getValidatedAiClient(apiKey);
        const filterInstructions = filters.length > 0
            ? `Aplica estos filtros inteligentes: ${filters.map(f => `'${f.label}'`).join(', ')}. Para cada resultado, evalúa si cumple con estos filtros.`
            : 'Usa tu criterio para encontrar los mejores prospectos.';

        const prompt = `
        Rol: Eres un experto en inteligencia de ventas y búsqueda de empleo.
        Tarea: Actúa como si usaras Google Maps para encontrar ${mode === 'sales' ? 'negocios' : 'ofertas de empleo'} que coincidan con los siguientes criterios y devuelve los ${limit} mejores resultados.
        
        Criterios de Búsqueda:
        1.  Categorías Principales: "${categories.join(', ')}".
        2.  Contexto del Usuario: ${mode === 'sales' ? `Ofrezco '${query.userOfferingOrProfession}'` : `Busco empleo como '${query.userOfferingOrProfession}'`}.
        3.  Industria de Enfoque: ${query.targetAudienceOrIndustry || 'Cualquiera'}.
        4.  Ubicación y Radio: Buscar en la zona de ${area.useUserLocation ? `mi ubicación actual` : `"${area.location}"`} en un radio de ${radius} km.
        5.  Filtros Inteligentes: ${filterInstructions}

        Para cada resultado encontrado, realiza las siguientes acciones:
        1.  Analiza la información disponible (nombre, tipo, reseñas, sitio web si existe) para determinar su potencial.
        2.  Asigna un 'potentialScore' (0-100) basado en qué tan bueno es el prospecto para el usuario. Un puntaje alto significa que tiene un problema que el usuario puede resolver (para ventas) o que el perfil del usuario encaja perfectamente (para empleos).
        3.  Escribe un 'opportunityAnalysis' (para ventas) o 'description' (para empleos) conciso y accionable.
        4.  Extrae información de contacto (teléfono, email, sitio web) si está disponible.

        Formato de Salida: Devuelve un array de objetos JSON.
        ${mode === 'sales' ? `
        Schema para cada objeto Lead:
        - id: string (ID único de Google Maps)
        - name: string
        - details: string (Dirección o descripción corta)
        - businessType: string (Tipo de negocio)
        - contactInfo: object { phone?: string, email?: string, website?: string }
        - mapUri: string (URL de Google Maps)
        - potentialScore: number (0-100)
        - opportunityAnalysis: string (Análisis corto de por qué es una buena oportunidad)
        ` : `
        Schema para cada objeto Job:
        - id: string (ID único)
        - jobTitle: string
        - companyName: string
        - location: string
        - description: string (Resumen de la oferta)
        - requirements: string[] (Lista de requisitos clave)
        - salaryRange: string (si está disponible)
        - profileFitScore: number (0-100, qué tan bien encaja el perfil de '${query.userOfferingOrProfession}')
        `}
        Asegúrate de que la salida sea un JSON válido. No incluyas nada más que el array JSON.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: area.useUserLocation && area.coordinates ? {
                        latLng: {
                            latitude: area.coordinates.latitude,
                            longitude: area.coordinates.longitude
                        }
                    } : undefined
                }
            },
        });
        
        // CORRECCIÓN: Validamos que response.text exista antes de pasarlo.
        const context = mode === 'sales' ? "leads" : "jobs";
        if (!response.text) {
            throw new Error(`La IA no devolvió texto para ${context}.`);
        }
        return safelyParseJson(response.text, context);
    } catch (error: any) {
        console.error("findLeadsOrJobs failed:", error);
        
        const friendlyMessage = "Límite de la API de Google alcanzado o clave no válida. Revisa tu plan y facturación.";
        
        const errorResult = {
            id: `error-${new Date().toISOString()}`,
            name: 'Error en la Búsqueda',
            jobTitle: 'Error en la Búsqueda',
            details: 'No se pudo contactar la API de Google.',
            detailError: friendlyMessage,
            potentialScore: 0,
            profileFitScore: 0,
            status: mode === 'sales' ? 'pending' : 'saved',
            userOffering: query.userOfferingOrProfession,
            requirements: [],
            companyName: 'N/A',
            location: 'N/A',
            description: 'No se pudo contactar la API de Google.',
        };

        return [errorResult as Lead & Job];
    }
};

export const analyzeLeadOpportunity = async (lead: Lead, apiKey: string | undefined): Promise<Partial<Lead>> => {
    try {
        const ai = getValidatedAiClient(apiKey);
        const prompt = `
        Analiza este cliente potencial para un vendedor de "${lead.userOffering}":
        - Nombre: ${lead.name}
        - Tipo: ${lead.businessType}
        - Detalles: ${lead.details}
        - Website: ${lead.contactInfo?.website || 'No disponible'}
        
        Basado en esta información, realiza un análisis profundo y devuelve un objeto JSON con:
        - "potentialScore": un número del 0 al 100.
        - "opportunityAnalysis": una frase corta y vendedora sobre la oportunidad.
        - "painPoint": un posible "punto de dolor" que el negocio podría tener.
        - "suggestedHook": un "gancho" sugerido para iniciar una conversación.
        `;
        
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        potentialScore: { type: Type.NUMBER },
                        opportunityAnalysis: { type: Type.STRING },
                        painPoint: { type: Type.STRING },
                        suggestedHook: { type: Type.STRING }
                    },
                    required: ["potentialScore", "opportunityAnalysis", "painPoint", "suggestedHook"]
                }
            }
        });

        // CORRECCIÓN: Validamos que response.text exista antes de pasarlo.
        if (!response.text) {
            throw new Error("La IA no devolvió texto para opportunity analysis.");
        }
        return safelyParseJson(response.text, "opportunity analysis");
    } catch (error: any) {
        console.error("analyzeLeadOpportunity failed:", error);
        throw new Error(error.message || "Error al analizar la oportunidad del cliente.");
    }
};

// --- Content Generation ---

export const performMarketAnalysis = async (query: InitialQuery, area: SearchArea, mode: SearchMode, apiKey: string | undefined): Promise<MarketAnalysis> => {
    try {
        const ai = getValidatedAiClient(apiKey);
        const context = mode === 'sales'
            ? `un vendedor de "${query.userOfferingOrProfession}"`
            : `un profesional de "${query.userOfferingOrProfession}"`;

        const prompt = `
        Realiza un análisis de mercado para ${context} en la zona de "${area.location}".
        Investiga y devuelve un objeto JSON con la siguiente estructura:
        - "marketSize": string (Una estimación del tamaño del mercado: "grande", "mediano", "pequeño" o "nicho").
        - "keyStrengths": string[] (Array de 2-3 fortalezas comunes que tienen los negocios existentes en este nicho).
        - "commonWeaknesses": string[] (Array de 2-3 debilidades o puntos de dolor comunes).
        - "unmetNeeds": string[] (Array de 2-3 necesidades no cubiertas o mal atendidas por la competencia).
        - "strategicOpportunities": string (Un párrafo corto resumiendo la oportunidad estratégica más clara para mi oferta).
        Usa Google Search para obtener información actualizada. La salida debe ser solo el JSON.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                // FIX: `responseMimeType` and `responseSchema` are not allowed when using the `googleSearch` tool.
                tools: [{ googleSearch: {} }],
            }
        });

        // CORRECCIÓN: Validamos que response.text exista antes de pasarlo.
        if (!response.text) {
            throw new Error("La IA no devolvió texto para market analysis.");
        }
        return safelyParseJson(response.text, "market analysis");
    } catch (error: any) {
        console.error("performMarketAnalysis failed:", error);
        throw new Error(error.message || "Error al realizar el análisis de mercado.");
    }
};

export const generateContactScript = async (lead: Lead, tone: ScriptTone, focus: ScriptFocus, apiKey: string | undefined, replyContext?: ReplyAnalysis): Promise<ContactScript> => {
    try {
        const ai = getValidatedAiClient(apiKey);
        const contextPrompt = replyContext
            ? `El cliente respondió: "${replyContext.summary}". Mi IA sugirió este siguiente paso: "${replyContext.suggestedNextStep}". Redacta una respuesta a este email, no un primer contacto.`
            : `Este es un primer contacto en frío.`;

        const prompt = `
        Soy un vendedor de "${lead.userOffering}". Mi cliente potencial es "${lead.name}", un negocio de tipo "${lead.businessType}".
        Mi análisis de IA sobre ellos indica:
        - Oportunidad: ${lead.opportunityAnalysis}
        - Punto de Dolor Potencial: ${lead.painPoint}
        - Gancho Sugerido: ${lead.suggestedHook}
        
        ${contextPrompt}

        Tarea: Escribe un email corto y persuasivo.
        - Tono: ${tone}.
        - Enfoque: ${focus}.
        - Incluye el nombre del cliente y mi oferta de forma natural.
        - El objetivo es conseguir una respuesta o una reunión.
        
        Devuelve un objeto JSON con "subject" y "body".
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING }
                    },
                    required: ["subject", "body"]
                }
            }
        });
        
        // CORRECCIÓN: Validamos que response.text exista antes de pasarlo.
        if (!response.text) {
            throw new Error("La IA no devolvió texto para contact script.");
        }
        const scriptBase = safelyParseJson<{ subject: string; body: string }>(response.text, "contact script");
        return { ...scriptBase, tone, focus };
    } catch (error: any) {
        console.error("generateContactScript failed:", error);
        throw new Error(error.message || "Error al generar el guion de contacto.");
    }
};

export const performDeepDiveAnalysis = async (lead: Lead, apiKey: string | undefined): Promise<DeepDiveAnalysis> => {
    try {
        const ai = getValidatedAiClient(apiKey);
        const prompt = `
         Realiza un "Diagnóstico 360°" para el negocio "${lead.name}" (${lead.businessType}) ubicado en "${lead.details}", cuyo sitio web es ${lead.contactInfo?.website || 'no disponible'}. 
         El análisis es para un proveedor de "${lead.userOffering}".
         
         Investiga y devuelve un objeto JSON con la siguiente estructura:
         - strategicSummary: string (Un resumen ejecutivo de la situación actual y la oportunidad clave para mi servicio).
         - reviewAnalysis: object { positivePoints: string[], areasForImprovement: string[] } (Analiza reseñas de clientes si las encuentras).
         - visualAnalysis: object { summary: string, imageTags: string[] } (Analiza la estética de su web o imágenes de Google Maps).
         - onlineVisibilityAudit: object { keyOpportunity: string, googleBusinessProfileOptimized: boolean, directoryPresence: string, reputationManagement: string } (Evalúa su presencia online, SEO básico, etc., y resume la oportunidad principal).
         - socialMediaAnalysis: object { keyOpportunity: string, presence: string[], activityLevel: string, engagement: string } (Evalúa su presencia en redes sociales y resume la oportunidad principal).
         `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                // FIX: `responseMimeType` and `responseSchema` are not allowed when using the `googleSearch` tool.
                tools: [{ googleSearch: {} }],
            }
        });
        
        // CORRECCIÓN: Validamos que response.text exista antes de pasarlo.
        if (!response.text) {
            throw new Error("La IA no devolvió texto para deep dive analysis.");
        }
        return safelyParseJson(response.text, "deep dive analysis");
    } catch (error: any) {
        console.error("performDeepDiveAnalysis failed:", error);
        throw new Error(error.message || "Error al realizar el diagnóstico profundo.");
    }
};

export const performCompetitorAnalysis = async (lead: Lead, apiKey: string | undefined): Promise<CompetitorAnalysis> => {
    try {
        const ai = getValidatedAiClient(apiKey);
        const prompt = `
        Analiza el panorama competitivo para "${lead.name}" (${lead.businessType}) en el contexto de mi oferta: "${lead.userOffering}".
        Identifica 2-3 competidores directos.
        Para cada competidor, resume su principal fortaleza y debilidad en relación a "${lead.name}".
        Finalmente, proporciona una "ventaja estratégica" clara que yo (el vendedor) puedo usar para posicionar mi oferta contra la competencia.
        
        Devuelve un objeto JSON con la siguiente estructura:
        - strategicAdvantage: string
        - competitors: array de objetos, cada uno con { name: string, strength: string, weakness: string }
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                // FIX: `responseMimeType` and `responseSchema` are not allowed when using the `googleSearch` tool.
                tools: [{ googleSearch: {} }],
            }
        });

        // CORRECCIÓN: Validamos que response.text exista antes de pasarlo.
        if (!response.text) {
            throw new Error("La IA no devolvió texto para competitor analysis.");
        }
        return safelyParseJson(response.text, "competitor analysis");
    } catch (error: any) {
        console.error("performCompetitorAnalysis failed:", error);
        throw new Error(error.message || "Error al analizar la competencia.");
    }
};

export const generateProposal = async (lead: Lead, apiKey: string | undefined): Promise<Proposal> => {
    try {
        const ai = getValidatedAiClient(apiKey);
        if (!lead.deepDiveAnalysis) {
            throw new Error("Se requiere un Diagnóstico 360° para generar una propuesta.");
        }
        const prompt = `
        Usando el siguiente "Diagnóstico 360°" del cliente "${lead.name}":
        ${JSON.stringify(lead.deepDiveAnalysis, null, 2)}
        
        Y sabiendo que mi oferta es "${lead.userOffering}", redacta una propuesta comercial.
        
        Devuelve un objeto JSON con las siguientes claves:
        - introduction: string (Personalizada, menciona sus puntos de dolor identificados).
        - solution: string (Describe cómo mi oferta soluciona sus problemas específicos).
        - investment: string (Plantea la inversión en términos de valor y retorno, no solo precio).
        - nextSteps: string (Un llamado a la acción claro y simple).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        introduction: { type: Type.STRING },
                        solution: { type: Type.STRING },
                        investment: { type: Type.STRING },
                        nextSteps: { type: Type.STRING }
                    },
                    required: ["introduction", "solution", "investment", "nextSteps"]
                }
            }
        });

        // CORRECCIÓN: Validamos que response.text exista antes de pasarlo.
        if (!response.text) {
            throw new Error("La IA no devolvió texto para proposal.");
        }
        return safelyParseJson(response.text, "proposal");
    } catch (error: any) {
        console.error("generateProposal failed:", error);
        throw new Error(error.message || "Error al generar la propuesta.");
    }
};

export const analyzeEmailReply = async (replyBody: string, lead: Lead, apiKey: string | undefined): Promise<ReplyAnalysis> => {
    try {
        const ai = getValidatedAiClient(apiKey);
        const prompt = `
        Analiza esta respuesta de email de un cliente potencial llamado "${lead.name}".
        Mi oferta para ellos fue: "${lead.userOffering}".
        Respuesta del cliente: "${replyBody}"
        
        Devuelve un objeto JSON con:
        - "sentiment": 'positivo', 'negativo', o 'neutral'.
        - "summary": Un resumen de una línea de lo que dijo el cliente.
        - "suggestedNextStep": La siguiente acción recomendada para mí.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sentiment: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        suggestedNextStep: { type: Type.STRING }
                    },
                    required: ["sentiment", "summary", "suggestedNextStep"]
                }
            }
        });
        
        // CORRECCIÓN: Validamos que response.text exista antes de pasarlo.
        if (!response.text) {
            throw new Error("La IA no devolvió texto para email reply analysis.");
        }
        return safelyParseJson(response.text, "email reply analysis");
    } catch (error: any) {
        console.error("analyzeEmailReply failed:", error);
        throw new Error(error.message || "Error al analizar la respuesta.");
    }
};


// --- Job Search Content Generation ---

export const generateCV = async (job: Job, userInfo: UserCVInfo, apiKey: string | undefined): Promise<CV> => {
    try {
        const ai = getValidatedAiClient(apiKey);
        const prompt = `
        Adapta mi información de CV para la oferta de trabajo de "${job.jobTitle}" en "${job.companyName}".
        Mi información general:
        - Resumen: ${userInfo.professionalSummary}
        - Experiencia: ${userInfo.workExperience}
        - Habilidades: ${userInfo.skills}
        
        Descripción de la oferta:
        ${job.description}
        Requisitos clave: ${job.requirements.join(', ')}
        
        Tarea: Genera un objeto JSON con:
        - summary: string (Un resumen profesional de 2-3 líneas, reescrito para que coincida perfectamente con la oferta).
        - highlightedSkills: string[] (Un array con las 5-7 habilidades MÁS relevantes de mi lista para este puesto).
        - tailoredExperience: array de objetos { title: string, company: string, description: string } (Toma mi experiencia más relevante y reescribe las descripciones para destacar los logros que se alinean con los requisitos de la oferta).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        highlightedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                        tailoredExperience: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    company: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                },
                                required: ["title", "company", "description"]
                            }
                        }
                    },
                    required: ["summary", "highlightedSkills", "tailoredExperience"]
                }
            }
        });

        // CORRECCIÓN: Validamos que response.text exista antes de pasarlo.
        if (!response.text) {
            throw new Error("La IA no devolvió texto para CV generation.");
        }
        return safelyParseJson(response.text, "CV generation");
    } catch (error: any) {
        console.error("generateCV failed:", error);
        throw new Error(error.message || "Error al generar el CV.");
    }
};

export const generateCoverLetter = async (job: Job, userInfo: UserCVInfo, apiKey: string | undefined): Promise<CoverLetter> => {
    try {
        const ai = getValidatedAiClient(apiKey);
        const prompt = `
        Escribe una carta de presentación para el puesto de "${job.jobTitle}" en "${job.companyName}".
        Usa esta información sobre mí: ${JSON.stringify(userInfo)}.
        Y esta información sobre la oferta: ${JSON.stringify(job)}.
        
        La carta debe ser profesional, concisa y destacar cómo mi perfil resuelve las necesidades del puesto.
        
        Devuelve un objeto JSON con "subject" y "body".
        `;

         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING }
                    },
                    required: ["subject", "body"]
                }
            }
        });

        // CORRECCIÓN: Validamos que response.text exista antes de pasarlo.
        if (!response.text) {
            throw new Error("La IA no devolvió texto para cover letter.");
        }
        return safelyParseJson(response.text, "cover letter");
    } catch (error: any) {
        console.error("generateCoverLetter failed:", error);
        throw new Error(error.message || "Error al generar la carta de presentación.");
    }
};

export const generateInterviewPrep = async (job: Job, userInfo: UserCVInfo, apiKey: string | undefined): Promise<InterviewPrep> => {
    try {
        const ai = getValidatedAiClient(apiKey);
        const prompt = `
        Prepara una guía de entrevista para el puesto de "${job.jobTitle}" en "${job.companyName}".
        Mi perfil: ${JSON.stringify(userInfo)}.
        Oferta: ${JSON.stringify(job)}.
        
        Genera un objeto JSON con:
        - commonQuestions: string[] (3-4 preguntas típicas de RRHH).
        - technicalQuestions: string[] (3-4 preguntas técnicas basadas en los requisitos del puesto).
        - behavioralQuestions: string[] (3-4 preguntas de comportamiento, para responder con el método STAR).
        - closingStatement: string (Una frase de cierre potente para finalizar la entrevista).
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        commonQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        technicalQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        behavioralQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        closingStatement: { type: Type.STRING }
                    },
                    required: ["commonQuestions", "technicalQuestions", "behavioralQuestions", "closingStatement"]
                }
            }
        });

        // CORRECCIÓN: Validamos que response.text exista antes de pasarlo.
        if (!response.text) {
            throw new Error("La IA no devolvió texto para interview prep.");
        }
        return safelyParseJson(response.text, "interview prep");
    } catch (error: any) {
        console.error("generateInterviewPrep failed:", error);
        throw new Error(error.message || "Error al generar la preparación de entrevista.");
    }
};