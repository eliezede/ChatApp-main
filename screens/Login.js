import React, { useState } from "react";
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
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../colors";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onHandleLogin = () => {
    if (email !== "" && password !== "") {
      setLoading(true);
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          console.log("Login success");
        })
        .catch((err) => {
          setLoading(false);
          console.error("Login Error Details:", err.code, err.message);
          let errorMessage = "Ocorreu um erro ao entrar.";
          if (err.code === 'auth/user-not-found') errorMessage = "Usuário não encontrado. Verifique o email ou crie uma conta.";
          else if (err.code === 'auth/wrong-password') errorMessage = "Senha incorreta. Tente novamente.";
          else if (err.code === 'auth/invalid-email') errorMessage = "Email inválido.";

          Alert.alert("Erro no Login", errorMessage);
        });
    } else {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>ORIGIN</Text>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>Entrar no Sistema</Text>
            <Text style={styles.subtitle}>Bem-vindo de volta, Agente.</Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>EMAIL</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="nome@exemplo.com"
                placeholderTextColor="#475569"
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                value={email}
                onChangeText={(text) => setEmail(text)}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>SENHA</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Insira sua senha"
                placeholderTextColor="#475569"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showPassword}
                textContentType="password"
                value={password}
                onChangeText={(text) => setPassword(text)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.forgotPass}
          >
            <Text style={styles.forgotPassText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={onHandleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>ENTRAR</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => navigation.navigate("Signup")}
            >
              <Text style={styles.signupButtonText}>CRIAR CONTA</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Social Section */}
        <View style={styles.socialSection}>
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OU CONTINUAR COM</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => Alert.alert("Aviso", "Google Sign In temporariamente desativado.")}>
              <MaterialCommunityIcons name="google" size={20} color="#fff" />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => Alert.alert("Aviso", "Apple Sign In temporariamente desativado.")}>
              <MaterialCommunityIcons name="apple" size={20} color="#fff" />
              <Text style={styles.socialBtnText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    paddingTop: 40,
    paddingBottom: 40,
  },
  brandTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 4,
    marginBottom: 32,
    textAlign: "center",
    opacity: 0.8,
  },
  titleGroup: {
    width: "100%",
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 8,
    paddingLeft: 4,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceDark,
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    color: "#fff",
    fontSize: 16,
  },
  eyeIcon: {
    paddingRight: 16,
  },
  forgotPass: {
    alignItems: "flex-end",
    marginTop: 4,
    marginBottom: 24,
  },
  forgotPassText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  buttonGroup: {
    gap: 12,
  },
  loginButton: {
    backgroundColor: colors.primary,
    height: 58,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  signupButton: {
    height: 58,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#475569",
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },
  socialSection: {
    marginTop: 40,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#1e293b",
  },
  dividerText: {
    color: "#475569",
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 16,
    letterSpacing: 1,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  socialBtn: {
    flex: 1,
    maxWidth: 140,
    height: 52,
    backgroundColor: colors.surfaceDark,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  socialBtnText: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "500",
  },
});
