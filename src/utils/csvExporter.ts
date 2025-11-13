import type { Lead } from '../types';

function escapeCsvCell(cell: string | number | undefined | null): string {
    if (cell === undefined || cell === null) {
        return '""';
    }
    const cellStr = String(cell);
    // If the cell contains a comma, a double quote, or a newline, wrap it in double quotes
    // and escape any existing double quotes by doubling them.
    if (/[",\n\r]/.test(cellStr)) {
        return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return `"${cellStr}"`;
}

export function exportToCsv(leads: Lead[], filename: string): void {
    const headers = [
        'ID',
        'Name',
        'Status',
        'Potential Score',
        'Contact',
        'Details',
        'Opportunity Analysis',
        'Notes',
        'Map URI'
    ];
    
    const rows = leads.map(lead => [
        escapeCsvCell(lead.id),
        escapeCsvCell(lead.name),
        escapeCsvCell(lead.status),
        escapeCsvCell(lead.potentialScore),
        escapeCsvCell([lead.contactInfo?.phone, lead.contactInfo?.email].filter(Boolean).join(' | ')),
        escapeCsvCell(lead.details),
        escapeCsvCell(lead.opportunityAnalysis),
        escapeCsvCell(lead.notes),
        escapeCsvCell(lead.mapUri)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
