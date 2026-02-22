import React, { useState, createContext, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config/firebase';
import colors from './colors';
import Login from './screens/Login';
import Signup from './screens/Signup';
import ForgotPassword from './screens/ForgotPassword';
import TermsOfUse from './screens/TermsOfUse';
import Transparency from './screens/Transparency';
import Chat from './screens/Chat';
import Home from './screens/Home';
import WelcomeOnboarding from './screens/WelcomeOnboarding';
import Questionnaire from './screens/Questionnaire';
import Dashboard from './screens/Dashboard';
import Sessions from './screens/Sessions';
import Perspective from './screens/Perspective';
import Profile from './screens/Profile';
import ProgressDetail from './screens/ProgressDetail';
import ProtocolTutorial from './screens/ProtocolTutorial';
import SplashScreen from './screens/SplashScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomDrawerContent from './components/CustomDrawerContent';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

export const AuthenticatedUserContext = createContext({});

const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser, onboardingCompleted, setOnboardingCompleted }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          else if (route.name === 'Sessions') iconName = focused ? 'play-circle' : 'play-circle-outline';
          else if (route.name === 'Perspective') iconName = focused ? 'calendar-month' : 'calendar-month-outline';
          else if (route.name === 'Profile') iconName = focused ? 'account' : 'account-outline';
          return <MaterialCommunityIcons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: 'rgba(22, 30, 38, 0.95)',
          borderTopColor: colors.borderDark,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          position: 'absolute',
          borderTopWidth: 1,
          elevation: 0,
        },
        headerStyle: {
          backgroundColor: colors.backgroundDark,
          borderBottomColor: colors.borderDark,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          letterSpacing: 2,
        },
        headerTitleAlign: 'center',
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name='Dashboard' component={Dashboard} options={{ headerShown: false }} />
      <Tab.Screen name='Sessions' component={Sessions} />
      <Tab.Screen name='Perspective' component={Perspective} />
      <Tab.Screen name='Profile' component={Profile} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function MainDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '85%',
        },
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabs} />
      <Drawer.Screen name="Profile" component={Profile} />
    </Drawer.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Main' component={MainDrawer} />
      <Stack.Screen name='Chat' component={Chat} />
      <Stack.Screen name='ProgressDetail' component={ProgressDetail} />
    </Stack.Navigator>
  );
}

function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='OnboardingIntro' component={WelcomeOnboarding} />
      <Stack.Screen name='Questionnaire' component={Questionnaire} />
      <Stack.Screen name='ProtocolTutorial' component={ProtocolTutorial} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Login' component={Login} />
      <Stack.Screen name='Signup' component={Signup} />
      <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
      <Stack.Screen name='TermsOfUse' component={TermsOfUse} />
      <Stack.Screen name='Transparency' component={Transparency} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, setUser, onboardingCompleted, setOnboardingCompleted } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscriber
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async authenticatedUser => {
        if (authenticatedUser) {
          setUser(authenticatedUser);
          // Check onboarding status in Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', authenticatedUser.uid));
            if (userDoc.exists() && userDoc.data().onboardingCompleted) {
              setOnboardingCompleted(true);
            } else {
              setOnboardingCompleted(false);
            }
          } catch (error) {
            console.error("Error fetching user doc:", error);
          }
        } else {
          setUser(null);
          setOnboardingCompleted(false);
        }
        setIsLoading(false);
      }
    );
    // unsubscribe auth listener on unmount
    return unsubscribeAuth;
  }, []); // Remove user from dependency array to avoid infinite loop or unnecessary re-runs

  // Minimum duration for splash screen
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // Show for 3 seconds to match animations
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || showSplash) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {user ? (
        onboardingCompleted ? <ChatStack /> : <OnboardingStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthenticatedUserProvider>
      <RootNavigator />
    </AuthenticatedUserProvider>
  );
}