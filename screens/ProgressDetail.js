import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import AppHeader from '../components/AppHeader';
import colors from '../colors';

const { width } = Dimensions.get('window');

const ProgressDetail = ({ navigation }) => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
                setUserProfile(doc.data());
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const ProgressRow = ({ label, value, color, icon, description }) => (
        <View style={styles.detailCard}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                    <MaterialCommunityIcons name={icon} size={20} color={color} />
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.statLabel}>{label}</Text>
                    <Text style={styles.statValue}>{Math.round(value || 0)}%</Text>
                </View>
            </View>

            <View style={styles.barContainer}>
                <View style={[styles.barBase, { backgroundColor: `${color}10` }]}>
                    <View style={[styles.barFill, { width: `${Math.min(100, value || 0)}%`, backgroundColor: color }]} />
                </View>
            </View>

            <Text style={styles.statDescription}>{description}</Text>

            <View style={styles.milestones}>
                <View style={styles.milestone}>
                    <MaterialCommunityIcons name="check-circle" size={12} color={value >= 30 ? color : '#334155'} />
                    <Text style={[styles.milestoneText, value >= 30 && { color: '#fff' }]}>Base Consolidada</Text>
                </View>
                <View style={styles.milestone}>
                    <MaterialCommunityIcons name="check-circle" size={12} color={value >= 70 ? color : '#334155'} />
                    <Text style={[styles.milestoneText, value >= 70 && { color: '#fff' }]}>Domínio</Text>
                </View>
            </View>
        </View>
    );

    const phase = userProfile?.profile?.phase || '1';
    const phaseNames = { '1': 'ESTABILIZAÇÃO', '2': 'ESTRUTURA', '3': 'EXPANSÃO' };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <AppHeader
                variant="nav"
                title="Sessões"
                subtitle="BIBLIOTECA"
            />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Phase Overview */}
                <View style={styles.phaseOverview}>
                    <Text style={styles.phaseLabel}>FASE ATUAL</Text>
                    <Text style={styles.phaseName}>{phaseNames[phase]}</Text>
                    <View style={styles.phaseBadge}>
                        <Text style={styles.badgeText}>EM PROGRESSO</Text>
                    </View>
                </View>

                {/* Stats Deep Dive */}
                <ProgressRow
                    label="ESTABILIDADE"
                    value={userProfile?.profile?.stabilityScore}
                    color="#4ade80"
                    icon="shield-check-outline"
                    description="Sua capacidade de manter a calma e a rotina sob pressão. A base da sua reconstrução."
                />

                <ProgressRow
                    label="ESTRUTURA"
                    value={userProfile?.profile?.structureScore}
                    color={colors.primary}
                    icon="cube-outline"
                    description="Como você organiza seu tempo e prioriza o que é essencial. A arquitetura do seu dia."
                />

                <ProgressRow
                    label="DISCIPLINA"
                    value={userProfile?.profile?.disciplineScore}
                    color="#f472b6"
                    icon="vibrate"
                    description="A força para executar o planejado, mesmo quando a motivação falha. O motor da mudança."
                />

                {/* Future Roadmap */}
                <View style={styles.roadmapCard}>
                    <Text style={styles.roadmapTitle}>O QUE VEM A SEGUIR</Text>
                    <View style={styles.roadmapItem}>
                        <View style={styles.roadmapLine} />
                        <View style={styles.roadmapDot} />
                        <View style={styles.roadmapContent}>
                            <Text style={styles.roadmapLabel}>Fase 2: Estrutura</Text>
                            <Text style={styles.roadmapSub}>Foco em otimização de performance e hábitos profundos.</Text>
                        </View>
                    </View>
                    <View style={styles.roadmapItem}>
                        <View style={styles.roadmapDotEmpty} />
                        <View style={styles.roadmapContent}>
                            <Text style={[styles.roadmapLabel, { color: '#334155' }]}>Fase 3: Expansão</Text>
                            <Text style={styles.roadmapSub}>Sua nova vida operando em capacidade máxima.</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
    },
    scrollContent: {
        padding: 24,
    },
    phaseOverview: {
        alignItems: 'center',
        marginBottom: 32,
    },
    phaseLabel: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 8,
    },
    phaseName: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 12,
    },
    phaseBadge: {
        backgroundColor: 'rgba(23, 115, 207, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.primary + '30',
    },
    badgeText: {
        color: colors.primary,
        fontSize: 9,
        fontWeight: 'bold',
    },
    detailCard: {
        backgroundColor: 'rgba(28, 37, 48, 0.4)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerInfo: {
        flex: 1,
    },
    statLabel: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    statValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        marginTop: 2,
    },
    barContainer: {
        marginBottom: 16,
    },
    barBase: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
    },
    statDescription: {
        color: '#64748b',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 20,
    },
    milestones: {
        flexDirection: 'row',
        gap: 20,
    },
    milestone: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    milestoneText: {
        color: '#475569',
        fontSize: 10,
        fontWeight: 'bold',
    },
    roadmapCard: {
        backgroundColor: 'rgba(28, 37, 48, 0.2)',
        borderRadius: 24,
        padding: 24,
        marginTop: 12,
    },
    roadmapTitle: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 24,
    },
    roadmapItem: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    roadmapLine: {
        position: 'absolute',
        left: 5,
        top: 20,
        bottom: -24,
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    roadmapDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
        marginTop: 4,
        marginRight: 20,
        borderWidth: 2,
        borderColor: '#0d1218',
        zIndex: 1,
    },
    roadmapDotEmpty: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#1e293b',
        marginTop: 4,
        marginRight: 20,
        zIndex: 1,
    },
    roadmapContent: {
        flex: 1,
    },
    roadmapLabel: {
        color: '#f1f5f9',
        fontSize: 14,
        fontWeight: 'bold',
    },
    roadmapSub: {
        color: '#475569',
        fontSize: 12,
        marginTop: 4,
    }
});

export default ProgressDetail;
