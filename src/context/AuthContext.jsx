// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext, useRef } from 'react'; // Añadido useRef
import { AppState } from 'react-native'; // Añadido AppState
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'; // Añadido updateDoc, serverTimestamp
import { app } from '../../firebaseConfig';

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Hook personalizado para usar el Contexto más fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Crear el Proveedor del Contexto (AuthProvider)
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); // Estado para guardar datos del perfil de Firestore
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const auth = getAuth(app);
  const db = getFirestore(app);

  // Ref para el estado actual de la aplicación (foreground/background)
  const appStateRef = useRef(AppState.currentState);

  // Efecto para el listener de autenticación y obtener datos del usuario
  useEffect(() => {
    console.log('[AuthContext] Montando listener de onAuthStateChanged.');
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAdmin(false); // Resetear el estado de admin
      setUserData(null); // Resetear datos del usuario

      if (user) {
        console.log('[AuthContext] Usuario autenticado:', user.uid);
        const userDocRef = doc(db, 'usuarios', user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const firestoreUserData = userDocSnap.data();
            setUserData(firestoreUserData); // Guardar datos del perfil de Firestore
            console.log('[AuthContext] Datos del usuario en Firestore:', firestoreUserData);
            if (firestoreUserData.role === 'admin') {
              setIsAdmin(true);
              console.log('[AuthContext] Acceso como Administrador concedido.');
            } else {
              console.log('[AuthContext] Acceso como Usuario Regular.');
            }
          } else {
            console.warn('[AuthContext] ¡Advertencia! Documento de usuario no encontrado en Firestore para UID:', user.uid);
            // Considera crear un perfil básico aquí si es necesario para tu app
          }
        } catch (error) {
          console.error("[AuthContext] Error al obtener datos del usuario desde Firestore:", error);
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
  }, [auth, db]);


  // Efecto para manejar el sistema de presencia (isOnline, lastSeen)
  useEffect(() => {
    if (!currentUser) { // Solo actuar si hay un usuario logueado
      return;
    }

    console.log(`[AuthContext] Montando listener de AppState para usuario: ${currentUser.uid}. Estado actual: ${appStateRef.current}`);
    const userStatusRef = doc(db, 'usuarios', currentUser.uid);

    // Función para manejar cambios de estado de la app
    const handleAppStateChange = async (nextAppState) => {
      const currentStatus = appStateRef.current;
      console.log(`[AuthContext] AppState cambió de ${currentStatus} a ${nextAppState} para usuario ${currentUser.uid}`);

      if (currentStatus.match(/inactive|background/) && nextAppState === 'active') {
        // App vuelve a primer plano
        console.log('[AuthContext] AppState: Foreground. Marcando usuario como Online.');
        try {
          await updateDoc(userStatusRef, {
            isOnline: true,
            lastSeen: serverTimestamp()
          });
        } catch (e) {
          console.error("[AuthContext] Error actualizando estado a online:", e);
        }
      } else if (currentStatus === 'active' && nextAppState.match(/inactive|background/)) {
        // App va a segundo plano o se vuelve inactiva
        console.log('[AuthContext] AppState: Background/Inactive. Marcando usuario como Offline.');
        try {
          await updateDoc(userStatusRef, {
            isOnline: false,
            lastSeen: serverTimestamp()
          });
        } catch (error) {
          console.error('[AuthContext] Error actualizando estado a offline:', error);
        }
      }
      appStateRef.current = nextAppState; // Actualizar el estado de referencia
    };

    // Establecer estado inicial al montar el listener si la app ya está activa
    if (AppState.currentState === 'active') {
      console.log('[AuthContext] App ya está activa al montar listener. Marcando como Online.');
      updateDoc(userStatusRef, {
        isOnline: true,
        lastSeen: serverTimestamp()
      }).catch(e => console.error("[AuthContext] Error actualizando estado a online (estado inicial):", e));
    } else {
      // Si la app se carga pero no está activa, asegurar que esté offline
      console.log('[AuthContext] App no está activa al montar listener. Marcando como Offline.');
       updateDoc(userStatusRef, {
        isOnline: false,
        lastSeen: serverTimestamp()
      }).catch(e => console.error("[AuthContext] Error actualizando estado a offline (estado inicial):", e));
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Limpieza al desmontar o cuando currentUser cambia
    return () => {
      console.log(`[AuthContext] Desmontando listener de AppState para usuario: ${currentUser?.uid}.`);
      subscription.remove();
      // Cuando el listener se quita (ej. cierre de sesión), marcar como offline
      // Es importante verificar currentUser de nuevo porque podría ser null si el usuario cerró sesión
      if (auth.currentUser) { // Usar auth.currentUser para la referencia más actualizada
        const finalUserStatusRef = doc(db, 'usuarios', auth.currentUser.uid);
        console.log(`[AuthContext] Limpieza: Marcando usuario ${auth.currentUser.uid} como offline.`);
        updateDoc(finalUserStatusRef, {
          isOnline: false,
          lastSeen: serverTimestamp()
        }).catch(e => console.error("[AuthContext] Error actualizando a offline en limpieza de AppState:", e));
      }
    };
  }, [currentUser, db, auth]); // 'auth' añadido a dependencias por si se usa en la limpieza

  const value = {
    currentUser,
    userData, // Exponer userData para que otros componentes puedan usar el perfil
    isAdmin,
    loadingAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loadingAuth && children}
    </AuthContext.Provider>
  );
};