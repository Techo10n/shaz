'use client'; 

import { FC, useState } from 'react';

const Navbar: FC = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">shaz</h1>
        <div className="relative">
          <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2">
            <span>Profile</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg">
              <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Dashboard</a>
              <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Settings</a>
              <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Log out</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;