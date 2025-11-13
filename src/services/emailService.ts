import type { Lead } from '../types';

/**
 * --- SIMULATED EMAIL SERVICE ---
 * In a real application, this service would integrate with a real email API 
 * like the Gmail API or Microsoft Graph to send emails and check for replies.
 * For this prototype, we simulate the behavior with console logs and delays.
 */

/**
 * Simulates sending an email to a lead.
 * @param lead The lead to email.
 * @param emailContent The content of the email.
 * @returns A promise that resolves to true if the email was "sent" successfully.
 */
export const sendEmail = async (lead: Lead, emailContent: { subject: string; body: string }): Promise<boolean> => {
  console.log(`%c[Email Service] SIMULATING: Sending email to ${lead.contactInfo?.email}...`, 'color: #0077b6');
  console.log(`  Subject: ${emailContent.subject}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log(`%c[Email Service] SUCCESS: Email "sent" to ${lead.name}.`, 'color: #2b9348');
  return true;
};

const simulatedReplies = [
    "¡Hola! Gracias por contactarme. Suena interesante. ¿Podrías enviarme más información sobre los precios?",
    "Me interesa. ¿Podemos agendar una llamada rápida la próxima semana para discutirlo?",
    "No estoy interesado en este momento, gracias.",
    "¿Tienen algún caso de estudio que pueda ver? Me gustaría ver resultados concretos.",
    "Parece prometedor. ¿Cómo se compara su servicio con [Competidor]?",
    "Agradezco el contacto, pero ya estamos trabajando con otra agencia. Quizás en el futuro.",
    "Tu propuesta llega en un buen momento. ¿Cuál es el siguiente paso?"
];

/**
 * Simulates checking for replies from leads with active campaigns.
 * @param leadsWithActiveCampaigns An array of leads to check for replies.
 * @returns A promise that resolves to an array of objects containing leadId and a simulated replyBody.
 */
export const checkForReplies = async (leadsWithActiveCampaigns: Lead[]): Promise<{leadId: string, replyBody: string}[]> => {
  if (leadsWithActiveCampaigns.length === 0) {
    return [];
  }
  
  console.log(`%c[Email Service] SIMULATING: Checking for replies for ${leadsWithActiveCampaigns.length} active campaigns...`, 'color: #0077b6');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // To make the simulation more realistic, we'll only check a subset of leads for replies each time.
  // We'll simulate that roughly 1 in 5 active campaigns gets a reply.
  const repliedLeads = leadsWithActiveCampaigns
    .filter(lead => !lead.lastReply) // Don't re-detect replies for leads that already have one
    .filter(() => Math.random() < 0.2); // 20% chance of replying

  if (repliedLeads.length > 0) {
    const repliedData = repliedLeads.map(lead => ({
        leadId: lead.id,
        replyBody: simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)]
    }));
    
    console.log(`%c[Email Service] SUCCESS: Detected replies from: ${repliedLeads.map(l => l.name).join(', ')}`, 'color: #2b9348');
    return repliedData;

  } else {
    console.log(`%c[Email Service] INFO: No new replies detected.`, 'color: #555');
    return [];
  }
};
