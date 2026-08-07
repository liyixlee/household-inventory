import React, { useEffect } from 'react';

export const DisqusComments: React.FC = () => {
  useEffect(() => {
    const disqusShortname = 'household-2';

    // 1. Embed script or reset if already loaded
    if ((window as any).DISQUS) {
      (window as any).DISQUS.reset({
        reload: true,
        config: function (this: any) {
          this.page.url = window.location.href;
          this.page.identifier = window.location.pathname;
        },
      });
    } else {
      const d = document;
      const s = d.createElement('script');
      s.src = `https://${disqusShortname}.disqus.com/embed.js`;
      s.setAttribute('data-timestamp', `${+new Date()}`);
      (d.head || d.body).appendChild(s);
    }

    // 2. Count script
    if (!document.getElementById('dsq-count-scr')) {
      const countScript = document.createElement('script');
      countScript.id = 'dsq-count-scr';
      countScript.src = `//${disqusShortname}.disqus.com/count.js`;
      countScript.async = true;
      (document.head || document.body).appendChild(countScript);
    }
  }, []);

  return (
    <section className="mt-12 pt-8 border-t border-[#c3c6d7] bg-white rounded-lg p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-6">
        <span className="material-symbols-outlined text-[#004ac6] text-[24px]">
          forum
        </span>
        <h3 className="text-[20px] font-bold text-[#131b2e] font-headline-md">
          Community & Reviewer Discussion
        </h3>
      </div>

      {/* Disqus Thread Container */}
      <div id="disqus_thread"></div>

      <noscript>
        Please enable JavaScript to view the{' '}
        <a href="https://disqus.com/?ref_noscript">
          comments powered by Disqus.
        </a>
      </noscript>
    </section>
  );
};
