'use client';

import { useState, useRef, useEffect } from "react";
import { FiCopy, FiDownload, FiShare2 } from "react-icons/fi";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

type RightSidebarProps = {
    logs: string[];
    errors: string[];
    codeOutput: string;
};

export default function RightSidebar({ logs, errors, codeOutput }: RightSidebarProps) {
  const [width, setWidth] = useState(350);
  const isResizing = useRef(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'Code Output' | 'Logs' | 'Errors'>("Code Output");
  const [copied, setCopied] = useState(false);

  const overlayId = 'resize-overlay';

  const addOverlay = () => {
    const overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '9999';
    overlay.style.cursor = 'col-resize';
    overlay.style.background = 'transparent';
    document.body.appendChild(overlay);
  };
  
  const removeOverlay = () => {
    const overlay = document.getElementById(overlayId);
    if (overlay) document.body.removeChild(overlay);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing.current && sidebarRef.current) {
        const screenWidth = window.innerWidth;
        const newWidth = screenWidth - e.clientX;
        if (newWidth >= 150 && newWidth <= 700) {
          setWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
        isResizing.current = false;
        document.body.classList.remove('no-select');
        removeOverlay();
      };
    const win = typeof window !== 'undefined' && window.top && window.top !== null
      ? window.top
      : window;

    win.addEventListener("mousemove", handleMouseMove);
    win.addEventListener("mouseup", handleMouseUp);

    return () => {
      win.removeEventListener("mousemove", handleMouseMove);
      win.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const tabContent = {
    'Code Output': (
      <div className="flex-1 bg-gray-900 rounded-md p-2 font-mono text-gray-100 text-base overflow-auto whitespace-pre">
        <SyntaxHighlighter language="python" style={oneLight} wrapLongLines={false} showLineNumbers>
          {codeOutput || '# No code generated yet.'}
        </SyntaxHighlighter>
      </div>
    ),
    Logs: (
      <div className="flex-1 bg-black text-white font-mono text-sm p-4 overflow-auto whitespace-pre">
        {logs.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    ),
    Errors: (
      <div className="flex-1 bg-black text-red-400 font-mono text-sm p-4 overflow-auto whitespace-pre">
        {errors.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    ),
  };

  const handleCopy = async() => {
    if (!codeOutput) return;
    try {
      await navigator.clipboard.writeText(codeOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleDownload = () => {
    if (!codeOutput) return;
    const blob = new Blob([codeOutput], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_code.py'
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={sidebarRef}
      style={{ width: `${width}px` }}
      className="bg-white text-gray-800 p-4 shadow-md border-l border-gray-300 relative flex flex-col whitespace-nowrap overflow-hidden text-ellipsis"
    >
      {/* Tabs */}
      <div className="flex flex-row justify-center space-x-0 mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
      {(['Code Output', 'Logs', 'Errors'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-white font-semibold text-lg transition-colors duration-200 ${
              activeTab === tab ? 'bg-blue-900' : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Output Box */}
      <div className="flex-1 mb-4 bg-gray-100 rounded-md p-4 font-mono text-gray-600 text-sm whitespace-nowrap overflow-scroll">
        {tabContent[activeTab]}
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-auto text-sm">
      <button
            onClick={handleCopy}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-300 ${
              copied ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            <FiCopy /> <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            <FiDownload /> <span>Download</span>
          </button>
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={() => {
            isResizing.current = true;
            document.body.classList.add('no-select');
            addOverlay();
        }}
        className="absolute top-0 left-0 h-full w-2 cursor-col-resize bg-transparent hover:bg-gray-400 transition-colors"
      />
    </div>
  );
}