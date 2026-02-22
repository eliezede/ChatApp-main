import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../colors";

export default function ForgotPassword({ navigation }) {
    const [email, setEmail] = useState("");

    const handleReset = () => {
        if (!email) {
            Alert.alert("Erro", "Por favor, insira seu email.");
            return;
        }
        Alert.alert("Sucesso", "Se o email estiver cadastrado, você receberá as instruções em breve.");
        navigation.goBack();
    };
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Decor */}
            <View style={styles.glowTop} />
            <View style={styles.glowBottom} />

            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.systemTitle}>ORIGIN SYSTEM</Text>
                    <View style={styles.spacer} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Main Body */}
                    <View style={styles.main}>
                        <View style={styles.titleGroup}>
                            <Text style={styles.title}>
                                Recuperar{"\n"}
                                <Text style={styles.primaryText}>Acesso</Text>
                            </Text>
                            <Text style={styles.description}>
                                O sistema enviará um link seguro para o email cadastrado para redefinir suas credenciais de acesso.
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Endereço de Email</Text>
                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="email-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="nome@exemplo.com"
                                        placeholderTextColor="#475569"
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleReset}
                            >
                                <View style={styles.buttonContent}>
                                    <Text style={styles.buttonText}>Enviar instruções</Text>
                                    <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Helper Link */}
                        <View style={styles.footerLink}>
                            <Text style={styles.footerText}>Lembrou suas credenciais? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                <Text style={styles.loginLink}>Fazer Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                {/* Status Indicator */}
                <View style={styles.statusFooter}>
                    <View style={styles.statusBadge}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.statusText}>SISTEMA OPERACIONAL</Text>
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
    },
    glowTop: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 250,
        height: 250,
        backgroundColor: colors.primary,
        opacity: 0.05,
        borderRadius: 125,
    },
    glowBottom: {
        position: 'absolute',
        bottom: -100,
        left: -100,
        width: 300,
        height: 300,
        backgroundColor: colors.primary,
        opacity: 0.05,
        borderRadius: 150,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    systemTitle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    spacer: {
        width: 40,
    },
    scrollContent: {
        paddingHorizontal: 24,
        flexGrow: 1,
        justifyContent: 'center',
    },
    main: {
        paddingBottom: 40,
    },
    titleGroup: {
        marginBottom: 40,
    },
    title: {
        color: '#fff',
        fontSize: 34,
        fontWeight: 'bold',
        lineHeight: 42,
        letterSpacing: -1,
        marginBottom: 12,
    },
    primaryText: {
        color: colors.primary,
    },
    description: {
        color: colors.textSecondary,
        fontSize: 15,
        lineHeight: 24,
        maxWidth: '90%',
    },
    form: {
        gap: 24,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceInput,
        height: 58,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderDark,
    },
    inputIcon: {
        paddingLeft: 20,
    },
    input: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 12,
        color: '#fff',
        fontSize: 16,
    },
    actionButton: {
        backgroundColor: colors.primary,
        height: 58,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footerLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    loginLink: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    statusFooter: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceDark,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10b981',
        marginRight: 8,
    },
    statusText: {
        color: colors.textSecondary,
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1.5,
    },
});
