// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../../firebaseConfig';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); // Esto es tu userProfile
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const authInstance = getAuth(app);
  const dbInstance = getFirestore(app);

  useEffect(() => {
    console.log('[AuthContext] Montando listener de onAuthStateChanged.');
    const unsubscribeAuth = onAuthStateChanged(authInstance, async (user) => {
      setCurrentUser(user);
      setIsAdmin(false);
      setUserData(null); // Resetea userData al inicio de cada cambio de estado de auth

      if (user) {
        console.log('[AuthContext] Usuario autenticado con Firebase Auth UID:', user.uid);
        const usersCollectionRef = collection(dbInstance, 'usuarios');
        const q = query(usersCollectionRef, where("authUid", "==", user.uid));

        try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDocSnap = querySnapshot.docs[0];
            const firestoreUserData = userDocSnap.data();
            
            // ¡CAMBIO CLAVE AQUÍ! Prioriza el photoURL de Firestore.
            const profileWithPhoto = {
                ...firestoreUserData,
                // Si Firestore tiene photoURL, úsala. Si no, usa la de Auth, o un valor nulo.
                photoURL: firestoreUserData.photoURL || user.photoURL || null, 
            };

            setUserData({ firestoreDocId: userDocSnap.id, ...profileWithPhoto });
            console.log('[AuthContext] Datos del usuario encontrados en Firestore (doc ID ' + userDocSnap.id + '):', profileWithPhoto);
            if (profileWithPhoto.role === 'admin') {
              setIsAdmin(true);
              console.log('[AuthContext] Acceso como Administrador concedido.');
            } else {
              console.log('[AuthContext] Acceso como Usuario Regular.');
            }
          } else {
            console.warn('[AuthContext] ¡Advertencia! Documento de usuario NO encontrado en Firestore para authUid:', user.uid);
            
            const newUserDocRef = doc(dbInstance, "usuarios", user.uid);
            console.log(`[AuthContext] Intentando crear perfil para usuario con authUid: ${user.uid} usando UID como ID del documento.`);
            try {
              const defaultProfileData = {
                authUid: user.uid,
                email: user.email,
                nombre: user.displayName || user.email.split('@')[0] || "Usuario Nuevo",
                role: "user",
                createdAt: serverTimestamp(),
                photoURL: user.photoURL || null, // Incluir photoURL de Auth si ya existe
              };
              await setDoc(newUserDocRef, defaultProfileData);
              
              setUserData({ firestoreDocId: user.uid, ...defaultProfileData });
              console.log('[AuthContext] Perfil básico creado en Firestore con ID de documento:', user.uid, 'y authUid:', user.uid);
            } catch (creationError) {
              console.error('[AuthContext] Error creando perfil básico en Firestore:', creationError);
            }
          }
        } catch (error) {
          console.error("[AuthContext] Error al obtener/crear datos del usuario desde Firestore:", error);
        }
      } else {
        console.log('[AuthContext] No hay usuario autenticado.');
      }
      setLoadingAuth(false);
    });

    return () => {
      console.log('[AuthContext] Desmontando listener de onAuthStateChanged.');
      unsubscribeAuth();
    };
  }, [authInstance, dbInstance]);

  const value = {
    currentUser,
    userProfile: userData,
    isAdmin,
    loadingAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loadingAuth && children} 
    </AuthContext.Provider>
  );
};