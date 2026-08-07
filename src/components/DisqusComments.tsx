import React, { useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

declare global {
  interface Window {
    disqus_config?: () => void;
    DISQUS?: {
      reset: (options: { reload: boolean; config?: () => void }) => void;
    };
  }
}

export const DisqusComments: React.FC = () => {
  useEffect(() => {
    const forumShortname = 'household-2';
    const pageUrl = 'https://household-2.disqus.com';
    const pageIdentifier = 'household-inventory-main-thread';

    const configureDisqus = function (this: any) {
      this.page.url = pageUrl;
      this.page.identifier = pageIdentifier;
      this.page.title = 'Household Inventory Community Discussion';
    };

    window.disqus_config = configureDisqus;

    const initDisqus = () => {
      const threadEl = document.getElementById('disqus_thread');
      if (!threadEl) return;

      if (window.DISQUS) {
        try {
          window.DISQUS.reset({
            reload: true,
            config: configureDisqus,
          });
        } catch (e) {
          console.warn('Disqus reset error:', e);
        }
      } else {
        // Remove existing script tag if DISQUS global is not available yet
        const existingScript = document.getElementById('disqus-embed-script');
        if (existingScript) {
          existingScript.remove();
        }

        const script = document.createElement('script');
        script.id = 'disqus-embed-script';
        script.src = `https://${forumShortname}.disqus.com/embed.js`;
        script.setAttribute('data-timestamp', Date.now().toString());
        script.async = true;

        script.onload = () => {
          if (window.DISQUS) {
            try {
              window.DISQUS.reset({
                reload: true,
                config: configureDisqus,
              });
            } catch (e) {
              console.warn('Disqus reset on load error:', e);
            }
          }
        };

        (document.head || document.body).appendChild(script);
      }
    };

    // Small delay ensures #disqus_thread DOM node is painted by React
    const timer = setTimeout(initDisqus, 50);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <section id="disqus-section" className="mt-12 pt-8 border-t border-slate-800 space-y-4">
      {/* Clean Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Community Discussion
          </h2>
          <p className="text-xs text-slate-400">
            Log in to leave comments, upvote, and reply via Disqus.
          </p>
        </div>
      </div>

      {/* Clean White Container for Disqus Widget */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl text-slate-900 min-h-[350px]">
        <div id="disqus_thread" className="min-h-[300px]"></div>
        <noscript>
          Please enable JavaScript to view the{' '}
          <a href="https://disqus.com/?ref_noscript" className="text-blue-600 underline">
            comments powered by Disqus.
          </a>
        </noscript>
      </div>
    </section>
  );
};
