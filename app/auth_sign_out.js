// auth_sign_out.js
import { auth } from './firebase/firebase';
import { signOut } from "firebase/auth";
import { useRouter } from 'next/router';


const signOutUser = async () => {
 const router = useRouter(); // Initialize router


 try {
   await signOut(auth);
   console.log("User signed out successfully.");
  
   // Redirect to homepage after successful sign-out
   router.push('/');
 } catch (error) {
   console.error("Error signing out: ", error);
 }
};


export default signOutUser;