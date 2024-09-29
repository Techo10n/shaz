// auth_sign_out.js
import { auth } from './firebase/firebase';
import { signOut } from "firebase/auth";
import { useRouter } from 'next/router';
import { useCallback } from 'react';

const useSignOutUser = () => {
  const router = useRouter(); // Initialize router

  const signOutUser = useCallback(async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully.");
    
      // Redirect to homepage after successful sign-out
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }, [router]);

  return signOutUser;
};

export default useSignOutUser;