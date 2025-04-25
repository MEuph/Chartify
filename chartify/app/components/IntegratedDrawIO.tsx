'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

const IntegratedDrawIO = forwardRef((props, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(ref, () => ({
    exportXml(callback: (xml: string) => void) {
      const iframe = iframeRef.current;
    
      iframe?.contentWindow?.postMessage(
        JSON.stringify({ action: 'export', format: 'html2'}),
        '*'
      );
    
      const handleExport = (event: MessageEvent) => {
        if (
          event.origin === 'https://embed.diagrams.net' &&
          typeof event.data === 'string'
        ) {
          try {
            const msg = JSON.parse(event.data);
            console.log(`msg: ${msg}\n\nmsg.data: ${event.data}\n\msg['xml']: ${msg['xml']}`);
            if (msg.event === 'export' && msg.data) {
              callback(msg['xml']); // This will now be proper raw XML
              console.log(`[IntegratedDrawIO]: msg: ${msg}`);
              window.removeEventListener('message', handleExport);
            }
          } catch (_) {}
        }
      };
    
      window.addEventListener('message', handleExport);
    },

    loadXml(xml: string) {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({
          action: 'load',
          autosave: 1,
          xml,
          title: 'Foobar'
        }),
        '*'
      );
    }
    
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