// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
// Añade query, where, getDocs, setDoc, serverTimestamp
import { getFirestore, collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../../firebaseConfig'; // Ajusta la ruta

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // IMPORTANTE: Obtén auth y db desde la app DE UNA SOLA VEZ, no desde firebaseConfig directamente si ya están inicializados allí
  // O, si firebaseConfig.js ya exporta 'auth' y 'db' inicializados (como lo hace tu archivo), úsalos directamente.
  // La forma en que lo tienes (getAuth(app), getFirestore(app)) aquí es redundante si firebaseConfig.js ya lo hace y exporta.
  // Para mantenerlo simple y alineado con tu firebaseConfig.js que exporta 'auth' y 'db':
  // import { auth as firebaseAuth, db as firebaseDb } from '../../firebaseConfig';
  // const auth = firebaseAuth;
  // const db = firebaseDb;
  // Pero ya que app se exporta, podemos seguir así:
  const authInstance = getAuth(app); // Usar una variable diferente para no sombrear la importada si la hubiera
  const dbInstance = getFirestore(app);

  useEffect(() => {
    console.log('[AuthContext] Montando listener de onAuthStateChanged.');
    const unsubscribeAuth = onAuthStateChanged(authInstance, async (user) => { // Usa authInstance
      setCurrentUser(user);
      setIsAdmin(false);
      setUserData(null);

      if (user) {
        console.log('[AuthContext] Usuario autenticado con Firebase Auth UID:', user.uid);
        const usersCollectionRef = collection(dbInstance, 'usuarios'); // Usa dbInstance
        // Busca el documento del usuario en Firestore donde el campo 'authUid' coincida con user.uid
        const q = query(usersCollectionRef, where("authUid", "==", user.uid));

        try {
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDocSnap = querySnapshot.docs[0]; // Debería haber solo uno
            const firestoreUserData = userDocSnap.data();
            // Guarda también el ID del documento de Firestore, podría ser útil
            setUserData({ firestoreDocId: userDocSnap.id, ...firestoreUserData });
            console.log('[AuthContext] Datos del usuario encontrados en Firestore (doc ID ' + userDocSnap.id + '):', firestoreUserData);
            if (firestoreUserData.role === 'admin') {
              setIsAdmin(true);
              console.log('[AuthContext] Acceso como Administrador concedido.');
            } else {
              console.log('[AuthContext] Acceso como Usuario Regular.');
            }
          } else {
            console.warn('[AuthContext] ¡Advertencia! Documento de usuario NO encontrado en Firestore para authUid:', user.uid);
            // --- INICIO: Lógica para crear perfil si no existe ---
            // Esta es una forma de asegurar que cada usuario de Auth tenga un perfil.
            // El ID del documento aquí será un ID automático de Firestore.
            console.log(`[AuthContext] Intentando crear perfil para usuario con authUid: ${user.uid}`);
            try {
              const newUserDocRef = doc(collection(dbInstance, "usuarios")); // Crea un ID automático
              await setDoc(newUserDocRef, {
                authUid: user.uid, // MUY IMPORTANTE: Guarda el UID de Firebase Auth
                email: user.email,
                nombre: user.displayName || user.email.split('@')[0] || "Usuario Nuevo",
                role: "user", // Rol por defecto
                createdAt: serverTimestamp(), // Fecha de creación
                // ... otros campos iniciales que desees ...
              });
              const newProfileData = { 
                authUid: user.uid, 
                email: user.email, 
                nombre: user.displayName || user.email.split('@')[0] || "Usuario Nuevo", 
                role: "user" 
              };
              setUserData({ firestoreDocId: newUserDocRef.id, ...newProfileData });
              console.log('[AuthContext] Perfil básico creado en Firestore con ID de documento:', newUserDocRef.id, 'y authUid:', user.uid);
            } catch (creationError) {
              console.error('[AuthContext] Error creando perfil básico en Firestore:', creationError);
            }
            // --- FIN: Lógica para crear perfil si no existe ---
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
    userData,
    isAdmin,
    loadingAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loadingAuth && children}
    </AuthContext.Provider>
  );
};