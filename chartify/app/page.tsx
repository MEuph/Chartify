'use client';

import { useState, useRef } from 'react';
import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import IntegratedDrawIO from "./components/IntegratedDrawIO";

export default function Home() {
  const drawioRef = useRef<any>(null);
  const [logContent, setLogContent] = useState('');

  const handleGenerateCode = () => {
    drawioRef.current?.exportXml((xml: string) => {
      setLogContent(xml);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 text-3xl flex flex-col">
      <Header onGenerateCode={handleGenerateCode} />
      <div className="flex flex-1 w-full overflow-hidden">
        <LeftSidebar />
        <div className="flex flex-grow overflow-hidden">
          <IntegratedDrawIO ref={drawioRef} />
        </div>
        <RightSidebar logs = {logContent} />
      </div>
    </div>
  );
}