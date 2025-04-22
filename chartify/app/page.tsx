'use client';

import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 text-3xl flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <div className="flex-1 p-10 overflow-auto">{/* Main content goes here */}</div>
        <RightSidebar />
      </div>
    </div>
  );
}