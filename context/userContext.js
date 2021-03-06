import { useState, useEffect, createContext, useContext } from "react";
import firebase from "../firebase/clientApp";

export const UserContext = createContext();

export default function UserContextComp({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // Helpful, to update the UI accordingly.
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Look for Orders if logged in
    const unsubscriber = firebase.auth().onAuthStateChanged(async (user) => {
      // console.log('user')
      // console.log(user)
      try {
        if (user) {
          // User is signed in.
          const { uid, displayName, email, photoURL, phoneNumber } = user;
          console.log("user");
          console.log(user);
          // You could also look for the user doc in your Firestore (if you have one):
          // const userDoc = await firebase.firestore().doc(`users/${uid}`).get()
          setUser({ uid, displayName, email, photoURL, phoneNumber });
        } else setUser(null);
      } catch (error) {
        // Most probably a connection error. Handle appropriately.
      } finally {
        setLoadingUser(false);
      }
    });

    return () => unsubscriber();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loadingUser,
        fireUser,
        isDark,
        setIsDark,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
