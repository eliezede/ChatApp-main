import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    ImageBackground,
    Platform,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePlayback } from '../context/PlaybackContext';
import colors from '../colors';

const PlanReady = ({ navigation, route }) => {
    const { questionnaireAnswers } = route.params || {};
    const [rulesModalVisible, setRulesModalVisible] = useState(false);

    const { playingSession, isPlaying, loading: audioLoading, playSession } = usePlayback();

    const audioSession = {
        id: '01',
        type: 'audio',
        phase: 'Estabilização',
        title: '1. O que realmente dói',
        subtitle: 'Uma análise sobre como a dor do término não vem apenas da ausência física...',
        audioPath: 'audios/1 - O que realmente doi.mp3',
    };

    const handleSavePlan = () => {
        navigation.navigate('Signup', { questionnaireAnswers });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Top Navigation Bar */}
                <View style={styles.navBar}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#f1f5f9" />
                    </TouchableOpacity>
                    <Text style={styles.navTitle}>ORIGIN RECOVERY</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.iconBadge}>
                        <MaterialCommunityIcons name="check-decagram" size={32} color={colors.primary} />
                    </View>
                    <Text style={styles.mainTitle}>Pronto!</Text>
                    <Text style={styles.headerDesc}>
                        Com base nas suas respostas, criamos o seu plano de{' '}
                        <Text style={{ color: colors.primary, fontWeight: '600' }}>treino emocional personalizado</Text>.
                    </Text>
                </View>

                {/* Card 1: Contact Zero Challenge */}
                <View style={[styles.glassCard, { padding: 4 }]}>
                    <ImageBackground
                        source={{ uri: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }} // Placeholder Dark Zen
                        style={styles.cardImageBg}
                        imageStyle={{ opacity: 0.6, borderRadius: 12 }}
                    >
                        <View style={styles.imageOverlay}>
                            <MaterialCommunityIcons name="clock-outline" size={48} color={colors.primary} style={{ marginBottom: 8 }} />
                            <View style={styles.activeBadge}>
                                <Text style={styles.activeBadgeText}>ATIVO AGORA</Text>
                            </View>
                        </View>
                    </ImageBackground>

                    <View style={styles.cardContent}>
                        <Text style={styles.levelText}>NÍVEL 1 • INICIANTE</Text>
                        <Text style={styles.cardTitle}>Desafio Contato Zero</Text>
                        <Text style={styles.cardDesc}>
                            Mantenha o foco absoluto no seu crescimento pessoal e resiliência interna.
                        </Text>

                        <View style={styles.cardFooter}>
                            <View style={styles.avatarGroup}>
                                <View style={styles.avatarCircle}>
                                    <Text style={styles.avatarText}>+12k</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => setRulesModalVisible(true)}
                            >
                                <Text style={styles.actionButtonText}>Ver Regras</Text>
                                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Card 2: Stoic Exercise */}
                <TouchableOpacity
                    style={[styles.glassCard, { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 24 }]}
                    onPress={() => playSession(audioSession)}
                    activeOpacity={0.8}
                >
                    <ImageBackground
                        source={{ uri: 'https://images.unsplash.com/photo-1541834246830-4e1160a2b0eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }} // Placeholder Bust
                        style={styles.stoicImage}
                        imageStyle={{ borderRadius: 8, opacity: 0.8 }}
                    >
                        <View style={styles.playButtonOverlay}>
                            <View style={styles.playButton}>
                                {audioLoading && playingSession?.id === audioSession.id ? (
                                    <ActivityIndicator size="small" color={colors.backgroundDark} />
                                ) : (
                                    <MaterialCommunityIcons
                                        name={isPlaying && playingSession?.id === audioSession.id ? "pause" : "play"}
                                        size={24}
                                        color={colors.backgroundDark}
                                    />
                                )}
                            </View>
                        </View>
                    </ImageBackground>

                    <View style={{ flex: 1 }}>
                        <View style={styles.audioLabel}>
                            <MaterialCommunityIcons name="headphones" size={14} color={colors.primary} />
                            <Text style={styles.audioText}>ÁUDIO DE 12 MIN</Text>
                        </View>
                        <Text style={styles.cardTitle}>O que realmente dói</Text>
                        <Text style={styles.cardDescItalic}>Estabilização Emocional</Text>

                        {isPlaying && playingSession?.id === audioSession.id ? (
                            <View style={styles.waveContainer}>
                                <View style={[styles.waveBar, { height: 6 }]} />
                                <View style={[styles.waveBar, { height: 12 }]} />
                                <View style={[styles.waveBar, { height: 8 }]} />
                                <View style={[styles.waveBar, { height: 16 }]} />
                                <View style={[styles.waveBar, { height: 10 }]} />
                            </View>
                        ) : (
                            <View style={styles.progressBarBg}>
                                <View style={styles.progressBarFill} />
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Bonus/Value Card */}
                <View style={styles.bonusCard}>
                    <View style={styles.bonusIconBox}>
                        <MaterialCommunityIcons name="trending-up" size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.bonusText}>
                        Seu plano foca em <Text style={{ color: '#f1f5f9', fontWeight: 'bold' }}>Resiliência Emocional</Text> baseado no seu perfil analítico.
                    </Text>
                </View>

            </ScrollView>

            {/* Fixed Footer Action */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.mainButton}
                    onPress={handleSavePlan}
                    activeOpacity={0.8}
                >
                    <View style={styles.buttonTextGroup}>
                        <Text style={styles.mainButtonText}>Salvar meu Plano</Text>
                        <Text style={styles.subButtonText}>(Criar Conta Grátis)</Text>
                    </View>
                    <MaterialCommunityIcons name="arrow-right" size={24} color={colors.backgroundDark} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
                <Text style={styles.footerDisclaimer}>
                    NÃO REQUER CARTÃO DE CRÉDITO • ACESSO IMEDIATO
                </Text>
            </View>

            {/* Rules Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={rulesModalVisible}
                onRequestClose={() => setRulesModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Regras Contato Zero</Text>
                            <TouchableOpacity onPress={() => setRulesModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll}>
                            <View style={styles.ruleItem}>
                                <MaterialCommunityIcons name="eye-off" size={20} color={colors.primary} />
                                <Text style={styles.ruleText}>Sem 'Stalking'. Proibido olhar redes sociais da(o) ex.</Text>
                            </View>
                            <View style={styles.ruleItem}>
                                <MaterialCommunityIcons name="message-text-outline" size={20} color={colors.primary} />
                                <Text style={styles.ruleText}>Proibido iniciar conversas. Não mande mensagens, fotos ou áudios.</Text>
                            </View>
                            <View style={styles.ruleItem}>
                                <MaterialCommunityIcons name="phone-off" size={20} color={colors.primary} />
                                <Text style={styles.ruleText}>Não atenda ligações. Se for urgente, a pessoa enviará mensagem.</Text>
                            </View>
                            <View style={styles.ruleItem}>
                                <MaterialCommunityIcons name="account-group" size={20} color={colors.primary} />
                                <Text style={styles.ruleText}>Não pergunte a amigos. Evite falar sobre ela/ele com conhecidos mútuos.</Text>
                            </View>

                            <Text style={styles.modalDesc}>
                                O Contato Zero não é para trazer a pessoa de volta, é para trazer você de volta a si mesmo.
                            </Text>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setRulesModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Entendido</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundDark,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 140, // Space for fixed footer
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceDark,
        borderWidth: 1,
        borderColor: 'rgba(244, 157, 37, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navTitle: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 16,
        paddingBottom: 32,
    },
    iconBadge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(244, 157, 37, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    mainTitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    headerDesc: {
        color: '#94a3b8',
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 28,
        paddingHorizontal: 16,
    },
    glassCard: {
        backgroundColor: 'rgba(43, 37, 30, 0.6)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(244, 157, 37, 0.1)',
        overflow: 'hidden',
    },
    cardImageBg: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: colors.surfaceDark,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(18, 15, 11, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeBadge: {
        backgroundColor: 'rgba(244, 157, 37, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
    },
    activeBadgeText: {
        color: colors.backgroundDark,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    cardContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 8,
    },
    levelText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    cardTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardDesc: {
        color: '#94a3b8',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 24,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        paddingTop: 16,
    },
    avatarGroup: {
        flexDirection: 'row',
    },
    avatarCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#334155',
        borderWidth: 2,
        borderColor: colors.surfaceDark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(244, 157, 37, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
        gap: 8,
    },
    actionButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    stoicImage: {
        width: 96,
        height: 96,
        backgroundColor: colors.surfaceDark,
        borderRadius: 8,
        overflow: 'hidden',
    },
    playButtonOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(244, 157, 37, 0.1)',
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    audioLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    audioText: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    cardDescItalic: {
        color: '#94a3b8',
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 12,
    },
    progressBarBg: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        width: '33%',
        height: '100%',
        backgroundColor: colors.primary,
    },
    bonusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(244, 157, 37, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(244, 157, 37, 0.3)',
        borderStyle: 'dashed',
        borderRadius: 20,
        padding: 16,
        gap: 16,
        marginTop: 24,
    },
    bonusIconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(244, 157, 37, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bonusText: {
        flex: 1,
        color: '#cbd5e1',
        fontSize: 14,
        lineHeight: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        backgroundColor: colors.backgroundDark,
        // Gradient overlay simulation
        borderTopWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    mainButton: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 24,
        paddingVertical: 20,
        paddingHorizontal: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    buttonTextGroup: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    mainButtonText: {
        color: colors.backgroundDark,
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    subButtonText: {
        color: colors.backgroundDark,
        fontSize: 13,
        fontWeight: '700',
        opacity: 0.7,
    },
    footerDisclaimer: {
        textAlign: 'center',
        color: '#64748b',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginTop: 16,
    },
    waveContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 3,
        marginTop: 4,
        height: 16, // Fixed height so the wave bars can animate/sit comfortably
    },
    waveBar: {
        width: 3,
        backgroundColor: colors.primary,
        borderRadius: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.surfaceDark,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        width: '100%',
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalScroll: {
        marginBottom: 24,
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    ruleText: {
        flex: 1,
        color: '#cbd5e1',
        fontSize: 14,
        lineHeight: 20,
    },
    modalDesc: {
        color: colors.primary,
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 24,
        lineHeight: 22,
    },
    modalButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PlanReady;
