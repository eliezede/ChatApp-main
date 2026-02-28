import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
    SafeAreaView,
    ActivityIndicator,
    StatusBar,
    Dimensions,
    TouchableOpacity,
    Image,
    Platform,
    Modal,
    Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../config/firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp, setDoc, arrayUnion, arrayUnion as fArrayUnion } from 'firebase/firestore';
import Svg, { Polygon, Line, Circle, G, Text as SvgText } from 'react-native-svg';
import colors from '../colors';
import { AuthenticatedUserContext } from '../App';
import { generateDailyPlan } from '../logic/PlanEngine';
import { MISSIONS_LIBRARY, MISSION_CATEGORIES } from '../logic/missionsData';

const { width } = Dimensions.get('window');

const Dashboard = ({ navigation }) => {
    const { setOnboardingCompleted } = React.useContext(AuthenticatedUserContext);
    const [userProfile, setUserProfile] = useState(null);
    const [dailyPlan, setDailyPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Check-in modal state
    const [showCheckin, setShowCheckin] = useState(false);
    const [checkinResult, setCheckinResult] = useState(null); // 'success' | 'relapse' | null
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Balance modal state
    const [showBalance, setShowBalance] = useState(false);

    // Mission detail modal state
    const [showMissionDetail, setShowMissionDetail] = useState(false);
    const [selectedDashMission, setSelectedDashMission] = useState(null);

    // Breathing mini-app state
    const [showBreathing, setShowBreathing] = useState(false);
    const [breathPhase, setBreathPhase] = useState('ready'); // ready | inhale | hold | exhale
    const [breathCount, setBreathCount] = useState(0);
    const [breathTimer, setBreathTimer] = useState(4);
    const breathAnim = useRef(new Animated.Value(1)).current;
    const breathTimerRef = useRef(null);
    const breathPhaseRef = useRef('ready');

    const handleBreathToggle = () => {
        if (breathPhaseRef.current !== 'ready') {
            clearInterval(breathTimerRef.current);
            breathPhaseRef.current = 'ready';
            setBreathPhase('ready');
            setBreathCount(0);
            setBreathTimer(4);
            breathAnim.setValue(1);
            return;
        }
        const runPhase = (phase, duration, nextFn) => {
            breathPhaseRef.current = phase;
            setBreathPhase(phase);
            setBreathTimer(duration);
            if (phase === 'inhale') {
                Animated.timing(breathAnim, { toValue: 1.5, duration: duration * 1000, useNativeDriver: false }).start();
            } else if (phase === 'exhale') {
                Animated.timing(breathAnim, { toValue: 1, duration: duration * 1000, useNativeDriver: false }).start();
            }
            let t = duration;
            clearInterval(breathTimerRef.current);
            breathTimerRef.current = setInterval(() => {
                t -= 1;
                setBreathTimer(t);
                if (t <= 0) {
                    clearInterval(breathTimerRef.current);
                    nextFn();
                }
            }, 1000);
        };
        const startCycle = () => {
            runPhase('inhale', 4, () =>
                runPhase('hold', 7, () =>
                    runPhase('exhale', 8, () => {
                        setBreathCount(c => c + 1);
                        startCycle();
                    })
                )
            );
        };
        startCycle();
    };

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
                setUserProfile(doc.data());
            }
        });

        const planDocRef = doc(db, 'plans', user.uid, 'daily', selectedDate);
        const unsubscribePlan = onSnapshot(planDocRef, (doc) => {
            if (doc.exists()) {
                setDailyPlan(doc.data());
            }
            setLoading(false);
        });

        return () => {
            unsubscribeUser();
            unsubscribePlan();
        };
    }, [selectedDate]);

    useEffect(() => {
        const checkPlan = async () => {
            if (!loading && userProfile && !dailyPlan) {
                const user = auth.currentUser;
                await generateDailyPlan(user.uid, userProfile.profile, selectedDate);
            }
        };
        checkPlan();
    }, [loading, !!dailyPlan, userProfile]);

    const handleCompleteMission = async (missionId) => {
        const user = auth.currentUser;
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        try {
            const isCompleted = userProfile?.completed_missions?.includes(missionId);
            if (!isCompleted) {
                await updateDoc(userRef, {
                    completed_missions: arrayUnion(missionId)
                });
            }
        } catch (error) {
            console.error("Error completing mission from dashboard:", error);
        }
    };

    const handleCheckIn = () => {
        setCheckinResult(null);
        setShowCheckin(true);
    };

    const submitCheckin = async (didHold) => {
        const user = auth.currentUser;
        if (!user) return;
        const today = new Date().toISOString().split('T')[0];
        const userRef = doc(db, 'users', user.uid);
        const historyEntry = { date: today, success: didHold };

        try {
            if (didHold) {
                const newStreak = (userProfile?.contactZero?.currentStreak || 0) + 1;
                const best = Math.max(newStreak, userProfile?.contactZero?.bestStreak || 0);
                await updateDoc(userRef, {
                    'contactZero.currentStreak': newStreak,
                    'contactZero.bestStreak': best,
                    'contactZero.lastChecked': serverTimestamp(),
                    'contactZero.history': arrayUnion(historyEntry),
                });
            } else {
                await updateDoc(userRef, {
                    'contactZero.currentStreak': 0,
                    'contactZero.lastChecked': serverTimestamp(),
                    'contactZero.history': arrayUnion(historyEntry),
                });
            }
        } catch (e) {
            console.error('Error saving check-in:', e);
        }

        setCheckinResult(didHold ? 'success' : 'relapse');
        // Animate result in
        Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true }).start();
    };

    const closeCheckin = (navigateToDiary = false) => {
        setShowCheckin(false);
        setCheckinResult(null);
        fadeAnim.setValue(0);
        if (navigateToDiary) {
            navigation.navigate('Diario');
        }
    };

    const RadarChart = () => {
        const center = 50;
        const radius = 40;
        const stats = [
            { label: 'Resiliência', value: userProfile?.profile?.stabilityScore || 60 },
            { label: 'Foco', value: userProfile?.profile?.structureScore || 70 },
            { label: 'Humor', value: 80 }, // Placeholder for now
            { label: 'Sono', value: 50 }, // Placeholder
        ];

        const getPoint = (index, value) => {
            const angle = (index * (360 / stats.length)) * (Math.PI / 180);
            const r = (value / 100) * radius;
            return `${center + r * Math.sin(angle)},${center - r * Math.cos(angle)}`;
        };

        const points = stats.map((s, i) => getPoint(i, s.value)).join(' ');

        return (
            <View style={styles.radarWrapper}>
                <Svg height="180" width="180" viewBox="-20 -20 140 140">
                    {/* Grid */}
                    <G opacity="0.15">
                        <Polygon points="50,5 95,50 50,95 5,50" fill="none" stroke="#fff" strokeWidth="1" />
                        <Polygon points="50,25 75,50 50,75 25,50" fill="none" stroke="#fff" strokeWidth="0.5" />
                    </G>
                    {/* Data polygon */}
                    <Polygon points={points} fill="rgba(0, 242, 255, 0.25)" stroke="#00f2ff" strokeWidth="2" />
                    {/* Labels */}
                    {stats.map((s, i) => {
                        const angle = (i * (360 / stats.length) - 90) * (Math.PI / 180);
                        const labelR = 58;
                        const lx = center + labelR * Math.cos(angle);
                        const ly = center + labelR * Math.sin(angle);
                        return (
                            <SvgText
                                key={i}
                                x={lx}
                                y={ly}
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                fontSize="6"
                                fill="#475569"
                                letterSpacing="0.5"
                            >
                                {s.label.toUpperCase()}
                            </SvgText>
                        );
                    })}
                </Svg>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const czDays = userProfile?.contactZero?.currentStreak || 0;

    // --- Progressive Disclosure: unlock missions by streak ---
    const getUnlockedCategories = (streak) => {
        if (streak >= 14) return ['detox', 'action', 'stoic', 'identity'];
        if (streak >= 7) return ['detox', 'action', 'stoic'];
        if (streak >= 3) return ['detox', 'action'];
        return ['detox'];
    };
    const unlockedCategories = getUnlockedCategories(czDays);

    // --- Mission gallery logic ---
    const planMissionIds = dailyPlan?.tasks?.map(t => t.id) || [];
    const completedIds = userProfile?.completed_missions || [];
    // All missions filtered by unlocked categories (fallback: all detox + stoic03)
    const allUnlocked = MISSIONS_LIBRARY.filter(m => unlockedCategories.includes(m.category));
    const todayMissions = planMissionIds.length > 0
        ? planMissionIds.map(id => MISSIONS_LIBRARY.find(m => m.id === id)).filter(Boolean)
        : allUnlocked.slice(0, 3);
    const galleryMissions = todayMissions.length > 0 ? todayMissions : allUnlocked.slice(0, 3);
    const activeMission = galleryMissions.find(m => !completedIds.includes(m.id)) || galleryMissions[0];
    const todayDone = galleryMissions.filter(m => completedIds.includes(m.id)).length;
    const todayTotal = Math.max(galleryMissions.length, 1);
    const allDoneToday = todayDone === todayTotal && todayTotal > 0;

    // Visual theme per category
    const MISSION_THEME = {
        detox: { bg: '#1a0510', accent: '#f43f5e', icon: 'shield-lock', label: 'DESINTOXICAÇÃO', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop' },
        action: { bg: '#051a05', accent: '#22c55e', icon: 'lightning-bolt', label: 'AÇÃO & CORPO', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop' },
        stoic: { bg: '#050f1a', accent: '#3b82f6', icon: 'head-heart', label: 'MENTE ESTOICA', image: 'https://images.unsplash.com/photo-1505664159854-2326119c8152?q=80&w=600&auto=format&fit=crop' },
        identity: { bg: '#10051a', accent: '#a855f7', icon: 'compass-outline', label: 'AUTOEXPANSÃO', image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=600&auto=format&fit=crop' },
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()} activeOpacity={0.8} style={styles.avatarBorder}>
                        <Image
                            source={userProfile?.photoURL ? { uri: userProfile.photoURL } : require('../assets/stoic_avatar.jpg')}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.brandText}>ORIGIN</Text>
                        <Text style={styles.greetingText}>Mantenha-se Forte, {userProfile?.name?.split(' ')[0] || 'Guerreiro'}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.iconBtn}>
                    <MaterialCommunityIcons name="bell-outline" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1, overflow: 'hidden' }}>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* No Contact Tracker */}
                    <View style={[styles.glassCard, styles.czSection, styles.cyanGlow]}>
                        <View style={styles.czHeader}>
                            <MaterialCommunityIcons name="security" size={16} color={colors.primary} />
                            <Text style={styles.czLabel}>CONTROLE DE CONTATO ZERO</Text>
                        </View>
                        <View style={styles.czValueRow}>
                            <Text style={styles.czValue}>{czDays}</Text>
                            <Text style={styles.czUnit}>DIAS</Text>
                        </View>
                        <Text style={styles.czMessage}>Você está recuperando seu espaço mental. Continue firme.</Text>
                        <View style={styles.czActions}>
                            <TouchableOpacity style={styles.primaryBtn} onPress={handleCheckIn}>
                                <Text style={styles.primaryBtnText}>Check-in</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('CheckinHistory')}>
                                <Text style={styles.secondaryBtnText}>Histórico</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.czProgressBottom} />
                    </View>

                    {/* Mission Gallery */}
                    <View style={styles.missionGallerySection}>
                        {/* Section header */}
                        <View style={styles.missionGalleryHeader}>
                            <View>
                                <Text style={styles.missionGalleryTitle}>Missões do Dia</Text>
                                <Text style={styles.missionGalleryMeta}>
                                    {allDoneToday ? 'Todas concluídas!' : `${todayDone} de ${todayTotal} concluídas`}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('Missoes')} style={styles.missionSeeAll}>
                                <Text style={styles.seeAllText}>Ver Todas</Text>
                                <MaterialCommunityIcons name="arrow-right" size={13} color="#475569" />
                            </TouchableOpacity>
                        </View>

                        {/* Horizontal gallery */}
                        {allDoneToday ? (
                            <View style={styles.allDoneCard}>
                                <MaterialCommunityIcons name="trophy" size={40} color="#fbbf24" />
                                <Text style={styles.allDoneTitle}>Dia Conquistado!</Text>
                                <Text style={styles.allDoneSub}>Todas as missões de hoje foram concluídas. A disciplina é construida dia a dia.</Text>
                                <TouchableOpacity style={styles.allDoneBtn} onPress={() => navigation.navigate('Diario')}>
                                    <Text style={styles.allDoneBtnText}>Registar no Diário</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <FlatList
                                data={galleryMissions}
                                horizontal
                                pagingEnabled={false}
                                showsHorizontalScrollIndicator={false}
                                snapToInterval={width - 84}
                                snapToAlignment="start"
                                disableIntervalMomentum={true}
                                decelerationRate="fast"
                                contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => {
                                    const done = completedIds.includes(item.id);
                                    const theme = MISSION_THEME[item.category] || MISSION_THEME.stoic;
                                    return (
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            style={[styles.missionGalleryCard, { width: width - 96 }]}
                                            onPress={() => { setSelectedDashMission(item); setShowMissionDetail(true); }}
                                        >
                                            {/* Visual header */}
                                            <View style={[styles.missionCardVisual, { backgroundColor: '#0f1318' }]}>
                                                <Image source={{ uri: item.image || theme.image }} style={styles.missionCardBgImage} resizeMode="cover" />
                                                <View style={[styles.missionCardVisualOverlay, { backgroundColor: theme.bg || '#000', opacity: 0.15 }]} />
                                                <View style={[styles.missionCardVisualOverlay, { backgroundColor: '#000000', opacity: 0.4 }]} />
                                                <MaterialCommunityIcons
                                                    name={theme.icon}
                                                    size={48}
                                                    color={theme.accent + '55'}
                                                    style={styles.missionCardBgIcon}
                                                />
                                                {done ? (
                                                    <View style={[styles.missionDonePill, { backgroundColor: 'rgba(34,197,94,0.9)' }]}>
                                                        <MaterialCommunityIcons name="check-decagram" size={13} color="#fff" />
                                                        <Text style={[styles.missionDonePillText, { color: '#fff' }]}>CONCLUÍDA</Text>
                                                    </View>
                                                ) : (
                                                    <View style={[styles.missionActivePill, { backgroundColor: theme.accent }]}>
                                                        <MaterialCommunityIcons name="lightning-bolt" size={11} color="#120f0b" />
                                                        <Text style={[styles.missionActivePillText, { color: '#120f0b' }]}>ATIVO AGORA</Text>
                                                    </View>
                                                )}
                                                <View style={[styles.missionCardCategoryBar, { backgroundColor: theme.accent }]} />
                                            </View>

                                            {/* Content */}
                                            <View style={styles.missionCardBody}>
                                                <View style={styles.missionCardMeta}>
                                                    <Text style={[styles.missionCardCat, { color: theme.accent }]}>
                                                        {theme.label} · {item.difficulty?.toUpperCase()}
                                                    </Text>
                                                    <Text style={styles.missionCardDuration}>{item.duration}</Text>
                                                </View>
                                                <Text style={[styles.missionCardTitle, done && styles.missionTitleDoneGallery]}>
                                                    {item.title}
                                                </Text>
                                                <Text style={styles.missionCardDesc} numberOfLines={2}>
                                                    {item.science_fact}
                                                </Text>
                                                <View style={[styles.missionExecBtn, done && styles.missionExecBtnDone, { borderColor: done ? '#22c55e44' : theme.accent + '66' }]}>
                                                    <MaterialCommunityIcons
                                                        name={done ? 'check-decagram' : 'lightning-bolt'}
                                                        size={14}
                                                        color={done ? '#22c55e' : theme.accent}
                                                    />
                                                    <Text style={[styles.missionExecText, { color: done ? '#22c55e' : theme.accent }]}>
                                                        {done ? 'CONCLUÍDA' : 'EXECUTAR'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        )}

                        {/* Progress dots */}
                        {!allDoneToday && (
                            <View style={styles.missionDots}>
                                {galleryMissions.map((m, i) => (
                                    <View
                                        key={m.id}
                                        style={[styles.missionDot, completedIds.includes(m.id) && styles.missionDotDone]}
                                    />
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Arsenal */}
                    <View style={styles.toolkitSection}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="lightning-bolt" size={20} color={colors.primary} />
                            <Text style={styles.sectionTitle}>Arsenal de Ferramentas</Text>
                        </View>
                        <View style={styles.toolkitGrid}>

                            {/* Biblioteca */}
                            <TouchableOpacity
                                style={[styles.glassCard, styles.toolkitItemLarge]}
                                onPress={() => navigation.navigate('Sessions')}
                                activeOpacity={0.85}
                            >
                                <View style={[styles.toolkitIconGlow, { backgroundColor: 'rgba(244, 63, 94, 0.08)' }]}>
                                    <View style={[styles.breathRing, { borderColor: '#f43f5e' }]}>
                                        <MaterialCommunityIcons name="headphones" size={20} color="#f43f5e" />
                                    </View>
                                </View>
                                <Text style={styles.toolkitItemTitle}>Biblioteca</Text>
                                <Text style={styles.toolkitItemSub}>Cursos & Áudios</Text>
                            </TouchableOpacity>

                            {/* Respiração */}
                            <TouchableOpacity
                                style={[styles.glassCard, styles.toolkitItemLarge]}
                                onPress={() => setShowBreathing(true)}
                                activeOpacity={0.85}
                            >
                                <View style={styles.toolkitIconGlow}>
                                    <View style={styles.breathRing}>
                                        <View style={styles.breathInner} />
                                    </View>
                                </View>
                                <Text style={styles.toolkitItemTitle}>Respiração</Text>
                                <Text style={styles.toolkitItemSub}>4 · 7 · 8</Text>
                            </TouchableOpacity>

                        </View>
                    </View>

                </ScrollView>
            </View>

            {/* === MISSION DETAIL MODAL === */}
            <Modal
                visible={showMissionDetail}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setShowMissionDetail(false);
                    setTimeout(() => setSelectedDashMission(null), 300);
                }}
            >
                <View style={styles.missionModalOverlay}>
                    <View style={styles.missionModalSheet}>
                        <View style={styles.dragBar} />
                        {selectedDashMission && (
                            <>
                                <View style={[styles.missionModalCatBadge, { backgroundColor: (MISSION_THEME[selectedDashMission.category]?.accent || '#00f2ff') + '22' }]}>
                                    <Text style={[styles.missionModalCatText, { color: MISSION_THEME[selectedDashMission.category]?.accent || '#00f2ff' }]}>
                                        {MISSION_THEME[selectedDashMission.category]?.label || 'MISSÃO'}
                                    </Text>
                                    <Text style={styles.missionModalCatDiff}>
                                        · {selectedDashMission.difficulty?.toUpperCase()}
                                    </Text>
                                </View>

                                <Text style={styles.missionModalTitle}>{selectedDashMission.title}</Text>
                                <Text style={styles.missionModalMeta}>{selectedDashMission.duration}</Text>

                                <View style={styles.missionModalSection}>
                                    <View style={styles.missionModalSectionHeader}>
                                        <MaterialCommunityIcons name="target" size={16} color={colors.primary} />
                                        <Text style={styles.missionModalSectionTitle}>O que fazer</Text>
                                    </View>
                                    <Text style={styles.missionModalSectionText}>{selectedDashMission.science_fact}</Text>
                                </View>

                                <View style={styles.missionModalSection}>
                                    <View style={styles.missionModalSectionHeader}>
                                        <MaterialCommunityIcons name="brain" size={16} color={colors.primary} />
                                        <Text style={styles.missionModalSectionTitle}>Porquê funciona</Text>
                                    </View>
                                    <Text style={styles.missionModalSectionText}>{selectedDashMission.logic}</Text>
                                </View>

                                <View style={styles.missionModalActions}>
                                    {completedIds.includes(selectedDashMission.id) ? (
                                        <View style={[styles.missionModalCompleteBtn, { backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: '#22c55e44' }]}>
                                            <MaterialCommunityIcons name="check-decagram" size={16} color="#22c55e" />
                                            <Text style={[styles.missionModalCompleteBtnText, { color: '#22c55e' }]}>MISSÃO CONCLUÍDA</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.missionModalCompleteBtn}
                                            onPress={async () => {
                                                await handleCompleteMission(selectedDashMission.id);
                                                setShowMissionDetail(false);
                                                setTimeout(() => setSelectedDashMission(null), 300);
                                            }}
                                        >
                                            <MaterialCommunityIcons name="check-decagram" size={16} color="#120f0b" />
                                            <Text style={styles.missionModalCompleteBtnText}>MARCAR COMO CONCLUÍDA</Text>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        style={styles.missionModalCancelBtn}
                                        onPress={() => {
                                            setShowMissionDetail(false);
                                            setTimeout(() => setSelectedDashMission(null), 300);
                                        }}
                                    >
                                        <Text style={styles.missionModalCancelBtnText}>Fechar Janela</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal >

            {/* === CHECK-IN MODAL === */}
            < Modal
                visible={showCheckin}
                animationType="slide"
                transparent={true}
                onRequestClose={() => closeCheckin()}
            >
                <View style={styles.checkinOverlay}>
                    <View style={styles.checkinSheet}>
                        <View style={styles.dragBar} />

                        {!checkinResult ? (
                            // Question stage
                            <View style={styles.checkinContent}>
                                <View style={styles.checkinIconBig}>
                                    <MaterialCommunityIcons name="shield-half-full" size={48} color={colors.primary} />
                                </View>
                                <Text style={styles.checkinQuestion}>
                                    Você se manteve firme no Contato Zero hoje?
                                </Text>
                                <Text style={styles.checkinSub}>
                                    Isso inclui não enviar mensagens, não ligar e não vigiar as redes sociais.
                                </Text>
                                <TouchableOpacity
                                    style={styles.checkinYes}
                                    onPress={() => submitCheckin(true)}
                                >
                                    <MaterialCommunityIcons name="check-bold" size={20} color="#120f0b" />
                                    <Text style={styles.checkinYesText}>SIM, MANTIVE O SILÊNCIO</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.checkinNo}
                                    onPress={() => submitCheckin(false)}
                                >
                                    <Text style={styles.checkinNoText}>Não consegui hoje...</Text>
                                </TouchableOpacity>
                            </View>
                        ) : checkinResult === 'success' ? (
                            // Success stage
                            <Animated.View style={[styles.checkinContent, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
                                <Text style={styles.resultEmoji}>🏆</Text>
                                <Text style={styles.resultTitle}>Excelente, Guerreiro!</Text>
                                <Text style={styles.resultSub}>
                                    O seu cérebro libertou dopamina saudável hoje. A sua sequência continua.
                                </Text>
                                <View style={styles.streakBadge}>
                                    <MaterialCommunityIcons name="fire" size={18} color={colors.primary} />
                                    <Text style={styles.streakText}>
                                        {(userProfile?.contactZero?.currentStreak || 0)} DIAS DE SEQUÊNCIA
                                    </Text>
                                </View>
                                <TouchableOpacity style={styles.checkinYes} onPress={() => closeCheckin()}>
                                    <Text style={styles.checkinYesText}>CONTINUAR</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ) : (
                            // Relapse stage
                            <Animated.View style={[styles.checkinContent, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
                                <Text style={styles.resultEmoji}>💪</Text>
                                <Text style={styles.resultTitle}>Isso acontece. Levanta.</Text>
                                <Text style={styles.resultSub}>
                                    A sequência foi reiniciada, mas a jornada não. Escreve o gatilho da recaída no Diário para neutralizar a ansiedade.
                                </Text>
                                <TouchableOpacity
                                    style={styles.checkinYes}
                                    onPress={() => closeCheckin(true)}
                                >
                                    <MaterialCommunityIcons name="book-open-outline" size={18} color="#120f0b" />
                                    <Text style={styles.checkinYesText}>IR AO DIÁRIO DA REALIDADE</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.checkinNo} onPress={() => closeCheckin()}>
                                    <Text style={styles.checkinNoText}>Fechar</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    </View>
                </View>
            </Modal >

            {/* === BREATHING MODAL === */}
            < Modal
                visible={showBreathing}
                animationType="fade"
                transparent={true}
                onRequestClose={() => {
                    clearInterval(breathTimerRef.current);
                    setBreathPhase('ready');
                    setBreathCount(0);
                    setBreathTimer(4);
                    breathAnim.setValue(1);
                    setShowBreathing(false);
                }}
            >
                <View style={styles.breathOverlay}>
                    <View style={styles.breathSheet}>

                        {/* Close */}
                        <TouchableOpacity
                            style={styles.breathClose}
                            onPress={() => {
                                clearInterval(breathTimerRef.current);
                                setBreathPhase('ready');
                                setBreathCount(0);
                                setBreathTimer(4);
                                breathAnim.setValue(1);
                                setShowBreathing(false);
                            }}
                        >
                            <MaterialCommunityIcons name="close" size={20} color="#475569" />
                        </TouchableOpacity>

                        <Text style={styles.breathTitle}>Respiração Estoica</Text>
                        <Text style={styles.breathSub}>Técnica 4-7-8 · Regula o sistema nervoso</Text>

                        {/* Breathing circle — tappable */}
                        <TouchableOpacity
                            style={styles.breathCircleArea}
                            onPress={handleBreathToggle}
                            activeOpacity={0.9}
                        >
                            <Animated.View style={[
                                styles.breathCircleOuter,
                                { transform: [{ scale: breathAnim }], opacity: breathAnim.interpolate({ inputRange: [1, 1.5], outputRange: [0.3, 0.7] }) }
                            ]} />
                            <Animated.View style={[
                                styles.breathCircleMid,
                                { transform: [{ scale: breathAnim.interpolate({ inputRange: [1, 1.5], outputRange: [1, 1.35] }) }] }
                            ]} />
                            <View style={styles.breathCircleCore}>
                                <Text style={styles.breathPhaseText}>
                                    {breathPhase === 'ready' ? '🪴' :
                                        breathPhase === 'inhale' ? breathTimer :
                                            breathPhase === 'hold' ? breathTimer :
                                                breathTimer}
                                </Text>
                                <Text style={styles.breathPhaseLabel}>
                                    {breathPhase === 'ready' ? 'Toca para começar' :
                                        breathPhase === 'inhale' ? 'INSPIRE' :
                                            breathPhase === 'hold' ? 'SEGURE' :
                                                'EXPIRE'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Session count */}
                        <View style={styles.breathStats}>
                            <Text style={styles.breathCycleCount}>{breathCount}</Text>
                            <Text style={styles.breathCycleLabel}>ciclos completos</Text>
                        </View>

                        {/* Guide text */}
                        <Text style={styles.breathGuide}>
                            {breathPhase === 'ready'
                                ? 'Senta-te confortavelmente. Costas direitas.\nResponde com o abdómen, não com o peito.'
                                : breathPhase === 'inhale'
                                    ? 'Inspira pelo nariz, enchendo o abdómen...'
                                    : breathPhase === 'hold'
                                        ? 'Segura a respiração. Mantém o corpo relaxado...'
                                        : 'Expira devagar pela boca. Solta tudo...'}
                        </Text>

                        {/* Start/Stop */}
                        <TouchableOpacity
                            style={styles.breathStartBtn}
                            onPress={handleBreathToggle}
                        >
                            <MaterialCommunityIcons
                                name={breathPhase === 'ready' ? 'play-circle' : 'stop-circle'}
                                size={20}
                                color={breathPhase === 'ready' ? colors.backgroundDark : '#ef4444'}
                            />
                            <Text style={[styles.breathStartText, breathPhase !== 'ready' && { color: '#ef4444' }]}>
                                {breathPhase === 'ready' ? 'Iniciar Sessão' : 'Parar'}
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal >

            {/* === BALANCE MODAL === */}
            < Modal
                visible={showBalance}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowBalance(false)}
            >
                <View style={styles.checkinOverlay}>
                    <View style={[styles.checkinSheet, { height: '90%' }]}>
                        <View style={styles.dragBar} />
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowBalance(false)}>
                            <MaterialCommunityIcons name="close" size={22} color="#475569" />
                        </TouchableOpacity>

                        <Text style={styles.balanceTitle}>Relatório de Equilíbrio</Text>
                        <Text style={styles.balanceSub}>A tua resiliência emocional hoje, baseada nos teus dados.</Text>

                        <ScrollView style={{ flex: 1, marginTop: 16 }} showsVerticalScrollIndicator={false}>
                            {[
                                {
                                    label: 'Resiliência',
                                    icon: 'shield-check-outline',
                                    color: '#22c55e',
                                    value: userProfile?.profile?.stabilityScore || 0,
                                    insight: (v) => v >= 70
                                        ? 'Estás sólido. O teu sistema nervoso está a aprender a suportar a pressão sem colapsar. Marco Aurélio chamaria isso de virtude.'
                                        : v >= 40
                                            ? 'Em reconstrução. A dor que sentes agora é o teu sistema nervoso a recalibrar. Não é fraqueza — é adaptação.'
                                            : 'Fase crítica. O teu córtex pré-frontal está sobrecarregado. Prioriza descanso e contato zero hoje.',
                                    action: 'Ver Missões de Ação',
                                    nav: () => navigation.navigate('Missoes'),
                                },
                                {
                                    label: 'Foco',
                                    icon: 'bullseye-arrow',
                                    color: '#fbbf24',
                                    value: userProfile?.profile?.structureScore || 0,
                                    insight: (v) => v >= 70
                                        ? 'A tua mente está estruturada. Consegues planejar e executar sem que a dor te desvie do caminho.'
                                        : v >= 40
                                            ? 'O foco oscila. O "loop mental" ainda consome largura de banda. O exercício de Matriz Estoica pode ajudar.'
                                            : 'A ruminação está no controlo. Cada pensamento na ex drena energia cognitiva. Faz a Matriz Estoica agora.',
                                    action: 'Abrir Matriz Estoica',
                                    nav: () => { setShowBalance(false); navigation.navigate('Diario'); },
                                },
                                {
                                    label: 'Humor',
                                    icon: 'emoticon-outline',
                                    color: '#818cf8',
                                    value: 80, // will come from mood tracker
                                    insight: (v) => v >= 70
                                        ? 'O teu humor está estável. Isso confirma que o trabalho que tens feito está a surtir efeito no plano químico do cérebro.'
                                        : v >= 40
                                            ? 'Humor variável. Normal nesta fase. Regista como te sentes agora no Check-in para acompanhar a tendência.'
                                            : 'Humor em baixo. A dopamina ainda busca o "estímulo" da ex. Substitui com uma ação positiva hoje.',
                                    action: 'Fazer Check-in de Humor',
                                    nav: () => { setShowBalance(false); navigation.navigate('Diario'); },
                                },
                                {
                                    label: 'Sono',
                                    icon: 'moon-waning-crescent',
                                    color: '#38bdf8',
                                    value: userProfile?.profile?.disciplineScore || 0,
                                    insight: (v) => v >= 70
                                        ? 'Disciplina de sono sólida. O sono é quando o hipocampo processa e arquiva as memórias emocionais — estás a ajudar o processo.'
                                        : v >= 40
                                            ? 'Sono irregular. O cortisol elevado do término interfere no sono REM. Reduz ecrãs à noite e tenta manter um horário fixo.'
                                            : 'Sono comprometido. Sem sono de qualidade, a regulação emocional falha. Esta é a tua prioridade número 1 hoje.',
                                    action: 'Missão de Higiene Digital',
                                    nav: () => { setShowBalance(false); navigation.navigate('Missoes'); },
                                },
                            ].map((dim) => {
                                const pct = Math.min(100, Math.max(0, dim.value));
                                return (
                                    <View key={dim.label} style={styles.balanceDimCard}>
                                        <View style={styles.balanceDimHeader}>
                                            <View style={[styles.balanceDimIcon, { backgroundColor: dim.color + '20' }]}>
                                                <MaterialCommunityIcons name={dim.icon} size={20} color={dim.color} />
                                            </View>
                                            <Text style={styles.balanceDimLabel}>{dim.label.toUpperCase()}</Text>
                                            <Text style={[styles.balanceDimScore, { color: dim.color }]}>{pct}%</Text>
                                        </View>
                                        <View style={styles.balanceBarBg}>
                                            <View style={[styles.balanceBarFill, { width: `${pct}%`, backgroundColor: dim.color }]} />
                                        </View>
                                        <Text style={styles.balanceInsight}>{dim.insight(pct)}</Text>
                                        <TouchableOpacity style={[styles.balanceAction, { borderColor: dim.color + '50' }]} onPress={dim.nav}>
                                            <Text style={[styles.balanceActionText, { color: dim.color }]}>{dim.action}</Text>
                                            <MaterialCommunityIcons name="arrow-right" size={14} color={dim.color} />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                            <View style={{ height: 32 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal >
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundDark,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundDark,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarBorder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'rgba(244, 157, 37, 0.3)',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    brandText: {
        color: colors.textSecondary,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
    },
    greetingText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(23, 28, 35, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    glassCard: {
        backgroundColor: 'rgba(23, 28, 35, 0.6)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        padding: 24,
    },
    czSection: {
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 24,
    },
    cyanGlow: {
        shadowColor: '#00f2ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    czHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    czLabel: {
        color: colors.textSecondary,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    czValueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    czValue: {
        color: '#fff',
        fontSize: 64,
        fontWeight: '900',
    },
    czUnit: {
        color: colors.primary,
        fontSize: 20,
        fontWeight: '800',
    },
    czMessage: {
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: 8,
        lineHeight: 20,
        maxWidth: '70%',
    },
    czActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    primaryBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    primaryBtnText: {
        color: colors.backgroundDark,
        fontSize: 13,
        fontWeight: '800',
    },
    secondaryBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'rgba(23, 28, 35, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    secondaryBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '800',
    },
    czProgressBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: 2,
        width: '100%',
        backgroundColor: colors.primary,
        opacity: 0.5,
    },
    gridContainer: {
        flexDirection: 'column',
        gap: 16,
        marginBottom: 32,
    },
    gridItem: {
        padding: 20,
    },
    gridItemTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    gridItemSub: {
        color: colors.textSecondary,
        fontSize: 10,
        fontWeight: '600',
    },
    radarWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    radarLabel: {
        position: 'absolute',
        color: '#475569',
        fontSize: 8,
        fontWeight: '900',
        width: 40,
        textAlign: 'center',
    },
    stoicBorder: {
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    stoicHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stoicBadge: {
        backgroundColor: 'rgba(244, 157, 37, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    stoicBadgeText: {
        color: colors.primary,
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
    },
    missionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        marginTop: 12,
    },
    missionQuote: {
        color: colors.textSecondary,
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 4,
        lineHeight: 18,
    },
    audioPlayer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'rgba(23, 28, 35, 0.8)',
        padding: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginTop: 16,
    },
    playBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    audioTrack: {
        flex: 1,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
    },
    audioProgress: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 2,
    },
    completeBtn: {
        width: '100%',
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(244, 157, 37, 0.4)',
        alignItems: 'center',
        marginTop: 16,
    },
    completeBtnText: {
        color: colors.primary,
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
    },
    toolkitSection: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    toolkitGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    toolkitItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
    },
    toolIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolLabel: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },

    // ---- Check-in Modal ----
    checkinOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    checkinSheet: {
        backgroundColor: '#0d1218',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 28,
        paddingBottom: 48,
        borderTopWidth: 1,
        borderColor: 'rgba(0,242,255,0.15)',
    },
    dragBar: { width: 40, height: 4, backgroundColor: '#334155', borderRadius: 2, alignSelf: 'center', marginBottom: 28 },
    checkinContent: { alignItems: 'center', gap: 12 },
    checkinIconBig: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 8,
    },
    checkinQuestion: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', lineHeight: 30 },
    checkinSub: { color: '#64748b', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 8 },
    checkinYes: {
        backgroundColor: colors.primary,
        height: 54,
        borderRadius: 27,
        paddingHorizontal: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        marginTop: 8,
    },
    checkinYesText: { color: '#120f0b', fontSize: 15, fontWeight: '900' },
    checkinNo: { paddingVertical: 14, alignItems: 'center', width: '100%' },
    checkinNoText: { color: '#64748b', fontSize: 14 },
    resultEmoji: { fontSize: 56, marginBottom: 4 },
    resultTitle: { color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center' },
    resultSub: { color: '#64748b', fontSize: 13, textAlign: 'center', lineHeight: 20 },
    streakBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1, borderColor: colors.primary + '40',
    },
    streakText: { color: colors.primary, fontSize: 13, fontWeight: '900' },

    // ---- Card Tap Hint ----
    cardTapHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    closeBtn: { position: 'absolute', top: 16, right: 20, padding: 4 },

    // ---- Balance Modal ----
    balanceTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginBottom: 4 },
    balanceSub: { color: '#64748b', fontSize: 12, lineHeight: 18 },
    balanceDimCard: {
        backgroundColor: '#0f1722',
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
    },
    balanceDimHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
    balanceDimIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    balanceDimLabel: { flex: 1, color: '#94a3b8', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    balanceDimScore: { fontSize: 20, fontWeight: '900' },
    balanceBarBg: { height: 6, backgroundColor: '#1e293b', borderRadius: 3, marginBottom: 14 },
    balanceBarFill: { height: 6, borderRadius: 3 },
    balanceInsight: { color: '#64748b', fontSize: 12, lineHeight: 19, marginBottom: 14 },
    balanceAction: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        borderWidth: 1, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16,
    },
    balanceActionText: { fontSize: 12, fontWeight: '800' },

    // ---- Mission of the Day Card ----
    missionBorderDone: { borderColor: 'rgba(34,197,94,0.3)' },
    missionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    missionCategoryChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
    missionCategoryText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
    missionProgressText: { color: '#334155', fontSize: 11, fontWeight: '700' },
    missionProgressBar: { height: 3, backgroundColor: '#1e293b', borderRadius: 2, marginBottom: 14 },
    missionProgressFill: { height: 3, borderRadius: 2 },
    missionTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
    missionTitleDone: { color: '#475569', textDecorationLine: 'line-through' },
    difficultyBadge: { backgroundColor: '#1e293b', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, marginTop: 2 },
    difficultyText: { color: '#475569', fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
    missionActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
    completeBtnDone: { borderColor: '#22c55e33', backgroundColor: '#22c55e11' },
    seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 10, paddingHorizontal: 4 },
    seeAllText: { color: '#475569', fontSize: 11, fontWeight: '600' },

    // ---- Arsenal toolkit cards ----
    toolkitItemLarge: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 12,
        gap: 10,
        minHeight: 140,
        justifyContent: 'center',
    },
    toolkitIconGlow: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(0,242,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    breathRing: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    breathInner: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: colors.primary + '55',
    },
    toolkitItemTitle: { color: '#e2e8f0', fontSize: 13, fontWeight: '700', textAlign: 'center' },
    toolkitItemSub: { color: '#475569', fontSize: 10, fontWeight: '600', textAlign: 'center' },

    // ---- Breathing Modal ----
    breathOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    breathSheet: {
        backgroundColor: '#0f1318',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 32,
        paddingHorizontal: 28,
        paddingBottom: 48,
        borderTopWidth: 1,
        borderColor: 'rgba(0,242,255,0.15)',
        alignItems: 'center',
    },
    breathClose: {
        position: 'absolute',
        top: 20,
        right: 20,
        padding: 8,
    },
    breathTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 6,
        textAlign: 'center',
    },
    breathSub: {
        color: '#475569',
        fontSize: 12,
        marginBottom: 36,
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    breathCircleArea: {
        width: 220,
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 28,
    },
    breathCircleOuter: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: colors.primary,
    },
    breathCircleMid: {
        position: 'absolute',
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: colors.primary + '33',
        borderWidth: 1,
        borderColor: colors.primary + '55',
    },
    breathCircleCore: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#0f1318',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.primary + '44',
    },
    breathPhaseText: {
        color: colors.primary,
        fontSize: 36,
        fontWeight: '900',
        lineHeight: 42,
    },
    breathPhaseLabel: {
        color: '#64748b',
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 2,
        marginTop: 2,
    },
    breathStats: {
        alignItems: 'center',
        marginBottom: 16,
    },
    breathCycleCount: {
        color: colors.primary,
        fontSize: 42,
        fontWeight: '900',
        lineHeight: 46,
    },
    breathCycleLabel: {
        color: '#334155',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    breathGuide: {
        color: '#475569',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
        paddingHorizontal: 8,
    },
    breathStartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
    },
    breathStartText: {
        color: colors.backgroundDark,
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.5,
    },

    // ---- Mission Gallery ----
    missionGallerySection: {
        marginTop: 24,
    },
    missionGalleryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    missionGalleryTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    missionGalleryMeta: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    missionSeeAll: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    missionGalleryCard: {
        backgroundColor: colors.backgroundLight,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    toolkitGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    missionCardVisual: {
        height: 100,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    missionCardBgImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    missionCardVisualOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.85,
    },
    missionCardBgIcon: {
        position: 'absolute',
        opacity: 0.15,
        transform: [{ scale: 1.2 }],
    },
    missionActivePill: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        zIndex: 10,
    },
    missionActivePillText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
    },
    missionDonePill: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        zIndex: 10,
    },
    missionDonePillText: {
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1,
    },
    missionCardCategoryBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
    },
    missionCardBody: {
        padding: 16,
    },
    missionCardMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    missionCardCat: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    missionCardDuration: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: '700',
    },
    missionCardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 8,
        lineHeight: 22,
    },
    missionTitleDoneGallery: {
        textDecorationLine: 'line-through',
        color: '#94a3b8',
    },
    missionCardDesc: {
        color: '#94a3b8',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 16,
    },
    missionExecBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    missionExecBtnDone: {
        backgroundColor: 'rgba(34,197,94,0.05)',
        borderColor: 'rgba(34,197,94,0.2)',
    },
    missionExecText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    missionDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: 16,
    },
    missionDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#334155',
    },
    missionDotDone: {
        backgroundColor: colors.primary,
        width: 16,
    },
    allDoneCard: {
        backgroundColor: 'rgba(34,197,94,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(34,197,94,0.2)',
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 24,
        alignItems: 'center',
    },
    allDoneTitle: {
        color: '#22c55e',
        fontSize: 18,
        fontWeight: '900',
        marginTop: 12,
        marginBottom: 8,
    },
    allDoneSub: {
        color: '#94a3b8',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    allDoneBtn: {
        backgroundColor: '#22c55e',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    allDoneBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '800',
    },

    // ---- Mission Detail Modal ----
    missionModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    missionModalSheet: {
        backgroundColor: colors.backgroundLight,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        maxHeight: '90%',
    },
    missionModalCatBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 16,
    },
    missionModalCatText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    missionModalCatDiff: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: '700',
    },
    missionModalTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 4,
    },
    missionModalMeta: {
        color: '#64748b',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 24,
    },
    missionModalSection: {
        backgroundColor: '#161920',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    missionModalSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    missionModalSectionTitle: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    missionModalSectionText: {
        color: '#e2e8f0',
        fontSize: 15,
        lineHeight: 22,
    },
    missionModalActions: {
        marginTop: 16,
        gap: 12,
    },
    missionModalCompleteBtn: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    missionModalCompleteBtnText: {
        color: '#120f0b',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    missionModalCancelBtn: {
        padding: 14,
        alignItems: 'center',
    },
    missionModalCancelBtnText: {
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '700',
    },
});

export default Dashboard;
