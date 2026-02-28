import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Linking,
    StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import colors from '../colors';

const About = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <AppHeader
                variant="nav"
                title="Sobre o ORIGIN"
            />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.logoSection}>
                    <View style={styles.logoCircle}>
                        <View style={styles.logoInnerCircle} />
                        <View style={styles.logoRotateLine} />
                        <View style={styles.logoDot} />
                    </View>
                    <Text style={styles.appName}>ORIGIN System</Text>
                    <Text style={styles.versionText}>v1.2.0 (Build 450)</Text>
                </View>

                <View style={styles.linksSection}>
                    <TouchableOpacity style={styles.linkItem} onPress={() => { }}>
                        <MaterialCommunityIcons name="file-document-outline" size={22} color={colors.textSecondary} />
                        <Text style={styles.linkText}>Termos de Uso</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#334155" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkItem} onPress={() => { }}>
                        <MaterialCommunityIcons name="shield-check-outline" size={22} color={colors.textSecondary} />
                        <Text style={styles.linkText}>Política de Privacidade</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#334155" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.linkItem} onPress={() => { }}>
                        <MaterialCommunityIcons name="license" size={22} color={colors.textSecondary} />
                        <Text style={styles.linkText}>Licenças de Software</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#334155" />
                    </TouchableOpacity>
                </View>

                <View style={styles.supportSection}>
                    <Text style={styles.sectionLabel}>SUPORTE</Text>
                    <TouchableOpacity style={styles.supportButton} onPress={() => Linking.openURL('mailto:suporte@origin.com')}>
                        <MaterialCommunityIcons name="email-outline" size={20} color={colors.primary} />
                        <Text style={styles.supportEmail}>suporte@origin.com</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.deleteAccount} onPress={() => { }}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" />
                    <Text style={styles.deleteText}>Deletar minha conta</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>ORIGIN</Text>
                    <Text style={styles.copyright}>© 2026 Proto-G All Rights Reserved</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundDark,
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    logoSection: {
        alignItems: 'center',
        marginVertical: 40,
    },
    logoCircle: {
        width: 120,
        height: 120,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoInnerCircle: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    logoRotateLine: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderTopWidth: 2,
        borderColor: colors.primary,
        transform: [{ rotate: '45deg' }],
        opacity: 0.8,
    },
    logoDot: {
        width: 10,
        height: 10,
        backgroundColor: '#ffffff',
        borderRadius: 5,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10,
    },
    appName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 2,
    },
    versionText: {
        color: '#64748b',
        fontSize: 14,
        marginTop: 6,
    },
    linksSection: {
        width: '100%',
        backgroundColor: 'rgba(28, 37, 48, 0.4)',
        borderRadius: 20,
        padding: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 40,
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    linkText: {
        flex: 1,
        color: '#cbd5e1',
        fontSize: 15,
        fontWeight: '500',
    },
    supportSection: {
        alignItems: 'center',
        width: '100%',
        marginBottom: 60,
    },
    sectionLabel: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 16,
    },
    supportButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    supportEmail: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    deleteAccount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 40,
        opacity: 0.7,
    },
    deleteText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        alignItems: 'center',
        opacity: 0.3,
    },
    footerText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 8,
        marginBottom: 8,
    },
    copyright: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    }
});

export default About;
