import type { Lead } from '../types';

function escapeCsvCell(cell: string | number | undefined | null): string {
    if (cell === undefined || cell === null) {
        return '""';
    }
    const cellStr = String(cell);
    if (/[",\n\r]/.test(cellStr)) {
        return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return `"${cellStr}"`;
}

function downloadCsv(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

export function exportFullAnalysisToCsv(leads: Lead[], filename: string): void {
    const headers = [
        'ID', 'Name', 'Status', 'Potential Score', 'Phone', 'Email', 
        'Website', 'Details', 'Opportunity Analysis', 'Notes', 'Map URI'
    ];
    
    const rows = leads.map(lead => [
        escapeCsvCell(lead.id),
        escapeCsvCell(lead.name),
        escapeCsvCell(lead.status),
        escapeCsvCell(lead.potentialScore),
        escapeCsvCell(lead.contactInfo?.phone),
        escapeCsvCell(lead.contactInfo?.email),
        escapeCsvCell(lead.contactInfo?.website),
        escapeCsvCell(lead.details),
        escapeCsvCell(lead.opportunityAnalysis),
        escapeCsvCell(lead.notes),
        escapeCsvCell(lead.mapUri)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    downloadCsv(csvContent, filename);
}

export function exportGoogleContactsCsv(leads: Lead[], filename: string): void {
    const headers = ['Given Name', 'Family Name', 'Phone 1 - Type', 'Phone 1 - Value'];
    
    const rows = leads
        .filter(lead => lead.contactInfo?.phone) // Only include leads with a phone number
        .map(lead => {
            // A simple way to split name, might need improvement
            const nameParts = lead.name.split(' ');
            const givenName = nameParts[0];
            const familyName = nameParts.slice(1).join(' ');
            
            return [
                escapeCsvCell(givenName),
                escapeCsvCell(familyName),
                escapeCsvCell('Mobile'),
                escapeCsvCell(lead.contactInfo?.phone)
            ].join(',');
        });

    if (rows.length === 0) {
        alert("Ninguno de los clientes seleccionados tiene un número de teléfono para exportar.");
        return;
    }
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    downloadCsv(csvContent, filename);
}


export function sendLeadsToWhatsApp(leads: Lead[], userWhatsAppNumber: string | undefined): void { // userWhatsAppNumber can be undefined
    if (!userWhatsAppNumber || userWhatsAppNumber.trim() === '') {
        alert("Por favor, configura tu número de WhatsApp en los Ajustes primero.");
        return;
    }

    const cleanPhoneNumber = (num: string) => num.replace(/\D/g, '');

    const messageHeader = '*Mis Contactos de Prospect Nexus AI:*\n\n';
    const leadsWithMessage = leads
        .filter(lead => lead.contactInfo?.phone)
        .map(lead => {
            const phone = lead.contactInfo!.phone!.replace(/[\s-()]/g, '');
            return `*${lead.name}*\nTel: ${phone}`;
        })
        .join('\n\n');
    
    if (!leadsWithMessage) {
         alert("Ninguno de los clientes en tu espacio de trabajo tiene un número de teléfono para exportar.");
        return;
    }

    const fullMessage = messageHeader + leadsWithMessage;
    const encodedMessage = encodeURIComponent(fullMessage);
    const userNumberCleaned = cleanPhoneNumber(userWhatsAppNumber);
    const whatsappUrl = `https://wa.me/${userNumberCleaned}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
}