'use client';

import Header from "./components/Header";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import IntegratedDrawIO from "./components/IntegratedDrawIO";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 text-3xl flex flex-col">
      <Header />
      <div className="flex flex-1 w-full overflow-hidden">
        <LeftSidebar />
        <div className="flex flex-grow overflow-hidden">
          <IntegratedDrawIO/>
        </div>
        <RightSidebar />
      </div>
    </div>
  );
}