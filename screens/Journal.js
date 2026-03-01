import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../config/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, doc } from 'firebase/firestore';
import colors from '../colors';
import AppHeader from '../components/AppHeader';
import { AuthenticatedUserContext } from '../App';

const { width } = Dimensions.get('window');

const JOURNAL_TOOLS = [
    {
        id: 'mood_checkin',
        title: 'Check-in de Humor',
        subtitle: 'Monitoramento emocional diário',
        icon: 'emoticon-neutral-outline',
        color: '#818cf8',
        requiredDays: 0,
        science: 'O monitoramento contínuo ajuda a identificar padrões em picos de ansiedade.'
    },
    {
        id: 'negative_reappraisal',
        title: 'Diário da Realidade',
        subtitle: 'Combate ao vício neural',
        icon: 'brain',
        color: '#fbbf24',
        requiredDays: 3,
        science: 'Focar nas falhas da ex reduz o "recall eufórico" e acelera a superação.'
    },
    {
        id: 'unsent_letter',
        title: 'Carta Não Enviada',
        subtitle: 'Escrita expressiva ritual',
        icon: 'email-lock',
        color: '#f43f5e',
        requiredDays: 3,
        science: 'Escrever sobre traumas reorganiza memórias e reduz o stress fisiológico.'
    },
    {
        id: 'stoic_matrix',
        title: 'Matriz Estoica',
        subtitle: 'Dicotomia do Controle',
        icon: 'scale-balance',
        color: '#22c55e',
        requiredDays: 7,
        science: 'Separar o que você controla do que não controla traz paz imediata.'
    }
];

