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
import {
    doc, onSnapshot, updateDoc, serverTimestamp, setDoc, arrayUnion, arrayUnion as fArrayUnion,
    query, collection, where, orderBy, limit, getDocs
} from 'firebase/firestore';
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
    const [showSOSModal, setShowSOSModal] = useState(false);
    const [sosTimer, setSosTimer] = useState(300); // 5 minutes
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [breathingPhase, setBreathingPhase] = useState('Pronto?'); // Box breathing phase
    const [breathingAnim] = useState(new Animated.Value(1));
    const [timeUntilMidnight, setTimeUntilMidnight] = useState('');

    // SOS Quiz State
    const [currentSosQuizStep, setCurrentSosQuizStep] = useState(0);
    const [sosQuizAnswers, setSosQuizAnswers] = useState([]);
    const [showSosQuizFeedback, setShowSosQuizFeedback] = useState(false);

    const SOS_QUIZ_QUESTIONS = [
        {
            question: "O que está a motivar este impulso agora?",
            options: [
                { label: "FACTOS REAIS", isPositive: true },
                { label: "CARÊNCIA", isPositive: false }
            ]
        },
        {
            question: "Entrar em contacto vai resolver algo a longo prazo?",
            options: [
                { label: "SIM, RESOLVE", isPositive: false },
                { label: "NÃO, SÓ PIORA", isPositive: true }
            ]
        },
        {
            question: "Estás disposto(a) a perder o teu progresso de reconstrução?",
            options: [
                { label: "SIM, DESISTO", isPositive: false },
                { label: "NÃO, MANTENHO", isPositive: true }
            ]
        },
        {
            question: "O silêncio é a tua melhor proteção neste momento?",
            options: [
                { label: "NÃO, EXPOSTO", isPositive: false },
                { label: "SIM, PROTEGE", isPositive: true }
            ]
        },
        {
            question: "Consegues aguentar o desconforto até o fim do timer?",
            options: [
                { label: "NÃO, VOU CEDER", isPositive: false },
                { label: "SIM, CONSIGO", isPositive: true }
            ]
        }
    ];

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

    // SOS Timer Logic
    useEffect(() => {
        let interval;
        if (isTimerActive && sosTimer > 0) {
            interval = setInterval(() => {
                setSosTimer(prev => prev - 1);
            }, 1000);
        } else if (sosTimer === 0) {
            setIsTimerActive(false);
            // Alert omitted to avoid web-crash if Alert is not imported, using console instead or just stopping
        }
        return () => clearInterval(interval);
    }, [isTimerActive, sosTimer]);

    // SOS Breathing Animation
    const startBreathing = () => {
        const sequence = Animated.sequence([
            Animated.timing(breathingAnim, { toValue: 1.5, duration: 4000, useNativeDriver: true }),
            Animated.delay(4000),
            Animated.timing(breathingAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
            Animated.delay(4000),
        ]);

        const phases = ['Inspira...', 'Retém...', 'Expira...', 'Retém...'];
        let phaseIdx = 0;
        setBreathingPhase(phases[0]);

        const phaseInterval = setInterval(() => {
            phaseIdx = (phaseIdx + 1) % 4;
            setBreathingPhase(phases[phaseIdx]);
        }, 4000);

        Animated.loop(sequence).start();

        return () => {
            clearInterval(phaseInterval);
            Animated.loop(sequence).stop();
            breathingAnim.setValue(1);
            setBreathingPhase('Pronto?');
        };
    };

    // Quiz Logic
    const handleQuizAnswer = (answer) => {
        const updatedAnswers = [...sosQuizAnswers, answer];
        setSosQuizAnswers(updatedAnswers);

        if (currentSosQuizStep < SOS_QUIZ_QUESTIONS.length - 1) {
            setCurrentSosQuizStep(currentSosQuizStep + 1);
        } else {
            setShowSosQuizFeedback(true);
        }
    };

    // Cleanup SOS on close
    useEffect(() => {
        if (!showSOSModal) {
            setIsTimerActive(false);
            setSosTimer(300);
            breathingAnim.stopAnimation();
            breathingAnim.setValue(1);
            setBreathingPhase('Pronto?');

            // Reset Quiz
            setCurrentSosQuizStep(0);
            setSosQuizAnswers([]);
            setShowSosQuizFeedback(false);
        }
    }, [showSOSModal]);

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

    // Calculate time until next day (midnight)
    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0);

            const diffMs = tomorrow - now;
            const h = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diffMs % (1000 * 60)) / 1000);

            const padded = (num) => num.toString().padStart(2, '0');
            setTimeUntilMidnight(`${padded(h)}:${padded(m)}:${padded(s)}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    const alreadyCheckedInToday = React.useMemo(() => {
        if (!userProfile?.contactZero?.history) return false;
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        return userProfile.contactZero.history.some(entry => entry.date === todayStr);
    }, [userProfile?.contactZero?.history]);

    const isFirstCheckin = !userProfile?.contactZero?.history || userProfile.contactZero.history.length === 0;

    const handleCheckIn = () => {
        setCheckinResult(null);
        setShowCheckin(true);
    };

    const submitCheckin = async (didHold) => {
        const user = auth.currentUser;
        if (!user) return;

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const userRef = doc(db, 'users', user.uid);
        const historyEntry = { date: todayStr, success: didHold };

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

    // Visual theme per category
    const MISSION_THEME = {
        detox: { bg: '#1a0510', accent: '#f43f5e', icon: 'shield-lock', label: 'DESINTOXICAÇÃO', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop' },
        action: { bg: '#051a05', accent: '#22c55e', icon: 'lightning-bolt', label: 'AÇÃO & CORPO', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop' },
        stoic: { bg: '#050f1a', accent: '#3b82f6', icon: 'head-heart', label: 'MENTE ESTOICA', image: 'https://images.unsplash.com/photo-1505664159854-2326119c8152?q=80&w=600&auto=format&fit=crop' },
        identity: { bg: '#10051a', accent: '#a855f7', icon: 'compass-outline', label: 'AUTOEXPANSÃO', image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=600&auto=format&fit=crop' },
    };

    const czDays = userProfile?.contactZero?.currentStreak || 0;

    const galleryMissions = React.useMemo(() => {
        if (!dailyPlan?.tasks) return [];
        return dailyPlan.tasks.map(t => {
            const libMatch = MISSIONS_LIBRARY.find(lib => lib.id === t.id);
            if (libMatch) return { ...libMatch, ...t };

            // Fallback for system tasks
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
    }, [dailyPlan?.tasks, czDays, completedIds]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const toolkitItems = [
        { id: 'biblioteca', title: 'Biblioteca', sub: 'Cursos & Áudios', icon: 'headphones', color: '#f43f5e', required: 0, onPress: () => navigation.navigate('Sessions') },
        { id: 'respiracao', title: 'Respiração', sub: '4 · 7 · 8', icon: 'lungs', color: colors.primary, required: 0, onPress: () => setShowBreathing(true) },
        {
            id: 'sos',
            title: 'Protocolo SOS',
            sub: 'Impulsionador de Emergência',
            icon: 'alert-octagon',
            color: '#ef4444',
            required: 0,
            onPress: () => {
                setShowSOSModal(true);
            }
        },
        { id: 'realidade', title: 'Realidade', sub: 'Quebra-Vínculo', icon: 'eye-off-outline', color: '#8b5cf6', required: 3, onPress: () => navigation.navigate('Diario') },
        { id: 'estoica', title: 'Matriz Estoica', sub: 'Controle Real', icon: 'scale-balance', color: '#3b82f6', required: 7, onPress: () => alert('Matriz Estoica Desbloqueada!') },
        { id: 'mandala', title: 'Bússola', sub: 'Autoexpansão', icon: 'compass-outline', color: '#a855f7', required: 14, onPress: () => alert('Bússola de Autoexpansão Desbloqueada!') }
    ];

    const completedIds = userProfile?.completed_missions || [];
    const activeMission = galleryMissions.find(m => !completedIds.includes(m.id)) || galleryMissions[0];
    const todayDone = galleryMissions.filter(m => completedIds.includes(m.id)).length;
    const todayTotal = Math.max(galleryMissions.length, 1);
    const allDoneToday = todayDone === todayTotal && galleryMissions.length > 0;


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
                            {alreadyCheckedInToday ? (
                                <View style={[styles.primaryBtn, { backgroundColor: '#1e293b', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
                                    <Text style={[styles.primaryBtnText, { color: '#64748b' }]}>{timeUntilMidnight}</Text>
                                    <MaterialCommunityIcons name="timer-sand" size={16} color="#64748b" style={{ marginLeft: 6 }} />
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.primaryBtn} onPress={handleCheckIn}>
                                    <Text style={styles.primaryBtnText}>
                                        {isFirstCheckin ? 'Iniciar Contato Zero' : 'Check-in de Hoje'}
                                    </Text>
                                </TouchableOpacity>
                            )}
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
                            <View style={styles.toolkitHeaderLeft}>
                                <MaterialCommunityIcons name="clipboard-list-outline" size={20} color="#fbbf24" style={{ marginRight: 8 }} />
                                <View>
                                    <Text style={styles.missionGalleryTitle}>Missões do Dia</Text>
                                    <Text style={styles.missionGalleryMeta}>
                                        {allDoneToday ? 'Todas concluídas!' : `${todayDone} de ${todayTotal} concluídas`}
                                    </Text>
                                </View>
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
                                snapToInterval={width * 0.85 + 12}
                                snapToAlignment="start"
                                disableIntervalMomentum={true}
                                decelerationRate="fast"
                                contentContainerStyle={{
                                    paddingHorizontal: 0, // Removed double padding (scrollContent already has 24px)
                                    gap: 12,
                                    paddingBottom: 20
                                }}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => {
                                    const done = completedIds.includes(item.id);
                                    const isLocked = czDays < (item.requiredDays || 0);
                                    const theme = MISSION_THEME[item.category] || MISSION_THEME.stoic;

                                    return (
                                        <TouchableOpacity
                                            activeOpacity={isLocked ? 1 : 0.9}
                                            style={[
                                                styles.missionGalleryCard,
                                                { width: width * 0.85, flexDirection: 'row' },
                                                isLocked && { opacity: 0.6 }
                                            ]}
                                            onPress={() => {
                                                if (isLocked) return;
                                                setSelectedDashMission(item);
                                                setShowMissionDetail(true);
                                            }}
                                        >
                                            {/* Vertical Accent Bar */}
                                            <View style={[styles.missionVerticalBar, { backgroundColor: isLocked ? '#475569' : theme.accent }]} />

                                            <View style={{ flex: 1 }}>
                                                <View style={styles.missionCardBody}>
                                                    <View style={styles.missionCardMeta}>
                                                        <Text style={[styles.missionCardCat, { color: isLocked ? '#475569' : theme.accent }]}>
                                                            {isLocked ? 'BLOQUEADO' : `${theme.label} · ${(item.difficulty || 'Normal').toUpperCase()}`}
                                                        </Text>

                                                        <View style={styles.missionMetaRight}>
                                                            <Text style={styles.missionCardDuration}>{item.duration}</Text>
                                                            {done ? (
                                                                <View style={[styles.missionStatusPill, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
                                                                    <MaterialCommunityIcons name="check-decagram" size={10} color="#22c55e" />
                                                                    <Text style={[styles.missionStatusPillText, { color: '#22c55e' }]}>V</Text>
                                                                </View>
                                                            ) : !isLocked && (
                                                                <View style={[styles.missionStatusPill, { backgroundColor: theme.accent + '22' }]}>
                                                                    <MaterialCommunityIcons name="lightning-bolt" size={9} color={theme.accent} />
                                                                </View>
                                                            )}
                                                        </View>
                                                    </View>

                                                    <Text style={[styles.missionCardTitleLarge, done && styles.missionTitleDoneGallery, isLocked && { color: '#64748b' }]}>
                                                        {isLocked ? 'Missão Bloqueada' : item.title}
                                                    </Text>

                                                    <Text style={styles.missionCardDescLarge} numberOfLines={3}>
                                                        {isLocked ? `Conclui ${item.requiredDays} dias de Contato Zero para libertar esta missão.` : item.science_fact}
                                                    </Text>

                                                    <View style={[
                                                        styles.missionFooterBtn,
                                                        done && styles.missionFooterBtnDone,
                                                        { borderColor: isLocked ? '#334155' : (done ? '#22c55e44' : theme.accent + '44') }
                                                    ]}>
                                                        <MaterialCommunityIcons
                                                            name={isLocked ? 'lock' : (done ? 'check-decagram' : 'play-circle')}
                                                            size={16}
                                                            color={isLocked ? '#475569' : (done ? '#22c55e' : theme.accent)}
                                                        />
                                                        <Text style={[styles.missionFooterBtnText, { color: isLocked ? '#475569' : (done ? '#22c55e' : theme.accent) }]}>
                                                            {isLocked ? `DESBLOQUEIA NO DIA ${item.requiredDays}` : (done ? 'CONCLUÍDA' : 'EXECUTAR MISSÃO')}
                                                        </Text>
                                                    </View>
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

                    {/* Toolkit Section */}

                    {/* Arsenal de Mindset Section */}
                    <View style={styles.toolkitSection}>
                        <View style={styles.toolkitHeader}>
                            <View style={styles.toolkitHeaderLeft}>
                                <MaterialCommunityIcons name="head-cog-outline" size={20} color="#fbbf24" style={{ marginRight: 8 }} />
                                <View>
                                    <Text style={styles.missionGalleryTitle}>Arsenal de Mindset</Text>
                                    <Text style={styles.missionGalleryMeta}>Evolui com a tua disciplina</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.toolkitGrid}>
                            {toolkitItems.map(item => {
                                const isLocked = czDays < item.required;
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[styles.toolkitItemPill, isLocked && styles.toolkitLocked]}
                                        onPress={isLocked ? null : item.onPress}
                                        activeOpacity={isLocked ? 1 : 0.85}
                                    >
                                        <View style={styles.toolkitPillTop}>
                                            <View style={[styles.toolkitIconCircle, { backgroundColor: isLocked ? '#1e293b' : (item.color + '22') }]}>
                                                <MaterialCommunityIcons
                                                    name={isLocked ? "lock" : item.icon}
                                                    size={14}
                                                    color={isLocked ? "#475569" : item.color}
                                                />
                                            </View>
                                            <Text style={[styles.toolkitItemTitlePill, isLocked && { color: '#475569' }]} numberOfLines={1}>
                                                {item.title}
                                            </Text>
                                        </View>

                                        <Text style={[styles.toolkitItemSubPill, isLocked && { color: '#334155' }]} numberOfLines={1}>
                                            {isLocked ? `Liberta no Dia ${item.required}` : item.sub}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                </ScrollView>
            </View>

            {/* SOS EMERGENCY MODAL */}
            <Modal
                visible={showSOSModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowSOSModal(false)}
            >
                <View style={[styles.sosOverlay, { backgroundColor: 'rgba(5, 5, 5, 0.98)' }]}>
                    <SafeAreaView style={styles.sosContainer}>
                        {/* Header */}
                        <View style={styles.sosHeaderDesign}>
                            <View style={styles.sosHeaderLeft}>
                                <View style={styles.sosHeaderIconPulse}>
                                    <MaterialCommunityIcons name="alert" size={28} color="#FF4B4B" />
                                </View>
                                <Text style={styles.sosHeaderTitle}>PROTOCOLO DE EMERGÊNCIA</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.sosHeaderClose}
                                onPress={() => setShowSOSModal(false)}
                            >
                                <MaterialCommunityIcons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.sosProgressBar}>
                            <View style={[styles.sosProgressStep, { backgroundColor: '#FF4B4B' }]} />
                            <View style={[styles.sosProgressStep, { backgroundColor: '#1A1A1A' }]} />
                            <View style={[styles.sosProgressStep, { backgroundColor: '#1A1A1A' }]} />
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                            {/* Phase 1: Physiological Reset */}
                            <View style={styles.sosSectionDesign}>
                                <View style={styles.sosSectionLabelRow}>
                                    <Text style={styles.sosSectionBadge}>Fase 1</Text>
                                    <Text style={styles.sosSectionTitleDesign}>Reset Fisiológico</Text>
                                </View>
                                <View style={styles.sosGlassCardDesign}>
                                    <View style={styles.sosBreathingCenter}>
                                        <View style={styles.sosBreathingPulse} />
                                        <TouchableOpacity
                                            style={styles.sosBreathingCircleDesign}
                                            activeOpacity={0.9}
                                            onPress={startBreathing}
                                        >
                                            <Animated.View style={{ transform: [{ scale: breathingAnim }], alignItems: 'center' }}>
                                                <Text style={styles.sosOriginLabel}>ORIGIN</Text>
                                                <Text style={styles.sosBreathingText}>{breathingPhase.toUpperCase()}</Text>
                                            </Animated.View>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.sosSectionHint}>Sincronize sua respiração com o círculo para baixar o cortisol.</Text>
                                    <TouchableOpacity
                                        style={styles.sosPrimaryBtn}
                                        onPress={startBreathing}
                                    >
                                        <MaterialCommunityIcons name="air-filter" size={20} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={styles.sosPrimaryBtnText}>INICIAR RESPIRAÇÃO GUIADA</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Phase 2: Reality Quiz */}
                            <View style={styles.sosSectionDesign}>
                                <View style={styles.sosSectionLabelRow}>
                                    <Text style={[styles.sosSectionBadge, { color: '#FFB347' }]}>Fase 2</Text>
                                    <Text style={styles.sosSectionTitleDesign}>Reality Quiz</Text>
                                </View>

                                {!showSosQuizFeedback ? (
                                    <View style={styles.sosAmberCard}>
                                        <Text style={styles.sosQuizProgress}>Pergunta {currentSosQuizStep + 1} de 5</Text>
                                        <Text style={styles.sosQuizQuestion}>{SOS_QUIZ_QUESTIONS[currentSosQuizStep].question}</Text>
                                        <View style={styles.sosQuizOptions}>
                                            {SOS_QUIZ_QUESTIONS[currentSosQuizStep].options.map((opt, idx) => (
                                                <TouchableOpacity
                                                    key={idx}
                                                    style={[styles.sosQuizBtn, { borderColor: opt.isPositive ? '#FFB347' : '#94a3b8' }]}
                                                    onPress={() => handleQuizAnswer(opt.isPositive)}
                                                >
                                                    <Text style={[styles.sosQuizBtnText, { color: opt.isPositive ? '#FFB347' : '#94a3b8' }]}>{opt.label}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                ) : (
                                    <View style={[styles.sosAmberCard, { backgroundColor: '#FFB34722' }]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                            <MaterialCommunityIcons
                                                name={sosQuizAnswers.filter(a => a).length >= 3 ? "shield-check" : "weather-fog"}
                                                size={24}
                                                color="#FFB347"
                                            />
                                            <Text style={styles.sosFeedbackTitle}>
                                                {sosQuizAnswers.filter(a => a).length >= 3 ? "FORTALEZA MENTAL" : "NEBLINA DE IMPULSO"}
                                            </Text>
                                        </View>
                                        <Text style={styles.sosFeedbackText}>
                                            {sosQuizAnswers.filter(a => a).length >= 3
                                                ? "Estás no controle. O teu lado racional está a vencer a batalha contra o impulso carência. Mantém o silêncio."
                                                : "O teu cérebro está a tentar enganar-te. Respira fundo mais 4 vezes antes de tomar qualquer decisão."}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.sosQuizRetry}
                                            onPress={() => {
                                                setCurrentSosQuizStep(0);
                                                setSosQuizAnswers([]);
                                                setShowSosQuizFeedback(false);
                                            }}
                                        >
                                            <Text style={styles.sosQuizRetryText}>REPETIR QUIZ</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            {/* Phase 3: 5-Minute Rule */}
                            <View style={styles.sosSectionDesign}>
                                <View style={styles.sosSectionLabelRow}>
                                    <Text style={styles.sosSectionBadge}>Fase 3</Text>
                                    <Text style={styles.sosSectionTitleDesign}>A Regra dos 5 Minutos</Text>
                                </View>
                                <View style={styles.sosDarkCard}>
                                    <View style={styles.sosTimerLabelDesign}>
                                        <MaterialCommunityIcons name="timer-outline" size={16} color="#FF4B4B" />
                                        <Text style={styles.sosTimerLabelText}>TEMPO DE SOBREVIVÊNCIA</Text>
                                    </View>
                                    <Text style={styles.sosBigTimer}>
                                        {Math.floor(sosTimer / 60).toString().padStart(2, '0')}:{(sosTimer % 60).toString().padStart(2, '0')}
                                    </Text>
                                    <TouchableOpacity
                                        style={[styles.sosPrimaryBtn, { height: 64 }, isTimerActive && { backgroundColor: '#1A1A1A' }]}
                                        onPress={() => setIsTimerActive(!isTimerActive)}
                                    >
                                        <MaterialCommunityIcons name={isTimerActive ? "clock-outline" : "lock"} size={22} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={styles.sosPrimaryBtnText}>
                                            {isTimerActive ? 'ESPERA ATIVA...' : 'BLOQUEAR IMPULSO (5MIN)'}
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={styles.sosTimerScience}>
                                        A CIÊNCIA EXPLICA: O CÉREBRO PRECISA DE 5-10MIN PARA SAIR DO MODO EMOCIONAL REATIVO E RETOMAR O CONTROLE FRONTAL.
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </Modal>
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
            <Modal
                visible={showCheckin}
                animationType="slide"
                transparent={true}
                onRequestClose={() => closeCheckin()}
            >
                <View style={styles.checkinOverlay}>
                    <View style={styles.checkinSheet}>
                        <View style={styles.dragBar} />

                        {!checkinResult ? (
                            isFirstCheckin ? (
                                // Initiation stage
                                <View style={styles.checkinContent}>
                                    <View style={styles.checkinIconBig}>
                                        <MaterialCommunityIcons name="shield-lock" size={48} color={colors.primary} />
                                    </View>
                                    <Text style={styles.checkinQuestion}>
                                        Iniciação ao Silêncio
                                    </Text>
                                    <Text style={styles.checkinSub}>
                                        Ao iniciares o Contato Zero, comprometes-te a cortar todas as vias de comunicação.
                                        Sem mensagens, chamadas ou espreitar redes sociais.{'\n\n'}Estás pronto para desaparecer e recuperar o teu poder?
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.checkinYes}
                                        onPress={() => submitCheckin(true)}
                                    >
                                        <MaterialCommunityIcons name="sword-cross" size={20} color="#120f0b" />
                                        <Text style={styles.checkinYesText}>ACEITO O CÓDIGO</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                // Normal Question stage
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
                            )
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
            <Modal
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
            <Modal
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
        backgroundColor: colors.cardBackground,
        borderRadius: colors.cardRadius,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        padding: colors.cardPadding,
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
        height: 40, // Keeping specific height for these dashboard buttons
        borderRadius: colors.buttonRadius, // Standardizing radius
        justifyContent: 'center',
    },
    primaryBtnText: {
        color: colors.backgroundDark,
        fontSize: 13,
        fontWeight: '800',
    },
    toolsGrid: {
        paddingHorizontal: 24, // Standard margem
        gap: 16
    },
    secondaryBtn: {
        paddingHorizontal: 20,
        height: 40,
        borderRadius: colors.buttonRadius,
        backgroundColor: 'rgba(23, 28, 35, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
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
    // Removed accidentally added styles
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
        backgroundColor: colors.cardBackground,
        borderRadius: colors.cardRadius,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#1e293b',
    },
    missionVerticalBar: {
        width: 4,
        height: '100%',
    },
    missionMetaRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    missionStatusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    missionStatusPillText: {
        fontSize: 8,
        fontWeight: '900',
    },
    missionCardBody: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    missionCardMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    missionCardCat: {
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
    },
    missionCardDuration: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: '700',
    },
    missionCardTitleLarge: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 8,
        lineHeight: 24,
    },
    missionCardDescLarge: {
        color: '#94a3b8',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 20,
    },
    missionFooterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    missionFooterBtnDone: {
        backgroundColor: 'rgba(34,197,94,0.02)',
        borderColor: 'rgba(34,197,94,0.2)',
    },
    missionFooterBtnText: {
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 1,
    },
    missionTitleDoneGallery: {
        textDecorationLine: 'line-through',
        color: '#475569',
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
    toolkitSection: {
        marginTop: 32,
        paddingHorizontal: 0, // Removed double padding
    },
    toolkitHeader: {
        marginBottom: 16,
    },
    toolkitHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toolkitGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    toolkitItemPill: {
        width: '48%',
        padding: 12,
        borderRadius: colors.cardRadius,
        backgroundColor: '#171c2399',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 12,
        minHeight: 70,
    },
    toolkitPillTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    toolkitIconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    toolkitItemTitlePill: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
        flex: 1,
    },
    toolkitItemSubPill: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: '500',
        paddingLeft: 2,
    },
    toolkitLocked: {
        opacity: 0.5,
        borderStyle: 'dashed',
    },
    missionLockOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    missionLockText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
        marginTop: 8,
        letterSpacing: 1,
    },

    // ---- SOS Modal Styles ----
    sosOverlay: {
        flex: 1,
        backgroundColor: 'rgba(10, 12, 20, 0.9)',
    },
    sosContainer: {
        flex: 1,
        // padding: 24, // Removed as new design has padding in header and sections
    },
    sosHeader: { // Old header, keeping for reference if needed, but new design uses sosHeaderDesign
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        position: 'relative',
        height: 60,
    },
    sosTitle: { // Old title
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
        marginLeft: 12,
    },
    sosClose: { // Old close button
        position: 'absolute',
        right: 0,
        top: 15,
    },
    sosSection: { // Old section
        marginBottom: 24,
    },
    sosSectionLabel: { // Old section label
        color: '#475569',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    breathingCard: { // Old breathing card
        backgroundColor: colors.cardBackground,
        borderRadius: colors.cardRadius,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.1)',
    },
    breathingCircle: { // Old breathing circle
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    breathingPhaseText: { // Old breathing phase text
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '900',
    },
    breathingBtn: { // Old breathing button
        backgroundColor: '#ef444422',
        paddingHorizontal: 20,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ef444444',
        marginBottom: 12,
    },
    breathingBtnText: { // Old breathing button text
        color: '#ef4444',
        fontSize: 12,
        fontWeight: '800',
    },
    realityRecallCard: { // Old reality recall card
        backgroundColor: colors.cardBackground,
        borderRadius: colors.cardRadius,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    realityTitle: { // Old reality title
        color: '#94a3b8',
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 16,
    },
    factRow: { // Old fact row
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 12,
    },
    factText: { // Old fact text
        color: '#fff',
        fontSize: 15,
        lineHeight: 22,
        flex: 1,
    },
    factPlaceholder: { // Old fact placeholder
        color: '#475569',
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    timerCard: { // Old timer card
        backgroundColor: colors.cardBackground,
        borderRadius: colors.cardRadius,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    timerValue: { // Old timer value
        color: '#fff',
        fontSize: 48,
        fontWeight: '900',
        marginBottom: 16,
    },
    timerBtn: { // Old timer button
        backgroundColor: '#ef4444',
        width: '100%',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    timerBtnText: { // Old timer button text
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    },
    sosHint: { // Old hint
        color: '#475569',
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 16,
    },

    // SOS MODAL NEW DESIGN STYLES
    sosHeaderDesign: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 8,
    },
    sosHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sosHeaderIconPulse: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        // Pulse effect simulated by design if possible, simple View here
    },
    sosHeaderTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        marginLeft: 12,
        letterSpacing: -0.5,
    },
    sosHeaderClose: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1A1A1A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sosProgressBar: {
        flexDirection: 'row',
        gap: 4,
        paddingHorizontal: 24,
        marginVertical: 12,
    },
    sosProgressStep: {
        height: 4,
        flex: 1,
        borderRadius: 2,
    },
    sosSectionDesign: {
        paddingHorizontal: 24,
        marginTop: 24,
    },
    sosSectionLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sosSectionBadge: {
        color: '#FF4B4B',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginRight: 8,
    },
    sosSectionTitleDesign: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    sosGlassCardDesign: {
        backgroundColor: 'rgba(40, 40, 40, 0.4)',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 75, 75, 0.1)',
        // Backdrop-filter simulated with background on web fallback
    },
    sosBreathingCenter: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 24,
    },
    sosBreathingPulse: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(255, 75, 75, 0.1)',
    },
    sosBreathingCircleDesign: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 4,
        borderColor: '#FF4B4B',
        backgroundColor: '#0A0A0A',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF4B4B',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    sosOriginLabel: {
        color: '#FF4B4B',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 3,
        marginBottom: 4,
    },
    sosBreathingText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: -1,
    },
    sosSectionHint: {
        color: '#94a3b8',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 8,
        marginBottom: 24,
    },
    sosPrimaryBtn: {
        width: '100%',
        height: 56,
        backgroundColor: '#FF4B4B',
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF4B4B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    sosPrimaryBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1.2,
    },
    sosAmberCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#FFB347',
    },
    realityTitleDesign: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        fontStyle: 'italic',
        marginBottom: 12,
    },
    realityQuoteBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    factTextDesign: {
        color: '#94a3b8',
        fontSize: 14,
        fontStyle: 'italic',
        lineHeight: 22,
    },
    factPlaceholderDesign: {
        color: '#64748b',
        fontSize: 13,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    sosDarkCard: {
        backgroundColor: '#000',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 75, 75, 0.2)',
    },
    sosTimerLabelDesign: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sosTimerLabelText: {
        color: '#FF4B4B',
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    sosBigTimer: {
        color: '#fff',
        fontSize: 64,
        fontWeight: '900',
        letterSpacing: -2,
        marginVertical: 12,
        fontVariant: ['tabular-nums'],
    },
    sosTimerScience: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 24,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        lineHeight: 14,
    },
    // SOS QUIZ STYLES
    sosQuizProgress: {
        color: '#FFB347',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    sosQuizQuestion: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 24,
        marginBottom: 20,
    },
    sosQuizOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    sosQuizBtn: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sosQuizBtnText: {
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 1,
    },
    sosFeedbackTitle: {
        color: '#FFB347',
        fontSize: 14,
        fontWeight: '900',
        marginLeft: 10,
        letterSpacing: 1,
    },
    sosFeedbackText: {
        color: '#cbd5e1',
        fontSize: 14,
        lineHeight: 22,
        fontStyle: 'italic',
        marginTop: 4,
    },
    sosQuizRetry: {
        marginTop: 16,
        alignSelf: 'flex-start',
    },
    sosQuizRetryText: {
        color: '#FFB347',
        fontSize: 11,
        fontWeight: '800',
        textDecorationLine: 'underline',
    },
});

export default Dashboard;
