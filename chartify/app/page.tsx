'use client';

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 text-3xl flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-10 overflow-auto">{/* Main content goes here */}</div>
      </div>
    </div>
  );
}