import SignInModel from '../models/SignInModel';

export default class SignInPresenter {
  constructor(view) {
    this.view = view;
    console.log('Presenter inicializado'); // Debug
  }

  async registerUser(userData) {
    console.log('Iniciando registro', userData); // Debug
    
    // Validación mejorada
    if (!this.validateFields(userData)) return;

    try {
      // 1. Registro en Auth
      console.log('Creando usuario en Firebase Auth...');
      const uid = await SignInModel.registerWithEmail(userData.correo, userData.password);
      
      // 2. Guardar en Firestore
      console.log('Guardando datos en Firestore...');
      await SignInModel.saveUserData({
        ...userData,
        uid: uid,
        createdAt: new Date().toISOString()
      });

      console.log('Registro completado'); // Debug
      this.view.onSuccess();
      
    } catch (error) {
      console.error('Error en registro:', error); // Debug detallado
      this.handleFirebaseError(error); // Pasa el error completo
    }
  }

  validateFields(userData) {
    const { correo, password } = userData;
    
    // Validar campos vacíos
    if (Object.values(userData).some(field => !field)) {
      this.view.showError('Todos los campos son obligatorios');
      return false;
    }

    // Validar formato email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      this.view.showError('Ingrese un correo válido');
      return false;
    }

    // Validar contraseña
    if (password.length < 6) {
      this.view.showError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  }

  handleFirebaseError(error) {
    console.log('Error code:', error.code); // Debug
    
    const errorMap = {
      'auth/email-already-in-use': 'El correo ya está registrado',
      'auth/weak-password': 'La contraseña debe tener 6+ caracteres',
      'auth/invalid-email': 'Correo electrónico inválido',
      'firestore/save-failed': 'Error al guardar datos. Intente nuevamente',
      'default': 'Error al registrar. Por favor intente más tarde'
    };

    const errorCode = error.code || 'default';
    this.view.showError(errorMap[errorCode] || errorMap['default']);
  }
}