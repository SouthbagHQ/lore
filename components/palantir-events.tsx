'use client';
import { useEffect } from 'react';

declare global {
  interface Window {
    palantir?: {
      capture: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

function capture(event: string, properties: Record<string, unknown> = {}) {
  window.palantir?.capture(event, properties);
}

function text(el: Element | null | undefined) {
  return el?.textContent?.trim().slice(0, 120) || undefined;
}

/**
 * Delegated PostHog events for the Fumadocs UI. Nothing here renders; it listens on
 * `document` so it survives client-side navigation and Fumadocs' own re-renders.
 * Selectors rely on the stable `nd-*` ids Fumadocs puts on its layout regions.
 */
export function PalantirEvents() {
  useEffect(() => {
    let searchOpenedAt = 0;
    let lastQuery = '';
    let queryTimer: ReturnType<typeof setTimeout> | undefined;

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;

      const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
      if (anchor) {
        const href = anchor.getAttribute('href') ?? '';
        const base = { href, text: text(anchor), page: location.pathname };

        if (anchor.closest('[role="dialog"]') && document.querySelector('input[data-fd-search-dialog-input]')) {
          capture('docs_search_result_clicked', { ...base, query: lastQuery });
          return;
        }
        if (anchor.closest('#nd-sidebar, #nd-sidebar-mobile')) {
          capture('docs_sidebar_link_clicked', base);
          return;
        }
        if (anchor.closest('#nd-toc, #nd-toc-placeholder')) {
          capture('docs_toc_clicked', base);
          return;
        }
        if (anchor.closest('#nd-nav, #nd-subnav')) {
          capture('docs_nav_link_clicked', base);
          return;
        }
        if (/^#/.test(href) && anchor.closest('h1, h2, h3, h4, h5, h6')) {
          capture('docs_heading_anchor_clicked', base);
          return;
        }

        let url: URL | undefined;
        try {
          url = new URL(anchor.href, location.href);
        } catch {
          /* relative garbage — treat as internal */
        }
        if (url && url.origin !== location.origin) {
          const host = url.hostname;
          if (host === 'github.com') {
            capture('docs_github_clicked', { ...base, url: url.href });
          } else if (host === 'southbag.cc' || host.endsWith('.southbag.cc')) {
            capture('docs_southbag_app_clicked', {
              ...base,
              url: url.href,
              southbag_target: host.replace(/\.southbag\.cc$/, '') || 'southbag.cc',
            });
          } else {
            capture('docs_external_link_clicked', { ...base, url: url.href, host });
          }
          return;
        }
        if (anchor.closest('footer')) {
          capture('docs_footer_link_clicked', base);
          return;
        }
        if (anchor.closest('article, #nd-page')) {
          capture('docs_page_link_clicked', base);
          return;
        }
        capture('docs_link_clicked', base);
        return;
      }

      const button = target.closest('button') as HTMLButtonElement | null;
      if (!button) return;
      const label = button.getAttribute('aria-label') ?? '';
      const buttonText = text(button) ?? '';
      const props = { label: label || buttonText, page: location.pathname };

      if (/copy text|copied text/i.test(label) || button.closest('figure[data-rehype-pretty-code-figure], .shiki, pre')) {
        const figure = button.closest('figure');
        capture('docs_code_copied', {
          ...props,
          code_title: text(figure?.querySelector('figcaption')),
          language: figure?.querySelector('[data-language]')?.getAttribute('data-language') ?? undefined,
        });
        return;
      }
      if (/copy markdown/i.test(buttonText) || /copy markdown/i.test(label)) {
        capture('docs_markdown_copied', props);
        return;
      }
      if (/close search/i.test(label)) {
        capture('docs_search_closed', {
          ...props,
          query: lastQuery,
          open_ms: searchOpenedAt ? Date.now() - searchOpenedAt : undefined,
        });
        return;
      }
      if (/search/i.test(label) || /^search/i.test(buttonText)) {
        capture('docs_search_toggle_clicked', props);
        return;
      }
      if (/theme/i.test(label) || /theme/i.test(buttonText)) {
        capture('docs_theme_toggled', props);
        return;
      }
      if (/sidebar|menu|navigation/i.test(label) || /open sidebar|toggle sidebar/i.test(buttonText)) {
        capture('docs_sidebar_toggled', props);
        return;
      }
      if (button.closest('#nd-sidebar, #nd-sidebar-mobile')) {
        capture('docs_sidebar_folder_toggled', props);
        return;
      }
      if (/open|view options|markdown|llm/i.test(buttonText + label) && button.closest('#nd-page')) {
        capture('docs_view_options_clicked', props);
        return;
      }
      if (button.closest('[data-state]') && /accordion|tabs|tab/i.test(button.getAttribute('role') ?? '')) {
        capture('docs_tab_or_accordion_clicked', props);
        return;
      }
      if (buttonText || label) capture('docs_button_clicked', props);
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as Element | null;
      if (target?.matches('input[data-fd-search-dialog-input]')) {
        if (!searchOpenedAt) {
          searchOpenedAt = Date.now();
          lastQuery = '';
          capture('docs_search_opened', { page: location.pathname });
        }
      }
    };

    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement | null;
      if (!target?.matches('input[data-fd-search-dialog-input]')) return;
      const query = target.value.trim();
      if (queryTimer) clearTimeout(queryTimer);
      queryTimer = setTimeout(() => {
        if (!query || query === lastQuery) return;
        lastQuery = query;
        const results = document.querySelectorAll('[role="dialog"] a[href]').length;
        capture('docs_search_queried', { query, results, page: location.pathname });
      }, 600);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        capture('docs_search_shortcut', { page: location.pathname });
      }
    };

    // The search dialog unmounts on close; watch for its input disappearing so a
    // reopened dialog counts as a fresh docs_search_opened.
    const observer = new MutationObserver(() => {
      if (searchOpenedAt && !document.querySelector('input[data-fd-search-dialog-input]')) {
        searchOpenedAt = 0;
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const onCopy = () => {
      const selection = window.getSelection()?.toString() ?? '';
      if (selection.length > 0) {
        capture('docs_text_copied', { length: selection.length, page: location.pathname });
      }
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('input', onInput, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('copy', onCopy);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('focusin', onFocusIn, true);
      document.removeEventListener('input', onInput, true);
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('copy', onCopy);
      observer.disconnect();
      if (queryTimer) clearTimeout(queryTimer);
    };
  }, []);

  return null;
}
