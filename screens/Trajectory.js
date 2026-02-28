import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import AppHeader from '../components/AppHeader';
import colors from '../colors';

const { width } = Dimensions.get('window');

const Trajectory = () => {
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

    const Milestone = ({ phase, title, date, isCompleted, isCurrent }) => (
        <View style={styles.milestoneItem}>
            <View style={styles.milestoneLeft}>
                <View style={[
                    styles.milestoneDot,
                    isCompleted && styles.dotCompleted,
                    isCurrent && styles.dotCurrent
                ]}>
                    {isCompleted && <MaterialCommunityIcons name="check" size={12} color="#fff" />}
                </View>
                {!isCurrent && <View style={styles.milestoneLine} />}
            </View>
            <View style={[styles.milestoneContent, isCurrent && styles.contentCurrent]}>
                <View style={styles.milestoneHeader}>
                    <Text style={styles.phaseLabel}>FASE {phase}</Text>
                    <Text style={styles.milestoneDate}>{date}</Text>
                </View>
                <Text style={styles.milestoneTitle}>{title}</Text>
                {isCurrent && (
                    <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>EM CURSO</Text>
                    </View>
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const phase = userProfile?.profile?.phase || 1;
    const joinedDate = userProfile?.createdAt?.toDate() || new Date(auth.currentUser?.metadata.creationTime);
    const dayInProtocol = Math.floor((new Date() - joinedDate) / (1000 * 60 * 60 * 24)) + 1;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <AppHeader
                variant="nav"
                title="Trajetória & Ciclos"
            />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>{userProfile?.profile?.disciplineScore || 0}%</Text>
                        <Text style={styles.summaryLabel}>DISCIPLINA</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryValue}>Dia {dayInProtocol}</Text>
                        <Text style={styles.summaryLabel}>NO PROTOCOLO</Text>
                    </View>
                </View>

                <View style={styles.timelineContainer}>
                    <Text style={styles.sectionTitle}>LINHA DO TEMPO</Text>

                    <Milestone
                        phase="3"
                        title="Expansão & Autodomínio"
                        date={phase >= 3 ? "Em curso" : "Futuro"}
                        isCompleted={phase > 3}
                        isCurrent={phase === 3}
                    />
                    <Milestone
                        phase="2"
                        title="Estrutura & Arquitetura"
                        date={phase >= 2 ? "Em curso" : "Futuro"}
                        isCompleted={phase > 2}
                        isCurrent={phase === 2}
                    />
                    <Milestone
                        phase="1"
                        title="Estabilização Mental"
                        date={joinedDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                        isCompleted={phase > 1}
                        isCurrent={phase === 1}
                    />
                </View>

                <View style={styles.statsOverview}>
                    <Text style={styles.sectionTitle}>CONSISTÊNCIA SEMANAL</Text>
                    <View style={styles.chartPlaceholder}>
                        <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={40} color="rgba(255,255,255,0.1)" />
                        <Text style={styles.chartText}>Gráfico de evolução em tempo real</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
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
    content: {
        padding: 24,
    },
    summaryCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(28, 37, 48, 0.4)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 40,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        marginBottom: 4,
    },
    summaryLabel: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    divider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginHorizontal: 10,
    },
    timelineContainer: {
        marginBottom: 40,
    },
    sectionTitle: {
        color: '#475569',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 24,
    },
    milestoneItem: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 4,
    },
    milestoneLeft: {
        alignItems: 'center',
        width: 20,
    },
    milestoneDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#1e293b',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        zIndex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dotCompleted: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    dotCurrent: {
        backgroundColor: colors.primary + '22',
        borderColor: colors.primary,
    },
    milestoneLine: {
        width: 2,
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginTop: -2,
    },
    milestoneContent: {
        flex: 1,
        paddingBottom: 40,
    },
    contentCurrent: {
        opacity: 1,
    },
    milestoneHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    phaseLabel: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    milestoneDate: {
        color: '#475569',
        fontSize: 10,
        fontWeight: 'bold',
    },
    milestoneTitle: {
        color: '#cbd5e1',
        fontSize: 16,
        fontWeight: '600',
    },
    currentBadge: {
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    currentBadgeText: {
        color: colors.primary,
        fontSize: 8,
        fontWeight: '900',
    },
    statsOverview: {
        width: '100%',
    },
    chartPlaceholder: {
        height: 200,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    chartText: {
        color: '#334155',
        fontSize: 12,
        fontWeight: 'bold',
    }
});

export default Trajectory;
