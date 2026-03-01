import React, { useState, useEffect, useContext, useMemo } from 'react';
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
    ActivityIndicator,
    Platform,
    Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../config/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import colors from '../colors';
import AppHeader from '../components/AppHeader';
import { AuthenticatedUserContext } from '../App';
import { MISSIONS_LIBRARY, MISSION_CATEGORIES } from '../logic/missionsData';

const { width } = Dimensions.get('window');

const MissionCard = ({ mission, isCompleted, onPress, isLocked }) => {
    const category = MISSION_CATEGORIES.find(c => c.id === mission.category);

    return (
        <TouchableOpacity
            style={[styles.missionCard, isCompleted && styles.missionCardCompleted, isLocked && styles.missionCardLocked]}
            onPress={() => isLocked ? null : onPress(mission)}
            activeOpacity={isLocked ? 1 : 0.8}
        >
            <View style={[styles.categoryBorder, { backgroundColor: isLocked ? '#1e293b' : (category?.color || colors.primary) }]} />

            <View style={styles.missionContent}>
                <View style={styles.missionTop}>
                    <View style={[styles.difficultyBadge, isLocked && { backgroundColor: '#1e293b', borderColor: '#334155' }]}>
                        <Text style={[styles.difficultyText, isLocked && { color: '#475569' }]}>
                            {isLocked ? 'RESTRITO' : (mission.difficulty || 'Normal').toUpperCase()}
                        </Text>
                    </View>
                    <Text style={[styles.durationText, isLocked && { color: '#334155' }]}>
                        {isLocked ? `Dia ${mission.requiredDays || 0}+` : (mission.duration || 'Daily')}
                    </Text>
                </View>

                <Text style={[styles.missionTitle, isCompleted && styles.missionTitleCompleted, isLocked && { color: '#475569' }]}>
                    {isLocked ? 'Missão Bloqueada' : mission.title}
                </Text>

                <View style={styles.missionBottom}>
                    <MaterialCommunityIcons
                        name={isLocked ? 'lock' : (category?.icon || 'target')}
                        size={16}
                        color={isLocked ? '#334155' : (isCompleted ? '#94a3b8' : (category?.color || colors.textSecondary))}
                    />
                    <Text style={[styles.categoryLabel, { color: isLocked ? '#334155' : (category?.color || colors.textSecondary) }]}>
                        {isLocked ? `${mission.requiredDays} dias de Contato Zero` : category?.label}
                    </Text>

                    {isCompleted && !isLocked && (
                        <View style={styles.completedBadge}>
                            <MaterialCommunityIcons name="check-decagram" size={14} color="#22c55e" />
                            <Text style={styles.completedText}>CONCLUÍDO</Text>
                        </View>
                    )}
                </View>
            </View>

            {!isLocked && (
                <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="rgba(255,255,255,0.1)"
                />
            )}
        </TouchableOpacity>
    );
};

