import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [screenName, setScreenName] = useState(null);
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            const data = snap.data();
            setScreenName(data.screenName || firebaseUser.displayName || firebaseUser.email);
            setRole(data.role || "member");
          } else {
            setScreenName(firebaseUser.displayName || firebaseUser.email);
            setRole("member");
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setScreenName(firebaseUser.displayName || firebaseUser.email);
        }
      } else {
        setUser(null);
        setScreenName(null);
        setRole("member");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        screenName,
        setScreenName,
        role,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
