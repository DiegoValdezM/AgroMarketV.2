// src/presenters/SignInPresenter.js
import SignInModel from '../models/SignInModel'; 
import { Alert } from 'react-native';

export default class SignInPresenter {
  constructor(view) {
    this.view = view;
    console.log('[SignInPresenter] Presenter inicializado');
  }

  async registerUser(userData) {
    console.log('[SignInPresenter] Iniciando registro con userData:', JSON.stringify(userData, null, 2));
    
    if (!this.validateFields(userData)) return;

    try {
      console.log('[SignInPresenter] Creando usuario en Firebase Auth con correo:', userData.correo);
      const firebaseUser = await SignInModel.registerWithEmail(userData.correo, userData.password);
      
      // --- 🔥 LOG DE DEBUG ADICIONAL AQUÍ 🔥 ---
      console.log("[SignInPresenter] Valor de 'firebaseUser' recibido desde SignInModel:", firebaseUser);
      if (firebaseUser && typeof firebaseUser === 'object') {
        console.log("[SignInPresenter] Propiedades de 'firebaseUser':", Object.keys(firebaseUser));
        console.log("[SignInPresenter] 'firebaseUser.uid' es:", firebaseUser.uid);
      }
      // -----------------------------------------
      
      if (!firebaseUser || !firebaseUser.uid) { 
        console.error("[SignInPresenter] CONDICIÓN IF FALLÓ: !firebaseUser o !firebaseUser.uid es verdadero.");
        console.error("[SignInPresenter] Valor de !firebaseUser:", !firebaseUser);
        console.error("[SignInPresenter] Valor de !firebaseUser.uid (si firebaseUser existe):", firebaseUser ? !firebaseUser.uid : "firebaseUser es null/undefined");
        throw new Error("auth/user-not-created");
      }
      // Si este log aparece, la condición if pasó:
      console.log('[SignInPresenter] Usuario creado en Firebase Auth y objeto user recibido correctamente. UID:', firebaseUser.uid);


      const displayNameParaAuth = userData.usuario.trim(); 
      console.log(`[SignInPresenter] Intentando actualizar perfil de Auth con displayName: '${displayNameParaAuth}'`);
      await SignInModel.updateAuthUserProfile(firebaseUser, {
        displayName: displayNameParaAuth
      });
      console.log(`[SignInPresenter] Perfil de Firebase Auth actualizado con displayName.`);
      
      const userProfileDataForFirestore = {
        usuario: userData.usuario.trim(),
        nombre: userData.nombre.trim(),
        apellidos: userData.apellidos.trim(),
        correo: userData.correo.toLowerCase().trim(),
        ubicacion: userData.ubicacion.trim(),
        telefono: userData.telefono.trim(),
        role: 'user',
        isActive: true,
        createdAt: SignInModel.getServerTimestamp(),
      };
      console.log('[SignInPresenter] Guardando datos en Firestore para UID:', firebaseUser.uid, 'Datos:', JSON.stringify(userProfileDataForFirestore, null, 2));
      await SignInModel.saveUserData(firebaseUser.uid, userProfileDataForFirestore);
      console.log('[SignInPresenter] Datos del usuario guardados en Firestore.');

      console.log('[SignInPresenter] Registro completado exitosamente.');
      this.view.onSuccess();
      
    } catch (error) {
      console.error('[SignInPresenter] Error detallado en registerUser:', error);
      this.handleFirebaseError(error);
    }
  }

  // ... (tus métodos validateFields y handleFirebaseError sin cambios) ...
  validateFields(userData) {
    const { correo, password, nombre, apellidos, usuario, ubicacion, telefono } = userData;
    if (!usuario || !nombre || !apellidos || !correo || !password || !ubicacion || !telefono) {
      this.view.showError('Todos los campos son obligatorios');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      this.view.showError('Ingrese un correo válido');
      return false;
    }
    if (password.length < 6) {
      this.view.showError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  }

  handleFirebaseError(error) {
    console.log('[SignInPresenter] handleFirebaseError. Código:', error.code, 'Mensaje:', error.message);
    const errorMap = {
      'auth/email-already-in-use': 'El correo ya está en uso por otra cuenta.',
      'auth/weak-password': 'La contraseña es demasiado débil (mínimo 6 caracteres).',
      'auth/invalid-email': 'El formato del correo electrónico no es válido.',
      'auth/user-not-created': 'No se pudo crear el usuario en el sistema de autenticación. Verifique los datos.',
      'firestore/save-failed': 'Error al guardar los datos del usuario. Intente nuevamente.',
      'default': 'Error durante el registro. Por favor, intente más tarde.'
    };
    const errorCode = error.code || (error.message === "auth/user-not-created" ? "auth/user-not-created" : "default");
    this.view.showError(errorMap[errorCode] || errorMap['default']);
  }
}