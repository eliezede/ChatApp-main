import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    StatusBar,
    Dimensions,
    TouchableOpacity,
    Modal,
    Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../config/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import colors from '../colors';
import TaskCard from '../components/TaskCard';
import ActionModal from '../components/ActionModal';
import { AuthenticatedUserContext } from '../App';
import { calculateStatUpdate } from '../logic/StatsEngine';
import { generateDailyPlan } from '../logic/PlanEngine';

const { width } = Dimensions.get('window');

const Dashboard = ({ navigation, route }) => {
    const { user, setOnboardingCompleted } = React.useContext(AuthenticatedUserContext);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dailyPlan, setDailyPlan] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState(null); // { title, text }

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
                setUserProfile(doc.data());
            }
        });

        const today = new Date().toISOString().split('T')[0];
        const planDocRef = doc(db, 'plans', user.uid, 'daily', today);

        const unsubscribePlan = onSnapshot(planDocRef, (doc) => {
            if (doc.exists()) {
                setDailyPlan({ id: doc.id, ...doc.data() });
            } else {
                setDailyPlan(null);
            }
            setLoading(false);
        });

        return () => {
            unsubscribeUser();
            unsubscribePlan();
        };
    }, []);

    // Auto-generate plan if missing
    useEffect(() => {
        const checkAndGeneratePlan = async () => {
            if (!loading && !dailyPlan && userProfile) {
                const user = auth.currentUser;
                if (user) {
                    await generateDailyPlan(user.uid, userProfile.profile);
                }
            }
        };
        checkAndGeneratePlan();
    }, [loading, dailyPlan, userProfile]);

    const toggleTask = async (taskId, currentCompleted) => {
        const user = auth.currentUser;
        const today = new Date().toISOString().split('T')[0];
        const planDocRef = doc(db, 'plans', user.uid, 'daily', today);

        try {
            const updatedTasks = dailyPlan.tasks.map(task => {
                if (task.id === taskId) {
                    return { ...task, isCompleted: !currentCompleted };
                }
                return task;
            });

            await updateDoc(planDocRef, { tasks: updatedTasks });

            // Update Stats
            if (!currentCompleted) {
                const completedTask = dailyPlan.tasks.find(t => t.id === taskId);
                if (completedTask && userProfile?.profile) {
                    const result = calculateStatUpdate(completedTask, userProfile.profile);
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, {
                        [`profile.${result.stat}`]: result.newValue
                    });
                }
            }
        } catch (error) {
            console.error("Error toggling task:", error);
        }
    };

    const handleAction = (task) => {
        setSelectedTask(task);
        setModalVisible(true);
    };

    const handleSaveAction = async (data) => {
        const user = auth.currentUser;
        const today = new Date().toISOString().split('T')[0];
        const planDocRef = doc(db, 'plans', user.uid, 'daily', today);

        try {
            if (selectedTask?.isQuickAdd) {
                // Handle Quick Add
                const newTask = {
                    id: `user_task_${Date.now()}`,
                    title: data.title || 'Nova Tarefa',
                    description: data.isImpulse ? 'Gatilho descarregado' : 'Adicionada manualmente',
                    type: data.isImpulse ? 'impulse' : 'complementary',
                    isUserCreated: true,
                    isCompleted: data.isImpulse, // Triggers are completed on save
                    period: 'other',
                    isImpulse: data.isImpulse,
                    actionData: data,
                    createdAt: new Date().toISOString()
                };

                const updatedTasks = [...(dailyPlan?.tasks || []), newTask];
                await updateDoc(planDocRef, { tasks: updatedTasks });

                // Update Stats for Impulse (auto-completed)
                if (data.isImpulse && userProfile?.profile) {
                    const result = calculateStatUpdate(newTask, userProfile.profile);
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, {
                        [`profile.${result.stat}`]: result.newValue
                    });
                }
            } else if (selectedTask?.actionType === 'PRIORITY') {
                // Handle Priority Generation
                const priorities = [data.p1, data.p2, data.p3].filter(p => p && p.trim() !== "");

                const newPriorityTasks = priorities.map((p, idx) => ({
                    id: `priority_${Date.now()}_${idx}`,
                    title: p,
                    description: 'Prioridade Inegociável',
                    type: 'essential',
                    isUserCreated: true,
                    isCompleted: false,
                    period: 'afternoon', // Most priorities are for the day's occupation
                    isPriorityTask: true,
                    createdAt: new Date().toISOString()
                }));

                const updatedTasks = dailyPlan.tasks.map(task => {
                    if (task.id === selectedTask.id) {
                        return { ...task, isCompleted: true, actionData: data };
                    }
                    return task;
                });

                await updateDoc(planDocRef, { tasks: [...updatedTasks, ...newPriorityTasks] });

                // Update Stats for completing the planning
                if (userProfile?.profile) {
                    const result = calculateStatUpdate(selectedTask, userProfile.profile);
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, {
                        [`profile.${result.stat}`]: result.newValue
                    });
                }
            } else if (selectedTask?.actionType === 'PHYSICAL_TRAINING' && data.workoutTitle) {
                // Handle Physical Training Selection
                const updatedTasks = dailyPlan.tasks.map(task => {
                    if (task.id === selectedTask.id) {
                        return {
                            ...task,
                            isCompleted: true,
                            actionData: data,
                            title: `Treino: ${data.workoutTitle}`,
                            description: 'Sessão concluída com sucesso'
                        };
                    }
                    return task;
                });
                await updateDoc(planDocRef, { tasks: updatedTasks });

                // Update Stats and History
                if (userProfile?.profile) {
                    const result = calculateStatUpdate(selectedTask, userProfile.profile);
                    const userRef = doc(db, 'users', user.uid);

                    const workoutEntry = {
                        date: today,
                        workoutId: data.workoutId,
                        workoutTitle: data.workoutTitle,
                        completedExercises: data.completedExercises || [],
                        timestamp: new Date().toISOString()
                    };

                    const history = userProfile.profile.workoutHistory || [];
                    // Keep unique workouts by date to avoid duplicates on double save
                    const updatedHistory = [workoutEntry, ...history.filter(h => h.date !== today)].slice(0, 10);

                    await updateDoc(userRef, {
                        [`profile.${result.stat}`]: result.newValue,
                        'profile.workoutHistory': updatedHistory
                    });
                }
            } else {
                // Handle existing task action
                const updatedTasks = dailyPlan.tasks.map(task => {
                    if (task.id === selectedTask.id) {
                        return { ...task, isCompleted: true, actionData: data };
                    }
                    return task;
                });
                await updateDoc(planDocRef, { tasks: updatedTasks });

                // Update Stats
                if (userProfile?.profile) {
                    const result = calculateStatUpdate(selectedTask, userProfile.profile);
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, {
                        [`profile.${result.stat}`]: result.newValue
                    });
                }
            }
        } catch (error) {
            console.error("Error saving action data:", error);
        }
    };

    const handleSaveSettings = async (settings) => {
        const user = auth.currentUser;
        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                const updates = {};

                if (settings.trainingDays) {
                    updates['profile.trainingDays'] = settings.trainingDays;
                }

                if (settings.focus) {
                    updates['profile.focus'] = settings.focus;
                }

                if (Object.keys(updates).length > 0) {
                    await updateDoc(userRef, updates);
                }
            } catch (error) {
                console.error("Error saving settings:", error);
            }
        }
    };

    const handleRecalibrate = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                await updateDoc(doc(db, 'users', user.uid), {
                    onboardingCompleted: false
                });
                setOnboardingCompleted(false);
            } catch (error) {
                console.error("Error resetting onboarding:", error);
            }
        }
    };

    const handleQuickAdd = () => {
        setSelectedTask({ id: 'quick_add', isQuickAdd: true, actionType: 'QUICK_ADD' });
        setModalVisible(true);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const groupTasks = () => {
        const tasks = dailyPlan?.tasks || [];
        return {
            morning: tasks.filter(t => t.period === 'morning' || (!t.period && t.title.toLowerCase().includes('manhã'))),
            afternoon: tasks.filter(t => t.period === 'afternoon' || (!t.period && t.title.toLowerCase().includes('tarde'))),
            evening: tasks.filter(t => t.period === 'evening' || (!t.period && (t.title.toLowerCase().includes('noite') || t.title.toLowerCase().includes('nocturna')))),
            other: tasks.filter(t => (t.period === 'other' || !t.period) && !t.title.toLowerCase().includes('manhã') && !t.title.toLowerCase().includes('tarde') && !t.title.toLowerCase().includes('noite') && !t.title.toLowerCase().includes('nocturna'))
        };
    };

    const groups = groupTasks();
    const phase = userProfile?.profile?.phase || '1';
    const phaseIndex = phase === '1' ? 0 : phase === '2' ? 1 : 2;
    const phaseNames = { '1': 'Estabilização', '2': 'Estrutura', '3': 'Expansão' };

    const CompactStatRow = ({ label, value, color, icon, tooltip }) => (
        <View style={styles.statRowCompact}>
            <View style={styles.statHeaderCompact}>
                <View style={[styles.statIconWrapper, { borderColor: `${color}40` }]}>
                    <MaterialCommunityIcons name={icon} size={14} color={color} />
                </View>
                <Text style={styles.statLabelCompact}>{label}</Text>
                <TouchableOpacity
                    onPress={() => tooltip && setActiveTooltip({ title: label, text: tooltip })}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ marginRight: 6 }}
                >
                    <MaterialCommunityIcons name="information-outline" size={13} color="#334155" />
                </TouchableOpacity>
                <Text style={styles.statValueCompact}>{Math.round(value || 0)}%</Text>
            </View>
            <View style={styles.progressBarBase}>
                <View style={[styles.progressBarFill, { width: `${Math.min(100, value || 0)}%`, backgroundColor: color, shadowColor: color }]} />
            </View>
        </View>
    );

    const PhaseTimeline = () => (
        <View style={styles.timelineWrapper}>
            <View style={styles.timelineBaseLine} />
            <View style={[styles.timelineProgressLine, { width: `${(phaseIndex / 2) * 100}%` }]} />
            <View style={styles.timelineNodes}>
                {[0, 1, 2].map((idx) => (
                    <View key={idx} style={styles.timelineNodeGroup}>
                        <View style={[
                            styles.timelineNode,
                            idx <= phaseIndex && styles.timelineNodeActive,
                            idx === phaseIndex && styles.timelineNodeCurrent
                        ]}>
                            {idx < phaseIndex && <MaterialCommunityIcons name="check" size={10} color="#fff" />}
                        </View>
                        <Text style={[
                            styles.timelineNodeLabel,
                            idx === phaseIndex && styles.timelineNodeLabelActive
                        ]}>
                            {Object.values(phaseNames)[idx]}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const TaskSection = ({ title, tasks, icon }) => {
        if (tasks.length === 0) return null;
        return (
            <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <MaterialCommunityIcons name={icon} size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                    <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
                </View>
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onAction={handleAction}
                    />
                ))}
            </View>
        );
    };

    // Calculate current highlighting (First uncompleted task)
    const allTasksSorted = [
        ...groups.morning,
        ...groups.afternoon,
        ...groups.evening,
        ...groups.other
    ];
    const currentTask = allTasksSorted.find(t => !t.isCompleted);

    const handleRefreshPlan = async () => {
        setLoading(true);
        const user = auth.currentUser;
        if (user && userProfile) {
            await generateDailyPlan(user.uid, userProfile.profile);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <MaterialCommunityIcons name="menu" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.logoText}>ORIGIN</Text>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerProgressBase}>
                    <View style={[styles.headerProgressFill, { width: `${Math.min(100, (userProfile?.profile?.disciplineScore || 0))}%` }]} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.dateLabelContainer}>
                    <Text style={styles.headerDate}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</Text>
                </View>
                {/* Now Area */}
                {currentTask && (
                    <View style={styles.nowSection}>
                        <Text style={styles.nowLabel}>FOCAR AGORA</Text>
                        <TaskCard
                            task={currentTask}
                            onToggle={toggleTask}
                            onAction={handleAction}
                        />
                    </View>
                )}

                {/* Premium Progress Card (Compact) */}
                <TouchableOpacity
                    style={styles.glassCard}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ProgressDetail')}
                >
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.cardHeader}>ALCANCE DO PROTOCOLO</Text>
                        <View style={styles.phaseIndicator}>
                            <Text style={styles.phaseText}>{phaseNames[phase]}</Text>
                            <MaterialCommunityIcons name="chevron-down" size={14} color="#64748b" />
                        </View>
                    </View>

                    <View style={styles.statsContainerCompact}>
                        <CompactStatRow
                            label="Estabilidade"
                            value={userProfile?.profile?.stabilityScore}
                            color="#4ade80"
                            icon="check-circle-outline"
                            tooltip="Mede sua capacidade de manter a calma.\nCresce ao completar tarefas de impulso e sessões emocionais (+1–1.5% por tarefa)."
                        />
                        <CompactStatRow
                            label="Estrutura"
                            value={userProfile?.profile?.structureScore}
                            color={colors.primary}
                            icon="cube-outline"
                            tooltip="Mede como você organiza o seu tempo.\nCresce ao completar rotinas e prioridades (+0.5–1.5% por tarefa)."
                        />
                        <CompactStatRow
                            label="Disciplina"
                            value={userProfile?.profile?.disciplineScore}
                            color="#f472b6"
                            icon="check-circle-outline"
                            tooltip="Mede sua consistência de execução.\nCresce ao completar tarefas essenciais e de identidade (+1–1.5% por tarefa). Começa baixo — reflete sua situação real no Dia 0."
                        />
                    </View>
                </TouchableOpacity>

                {/* Time Groups */}
                <TaskSection title="Alvorada" tasks={groups.morning} icon="weather-sunset-up" />
                <TaskSection title="Ocupação" tasks={groups.afternoon} icon="briefcase-outline" />
                <TaskSection title="Recolhimento" tasks={groups.evening} icon="weather-night" />
                <TaskSection title="Outros" tasks={groups.other} icon="dots-horizontal" />

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Tooltip Modal */}
            <Modal
                visible={!!activeTooltip}
                transparent
                animationType="fade"
                onRequestClose={() => setActiveTooltip(null)}
            >
                <Pressable style={styles.tooltipOverlay} onPress={() => setActiveTooltip(null)}>
                    <View style={styles.tooltipBox}>
                        <View style={styles.tooltipHeader}>
                            <Text style={styles.tooltipTitle}>{activeTooltip?.title?.toUpperCase()}</Text>
                            <TouchableOpacity onPress={() => setActiveTooltip(null)}>
                                <MaterialCommunityIcons name="close" size={16} color="#475569" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.tooltipText}>{activeTooltip?.text}</Text>
                    </View>
                </Pressable>
            </Modal>

            {/* Quick Add FAB */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={handleQuickAdd}
            >
                <MaterialCommunityIcons name="plus" size={30} color="#fff" />
            </TouchableOpacity>

            <ActionModal
                isVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                task={selectedTask}
                onSave={handleSaveAction}
            />
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
        backgroundColor: colors.backgroundDark,
        paddingTop: StatusBar.currentHeight || 10,
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: 10,
    },
    logoText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 6,
        marginLeft: 10,
    },
    notificationBtn: {
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        borderWidth: 1.5,
        borderColor: colors.backgroundDark,
    },
    headerProgressBase: {
        height: 1.5,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    headerProgressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    dateLabelContainer: {
        paddingHorizontal: 24,
        marginTop: 24,
        marginBottom: 10,
    },
    headerDate: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    scrollContent: {
        paddingTop: 10,
    },
    nowSection: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    nowLabel: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    glassCard: {
        backgroundColor: 'rgba(28, 37, 48, 0.4)',
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 32,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardHeader: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    phaseIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    phaseText: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: '500',
    },
    statsContainerCompact: {
        gap: 16,
    },
    statRowCompact: {
        gap: 8,
    },
    statHeaderCompact: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIconWrapper: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    statLabelCompact: {
        flex: 1,
        color: '#cbd5e1',
        fontSize: 13,
        fontWeight: '500',
    },
    statValueCompact: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    progressBarBase: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 1.5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 1.5,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
    },
    // Tooltip styles
    tooltipOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    tooltipBox: {
        backgroundColor: '#111827',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    tooltipHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    tooltipTitle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
    },
    tooltipText: {
        color: '#94a3b8',
        fontSize: 14,
        lineHeight: 22,
    },
    section: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 1,
    },
    fab: {
        position: 'absolute',
        bottom: 100, // Adjusted to be above tab bar
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
});

export default Dashboard;
