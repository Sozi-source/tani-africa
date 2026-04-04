// components/providers/ClientCleaner.tsx
'use client';

import { useEffect } from 'react';

export function ClientCleaner() {
  useEffect(() => {
    // Define the list of extension attributes to remove
    const extensionAttrs = [
      'data-new-gr-c-s-check-loaded',
      'data-gr-ext-installed',
      'data-grammarly',
      'data-grammarly-shadow-root',
      'data-lt-installed',
      'data-lt-timestamp',
      'data-inspector',
      'data-react-roots',
    ];

    // Function to remove extension attributes
    const cleanExtensionAttributes = () => {
      const body = document.body;
      const html = document.documentElement;
      
      extensionAttrs.forEach(attr => {
        if (html.hasAttribute(attr)) {
          html.removeAttribute(attr);
        }
        if (body.hasAttribute(attr)) {
          body.removeAttribute(attr);
        }
      });
    };
    
    // Run immediately after hydration
    cleanExtensionAttributes();
    
    // Also run after a short delay for extensions that load later
    const timer = setTimeout(cleanExtensionAttributes, 100);
    
    // Set up a mutation observer to catch dynamically added attributes
    const observer = new MutationObserver(() => {
      cleanExtensionAttributes();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: extensionAttrs,
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: extensionAttrs,
    });
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
  
  return null;
}