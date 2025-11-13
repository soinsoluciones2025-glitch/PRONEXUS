import { useEffect } from 'react';

const GA_SCRIPT_ID = 'ga-tracking-script';
const GA_INLINE_SCRIPT_ID = 'ga-tracking-script-inline';

export const useAnalytics = (gaId?: string) => {
  useEffect(() => {
    // Clean up any existing scripts first to handle ID changes or removal
    const existingScript = document.getElementById(GA_SCRIPT_ID);
    if (existingScript) existingScript.remove();
    const existingInlineScript = document.getElementById(GA_INLINE_SCRIPT_ID);
    if (existingInlineScript) existingInlineScript.remove();

    if (gaId) {
      // Add the main gtag script
      const script = document.createElement('script');
      script.id = GA_SCRIPT_ID;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      // Add the inline script for configuration
      const inlineScript = document.createElement('script');
      inlineScript.id = GA_INLINE_SCRIPT_ID;
      inlineScript.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(inlineScript);
    }

    return () => {
      // Clean up on unmount
      document.getElementById(GA_SCRIPT_ID)?.remove();
      document.getElementById(GA_INLINE_SCRIPT_ID)?.remove();
    };
  }, [gaId]);
};