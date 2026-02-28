import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Image,
    Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../colors';

const { width, height } = Dimensions.get('window');

const WelcomeOnboarding = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Decorative Element (Glow Sphere) */}
            <View style={styles.glowSphere} />

            <View style={styles.content}>
                {/* Top App Bar / Logo Section */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <View style={styles.glassIcon}>
                            <MaterialCommunityIcons name="auto-fix" size={28} color={colors.primary} />
                        </View>
                        <Text style={styles.logoLabel}>ORIGIN</Text>
                    </View>
                </View>

                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleText}>Términos são</Text>
                        <Text style={styles.italicTitle}>difíceis,</Text>
                    </View>

                    <View style={styles.glassPanel}>
                        <Text style={styles.descriptionText}>
                            mas você não precisa passar por isso sozinho. Vamos ajustar a sua jornada de recuperação.
                        </Text>
                        <Text style={styles.subDescriptionText}>
                            Leva menos de 1 minuto.
                        </Text>
                    </View>
                </View>

                {/* Footer / Action Zone */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.mainButton}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Questionnaire')}
                    >
                        <Text style={styles.buttonText}>Começar</Text>
                    </TouchableOpacity>

                    <View style={styles.trustSignals}>
                        <Text style={styles.trustText}>Privacidade Garantida</Text>
                        <View style={styles.dot} />
                        <Text style={styles.trustText}>100% Gratuito</Text>
                    </View>

                    {/* Safe Area Bottom Indicator */}
                    <View style={styles.bottomBar} />
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
    glowSphere: {
        position: 'absolute',
        top: '30%',
        left: '50%',
        width: 384,
        height: 384,
        marginLeft: -192,
        marginTop: -192,
        backgroundColor: colors.primary,
        borderRadius: 192,
        opacity: 0.08,
        // blurRadius is not supported in View style, would need an Image or specialized lib
        // but for now, opacity gives a similar 'feeling'
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 32,
    },
    header: {
        paddingTop: 40,
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        gap: 8,
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
    hero: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        marginBottom: 24,
        alignItems: 'center',
    },
    titleText: {
        color: '#fff',
        fontSize: 48,
        fontWeight: '800',
        lineHeight: 52,
        textAlign: 'center',
        letterSpacing: -1,
    },
    italicTitle: {
        color: colors.primary,
        fontSize: 48,
        fontStyle: 'italic',
        fontWeight: '500',
        lineHeight: 52,
        textAlign: 'center',
    },
    glassPanel: {
        paddingVertical: 24,
        paddingHorizontal: 32,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        width: '100%',
    },
    descriptionText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 18,
        fontWeight: '300',
        lineHeight: 28,
        textAlign: 'center',
    },
    subDescriptionText: {
        marginTop: 8,
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 14,
        textAlign: 'center',
    },
    footer: {
        paddingBottom: 48,
        alignItems: 'center',
        gap: 24,
    },
    mainButton: {
        width: '100%',
        height: 64,
        backgroundColor: colors.primary,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    buttonText: {
        color: '#120f0b',
        fontSize: 18,
        fontWeight: 'bold',
    },
    trustSignals: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    trustText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    bottomBar: {
        width: 48,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        marginTop: 8,
    },
});

export default WelcomeOnboarding;
