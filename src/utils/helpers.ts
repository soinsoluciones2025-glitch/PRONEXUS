/**
 * Formats a phone number string into a valid WhatsApp click-to-chat URL.
 * It strips all non-numeric characters from the input string.
 * This is a simple implementation and assumes the number includes the country code.
 * @param phoneNumber The raw phone number string.
 * @returns A formatted URL string (e.g., "https://wa.me/5491122334455").
 */
export const formatWhatsAppUrl = (phoneNumber: string): string => {
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${digitsOnly}`;
};