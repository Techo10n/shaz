'use client'; 

import { FC, useState } from 'react';

const Navbar: FC = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <a href="/history">
            <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <span className="pl-2"><a href='/'>shaz</a></span>
        </h1>
        <div className="relative">
          <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2">
            <span>(())</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-[#191919] rounded-lg shadow-lg">
              <a href="#" className="text-right block px-4 py-2 text-white hover:bg-[#cab0f5] rounded-lg">Profile</a>
              <a href="#" className="text-right block px-4 py-2 text-white hover:bg-[#cab0f5] rounded-lg">Dashboard</a>
              <a href="#" className="text-right block px-4 py-2 text-white hover:bg-[#cab0f5] rounded-lg">Log Out</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;