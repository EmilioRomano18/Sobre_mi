// ============================================================
// firebase-auth.js
// Módulo de autenticación con Firebase
// Maneja: registro, login con email, login con Google,
// logout y escucha de cambios de sesión.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// ============================================================
// Configuración de Firebase
// Estos valores conectan tu app con tu proyecto en Firebase Console
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDKZMfg1V01kQY2-O7ICammKtF4ZpEMK7k",
  authDomain: "personal-540f4.firebaseapp.com",
  projectId: "personal-540f4",
  storageBucket: "personal-540f4.firebasestorage.app",
  messagingSenderId: "176960675302",
  appId: "1:176960675302:web:bae1b6f4491680331c0a27",
  measurementId: "G-M79D7MP67F",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
// Obtener instancia de autenticación
const auth = getAuth(app);
// Obtener instancia de Firestore (base de datos)
const db = getFirestore(app);
// Proveedor de autenticación de Google
const googleProvider = new GoogleAuthProvider();

// ============================================================
// REGISTRO con email y contraseña
// 1. Crea el usuario en Firebase Auth
// 2. Actualiza su perfil con el nombre
// 3. Guarda datos adicionales en Firestore
// ============================================================
export async function registerUser(name, email, password) {
  try {
    // Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Actualizar el perfil del usuario con su nombre
    await updateProfile(user, { displayName: name });

    // Guardar datos adicionales en Firestore
    // Se crea un documento en la colección "usuarios" con el UID como ID
    await setDoc(doc(db, "usuarios", user.uid), {
      nombre: name,
      email: email,
      fechaRegistro: serverTimestamp(),
      metodoRegistro: "email",
    });

    return { success: true, user: user };
  } catch (error) {
    // Traducir errores comunes de Firebase al español
    return { success: false, error: translateError(error.code) };
  }
}

// ============================================================
// LOGIN con email y contraseña
// Busca el usuario en Firebase Auth y verifica la contraseña
// ============================================================
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: translateError(error.code) };
  }
}

// ============================================================
// LOGIN con Google
// Abre una ventana popup para que el usuario elija su cuenta de Google
// Si es la primera vez, también guarda sus datos en Firestore
// ============================================================
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Verificar si ya existe en Firestore (para no sobreescribir datos)
    const userDoc = await getDoc(doc(db, "usuarios", user.uid));

    if (!userDoc.exists()) {
      // Primera vez que inicia sesión con Google → guardar en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        nombre: user.displayName || "Usuario Google",
        email: user.email,
        fechaRegistro: serverTimestamp(),
        metodoRegistro: "google",
        fotoURL: user.photoURL || "",
      });
    }

    return { success: true, user: user };
  } catch (error) {
    return { success: false, error: translateError(error.code) };
  }
}

// ============================================================
// LOGOUT - Cierra la sesión del usuario actual
// ============================================================
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// ESCUCHAR CAMBIOS DE AUTENTICACIÓN
// Se ejecuta cada vez que el usuario inicia o cierra sesión
// Útil para actualizar la interfaz en tiempo real
// ============================================================
export function onAuthChange(callback) {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

// ============================================================
// OBTENER USUARIO ACTUAL
// Retorna el usuario logueado o null si no hay sesión
// ============================================================
export function getCurrentUser() {
  return auth.currentUser;
}

// ============================================================
// TRADUCIR ERRORES de Firebase al español
// Firebase devuelve códigos de error en inglés, esta función
// los convierte a mensajes amigables en español
// ============================================================
function translateError(errorCode) {
  const errors = {
    "auth/email-already-in-use": "Este correo electrónico ya está registrado.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/invalid-email": "El correo electrónico no es válido.",
    "auth/user-not-found": "No existe una cuenta con este correo electrónico.",
    "auth/wrong-password": "La contraseña es incorrecta.",
    "auth/too-many-requests":
      "Demasiados intentos fallidos. Intenta más tarde.",
    "auth/popup-closed-by-user":
      "Se cerró la ventana de Google antes de completar el login.",
    "auth/network-request-failed":
      "Error de conexión. Verifica tu internet.",
    "auth/invalid-credential":
      "Credenciales inválidas. Verifica tu email y contraseña.",
  };

  return errors[errorCode] || `Error inesperado: ${errorCode}`;
}
