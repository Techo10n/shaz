// app/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase/firebase'; // Ensure this path is correct
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from 'next/navigation';


const AuthPage = () => {
 const router = useRouter();
 const [user, setUser] = useState<User | null>(null); // State to manage user


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
   try {
     await signInWithPopup(auth, googleProvider);
   } catch (error) {
     console.error("Error during sign-in:", error);
   }
 };


 const handleLogout = async () => {
   try {
     await signOut(auth);
     setUser(null); // Clear the user state after signing out
   } catch (error) {
     console.error("Error during sign-out:", error);
   }
 };


 return (
   <div className="flex flex-col items-center justify-center min-h-screen bg-[#191919]">
     {user ? (
       <div>
         <h1 className="text-white">Welcome, {user.displayName}</h1>
         <button onClick={handleLogout} className="bg-red-500 text-white p-3 rounded hover:bg-red-600">
           Sign Out
         </button>
       </div>
     ) : (
       <button onClick={handleLogin} className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600">
         Sign In with Google
       </button>
     )}
   </div>
 );
};


export default AuthPage;