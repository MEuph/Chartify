'use client';

import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";

const dropdownOptions = {
  File: ["New", "Open", "Save", "Save As"],
  Edit: ["Undo", "Redo", "Cut", "Copy", "Paste"],
  Export: ["PDF", "PNG", "Markdown"],
  History: ["View History", "Revert Change"],
};

type HeaderProps = {
    onGenerateCode: () => void;
};

export default function Header({ onGenerateCode }: HeaderProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleGenerateCode = async () => {
    try {
      const response = await fetch("http://localhost:8000/generate-code", {
        method: "POST",
      });
      const data = await response.json();
      console.log("Generated code:", data);
    } catch (error) {
      console.error("Error generating code:", error);
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-6 bg-gray-800 shadow-md">
      <div className="flex items-center space-x-6">
        <a href="/" className="text-3xl text-gray-300 font-bold hover:text-white">
          🚀AlgoDraft
        </a>
        <span className="text-white text-lg">Untitled Project</span>
      </div>

      <div className="flex space-x-8 relative">
        {Object.entries(dropdownOptions).map(([label, options]) => (
          <div key={label} className="relative">
            <button
              onClick={() =>
                setOpenDropdown((prev) => (prev === label ? null : label))
              }
              className="px-4 py-2 bg-gray-700 rounded-md text-white hover:bg-gray-600 text-base"
            >
              {label}
            </button>
            {openDropdown === label && (
              <div className="absolute left-0 mt-2 w-40 bg-white text-black shadow-lg rounded-md z-10 text-sm">
                {options.map((option) => (
                  <div
                    key={option}
                    className="px-4 py-2 rounded-md hover:bg-gray-200 cursor-pointer"
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-6">
        <button
          onClick={onGenerateCode}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md text-base"
        >
          Generate Code
        </button>
        <FaUserCircle className="text-3xl text-gray-300 hover:text-gray-100 cursor-pointer" />
      </div>
    </div>
  );
}