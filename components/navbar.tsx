'use client';

import { FC, useEffect, useState } from 'react';
import { db } from '../app/firebase/firebase'; // Ensure you import db and initializeAnalytics correctly
import { setDoc, doc } from 'firebase/firestore';
import { auth, googleProvider } from '../app/firebase/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth'; // Import User type
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Navbar: FC = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null); // State to store user information
  const router = useRouter();

  // Check for user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  // Handle authentication state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set the user state based on authentication
      if (user) {
        router.push('/'); // Redirect to homepage if user is logged in
      }
    });
    return () => unsubscribe(); // Clean up the subscription
  }, [router]);

  const handleLogin = async () => {
    let result = null;
    try {
      result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;
      const userDocRef = doc(db, 'users', loggedInUser.uid);

      // Add necessary fields to user-specific document.
      await setDoc(userDocRef, {
        userId: loggedInUser.uid, // Save user ID
        numNotes: 0,
      });
    } catch (error) {
      console.error("Error during sign-in:", error);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.setItem("noteId", ""); // Set noteId to null in local storage
      localStorage.setItem("userId", ""); // Set userId to null in local storage
      await signOut(auth);
      setUser(null); // Clear the user state after signing out
      // window.location.href = '/';
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  return (
    <nav className="p-4 text-white">
      <div className="pr-4 w-full flex justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">
            <button onClick={() => router.push('/history')}>
              <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="pl-2">
                <button className="hover:text-[#cab0f5]" onClick={() => {
                localStorage.setItem("noteId", ""); // Set noteId to null when clicking shaz
                window.location.href = '/'; // Force a full page reload
                }}>sentimentai</button>
            </span>
          </h1>
        </div>
        <div className="relative">
          {!user ? (
            <button onClick={handleLogin} className="flex items-center space-x-2 hover:underline">
              Sign In
            </button>
          ) : (
            <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2">
              <Image src={user?.photoURL ?? "/default-profile-pic.png"} alt="profile-pic" width={96} height={96} className="w-8 h-8 rounded-full" />
              <span><a>{user.displayName?.split(" ")[0]}</a></span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-[#191919] rounded-lg shadow-lg text-right z-50">
              <button onClick={() => {router.push('/history'); setDropdownOpen(false);}} className="block px-4 py-2 text-white hover:bg-[#cab0f5] rounded-lg">History</button>
              <button
                onClick={() => {
                  handleLogout();
                  setDropdownOpen(false); // Close the dropdown after logout
                }}
                className="block text-right w-full px-4 py-2 text-white hover:bg-[#cab0f5] rounded-lg"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
