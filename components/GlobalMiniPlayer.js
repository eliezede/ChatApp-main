import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
    PanResponder
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePlayback } from '../context/PlaybackContext';
import colors from '../colors';

const { width, height } = Dimensions.get('window');

const GlobalMiniPlayer = () => {
    const {
        playingSession,
        isPlaying,
        togglePlay,
        playbackStatus,
        isMinimized,
        isVisible,
        minimize,
        maximize,
        close
    } = usePlayback();

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const pan = useRef(new Animated.ValueXY()).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Ignore small taps, only trigger for real movement
                return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 50 || gestureState.dx > 100 || gestureState.dx < -100) {
                    // "Launch" action -> minimize
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: Platform.OS !== 'web'
                    }).start(() => {
                        minimize();
                        pan.setValue({ x: 0, y: 0 });
                        opacity.setValue(1);
                    });
                } else {
                    // Snap back
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false
                    }).start();
                }
            }
        })
    ).current;

    useEffect(() => {
        if (isPlaying) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isPlaying]);

    if (!playingSession || !isVisible) return null;

    const getProgress = () => {
        if (playbackStatus?.durationMillis > 0) {
            return (playbackStatus.positionMillis / playbackStatus.durationMillis) * 100;
        }
        return 0;
    };

    if (isMinimized) {
        return (
            <TouchableOpacity
                style={styles.bubble}
                onPress={maximize}
                activeOpacity={0.8}
            >
                <Animated.View style={[styles.bubbleIcon, { transform: [{ scale: pulseAnim }] }]}>
                    <MaterialCommunityIcons name="waveform" size={24} color="#fff" />
                </Animated.View>
            </TouchableOpacity>
        );
    }

    return (
        <Animated.View
            style={[
                styles.miniPlayer,
                {
                    transform: [{ translateX: pan.x }, { translateY: pan.y }],
                    opacity: opacity
                }
            ]}
            {...panResponder.panHandlers}
        >
            <View style={styles.playerBarBase}>
                <View style={[styles.playerBarFill, { width: `${getProgress()}%` }]} />
            </View>
            <View style={styles.playerContent}>
                <View style={styles.playerInfo}>
                    <View style={styles.playerIconBox}>
                        <MaterialCommunityIcons name="waveform" size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.playerStatus}>TOCANDO AGORA</Text>
                        <Text style={styles.playerTitle} numberOfLines={1}>
                            {playingSession.id}. {playingSession.title}
                        </Text>
                    </View>
                </View>
                <View style={styles.playerControls}>
                    <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
                        <MaterialCommunityIcons
                            name={isPlaying ? "pause" : "play"}
                            size={24}
                            color="#000"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeBtn} onPress={close}>
                        <MaterialCommunityIcons name="close" size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    miniPlayer: {
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: Platform.select({ ios: 112, default: 88 }), // Aligned 24px above tab bar
        backgroundColor: 'rgba(28, 33, 38, 0.98)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 0,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        zIndex: 9999,
    },
    bubble: {
        position: 'absolute',
        right: 20,
        bottom: Platform.select({ ios: 112, default: 88 }),
        zIndex: 9999,
    },
    bubbleIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    playerBarBase: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.05)',
        width: '100%',
    },
    playerBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    playerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    playerIconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    playerStatus: {
        color: colors.primary,
        fontSize: 8,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    playerTitle: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    playerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        gap: 8,
    },
    playBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default GlobalMiniPlayer;
