'use client';

import { useState, useRef, useEffect } from "react";

type LeftSidebarProps = {
  onLoadExample: (path: string) => void;
};

export default function LeftSidebar({ onLoadExample }: LeftSidebarProps) {
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({
    Templates: false,
    Tips: false,
  });

  const templates = [
    { name: "Divide by Zero", path: "/templates/div_by_zero.drawio" },
    { name: "Nested Loop", path: "/templates/nested_loop.drawio" },
    { name: "Reusable Function", path: "/templates/reusable_function.drawio" },
  ]

  const sidebarRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(250); // default width in pixels
  const isResizing = useRef(false);

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
        const newWidth = e.clientX;
        if (newWidth >= 150 && newWidth <= 250) {
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

  return (
    <div
      ref={sidebarRef}
      style={{ width: `${width}px` }}
      className="bg-white text-gray-800 p-4 shadow-md border-l border-gray-300 relative flex flex-col"
    >
      <h2 className="font-bold text-gray-700 text-2xl mb-6 whitespace-nowrap overflow-hidden text-ellipsis">📁 Project Tools</h2>

      {/* Expandable: Templates */}
      <div>
        <button
          className="w-full text-left text-lg px-4 py-2 bg-white hover:bg-gray-100 rounded-md whitespace-nowrap overflow-hidden text-ellipsis"
          onClick={() =>
            setExpanded((prev) => ({ ...prev, Templates: !prev.Templates }))
          }
        >
          📌 Templates
        </button>
        <div
          className={`mt-2 space-y-2 text-base text-gray-700 transition-all duration-300 ease-in-out overflow-hidden ${expanded.Templates ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          {
            templates.map((template) => (
              <button
                key={template.path}
                className="block w-full text-sm text-left pl-20 py-1 hover:bg-gray-100 rounded-md overflow-hidden text-ellipsis"
                onClick={() => onLoadExample(template.path)}
              >
                {template.name}
              </button>
            ))}
        </div>
      </div>


      {/* Expandable: Tips */}
      <div>
        <button
          className="w-full text-left text-base px-4 py-2 bg-white hover:bg-gray-100 rounded-md whitespace-nowrap overflow-hidden text-ellipsis"
          onClick={() =>
            setExpanded((prev) => ({ ...prev, Tips: !prev.Tips }))
          }
        >
          💡 Tips
        </button>
        <div
          className={`mt-2 space-y-2 text-sm text-gray-700 transition-all duration-300 ease-in-out overflow-hidden ${expanded.Tips ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <button className="block w-full text-sm text-left pl-20 py-1 hover:bg-gray-100 rounded-md overflow-hidden text-ellipsis">
            Tip 1
          </button>
          <button className="block w-full text-sm text-left pl-20 py-1 hover:bg-gray-100 rounded-md overflow-hidden text-ellipsis">
            Tip 2
          </button>
        </div>
      </div>


      {/* AI Chat Button */}
      <button className="w-full text-base text-left px-4 py-2 bg-white hover:bg-gray-100 rounded-md whitespace-nowrap overflow-hidden text-ellipsis">
        🤖 AI Chat
      </button>

      {/* Resize handle */}
      <div
        onMouseDown={() => {
          isResizing.current = true;
          document.body.classList.add('no-select');
          addOverlay();
        }}
        className="absolute top-0 right-0 h-full w-2 cursor-col-resize bg-transparent hover:bg-gray-400 transition-colors"
      />
    </div>
  );
}