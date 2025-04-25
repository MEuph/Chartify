'use client';

import { useState, useRef } from 'react';
import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import IntegratedDrawIO from "./components/IntegratedDrawIO";

export default function Home() {
  const drawioRef = useRef<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [codeOutput, setCodeOutput] = useState('');

  const handleGenerateCode = async () => {
    console.log('starting generation');
    drawioRef.current?.exportXml(async (data: string) => {
      setLogs((prev) => [...prev, '[GenerateCode] Exported data received']);

      //if (data.startsWith('data:image/svg+xml;base64,')) {
      //  const base64 = data.replace('data:image/svg+xml;base64,', '');
      //  const decodedSvg = atob(base64); // Full SVG with embedded XML
        console.log(`data: ${data}`);
        const file = new File([data], 'diagram.drawio', { type: 'text/xml' });
        console.log(file.text());
        const formData = new FormData();
        formData.append('file', file);
  
        try {
          const response = await fetch('http://localhost:8000/api/py/generate', {
            method: 'POST',
            body: formData,
          });
  
          const result = await response.json();
          setCodeOutput(result.code);
          setLogs((prev) => [...prev, '[GenerateCode] Code generated successfully']);
        } catch (err: any) {
          setErrors((prev) => [...prev, `[Error] ${err.message}`]);
        }
      // } else {
        // setErrors((prev) => [...prev, '[Error] Unexpected format: expected base64 SVG']);
      // }
    });
  };

  const handleLoadExample = async (path: string) => {
    //alert("Loading example diagram" + path + "...");
    const res = await fetch(path);
    const xml = await res.text();
    console.log(xml);
    drawioRef.current?.loadXml(xml);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-3xl flex flex-col">
      <Header onGenerateCode={handleGenerateCode} />
      <div className="flex flex-1 w-full overflow-hidden">
        <LeftSidebar onLoadExample={handleLoadExample} />
        <div className="flex flex-grow overflow-hidden">
          <IntegratedDrawIO ref={drawioRef} />
        </div>
        <RightSidebar logs={logs} errors={errors} codeOutput={codeOutput}/>
      </div>
    </div>
  );
}