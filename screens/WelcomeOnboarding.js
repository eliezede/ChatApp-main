import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../colors';

const { width } = Dimensions.get('window');

const WelcomeOnboarding = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background Decor */}
            <View style={styles.bgGlow} />

            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.wordmark}>ORIGIN</Text>
                    <View style={styles.headerLine} />
                </View>

                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="weight-lifter" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.textGroup}>
                        <Text style={styles.heroTextLight}>
                            Você não está <Text style={styles.strikethroughText}>quebrado</Text>.
                        </Text>
                        <Text style={styles.heroTextBold}>
                            Está em <Text style={styles.primaryText}>reconstrução</Text>.
                        </Text>
                    </View>
                    <Text style={styles.description}>
                        O estoicismo não é sobre suprimir emoções, mas sobre direcioná-las com propósito.
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.progressIndicators}>
                        <View style={[styles.dot, styles.activeDot]} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Questionnaire')}
                    >
                        <View style={styles.buttonContent}>
                            <Text style={styles.buttonText}>INICIAR JORNADA</Text>
                            <MaterialCommunityIcons name="arrow-right" size={18} color={colors.primary} />
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.versionText}>V1.0.4 • SYSTEM ACTIVE</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundOLED,
    },
    bgGlow: {
        position: 'absolute',
        bottom: -100,
        width: width,
        height: width,
        borderRadius: width / 2,
        backgroundColor: colors.primary,
        opacity: 0.1,
        // Linear gradient simulation isn't perfect without a lib, but this gives the 'glow' effect
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        opacity: 0.6,
    },
    wordmark: {
        color: '#888',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 4,
        marginBottom: 4,
    },
    headerLine: {
        height: 1,
        width: 24,
        backgroundColor: colors.primary,
        opacity: 0.4,
    },
    hero: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#1e293b',
        backgroundColor: 'rgba(15, 18, 22, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
    },
    textGroup: {
        marginBottom: 24,
        alignItems: 'center',
    },
    heroTextLight: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 32,
        fontWeight: '300',
        textAlign: 'center',
        lineHeight: 40,
    },
    strikethroughText: {
        color: '#64748b',
        textDecorationLine: 'line-through',
    },
    heroTextBold: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 40,
    },
    primaryText: {
        color: colors.primary,
    },
    description: {
        color: '#94a3b8',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 240,
        opacity: 0.8,
    },
    footer: {
        alignItems: 'center',
        width: '100%',
    },
    progressIndicators: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#1e293b',
    },
    activeDot: {
        backgroundColor: '#fff',
    },
    button: {
        width: '100%',
        height: 58,
        backgroundColor: '#0f1216',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    versionText: {
        color: '#475569',
        fontSize: 10,
        letterSpacing: 2,
        fontWeight: '500',
    },
});

export default WelcomeOnboarding;
