import React, { useState, createContext, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native';
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
import PlanReady from './screens/PlanReady';
import Dashboard from './screens/Dashboard';
import Library from './screens/Library';
import Missions from './screens/Missions';
import Journal from './screens/Journal';
import Profile from './screens/Profile';
import Trajectory from './screens/Trajectory';
import About from './screens/About';
import ProgressDetail from './screens/ProgressDetail';
import CheckinHistory from './screens/CheckinHistory';
import ProtocolTutorial from './screens/ProtocolTutorial';
import SplashScreen from './screens/SplashScreen';
import TrainingSettings from './screens/TrainingSettings';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CustomDrawerContent from './components/CustomDrawerContent';
import { PlaybackProvider } from './context/PlaybackContext';
import GlobalMiniPlayer from './components/GlobalMiniPlayer';

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

const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { flex: 1 } }}>
    <Stack.Screen name="DashboardPrincipal" component={Dashboard} />
    <Stack.Screen name="DetalheProgresso" component={ProgressDetail} />
    <Stack.Screen name="CheckinHistory" component={CheckinHistory} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { flex: 1 } }}>
    <Stack.Screen name="PerfilPrincipal" component={Profile} />
    <Stack.Screen name="ConfiguracoesTreino" component={TrainingSettings} />
    <Stack.Screen name="ProgressDetail" component={ProgressDetail} />
    <Stack.Screen name="CheckinHistory" component={CheckinHistory} />
  </Stack.Navigator>
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Diario') {
            iconName = focused ? 'brain' : 'brain'; // brain doesn't have a direct -outline in many packs, check alternatives
          } else if (route.name === 'Missoes') {
            iconName = focused ? 'target' : 'target-variant';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'account-circle' : 'account-circle-outline';
          }

          return (
            <View style={{ alignItems: 'center', justifyContent: 'center', height: 48, width: 48 }}>
              <MaterialCommunityIcons
                name={iconName}
                size={26}
                color={focused ? colors.accentCyan : color}
                style={focused && {
                  textShadowColor: 'rgba(0, 242, 255, 0.5)',
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 10,
                }}
              />
            </View>
          );
        },
        tabBarActiveTintColor: colors.accentCyan,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.3)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
          marginBottom: Platform.OS === 'ios' ? 0 : 10,
        },
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          backgroundColor: 'rgba(18, 15, 11, 0.9)',
          height: Platform.OS === 'ios' ? 90 : 75,
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          paddingHorizontal: 10,
        },
      })}
    >
      <Tab.Screen
        name='Dashboard'
        component={DashboardStack}
        options={{ headerShown: false, tabBarLabel: 'Início' }}
      />
      <Tab.Screen
        name='Diario'
        component={Journal}
        options={{ headerShown: false, tabBarLabel: 'Diário' }}
      />
      <Tab.Screen
        name='Missoes'
        component={Missions}
        options={{ headerShown: false, tabBarLabel: 'Missões' }}
      />
      <Tab.Screen
        name='Perfil'
        component={ProfileStack}
        options={{ headerShown: false, tabBarLabel: 'Perfil' }}
      />
      <Tab.Screen name='Trajectory' component={Trajectory} options={{ headerShown: false, tabBarButton: () => null }} />
      <Tab.Screen name='About' component={About} options={{ headerShown: false, tabBarButton: () => null }} />
      <Tab.Screen name='Sessions' component={Library} options={{ headerShown: false, tabBarButton: () => null }} />
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
    </Drawer.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Main' component={MainDrawer} />
      <Stack.Screen name='Chat' component={Chat} />
    </Stack.Navigator>
  );
}

function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='ProtocolTutorial' component={ProtocolTutorial} />
    </Stack.Navigator>
  );
}

function UnauthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name='OnboardingIntro' component={WelcomeOnboarding} />
      <Stack.Screen name='Questionnaire' component={Questionnaire} />
      <Stack.Screen name='PlanReady' component={PlanReady} />
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
      <PlaybackProvider>
        <View style={styles.rootContainer} pointerEvents="box-none">
          {user ? (
            onboardingCompleted ? <ChatStack /> : <OnboardingStack />
          ) : (
            <UnauthStack />
          )}
          {user && onboardingCompleted && <GlobalMiniPlayer />}
        </View>
      </PlaybackProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    height: '100%',
    backgroundColor: colors.backgroundDark,
  }
});

export default function App() {
  return (
    <AuthenticatedUserProvider>
      <RootNavigator />
    </AuthenticatedUserProvider>
  );
}