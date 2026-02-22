import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '../colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TaskCard = ({ task, onToggle, onAction }) => {
    const [expanded, setExpanded] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(0)).current;

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const handlePress = () => {
        if (task.actionType && task.actionType !== 'SIMPLE') {
            onAction(task);
        } else {
            onToggle(task.id, task.isCompleted);
        }
    };

    const animateCheck = async () => {
        if (task.actionType && task.actionType !== 'SIMPLE' && !task.isCompleted) {
            onAction(task);
            return;
        }

        if (!task.isCompleted) {
            // Tactile feedback: Success
            if (Platform.OS !== 'web') {
                try {
                    if (Haptics?.notificationAsync) {
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                } catch (e) {
                    console.log('Haptics notification not available');
                }
            }

            // Visual Sequence
            Animated.parallel([
                // Background Pulse
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: false,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: false,
                    }),
                ]),
                // Checkmark Pop
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 0.7,
                        duration: 80,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.spring(scaleAnim, {
                        toValue: 1.3,
                        friction: 3,
                        tension: 100,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 100,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                ]),
            ]).start();
        } else {
            // Tactile feedback: Subtle
            if (Platform.OS !== 'web') {
                try {
                    if (Haptics?.impactAsync) {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                } catch (e) {
                    console.log('Haptics impact not available');
                }
            }
        }

        onToggle(task.id, task.isCompleted);
    };

    return (
        <View style={[styles.cardContainer, task.isCompleted && styles.cardCompleted]}>
            <Animated.View
                style={[
                    styles.pulseBackground,
                    {
                        opacity: pulseAnim,
                        transform: [{
                            scale: pulseAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.95, 1.05]
                            })
                        }]
                    }
                ]}
            />
            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={styles.checkWrapper}
                    onPress={animateCheck}
                    activeOpacity={0.7}
                >
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <MaterialCommunityIcons
                            name={task.isCompleted ? "check-circle" : "checkbox-blank-circle-outline"}
                            size={26}
                            color={task.isCompleted ? '#10b981' : '#475569'}
                        />
                    </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.contentWrapper}
                    onPress={toggleExpand}
                    activeOpacity={0.9}
                >
                    <View style={styles.textGroup}>
                        <View style={styles.titleRow}>
                            {task.isPriorityTask && (
                                <MaterialCommunityIcons name="star" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                            )}
                            <Text style={[styles.title, task.isCompleted && styles.textCompleted]}>
                                {task.title}
                            </Text>
                        </View>
                        <Text style={styles.subtitle} numberOfLines={1}>
                            {task.description}
                        </Text>
                    </View>
                    <MaterialCommunityIcons
                        name={expanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#475569"
                    />
                </TouchableOpacity>
            </View>

            {expanded && (
                <View style={styles.expandedContent}>
                    <View style={styles.divider} />
                    <View style={styles.rationaleBox}>
                        <Text style={styles.rationaleLabel}>FUNDAMENTO ESTOICO</Text>
                        <Text style={styles.rationaleText}>
                            {task.rationale || "Foque no que está sob seu controle. Esta ação fortalece sua prohairesis e constrói um caráter inabalável."}
                        </Text>
                    </View>

                    {task.actionType && task.actionType !== 'SIMPLE' && (
                        <TouchableOpacity style={styles.actionButton} onPress={() => onAction(task)}>
                            <Text style={styles.actionButtonText}>EXECUTAR FUNÇÃO</Text>
                            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: colors.surfaceDark,
        borderRadius: 20,
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
    },
    cardCompleted: {
        opacity: 0.6,
        backgroundColor: 'rgba(22, 30, 38, 0.4)',
    },
    pulseBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.primary + '22',
        borderRadius: 20,
        zIndex: -1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkWrapper: {
        marginRight: 16,
    },
    contentWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textGroup: {
        flex: 1,
        marginRight: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    subtitle: {
        color: '#64748b',
        fontSize: 13,
        marginTop: 2,
    },
    textCompleted: {
        textDecorationLine: 'line-through',
        color: '#475569',
    },
    expandedContent: {
        marginTop: 16,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: 16,
    },
    rationaleBox: {
        backgroundColor: 'rgba(23, 115, 207, 0.05)',
        padding: 12,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
    },
    rationaleLabel: {
        color: colors.primary,
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 6,
    },
    rationaleText: {
        color: '#cbd5e1',
        fontSize: 13,
        lineHeight: 18,
    },
    actionButton: {
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});

export default TaskCard;
