'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const IntegratedDrawIO = forwardRef((props, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(ref, () => ({
    exportXml(callback: (xml: string) => void) {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ action: 'export', format: 'xml' }),
        '*'
      );

      const handleExport = (event: MessageEvent) => {
        if (
          event.origin === 'https://embed.diagrams.net' &&
          typeof event.data === 'string'
        ) {
          try {
            const msg = JSON.parse(event.data);
            if (msg.event === 'export' && msg.data) {
              callback(msg.data);
              window.removeEventListener('message', handleExport);
            }
          } catch (_) {}
        }
      };

      window.addEventListener('message', handleExport);
    },
  }));

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleMessage = async (event: MessageEvent) => {
      if (
        event.origin !== 'https://embed.diagrams.net' ||
        typeof event.data !== 'string'
      )
        return;

      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      if (msg.event === 'init') {
        iframe.contentWindow?.postMessage(
          JSON.stringify({
            action: 'load',
            xml: '',
            title: 'Blank',
            autosave: 1,
          }),
          '*'
        );
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="flex-1 h-full w-full">
      <iframe
        ref={iframeRef}
        title="Draw.io"
        className="flex grow w-full h-full border-none"
        src="https://embed.diagrams.net/?embed=1&proto=json&ui=dark&spin=1&edit=1&libraries=general;uml"
      />
    </div>
  );
});

export default IntegratedDrawIO;