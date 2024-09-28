// auth_sign_in.js
import { auth, googleProvider } from './firebase/firebase';
import { signInWithPopup } from "firebase/auth";
import { useRouter } from 'next/router';


const signInWithGoogle = async () => {
 const router = useRouter(); // Initialize router


 try {
   const result = await signInWithPopup(auth, googleProvider);
   const user = result.user;
   console.log("User signed in: ", user);


   // Redirect to homepage after successful sign-in
   router.push('/'); // Change this to your homepage path
 } catch (error) {
   console.error("Error signing in: ", error);
 }
};


export default signInWithGoogle;