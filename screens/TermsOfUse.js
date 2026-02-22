import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../colors";

export default function TermsOfUse({ navigation }) {
    const [agreed, setAgreed] = React.useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>TERMOS DE USO</Text>
                <View style={styles.spacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.main}>
                    {/* Version Info */}
                    <View style={styles.versionInfo}>
                        <Text style={styles.protocolText}>PROTOCOLO DE SISTEMA V.2.4</Text>
                        <Text style={styles.updateText}>Última atualização: 24 Out 2023</Text>
                    </View>

                    {/* Section 1 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>1. Introdução ao Sistema</Text>
                        <Text style={styles.sectionText}>
                            Bem-vindo ao protocolo ORIGIN. Ao acessar este sistema de reconstrução de alta fidelidade, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis, e reconhece que é responsável pelo cumprimento de todas as leis locais.
                        </Text>
                    </View>

                    {/* Medical Disclaimer */}
                    <View style={styles.disclaimerCard}>
                        <View style={styles.disclaimerAccent} />
                        <View style={styles.disclaimerContent}>
                            <MaterialCommunityIcons name="medical-bag" size={24} color={colors.primary} />
                            <View style={styles.disclaimerTextGroup}>
                                <Text style={styles.disclaimerTitle}>AVISO IMPORTANTE</Text>
                                <Text style={styles.disclaimerText}>
                                    O sistema ORIGIN é uma ferramenta de autoaperfeiçoamento e <Text style={styles.boldText}>não substitui</Text> acompanhamento psicológico ou psiquiátrico profissional. Em caso de emergência, procure ajuda especializada.
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Section 2 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>2. Privacidade e Dados</Text>
                        <View style={styles.textGroup}>
                            <Text style={styles.sectionText}>
                                Seus dados biométricos e psicométricos são processados com criptografia de ponta a ponta. A integridade dos seus dados é fundamental para a precisão do protocolo ORIGIN.
                            </Text>
                            <Text style={styles.sectionText}>
                                Não compartilhamos suas informações pessoais com terceiros sem seu consentimento explícito, exceto quando exigido por lei.
                            </Text>
                        </View>
                    </View>

                    {/* Section 3 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>3. Responsabilidades</Text>
                        <Text style={styles.sectionText}>
                            O usuário se compromete a utilizar as ferramentas fornecidas de maneira ética e construtiva. Uso indevido resultará no bloqueio imediato do acesso.
                        </Text>
                        <View style={styles.list}>
                            {[
                                'Manter a confidencialidade das credenciais.',
                                'Fornecer informações precisas na calibragem.',
                                'Relatar falhas ou bugs imediatamente.'
                            ].map((item, i) => (
                                <View key={i} style={styles.listItem}>
                                    <View style={styles.listDot} />
                                    <Text style={styles.itemText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Section 4 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>4. Propriedade Intelectual</Text>
                        <Text style={styles.sectionText}>
                            Todo o conteúdo, design, algoritmos e metodologias presentes no ORIGIN são propriedade exclusiva da ORIGIN Systems.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => setAgreed(!agreed)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                        {agreed && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
                    </View>
                    <Text style={styles.checkboxLabel}>
                        Li e concordo com os Termos de Uso e Política de Privacidade.
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, !agreed && styles.buttonDisabled]}
                    disabled={!agreed}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.buttonText}>Aceitar e Continuar</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
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
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    spacer: {
        width: 44,
    },
    scrollContent: {
        paddingBottom: 160,
    },
    main: {
        padding: 20,
    },
    versionInfo: {
        alignItems: 'center',
        marginBottom: 32,
    },
    protocolText: {
        color: colors.textSecondary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    updateText: {
        color: '#64748b',
        fontSize: 13,
        marginTop: 4,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    sectionText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        lineHeight: 22,
    },
    textGroup: {
        gap: 16,
    },
    disclaimerCard: {
        backgroundColor: 'rgba(23, 115, 207, 0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(23, 115, 207, 0.2)',
        flexDirection: 'row',
        overflow: 'hidden',
        marginBottom: 32,
    },
    disclaimerAccent: {
        width: 4,
        backgroundColor: colors.primary,
    },
    disclaimerContent: {
        flex: 1,
        padding: 20,
        flexDirection: 'row',
        gap: 16,
    },
    disclaimerTextGroup: {
        flex: 1,
        gap: 8,
    },
    disclaimerTitle: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    disclaimerText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        lineHeight: 20,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#fff',
    },
    list: {
        marginTop: 16,
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    listDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
    },
    itemText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
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
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#475569',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkboxLabel: {
        flex: 1,
        color: colors.textSecondary,
        fontSize: 12,
        lineHeight: 18,
    },
    button: {
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
});
