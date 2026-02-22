import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    StatusBar,
    Dimensions,
    Platform,
} from 'react-native';
import colors from '../colors';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(10)).current;
    const delayFadeAnim = useRef(new Animated.Value(0)).current;
    const versionFadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            // First animation: Logo and Title
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ]),
            // Second animation: Subtitle
            Animated.timing(delayFadeAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: Platform.OS !== 'web',
            }),
            // Third animation: Version
            Animated.timing(versionFadeAnim, {
                toValue: 0.1,
                duration: 1000,
                useNativeDriver: Platform.OS !== 'web',
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#050505" />

            {/* Subtle background glow */}
            <View style={styles.glow} />

            <View style={styles.content}>
                {/* Logo Section */}
                <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.logoCircle}>
                        <View style={styles.logoInnerCircle} />
                        <View style={styles.logoRotateLine} />
                        <View style={styles.logoDot} />
                    </View>
                    <Text style={styles.title}>ORIGIN</Text>
                </Animated.View>

                {/* Subtitle Section */}
                <Animated.View style={[styles.subtitleContainer, { opacity: delayFadeAnim }]}>
                    <Text style={styles.subtitle}>
                        DISCIPLINA <Text style={styles.bullet}>•</Text> CLAREZA <Text style={styles.bullet}>•</Text> RECONSTRUÇÃO
                    </Text>
                </Animated.View>
            </View>

            {/* Version Indicator */}
            <Animated.View style={[styles.footer, { opacity: versionFadeAnim }]}>
                <Text style={styles.versionText}>V 1.0</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505',
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
        width: 256,
        height: 256,
        backgroundColor: colors.primary,
        opacity: 0.05,
        borderRadius: 128,
        // Note: Blur is tricky in RN without external libs, 
        // we use low opacity and size instead.
    },
    content: {
        alignItems: 'center',
        gap: 32,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoCircle: {
        width: 96,
        height: 96,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoInnerCircle: {
        position: 'absolute',
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    logoRotateLine: {
        position: 'absolute',
        width: 96,
        height: 96,
        borderRadius: 48,
        borderTopWidth: 2,
        borderColor: '#ffffff',
        transform: [{ rotate: '45deg' }],
    },
    logoDot: {
        width: 8,
        height: 8,
        backgroundColor: '#ffffff',
        borderRadius: 4,
        shadowColor: '#ffffff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    title: {
        color: '#ffffff',
        fontSize: 40,
        fontWeight: '900',
        letterSpacing: 8,
        textAlign: 'center',
    },
    subtitleContainer: {
        marginTop: 32,
    },
    subtitle: {
        color: '#555555',
        fontSize: 12,
        fontWeight: '300',
        letterSpacing: 2,
        textAlign: 'center',
    },
    bullet: {
        color: '#333333',
        marginHorizontal: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        alignItems: 'center',
    },
    versionText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '200',
        letterSpacing: 4,
        fontFamily: 'monospace',
    },
});

export default SplashScreen;