const Journal = () => {
    const { user } = useContext(AuthenticatedUserContext);
    const [activeTool, setActiveTool] = useState(null);
    const [loading, setLoading] = useState(false);
    const [czDays, setCzDays] = useState(0);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
            if (snapshot.exists()) {
                setCzDays(snapshot.data().contactZero?.currentStreak || 0);
            }
        });
        return () => unsubscribe();
    }, [user]);

    // Tool States
    const [mood, setMood] = useState(3);
    const [notes, setNotes] = useState('');
    const [negativeFacts, setNegativeFacts] = useState(['', '', '']);
    const [breakupReason, setBreakupReason] = useState('');
    const [letterContent, setLetterContent] = useState('');
    const [controlIn, setControlIn] = useState('');
    const [controlOut, setControlOut] = useState('');

    const saveEntry = async (type, data) => {
        if (!user) return;
        setLoading(true);
        try {
            await addDoc(collection(db, 'cbt_journal_entries'), {
                user_id: user.uid,
                timestamp: serverTimestamp(),
                entry_type: type,
                ...data
            });
            Alert.alert("Sucesso", "Sua entrada foi registrada cientificamente.");
            setActiveTool(null);
            resetStates();
        } catch (error) {
            console.error("Error saving entry:", error);
            Alert.alert("Erro", "Não foi possível salvar sua entrada.");
        } finally {
            setLoading(false);
        }
    };

    const resetStates = () => {
        setMood(3);
        setNotes('');
        setNegativeFacts(['', '', '']);
        setBreakupReason('');
        setLetterContent('');
        setControlIn('');
        setControlOut('');
    };

    const renderToolContent = () => {
        switch (activeTool) {
            case 'mood_checkin':
                return (
                    <View style={styles.toolContainer}>
                        <Text style={styles.modalTitle}>Como você está agora?</Text>
                        <View style={styles.moodRow}>
                            {[1, 2, 3, 4, 5].map(m => (
                                <TouchableOpacity
                                    key={m}
                                    style={[styles.moodCircle, mood === m && { backgroundColor: colors.primary }]}
                                    onPress={() => setMood(m)}
                                >
                                    <Text style={[styles.moodEmoji, mood === m && { color: '#000' }]}>
                                        {m === 1 ? '😫' : m === 2 ? '☹️' : m === 3 ? '😐' : m === 4 ? '🙂' : '🤩'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Estou me sentindo assim porque..."
                            placeholderTextColor="#64748b"
                            multiline
                            value={notes}
                            onChangeText={setNotes}
                        />
                        <TouchableOpacity style={styles.saveBtn} onPress={() => saveEntry('mood_checkin', { mood_score: mood, content: notes })}>
                            <Text style={styles.saveBtnText}>REGISTRAR HUMOR</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'negative_reappraisal':
                return (
                    <ScrollView style={styles.toolContainer}>
                        <Text style={styles.modalTitle}>Enfrente a Realidade</Text>
                        <Text style={styles.warningText}>O cérebro em abstinência tenta enganar você. Lembre-se da verdade.</Text>

                        <Text style={styles.inputLabel}>3 Hábitos ou atitudes tóxicas dela:</Text>
                        {negativeFacts.map((fact, i) => (
                            <TextInput
                                key={i}
                                style={styles.input}
                                placeholder={`Hábito ${i + 1}`}
                                placeholderTextColor="#64748b"
                                value={fact}
                                onChangeText={text => {
                                    let newFacts = [...negativeFacts];
                                    newFacts[i] = text;
                                    setNegativeFacts(newFacts);
                                }}
                            />
                        ))}

                        <Text style={styles.inputLabel}>1 Motivo claro do fim:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="A relação faliu porque..."
                            placeholderTextColor="#64748b"
                            value={breakupReason}
                            onChangeText={setBreakupReason}
                        />

                        <TouchableOpacity style={styles.saveBtn} onPress={() => saveEntry('negative_reappraisal', { negative_facts: negativeFacts, reason: breakupReason })}>
                            <Text style={styles.saveBtnText}>REFORÇAR REALIDADE</Text>
                        </TouchableOpacity>
                    </ScrollView>
                );
            case 'unsent_letter':
                return (
                    <View style={styles.toolContainer}>
                        <Text style={styles.modalTitle}>Carta de Purificação</Text>
                        <Text style={styles.modalSubtitle}>Escreva tudo o que você queria dizer. Esta carta nunca será enviada.</Text>
                        <TextInput
                            style={[styles.textArea, { height: 300 }]}
                            placeholder="Toda a raiva, dor ou injustiça..."
                            placeholderTextColor="#64748b"
                            multiline
                            value={letterContent}
                            onChangeText={setLetterContent}
                        />
                        <TouchableOpacity style={styles.saveBtn} onPress={() => saveEntry('unsent_letter', { content: letterContent })}>
                            <MaterialCommunityIcons name="fire" size={20} color="#120f0b" />
                            <Text style={styles.saveBtnText}>QUEIMAR E SELAR</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 'stoic_matrix':
                return (
                    <ScrollView style={styles.toolContainer}>
                        <Text style={styles.modalTitle}>Matriz de Controle</Text>

                        <View style={styles.matrixCard}>
                            <Text style={[styles.matrixLabel, { color: '#f43f5e' }]}>O QUE NÃO CONTROLO</Text>
                            <TextInput
                                style={styles.textAreaSmall}
                                placeholder="Ex: A opinião dela, o passado..."
                                placeholderTextColor="#64748b"
                                multiline
                                value={controlOut}
                                onChangeText={setControlOut}
                            />
                        </View>

                        <View style={styles.matrixCard}>
                            <Text style={[styles.matrixLabel, { color: '#22c55e' }]}>O QUE POSSO CONTROLAR AGORA</Text>
                            <TextInput
                                style={styles.textAreaSmall}
                                placeholder="Ex: Meu treino, meu silêncio, meu foco..."
                                placeholderTextColor="#64748b"
                                multiline
                                value={controlIn}
                                onChangeText={setControlIn}
                            />
                        </View>

                        <TouchableOpacity style={styles.saveBtn} onPress={() => saveEntry('stoic_matrix', { control_in: controlIn, control_out: controlOut })}>
                            <Text style={styles.saveBtnText}>ESTABELECER ORDEM</Text>
                        </TouchableOpacity>
                    </ScrollView>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <AppHeader variant="brand" />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.headerSection}>
                    <Text style={styles.pageTitle}>Diário Terapêutico</Text>
                    <Text style={styles.pageSubtitle}>Ferramentas estruturadas de TCC e Estoicismo para regulação emocional.</Text>
                </View>

                <View style={styles.toolsGrid}>
                    {JOURNAL_TOOLS.map(tool => {
                        const isLocked = czDays < tool.requiredDays;
                        return (
                            <TouchableOpacity
                                key={tool.id}
                                style={[styles.toolCard, isLocked && styles.toolCardLocked]}
                                onPress={() => isLocked ? null : setActiveTool(tool.id)}
                                activeOpacity={isLocked ? 1 : 0.8}
                            >
                                <View style={[styles.iconBox, { backgroundColor: isLocked ? '#1e293b' : tool.color + '15' }]}>
                                    <MaterialCommunityIcons
                                        name={isLocked ? 'lock' : tool.icon}
                                        size={28}
                                        color={isLocked ? '#475569' : tool.color}
                                    />
                                </View>
                                <View style={styles.toolInfo}>
                                    <Text style={[styles.toolTitle, isLocked && { color: '#64748b' }]}>
                                        {tool.title}
                                    </Text>
                                    <Text style={[styles.toolSubtitle, isLocked && { color: '#475569' }]}>
                                        {isLocked ? `Liberta no Dia ${tool.requiredDays}` : tool.subtitle}
                                    </Text>
                                    {!isLocked && (
                                        <View style={styles.scienceBadge}>
                                            <Text style={styles.scienceText}>{tool.science}</Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <Modal
                visible={!!activeTool}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setActiveTool(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.dragBar} />
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setActiveTool(null)}>
                            <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>

                        {loading ? (
                            <ActivityIndicator color={colors.primary} style={{ marginTop: 100 }} />
                        ) : (
                            renderToolContent()
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundDark },
    scrollContent: { paddingBottom: 100 },
    headerSection: { padding: 24 },
    pageTitle: { color: '#fff', fontSize: 28, fontWeight: '900' },
    pageSubtitle: { color: '#64748b', fontSize: 14, marginTop: 4, lineHeight: 20 },

    toolsGrid: {
        paddingHorizontal: 24, // Standard 24px margin
        gap: 16
    },
    toolCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: colors.cardRadius,
        padding: colors.cardPadding,
        flexDirection: 'row',
        gap: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    toolCardLocked: {
        opacity: 0.5,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        borderColor: 'rgba(255, 255, 255, 0.02)',
        borderStyle: 'dashed'
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    toolInfo: { flex: 1 },
    toolTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    toolSubtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
    scienceBadge: {
        marginTop: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 8,
        borderRadius: 8,
        alignSelf: 'flex-start'
    },
    scienceText: {
        color: '#475569',
        fontSize: 10,
        fontStyle: 'italic',
        lineHeight: 14,
    },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalSheet: {
        backgroundColor: colors.backgroundDark,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '85%',
        padding: 24
    },
    dragBar: { width: 40, height: 4, backgroundColor: '#334155', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    closeBtn: { position: 'absolute', top: 24, right: 24, zIndex: 10 },
    modalTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 8 },
    modalSubtitle: { color: '#64748b', fontSize: 14, marginBottom: 24 },

    toolContainer: { flex: 1 },
    moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    moodCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    moodEmoji: { fontSize: 24 },
    textArea: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        textAlignVertical: 'top',
        height: 120,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    textAreaSmall: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        padding: 12,
        color: '#fff',
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top'
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: 12,
        color: '#fff',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    inputLabel: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold', marginBottom: 8, marginTop: 16 },
    warningText: { color: '#fbbf24', fontSize: 12, fontStyle: 'italic', marginBottom: 16 },
    matrixCard: { marginBottom: 20 },
    matrixLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },

    saveBtn: {
        backgroundColor: colors.primary,
        height: colors.buttonHeight,
        borderRadius: colors.buttonRadius,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        gap: 8
    },
    saveBtnText: { color: colors.backgroundDark, fontSize: 16, fontWeight: '900' }
});

export default Journal;