const MissionDetailsModal = ({ mission, isVisible, onClose, isCompleted, onToggleComplete }) => {
    if (!mission) return null;
    const category = MISSION_CATEGORIES.find(c => c.id === mission.category);

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                    <View style={styles.dragBar} />

                    <View style={styles.modalHeader}>
                        <View style={[styles.modalCategoryIcon, { backgroundColor: (category?.color || colors.primary) + '20' }]}>
                            <MaterialCommunityIcons name={category?.icon} size={24} color={category?.color} />
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                        <Text style={styles.modalCategoryTitle}>{category?.label}</Text>
                        <Text style={styles.modalMissionTitle}>{mission.title}</Text>

                        <View style={styles.modalStatsRow}>
                            <View style={styles.modalStat}>
                                <MaterialCommunityIcons name="speedometer" size={16} color={colors.textSecondary} />
                                <Text style={styles.modalStatText}>{mission.difficulty || 'Normal'}</Text>
                            </View>
                            <View style={styles.modalStat}>
                                <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSecondary} />
                                <Text style={styles.modalStatText}>{mission.duration || 'Daily'}</Text>
                            </View>
                        </View>

                        <View style={styles.logicSection}>
                            <Text style={styles.sectionLabel}>O QUE FAZER?</Text>
                            <Text style={styles.logicText}>{mission.science_fact}</Text>
                        </View>

                        <View style={styles.logicSection}>
                            <View style={styles.logicHeader}>
                                <MaterialCommunityIcons name="brain" size={18} color={colors.primary} />
                                <Text style={styles.sectionLabel}>POR QUE FUNCIONA? (LOGICA CIENTÍFICA)</Text>
                            </View>
                            <View style={styles.logicCard}>
                                <Text style={styles.scienceExplanation}>{mission.logic}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.actionButton, isCompleted && styles.actionButtonCompleted]}
                            onPress={() => onToggleComplete(mission.id)}
                        >
                            <MaterialCommunityIcons
                                name={isCompleted ? "refresh" : "check-bold"}
                                size={20}
                                color={isCompleted ? colors.primary : "#120f0b"}
                            />
                            <Text style={[styles.actionButtonText, isCompleted && { color: colors.primary }]}>
                                {isCompleted ? 'REFAZER MISSÃO' : 'CONCLUIR MISSÃO'}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const Missions = () => {
    const { user } = useContext(AuthenticatedUserContext);
    const [selectedCategory, setSelectedCategory] = useState('hoje');
    const [userProfile, setUserProfile] = useState(null);
    const [dailyPlan, setDailyPlan] = useState(null);
    const [completedMissions, setCompletedMissions] = useState([]);
    const [czDays, setCzDays] = useState(0);
    const [selectedMission, setSelectedMission] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setUserProfile(data);
                setCompletedMissions(data.completed_missions || []);
                setCzDays(data.contactZero?.currentStreak || 0);
            }
        });

        const today = new Date().toISOString().split('T')[0];
        const planDocRef = doc(db, 'plans', user.uid, 'daily', today);
        const unsubscribePlan = onSnapshot(planDocRef, (snapshot) => {
            if (snapshot.exists()) {
                setDailyPlan(snapshot.data());
            }
            setLoading(false);
        });

        return () => {
            unsubscribeUser();
            unsubscribePlan();
        };
    }, [user]);

    const handleToggleComplete = async (missionId) => {
        if (!user) return;

        const isCurrentlyCompleted = completedMissions.includes(missionId);
        const userRef = doc(db, 'users', user.uid);

        try {
            if (isCurrentlyCompleted) {
                await updateDoc(userRef, {
                    completed_missions: arrayRemove(missionId)
                });
            } else {
                await updateDoc(userRef, {
                    completed_missions: arrayUnion(missionId)
                });
            }
            setSelectedMission(null);
        } catch (error) {
            console.error("Error updating mission status:", error);
            alert("Erro ao atualizar missão.");
        }
    };

    const MISSION_THEME = {
        detox: { bg: '#1a0510', accent: '#f43f5e', icon: 'shield-lock', label: 'DESINTOXICAÇÃO', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop' },
        action: { bg: '#051a05', accent: '#22c55e', icon: 'lightning-bolt', label: 'AÇÃO & CORPO', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop' },
        stoic: { bg: '#050f1a', accent: '#3b82f6', icon: 'head-heart', label: 'MENTE ESTOICA', image: 'https://images.unsplash.com/photo-1505664159854-2326119c8152?q=80&w=600&auto=format&fit=crop' },
        identity: { bg: '#10051a', accent: '#a855f7', icon: 'compass-outline', label: 'AUTOEXPANSÃO', image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=600&auto=format&fit=crop' },
    };

    const categoriesWithToday = [
        { id: 'hoje', label: 'HOJE', icon: 'calendar-check', color: colors.primary },
        ...MISSION_CATEGORIES
    ];

    const filteredMissions = useMemo(() => {
        if (selectedCategory === 'hoje') {
            if (!dailyPlan?.tasks) return [];
            return dailyPlan.tasks.map(t => {
                const libMatch = MISSIONS_LIBRARY.find(lib => lib.id === t.id);
                if (libMatch) return { ...libMatch, ...t };

                let category = 'stoic';
                if (t.id === 'origin_contact_zero' || t.id === 'origin_sos') category = 'detox';
                else if (t.id === 'aerobic_stimulus' || t.actionType === 'PHYSICAL_TRAINING') category = 'action';

                return {
                    id: t.id,
                    title: t.title,
                    category: category,
                    difficulty: t.difficulty || 'Normal',
                    duration: t.duration || (category === 'detox' ? '24h' : '15 min'),
                    science_fact: t.rationale || t.description,
                    image: (MISSION_THEME[category] || MISSION_THEME.stoic).image,
                    requiredDays: 0,
                    ...t
                };
            });
        }
        return MISSIONS_LIBRARY.filter(m => m.category === selectedCategory);
    }, [selectedCategory, dailyPlan, MISSIONS_LIBRARY]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <AppHeader variant="brand" />

            <View style={styles.categoryTabs}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {categoriesWithToday.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.tab, selectedCategory === cat.id && styles.tabActive]}
                            onPress={() => setSelectedCategory(cat.id)}
                        >
                            <MaterialCommunityIcons
                                name={cat.icon}
                                size={18}
                                color={selectedCategory === cat.id ? colors.primary : '#64748b'}
                            />
                            <Text style={[styles.tabText, selectedCategory === cat.id && styles.tabTextActive]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.headerSection}>
                    <Text style={styles.pageTitle}>Cardápio de Metas</Text>
                    <Text style={styles.pageSubtitle}>Selecione uma missão para acelerar sua neuroplasticidade.</Text>
                </View>

                {loading ? (
                    <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <View style={styles.missionsGrid}>
                        {filteredMissions.map(mission => (
                            <MissionCard
                                key={mission.id}
                                mission={mission}
                                isCompleted={completedMissions.includes(mission.id)}
                                isLocked={czDays < (mission.requiredDays || 0)}
                                onPress={setSelectedMission}
                            />
                        ))}
                    </View>
                )}
                <View style={{ height: 120 }} />
            </ScrollView>

            <MissionDetailsModal
                mission={selectedMission}
                isVisible={!!selectedMission}
                onClose={() => setSelectedMission(null)}
                isCompleted={completedMissions.includes(selectedMission?.id)}
                onToggleComplete={handleToggleComplete}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundDark },
    categoryTabs: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)' },
    tabsScroll: { paddingHorizontal: 20, gap: 12 },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        gap: 8
    },
    tabActive: {
        backgroundColor: colors.primary + '15',
        borderColor: colors.primary + '40'
    },
    tabText: { color: '#64748b', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    tabTextActive: { color: colors.primary },

    listScroll: { flex: 1 },
    headerSection: { padding: 24, paddingBottom: 12 },
    pageTitle: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
    pageSubtitle: { color: '#64748b', fontSize: 14, marginTop: 4, lineHeight: 20 },

    missionsGrid: { padding: 20, gap: 16 },
    missionCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: colors.cardRadius,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.cardBorder,
        alignItems: 'center',
        paddingRight: 16,
        position: 'relative',
        minHeight: 110,
        marginBottom: 12,
    },
    missionCardBgImage: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100%',
        height: '100%'
    },
    categoryBorder: { width: 4, height: '100%' },
    missionCardCompleted: {
        opacity: 0.6,
        borderColor: '#22c55e40'
    },
    missionCardLocked: {
        opacity: 0.5,
        backgroundColor: 'rgba(15, 23, 42, 0.3)',
        borderColor: 'rgba(255, 255, 255, 0.02)',
        borderStyle: 'dashed',
    },
    categoryBorder: { width: 4, height: '100%' },
    missionContent: { flex: 1, padding: 16 },
    missionTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    difficultyBadge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4
    },
    difficultyText: { color: '#94a3b8', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
    durationText: { color: '#475569', fontSize: 10, fontWeight: 'bold' },
    missionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
    missionTitleCompleted: { color: '#94a3b8', textDecorationLine: 'line-through' },
    missionBottom: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    categoryLabel: { color: '#475569', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
    completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
    completedText: { color: '#22c55e', fontSize: 9, fontWeight: '900' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalSheet: {
        backgroundColor: colors.backgroundDark,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '90%',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)'
    },
    dragBar: { width: 40, height: 4, backgroundColor: '#334155', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, alignItems: 'center' },
    modalCategoryIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    closeBtn: { padding: 8 },
    modalScroll: { padding: 24, paddingBottom: 60 },
    modalCategoryTitle: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
    modalMissionTitle: { color: '#fff', fontSize: 32, fontWeight: '900', lineHeight: 38, marginBottom: 16 },
    modalStatsRow: { flexDirection: 'row', gap: 20, marginBottom: 32 },
    modalStat: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    modalStatText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
    sectionLabel: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 12 },
    logicSection: { marginBottom: 32 },
    logicText: { color: '#cbd5e1', fontSize: 18, lineHeight: 28, fontWeight: '400' },
    logicHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    logicCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    scienceExplanation: { color: '#94a3b8', fontSize: 15, lineHeight: 24, fontStyle: 'italic' },
    actionButton: {
        backgroundColor: colors.primary,
        height: colors.buttonHeight,
        borderRadius: colors.buttonRadius,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 20,
    },
    actionButtonCompleted: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
        shadowOpacity: 0
    },
    actionButtonText: { color: '#120f0b', fontSize: 18, fontWeight: '900' }
});

export default Missions;
