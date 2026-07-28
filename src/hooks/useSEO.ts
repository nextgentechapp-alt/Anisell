import { useEffect } from 'react';

interface SEOMetadata {
  title: string;
  description?: string;
  keywords?: string;
  canonical?: string;
}

/**
 * Custom Hook to dynamically update Page-Level SEO Metadata (Title, Description, Keywords, Canonical).
 * Ensures search crawlers index specialized listings and directories with distinct and optimized details.
 *
 * @param {SEOMetadata} metadata Title, optional description, keywords, and canonical link
 */
export const useSEO = ({ title, description, keywords, canonical }: SEOMetadata) => {
  useEffect(() => {
    // 1. Dynamic Title Update
    const defaultSuffix = " | Anisell India";
    document.title = title.endsWith(defaultSuffix) ? title : `${title}${defaultSuffix}`;

    // 2. Dynamic Description Update
    if (description) {
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.setAttribute('name', 'description');
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute('content', description);
      
      // Update OpenGraph description
      let ogDescMeta = document.querySelector('meta[property="og:description"]');
      if (ogDescMeta) {
        ogDescMeta.setAttribute('content', description);
      }
    }

    // 3. Dynamic Keywords Update
    if (keywords) {
      let keywordsMeta = document.querySelector('meta[name="keywords"]');
      if (!keywordsMeta) {
        keywordsMeta = document.createElement('meta');
        keywordsMeta.setAttribute('name', 'keywords');
        document.head.appendChild(keywordsMeta);
      }
      keywordsMeta.setAttribute('content', keywords);
    }

    // 4. Dynamic Canonical Tag Update
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonical);
    }
  }, [title, description, keywords, canonical]);
};
