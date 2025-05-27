// App.js

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- PROVIDERS ---
import { AuthProvider } from './src/context/AuthContext'; // Asegúrate que la ruta sea correcta
import { ChatProvider } from './src/context/chat'; // <-- (1) IMPORTA TU CHATPROVIDER

// Importamos las pantallas (componentes) que vamos a usar en el stack de navegación.
import HomeScreen from './src/views/publics/inicioView';
import LoginScreen from './src/views/publics/loginView';
import Home2Screen from './src/views/publics/HomeView'; // Esta es la que tiene el botón de chat flotante
import FormScreen from './src/views/publics/AddPostForm';
import FormSignIn from './src/views/publics/SignInView';
import AdminView from './src/views/private/adminView';
import EditView from './src/views/publics/EditPostForm';
import EditUser from './src/views/publics/EditUserForm';
//import MainChat from './src/views/publics/MainChat';
import ChatOptions from './src/views/publics/ChatUserSelection'; // Esta es tu ChatUserSelectionScreen
import ChatPrueba from './src/views/publics/MainChatPrueba'; // Esta es tu ChatUserSelectionScreen

// Creamos el stack de navegación.
const Stack = createNativeStackNavigator();

// Componente principal de la aplicación.
export default function App() {
  return (
    <AuthProvider>
      {/* (2) ENVUELVE CON CHATPROVIDER DESPUÉS DE AUTHPROVIDER */}
      <ChatProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Inicio">
            {/*
              Definimos cada pantalla dentro del stack con Stack.Screen.
            */}
            <Stack.Screen name="Inicio" component={HomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen 
              name="Home" // Esta pantalla es Home2Screen (donde está el botón flotante de chat)
              component={Home2Screen} 
              options={{ title: 'AgroMarket' }} // Puedes poner un título
            />
            <Stack.Screen name="Form" component={FormScreen} options={{ title: 'Nueva Publicación' }}/>
            <Stack.Screen name="SignIn" component={FormSignIn} options={{ title: 'Crear Cuenta' }}/>
            <Stack.Screen name="Admin" component={AdminView} options={{ title: 'Panel de Admin' }}/>
            <Stack.Screen name="EditPost" component={EditView} options={{ title: 'Editar Publicación' }}/>
            <Stack.Screen name="EditUser" component={EditUser} options={{ title: 'Editar Usuario' }}/>
            <Stack.Screen 
              name="Chat" // Esta es MainChat
              component={ChatPrueba} 
              // options={({ route }) => ({ title: route.params?.chatPartnerName || 'Chat' })} // Título dinámico
            />
            <Stack.Screen 
              name="ChatSelection" // Esta es ChatOptions (ChatUserSelectionScreen)
              component={ChatOptions} 
              options={{ title: 'Seleccionar Chat' }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ChatProvider>
    </AuthProvider>
  );
}