import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Animated,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import colors from '../colors';

const { width } = Dimensions.get('window');

// Data
const SESSIONS_DATA = [
    {
        id: '01',
        phase: 'Estabilização',
        title: 'O Fundamento',
        subtitle: 'Introdução aos princípios básicos.',
        duration: '12:00',
        status: 'completed',
        audioPath: '1 - O que realmente doi.mp3', // gs://origin-690af.firebasestorage.app/1 - O que realmente doi.mp3
    },
    {
        id: '02',
        phase: 'Estabilização',
        title: 'Controle Interno',
        subtitle: 'Focar apenas no que está sob seu poder.',
        duration: '15:20',
        status: 'recommended',
        audioPath: '1 - O que realmente doi.mp3',
    },
    {
        id: '03',
        phase: 'Estabilização',
        title: 'A Voz da Razão',
        subtitle: 'Distinga fatos de julgamentos.',
        duration: '10:45',
        status: 'locked_open',
    },
    {
        id: '04',
        phase: 'Estrutura',
        title: 'Dicotomia do Controle',
        subtitle: 'Avançado: Aplicação prática.',
        duration: '22:15',
        status: 'locked',
    },
    {
        id: '05',
        phase: 'Expansão',
        title: 'Visualização Negativa',
        subtitle: 'Preparo para adversidades futuras.',
        duration: '18:30',
        status: 'locked',
    },
];

const CATEGORIES = ['Todas', 'Estabilização', 'Estrutura', 'Expansão'];

