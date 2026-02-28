import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Switch,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../colors";

export default function Transparency({ navigation }) {
    const [marketingAgreed, setMarketingAgreed] = React.useState(false);

    const InfoBlock = ({ icon, title, desc }) => (
        <View style={styles.infoBlock}>
            <View style={styles.blockIcon}>
                <MaterialCommunityIcons name={icon} size={24} color={colors.textSecondary} />
            </View>
            <View style={styles.blockText}>
                <Text style={styles.blockTitle}>{title}</Text>
                <Text style={styles.blockDesc}>{desc}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transparência</Text>
                <View style={styles.spacer} />
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroSection}>
                    <View style={styles.heroIcon}>
                        <MaterialCommunityIcons name="shield-lock-outline" size={32} color={colors.primary} />
                    </View>
                    <Text style={styles.heroTitle}>Sua privacidade é fundamental</Text>
                    <Text style={styles.heroDesc}>
                        A experiência ORIGIN é construída sobre confiança. Veja exatamente como protegemos e utilizamos seus dados para personalizar sua jornada.
                    </Text>
                </View>

                <View style={styles.blocksContainer}>
                    <View style={styles.infoBlock}>
                        <View style={styles.blockIcon}>
                            <MaterialCommunityIcons name="database-outline" size={24} color={colors.textSecondary} />
                        </View>
                        <View style={styles.blockContent}>
                            <Text style={styles.blockTitle}>Coleta de Dados Essenciais</Text>
                            <Text style={styles.blockDesc}>
                                Coletamos apenas o essencial para reconstruir seu perfil e refinar o algoritmo de acordo com seu uso.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoBlock}>
                        <View style={styles.blockIcon}>
                            <MaterialCommunityIcons name="lock-outline" size={24} color={colors.textSecondary} />
                        </View>
                        <View style={styles.blockContent}>
                            <Text style={styles.blockTitle}>Segurança Criptografada</Text>
                            <Text style={styles.blockDesc}>
                                Seus dados são criptografados de ponta a ponta. Ninguém além de você tem acesso às suas informações sensíveis.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoBlock}>
                        <View style={styles.blockIcon}>
                            <MaterialCommunityIcons name="tune" size={24} color={colors.textSecondary} />
                        </View>
                        <View style={styles.blockContent}>
                            <Text style={styles.blockTitle}>Controle Total</Text>
                            <Text style={styles.blockDesc}>
                                Você está no comando. Exclua ou exporte seus dados a qualquer momento diretamente nas configurações do aplicativo.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Marketing Toggle */}
                <View style={styles.toggleSection}>
                    <View style={styles.toggleContent}>
                        <Text style={styles.toggleTitle}>Permitir comunicações personalizadas</Text>
                        <Text style={styles.toggleDesc}>Receba insights baseados no seu progresso. (Opcional)</Text>
                    </View>
                    <Switch
                        value={marketingAgreed}
                        onValueChange={setMarketingAgreed}
                        trackColor={{ false: '#334155', true: colors.primary }}
                        thumbColor="#fff"
                    />
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.primaryButtonText}>Aceitar e Continuar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Ver Política de Privacidade Completa</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundDark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderDark,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    spacer: {
        width: 44,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 140,
    },
    heroSection: {
        paddingVertical: 24,
    },
    heroIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(23, 115, 207, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    heroTitle: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        lineHeight: 34,
        marginBottom: 12,
    },
    heroDesc: {
        color: colors.textSecondary,
        fontSize: 16,
        lineHeight: 24,
    },
    blocksContainer: {
        marginTop: 32,
        gap: 32,
    },
    infoBlock: {
        flexDirection: 'row',
        gap: 16,
    },
    blockIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.surfaceDark,
        borderWidth: 1,
        borderColor: colors.borderDark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blockContent: {
        flex: 1,
        gap: 4,
    },
    blockTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    blockDesc: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
    toggleSection: {
        marginTop: 40,
        paddingTop: 32,
        borderTopWidth: 1,
        borderTopColor: colors.borderDark,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggleContent: {
        flex: 1,
        paddingRight: 16,
    },
    toggleTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    toggleDesc: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 20,
        paddingBottom: 40,
        backgroundColor: colors.backgroundDark,
        borderTopWidth: 1,
        borderTopColor: colors.borderDark,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    secondaryButtonText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '500',
    },
});
