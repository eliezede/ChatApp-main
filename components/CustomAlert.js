import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    TouchableWithoutFeedback,
    Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../colors';

const CustomAlert = ({
    visible,
    title,
    message,
    icon = "alert-circle-outline",
    iconColor = colors.primary,
    buttons = [],
    onClose
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: Platform.OS !== 'web',
                })
            ]).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: Platform.OS !== 'web',
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                    <TouchableWithoutFeedback>
                        <Animated.View style={[styles.alertBox, { transform: [{ scale: scaleAnim }] }]}>

                            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                                <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
                            </View>

                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.message}>{message}</Text>

                            <View style={styles.buttonContainer}>
                                {buttons.map((btn, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.button,
                                            btn.style === 'cancel' && styles.buttonCancel,
                                            btn.style === 'destructive' && styles.buttonDestructive,
                                            btn.style === 'default' && styles.buttonDefault,
                                        ]}
                                        onPress={() => {
                                            if (btn.onPress) btn.onPress();
                                            onClose();
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[
                                            styles.buttonText,
                                            btn.style === 'cancel' && styles.buttonTextCancel,
                                            btn.style === 'destructive' && styles.buttonTextDestructive,
                                            btn.style === 'default' && styles.buttonTextDefault,
                                        ]}>
                                            {btn.text}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    alertBox: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: colors.surfaceDark,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    message: {
        color: '#94a3b8',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        width: '100%',
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    buttonDefault: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    buttonCancel: {
        backgroundColor: 'transparent',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    buttonDestructive: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    buttonTextDefault: {
        color: '#0f1318',
    },
    buttonTextCancel: {
        color: '#94a3b8',
    },
    buttonTextDestructive: {
        color: '#ef4444',
    }
});

export default CustomAlert;
