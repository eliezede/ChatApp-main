import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import colors from '../colors';
import { calculateProfile } from '../logic/ScoringEngine';
import { generateDailyPlan } from '../logic/PlanEngine';

export default function Signup({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onHandleSignup = () => {
    if (email === '' || password === '' || confirmPassword === '') {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    setLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        const answers = route.params?.questionnaireAnswers;
        let profile = null;

        if (answers) {
          profile = calculateProfile(answers);
        }

        // Create user document in Firestore
        const userData = {
          email: user.email,
          onboardingCompleted: false, // will activate ProtocolTutorial next
          createdAt: serverTimestamp()
        };

        if (profile) {
          userData.profile = profile;
          userData.lastPlanGeneration = serverTimestamp();
        }

        await setDoc(doc(db, 'users', user.uid), userData);
        console.log('Signup success and user doc created');

        if (profile) {
          await generateDailyPlan(user.uid, profile);
        }
      })
      .catch((err) => {
        setLoading(false);
        if (err.code === 'auth/email-already-in-use') {
          Alert.alert(
            "Conta Existente",
            "Este e-mail já está cadastrado em nosso sistema. Deseja fazer o login?",
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Fazer Login",
                onPress: () => navigation.navigate("Login", { prefilledEmail: email })
              }
            ]
          );
        } else {
          Alert.alert("Erro no Cadastro", err.message);
        }
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.glassIcon}>
              <Image
                source={require('../assets/icon.png')}
                style={{ width: 32, height: 32, borderRadius: 8 }}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.logoLabel}>ORIGIN</Text>
          </View>
          <Text style={styles.title}>Junte-se ao ORIGIN</Text>
          <Text style={styles.subtitle}>Inicie sua jornada de reconstrução.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#555"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#555"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
              textContentType="password"
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#555"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
              textContentType="password"
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={onHandleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>CRIAR CONTA</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundOLED,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  glassIcon: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLabel: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#0f1216",
    height: 58,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  button: {
    backgroundColor: colors.primary,
    height: 58,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 16,
    letterSpacing: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: {
    color: "#888",
    fontSize: 14,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});