import { useEffect } from 'react';
import { useCMS } from '@/contexts/CMSContext';

/**
 * Automatically replaces content in the DOM with CMS content
 * No need to manually add getContent() in every component!
 */
export function useAutoContentReplace() {
  const { getContentObject, loading } = useCMS();

  useEffect(() => {
    if (loading) return;

    const content = getContentObject();
    
    // Replace all elements with data-cms attribute
    document.querySelectorAll('[data-cms]').forEach((element) => {
      const key = element.getAttribute('data-cms');
      if (key && content[key]) {
        element.textContent = content[key];
      }
    });

    // Auto-replace by element type and index
    // h1_1, h1_2, p_1, p_2, etc.
    const elementTypes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'button', 'a', 'span', 'li'];
    
    elementTypes.forEach((tag) => {
      const elements = document.querySelectorAll(tag);
      elements.forEach((element, index) => {
        const key = `${tag}_${index + 1}`;
        if (content[key]) {
          // Only replace if element doesn't have data-cms-skip attribute
          if (!element.hasAttribute('data-cms-skip')) {
            element.textContent = content[key];
          }
        }
      });
    });

    console.log('✅ Auto content replacement complete!');
  }, [loading, getContentObject]);
}
