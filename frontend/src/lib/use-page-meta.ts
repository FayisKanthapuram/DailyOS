import { useEffect } from 'react';

interface PageMetaOptions {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
}

/**
 * usePageMeta — runtime meta tag management.
 *
 * This hook updates the document <head> during client-side navigation.
 * For public pages (/,  /privacy, /terms), static metadata is already
 * baked into the pre-rendered HTML by scripts/prerender.mjs at build time.
 * This hook is the secondary layer for private routes and runtime navigation.
 */
export function usePageMeta({ title, description, robots, canonical }: PageMetaOptions): void {
  useEffect(() => {
    // Title
    if (title) {
      document.title = title;
    }

    const setMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) {
          el.setAttribute('property', name);
        } else {
          el.setAttribute('name', name);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, true);
      setMeta('twitter:description', description);
    }

    if (robots) {
      setMeta('robots', robots);
    }

    if (title) {
      setMeta('og:title', title, true);
      setMeta('twitter:title', title);
    }

    if (canonical) {
      setLink('canonical', canonical);
      setMeta('og:url', canonical, true);
    }
  }, [title, description, robots, canonical]);
}
