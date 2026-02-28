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
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePlayback } from '../context/PlaybackContext';
import AppHeader from '../components/AppHeader';
import colors from '../colors';

const { width } = Dimensions.get('window');

// Data
const SESSIONS_DATA = [
    {
        id: '01',
        type: 'audio',
        phase: 'Estabilização',
        title: '1. O que realmente dói',
        subtitle: 'Uma análise sobre como a dor do término não vem apenas da ausência física, mas da quebra de expectativas e da ferida no senso de identidade.',
        duration: '12:00',
        status: 'recommended',
        audioPath: 'audios/1 - O que realmente doi.mp3',
    }
];

const READINGS_DATA = [
    {
        id: 'r01',
        type: 'text',
        phase: 'Estabilização',
        title: 'Meditações - Livro II',
        subtitle: 'Marco Aurélio sobre a transitoriedade e o foco no presente.',
        duration: '5 min leitura',
        status: 'available',
    },
    {
        id: 'r02',
        type: 'text',
        phase: 'Estrutura',
        title: 'Sobre a Brevidade da Vida',
        subtitle: 'Sêneca ensina como o tempo é mal gasto por quem não tem propósito.',
        duration: '8 min leitura',
        status: 'locked',
    }
];

const CATEGORIES = ['Todas', 'Estabilização', 'Estrutura', 'Expansão'];
const CONTENT_TYPES = [
    { id: 'audio', label: 'ÁUDIOS', icon: 'headphones' },
    { id: 'text', label: 'LEITURAS', icon: 'book-open-variant' }
];

const Library = () => {
    const [selectedCategory, setSelectedCategory] = useState('Estabilização');
    const [contentType, setContentType] = useState('audio'); // audio | text
    const {
        playingSession,
        isPlaying,
        loading,
        playSession
    } = usePlayback();

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;

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

    const handlePlaySession = async (session) => {
        try {
            await playSession(session);
        } catch (error) {
            alert('Erro ao carregar áudio. Verifique sua conexão.');
        }
    };

    const currentData = contentType === 'audio' ? SESSIONS_DATA : READINGS_DATA;
    const filteredContent = currentData.filter(s =>
        selectedCategory === 'Todas' || s.phase === selectedCategory
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <AppHeader
                variant="brand"
            />

            {/* Content Type Tabs */}
            <View style={styles.contentTypeWrapper}>
                {CONTENT_TYPES.map(type => (
                    <TouchableOpacity
                        key={type.id}
                        onPress={() => setContentType(type.id)}
                        style={[
                            styles.typeTab,
                            contentType === type.id && styles.typeTabActive
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={type.icon}
                            size={18}
                            color={contentType === type.id ? colors.primary : '#64748b'}
                        />
                        <Text style={[
                            styles.typeTabText,
                            contentType === type.id && styles.typeTabTextActive
                        ]}>
                            {type.label}
                        </Text>
                    </TouchableOpacity>
                ))}
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
                {/* Hero Card context dependent */}
                <View style={styles.heroCard}>
                    <View style={styles.heroGradient} />
                    <View style={styles.heroContent}>
                        <View style={styles.heroHeader}>
                            <View style={styles.faseBadge}>
                                <View style={styles.faseDot} />
                                <Text style={styles.faseBadgeText}>BIBLIOTECA</Text>
                            </View>
                            <Text style={styles.cicloText}>{contentType === 'audio' ? 'Refúgio de Voz' : 'Asilo de Letras'}</Text>
                        </View>
                        <View style={styles.heroMeta}>
                            <Text style={styles.heroTitle}>Estabilização</Text>
                            <Text style={styles.heroDesc}>
                                {contentType === 'audio'
                                    ? 'Acalme a tempestade interna através de guias curados para sua reconstrução.'
                                    : 'Acesse a sabedoria dos mestres. O conhecimento é a única posse que não pode ser roubada.'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Section Title */}
                <View style={styles.sectionDivider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.sectionLabel}>{contentType === 'audio' ? 'SESSÕES RECOMENDADAS' : 'LEITURAS ESSENCIAIS'}</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Content List */}
                <View style={styles.listContainer}>
                    {filteredContent.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.sessionItem,
                                item.status === 'recommended' && styles.sessionItemRecommended,
                                item.status === 'locked' && styles.sessionItemLocked
                            ]}
                            onPress={() => {
                                if (item.status === 'locked') return;
                                if (item.type === 'audio') handlePlaySession(item);
                                else { /* Handle text view */ }
                            }}
                        >
                            {item.status === 'recommended' && (
                                <View style={styles.recommendedBadge}>
                                    <Text style={styles.recommendedBadgeText}>RECOMENDADO PARA SUA FASE</Text>
                                </View>
                            )}

                            <View style={styles.sessionMain}>
                                <View style={[
                                    styles.sessionIconBox,
                                    item.status === 'recommended' && styles.sessionIconBoxRecommended,
                                    item.status === 'completed' && styles.sessionIconBoxCompleted,
                                    item.type === 'text' && { borderRadius: 12 }
                                ]}>
                                    {loading && playingSession?.id === item.id ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <MaterialCommunityIcons
                                            name={
                                                item.status === 'locked' ? 'lock' :
                                                    item.type === 'text' ? 'book-open-variant' : 'play'
                                            }
                                            size={20}
                                            color={item.status === 'locked' ? '#475569' : '#fff'}
                                        />
                                    )}
                                    {isPlaying && playingSession?.id === item.id && (
                                        <Animated.View style={[styles.playingPulse, { transform: [{ scale: pulseAnim }] }]} />
                                    )}
                                </View>

                                <View style={styles.sessionInfo}>
                                    <View style={styles.sessionMetaRow}>
                                        <View style={styles.numberBadge}>
                                            <Text style={styles.numberText}>{item.id}</Text>
                                        </View>
                                        <Text style={styles.sessionPhase}>{item.phase.toUpperCase()}</Text>
                                    </View>
                                    <Text style={styles.sessionTitle}>{item.title}</Text>
                                    <Text style={styles.sessionSubtitle} numberOfLines={2}>{item.subtitle}</Text>
                                </View>

                                <View style={styles.sessionRight}>
                                    <Text style={styles.durationText}>{item.duration}</Text>
                                    {playingSession?.id === item.id && isPlaying && (
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundDark,
    },
    contentTypeWrapper: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginTop: 20,
        gap: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    typeTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    typeTabActive: {
        borderBottomColor: colors.primary,
    },
    typeTabText: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    typeTabTextActive: {
        color: '#fff',
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
        fontSize: 11,
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
        marginTop: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    heroGradient: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(23, 115, 207, 0.08)',
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
        marginBottom: 8,
    },
    heroTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 4,
    },
    heroDesc: {
        color: '#94a3b8',
        fontSize: 12,
        lineHeight: 18,
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
    },
    sessionItemLocked: {
        opacity: 0.5,
    },
    recommendedBadge: {
        position: 'absolute',
        top: -10,
        right: 16,
        backgroundColor: colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 2,
    },
    recommendedBadgeText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 1,
    },
    sessionMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    sessionIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1e293b',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    sessionIconBoxRecommended: {
        backgroundColor: colors.primary + '22',
        borderWidth: 1,
        borderColor: colors.primary + '44',
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
        borderRadius: 22,
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
        fontSize: 9,
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
    }
});

export default Library;
