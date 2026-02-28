import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { generateDailyPlan } from '../logic/PlanEngine';
import AppHeader from '../components/AppHeader';
import colors from '../colors';

const ConfirmModal = ({ isVisible, onClose, onConfirm, title, message, confirmText = "Confirmar", isDestructive = false, showCancel = true }) => (
    <Modal visible={isVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{title}</Text>
                <Text style={styles.modalMessage}>{message}</Text>
                <View style={styles.modalButtons}>
                    {showCancel && (
                        <TouchableOpacity style={styles.modalBtn} onPress={onClose}>
                            <Text style={styles.modalBtnText}>CANCELAR</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.modalBtn, styles.modalBtnPrimary, isDestructive && styles.modalBtnDestructive]}
                        onPress={() => { onConfirm ? onConfirm() : null; onClose(); }}
                    >
                        <Text style={styles.modalBtnTextPrimary}>{confirmText.toUpperCase()}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
);

const TrainingSettings = ({ navigation }) => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [trainingDays, setTrainingDays] = useState([]);

    // Modal states
    const [confirmModal, setConfirmModal] = useState({
        visible: false,
        title: '',
        message: '',
        onConfirm: () => { },
        confirmText: '',
        isDestructive: false,
        showCancel: true
    });

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setUserProfile(data);
                setTrainingDays(data.profile?.trainingDays || ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const toggleDay = async (dayId) => {
        const newList = trainingDays.includes(dayId)
            ? trainingDays.filter(d => d !== dayId)
            : [...trainingDays, dayId];

        setTrainingDays(newList);

        const user = auth.currentUser;
        if (user) {
            try {
                await updateDoc(doc(db, 'users', user.uid), {
                    'profile.trainingDays': newList
                });
            } catch (error) {
                console.error("Error updating training days:", error);
            }
        }
    };

    const handleRefreshPlan = () => {
        setConfirmModal({
            visible: true,
            title: "Regerar Plano Diário",
            message: "Isso irá atualizar todas as suas tarefas de hoje com base nas suas novas preferências. Deseja continuar?",
            confirmText: "Sim, Regerar",
            onConfirm: performRefreshPlan,
            showCancel: true,
            isDestructive: false
        });
    };

    const performRefreshPlan = async () => {
        const user = auth.currentUser;
        if (user && userProfile) {
            setSaving(true);
            try {
                await generateDailyPlan(user.uid, userProfile.profile);
                setConfirmModal({
                    visible: true,
                    title: "Sucesso",
                    message: "Seu plano diário foi regerado com sucesso.",
                    confirmText: "Ok",
                    onConfirm: () => { },
                    showCancel: false,
                    isDestructive: false
                });
            } catch (error) {
                setConfirmModal({
                    visible: true,
                    title: "Erro",
                    message: "Não foi possível regerar o plano.",
                    confirmText: "Entendido",
                    onConfirm: () => { },
                    showCancel: false,
                    isDestructive: true
                });
            } finally {
                setSaving(false);
            }
        }
    };

    const handleRecalibrate = () => {
        setConfirmModal({
            visible: true,
            title: "Recalibrar Protocolo",
            message: "Isso levará você de volta ao questionário inicial. Seus dados atuais serão mantidos, mas um novo plano será gerado. Deseja continuar?",
            confirmText: "Sim, Recalibrar",
            isDestructive: true,
            showCancel: true,
            onConfirm: performRecalibrate
        });
    };

    const performRecalibrate = async () => {
        const user = auth.currentUser;
        if (user) {
            await updateDoc(doc(db, 'users', user.uid), {
                onboardingCompleted: false
            });
        }
    };

    const days = [
        { id: 'seg', label: 'SEG' },
        { id: 'ter', label: 'TER' },
        { id: 'qua', label: 'QUA' },
        { id: 'qui', label: 'QUI' },
        { id: 'sex', label: 'SEX' },
        { id: 'sab', label: 'SAB' },
        { id: 'dom', label: 'DOM' },
    ];

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <AppHeader
                variant="nav"
                title="Centro de Ajustes"
                subtitle="ROTINA"
            />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>FREQUÊNCIA SEMANAL</Text>
                    <Text style={styles.sectionDesc}>Selecione os dias em que você se compromete com a atividade física.</Text>

                    <View style={styles.daysGrid}>
                        {days.map(day => (
                            <TouchableOpacity
                                key={day.id}
                                style={[
                                    styles.dayCircle,
                                    trainingDays.includes(day.id) && styles.dayCircleActive
                                ]}
                                onPress={() => toggleDay(day.id)}
                            >
                                <Text style={[
                                    styles.dayLabel,
                                    trainingDays.includes(day.id) && styles.dayLabelActive
                                ]}>{day.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>AÇÕES DE PROTOCOLO</Text>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={handleRefreshPlan}
                        disabled={saving}
                    >
                        <View style={styles.actionIconBox}>
                            <MaterialCommunityIcons name="refresh" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.actionInfo}>
                            <Text style={styles.actionTitle}>Regerar Plano Diário</Text>
                            <Text style={styles.actionDesc}>Útil se você mudou sua agenda agora.</Text>
                        </View>
                        {saving && <ActivityIndicator size="small" color={colors.primary} />}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { marginTop: 16 }]}
                        onPress={handleRecalibrate}
                    >
                        <View style={[styles.actionIconBox, { backgroundColor: 'rgba(244, 114, 182, 0.1)' }]}>
                            <MaterialCommunityIcons name="brain" size={24} color="#f472b6" />
                        </View>
                        <View style={styles.actionInfo}>
                            <Text style={styles.actionTitle}>Recalibrar Metas</Text>
                            <Text style={styles.actionDesc}>Refazer o questionário de perfil.</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#334155" />
                    </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                    <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
                    <Text style={styles.infoText}>
                        Mudanças na agenda física afetam como o sistema distribui suas tarefas de Estrutura e Identidade.
                    </Text>
                </View>
            </ScrollView>

            <ConfirmModal
                isVisible={confirmModal.visible}
                onClose={() => setConfirmModal({ ...confirmModal, visible: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                isDestructive={confirmModal.isDestructive}
                showCancel={confirmModal.showCancel}
            />
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
    scrollContent: {
        padding: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 12,
    },
    sectionDesc: {
        color: '#64748b',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 24,
    },
    daysGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    dayCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(28, 37, 48, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    dayCircleActive: {
        backgroundColor: 'rgba(23, 115, 207, 0.2)',
        borderColor: colors.primary,
    },
    dayLabel: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '900',
    },
    dayLabelActive: {
        color: colors.primary,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginBottom: 32,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(28, 37, 48, 0.4)',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    actionIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(23, 115, 207, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionInfo: {
        flex: 1,
    },
    actionTitle: {
        color: '#f1f5f9',
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    actionDesc: {
        color: '#64748b',
        fontSize: 12,
        lineHeight: 18,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(23, 115, 207, 0.05)',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
        marginTop: 20,
        borderWidth: 1,
        borderColor: colors.primary + '10',
    },
    infoText: {
        flex: 1,
        color: colors.primary,
        fontSize: 12,
        lineHeight: 18,
        fontWeight: '500',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#111921',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalMessage: {
        color: '#94a3b8',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 24,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalBtn: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    modalBtnPrimary: {
        backgroundColor: colors.primary,
    },
    modalBtnDestructive: {
        backgroundColor: '#cf4a4a',
    },
    modalBtnText: {
        color: '#94a3b8',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    modalBtnTextPrimary: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});

export default TrainingSettings;