const Sessions = () => {
    const [selectedCategory, setSelectedCategory] = useState('Estabilização');
    const [playingSession, setPlayingSession] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);
    const [loading, setLoading] = useState(false);
    const [playbackStatus, setPlaybackStatus] = useState(null);

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isPlaying) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isPlaying]);

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    const handlePlaySession = async (session) => {
        if (!session.audioPath) return;

        if (playingSession?.id === session.id) {
            if (isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
            } else {
                await sound.playAsync();
                setIsPlaying(true);
            }
            return;
        }

        // New session
        setLoading(true);
        try {
            if (sound) {
                await sound.unloadAsync();
            }

            const audioRef = ref(storage, session.audioPath);
            const url = await getDownloadURL(audioRef);

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );

            setSound(newSound);
            setPlayingSession(session);
            setIsPlaying(true);
        } catch (error) {
            console.error('Error playing audio:', error);
            alert('Erro ao carregar áudio. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    const onPlaybackStatusUpdate = (status) => {
        setPlaybackStatus(status);
        if (status.didJustFinish) {
            setIsPlaying(false);
        }
    };

    const handleTogglePlay = async () => {
        if (!sound) return;
        if (isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
        } else {
            await sound.playAsync();
            setIsPlaying(true);
        }
    };

    const getProgress = () => {
        if (playbackStatus?.durationMillis > 0) {
            return (playbackStatus.positionMillis / playbackStatus.durationMillis) * 100;
        }
        return 0;
    };

    const filteredSessions = SESSIONS_DATA.filter(s =>
        selectedCategory === 'Todas' || s.phase === selectedCategory
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerIcon}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#64748b" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerSubtitle}>BIBLIOTECA</Text>
                    <Text style={styles.headerTitle}>Sessões</Text>
                </View>
                <TouchableOpacity style={styles.headerIcon}>
                    <MaterialCommunityIcons name="filter-variant" size={24} color="#64748b" />
                </TouchableOpacity>
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            style={[
                                styles.categoryChip,
                                selectedCategory === cat && styles.categoryChipActive
                            ]}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === cat && styles.categoryTextActive
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero Card */}
                <View style={styles.heroCard}>
                    <View style={styles.heroGradient} />
                    <View style={styles.heroContent}>
                        <View style={styles.heroHeader}>
                            <View style={styles.faseBadge}>
                                <View style={styles.faseDot} />
                                <Text style={styles.faseBadgeText}>FASE ATUAL</Text>
                            </View>
                            <Text style={styles.cicloText}>Ciclo 1 de 3</Text>
                        </View>
                        <View style={styles.heroMeta}>
                            <Text style={styles.heroTitle}>Estabilização</Text>
                            <Text style={styles.heroDesc}>
                                Reconstrua sua fundação mental. O caos externo não deve perturbar sua ordem interna.
                            </Text>
                        </View>
                        <View style={styles.heroProgress}>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: '33%' }]} />
                            </View>
                            <Text style={styles.progressText}>33%</Text>
                        </View>
                    </View>
                </View>

                {/* Section Title */}
                <View style={styles.sectionDivider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.sectionLabel}>SESSÕES RECOMENDADAS</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Session List */}
                <View style={styles.listContainer}>
                    {filteredSessions.map((session) => (
                        <TouchableOpacity
                            key={session.id}
                            style={[
                                styles.sessionItem,
                                session.status === 'recommended' && styles.sessionItemRecommended,
                                session.status === 'locked' && styles.sessionItemLocked
                            ]}
                            onPress={() => session.status !== 'locked' && handlePlaySession(session)}
                        >
                            {session.status === 'recommended' && (
                                <View style={styles.recommendedBadge}>
                                    <Text style={styles.recommendedBadgeText}>RECOMENDADO PARA SUA FASE</Text>
                                </View>
                            )}

                            <View style={styles.sessionMain}>
                                <View style={[
                                    styles.sessionIconBox,
                                    session.status === 'recommended' && styles.sessionIconBoxRecommended,
                                    session.status === 'completed' && styles.sessionIconBoxCompleted,
                                ]}>
                                    {loading && playingSession?.id === session.id ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <MaterialCommunityIcons
                                            name={
                                                session.status === 'completed' ? 'check' :
                                                    session.status === 'locked' ? 'lock' :
                                                        'play'
                                            }
                                            size={session.status === 'completed' ? 20 : 24}
                                            color={
                                                session.status === 'completed' ? '#22c55e' :
                                                    session.status === 'locked' ? '#475569' :
                                                        '#fff'
                                            }
                                        />
                                    )}
                                    {isPlaying && playingSession?.id === session.id && (
                                        <Animated.View style={[styles.playingPulse, { transform: [{ scale: pulseAnim }] }]} />
                                    )}
                                </View>

                                <View style={styles.sessionInfo}>
                                    <View style={styles.sessionMetaRow}>
                                        <View style={styles.numberBadge}>
                                            <Text style={styles.numberText}>{session.id}</Text>
                                        </View>
                                        <Text style={styles.sessionPhase}>{session.phase.toUpperCase()}</Text>
                                    </View>
                                    <Text style={styles.sessionTitle}>{session.title}</Text>
                                    <Text style={styles.sessionSubtitle}>{session.subtitle}</Text>
                                </View>

                                <View style={styles.sessionRight}>
                                    <Text style={styles.durationText}>{session.duration}</Text>
                                    {playingSession?.id === session.id && isPlaying && (
                                        <View style={styles.waveContainer}>
                                            <View style={[styles.waveBar, { height: 6 }]} />
                                            <View style={[styles.waveBar, { height: 12 }]} />
                                            <View style={[styles.waveBar, { height: 8 }]} />
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 160 }} />
            </ScrollView>

            {/* Mini Player */}
            {playingSession && (
                <View style={[styles.miniPlayer, { bottom: 85 }]}>
                    <View style={styles.playerBarBase}>
                        <View style={[styles.playerBarFill, { width: `${getProgress()}%` }]} />
                    </View>
                    <View style={styles.playerContent}>
                        <View style={styles.playerInfo}>
                            <View style={styles.playerIconBox}>
                                <MaterialCommunityIcons name="graphic-eq" size={20} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.playerStatus}>TOCANDO AGORA</Text>
                                <Text style={styles.playerTitle} numberOfLines={1}>
                                    {playingSession.id}. {playingSession.title}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.playerControls}>
                            <TouchableOpacity>
                                <MaterialCommunityIcons name="skip-previous" size={28} color="#94a3b8" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.playBtn} onPress={handleTogglePlay}>
                                <MaterialCommunityIcons
                                    name={isPlaying ? "pause" : "play"}
                                    size={24}
                                    color="#000"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <MaterialCommunityIcons name="skip-next" size={28} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundDark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerSubtitle: {
        color: '#cd7f32',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    categoriesContainer: {
        paddingVertical: 12,
    },
    categoriesScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    categoryChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryText: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: '500',
    },
    categoryTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    scrollContent: {
        flex: 1,
        paddingHorizontal: 16,
    },
    heroCard: {
        backgroundColor: '#1c2126',
        borderRadius: 20,
        padding: 24,
        marginTop: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    heroGradient: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(23, 115, 207, 0.1)',
        opacity: 0.5,
    },
    heroContent: {
        zIndex: 1,
    },
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    faseBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(23, 115, 207, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(23, 115, 207, 0.2)',
    },
    faseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
        marginRight: 6,
    },
    faseBadgeText: {
        color: colors.primary,
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    cicloText: {
        color: '#475569',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    heroMeta: {
        marginBottom: 20,
    },
    heroTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    heroDesc: {
        color: '#94a3b8',
        fontSize: 12,
        lineHeight: 18,
    },
    heroProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBarBg: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 2,
    },
    progressText: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 'bold',
    },
    sectionDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    sectionLabel: {
        color: '#475569',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    listContainer: {
        gap: 12,
    },
    sessionItem: {
        backgroundColor: '#1c2126',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    sessionItemRecommended: {
        borderColor: 'rgba(23, 115, 207, 0.4)',
        backgroundColor: '#1c2126',
    },
    sessionItemLocked: {
        opacity: 0.5,
    },
    recommendedBadge: {
        position: 'absolute',
        top: -10,
        right: 16,
        backgroundColor: '#cd7f32',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 2,
    },
    recommendedBadgeText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    sessionMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    sessionIconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    sessionIconBoxRecommended: {
        backgroundColor: colors.primary,
    },
    sessionIconBoxCompleted: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.2)',
    },
    playingPulse: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: 'rgba(23, 115, 207, 0.3)',
        borderRadius: 24,
    },
    sessionInfo: {
        flex: 1,
    },
    sessionMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    numberBadge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    numberText: {
        color: '#64748b',
        fontSize: 9,
        fontWeight: 'bold',
    },
    sessionPhase: {
        color: colors.primary,
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    sessionTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    sessionSubtitle: {
        color: '#64748b',
        fontSize: 10,
        marginTop: 2,
    },
    sessionRight: {
        alignItems: 'flex-end',
    },
    durationText: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: '500',
    },
    waveContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
        marginTop: 4,
    },
    waveBar: {
        width: 2,
        backgroundColor: colors.primary,
        borderRadius: 1,
    },
    miniPlayer: {
        position: 'absolute',
        left: 16,
        right: 16,
        backgroundColor: 'rgba(28, 33, 38, 0.95)',
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
        gap: 12,
    },
    playBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default Sessions;
