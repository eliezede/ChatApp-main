import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Switch,
    Alert,
    Image,
    SafeAreaView,
    TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import colors from '../colors';

const { width, height } = Dimensions.get('window');

const MenuModal = ({ isVisible, onClose, userProfile, onSaveSettings, onRefreshPlan, onRecalibrate }) => {
    const [currentView, setCurrentView] = useState('MAIN'); // MAIN, TRAINING, SETTINGS, PROFILE
    const [trainingDays, setTrainingDays] = useState(userProfile?.profile?.trainingDays || ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [tempFocus, setTempFocus] = useState(userProfile?.profile?.focus || 'Resiliência');

    const handleLogout = () => {
        Alert.alert(
            "Encerrar Sessão",
            "Deseja realmente sair do Protocolo?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", onPress: () => signOut(auth), style: "destructive" }
            ]
        );
    };

    const handleSaveProfile = () => {
        onSaveSettings({ focus: tempFocus });
        setCurrentView('MAIN');
    };

    const toggleDay = (dayId) => {
        const newList = trainingDays.includes(dayId)
            ? trainingDays.filter(d => d !== dayId)
            : [...trainingDays, dayId];
        setTrainingDays(newList);
        onSaveSettings({ trainingDays: newList });
    };

    const days = [
        { id: 'seg', label: 'S' },
        { id: 'ter', label: 'T' },
        { id: 'qua', label: 'Q' },
        { id: 'qui', label: 'Q' },
        { id: 'sex', label: 'S' },
        { id: 'sab', label: 'S' },
        { id: 'dom', label: 'D' },
    ];

    const NavItem = ({ icon, label, onPress, isActive, color = '#94a3b8' }) => (
        <TouchableOpacity
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={onPress}
        >
            <MaterialCommunityIcons
                name={icon}
                size={22}
                color={isActive ? colors.primary : color}
                style={styles.navIcon}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{label}</Text>
        </TouchableOpacity>
    );

    const renderMainView = () => (
        <View style={styles.navGroup}>
            <NavItem icon="view-dashboard" label="Dashboard" onPress={onClose} isActive={true} />
            <NavItem icon="map-marker-path" label="Plano de Reconstrução" onPress={() => setCurrentView('TRAINING')} />
            <NavItem icon="headphones" label="Sessões de Áudio" onPress={() => { }} />
            <NavItem icon="history" label="Trajetória & Ciclos" onPress={() => { }} />
            <NavItem icon="book-open-variant" label="Biblioteca Estoica" onPress={() => { }} />

            <View style={styles.divider} />

            <NavItem icon="account-cog" label="Perfil & Ajustes" onPress={() => setCurrentView('PROFILE')} />
            <NavItem icon="cog-outline" label="Preferências App" onPress={() => setCurrentView('SETTINGS')} />
            <NavItem icon="help-circle-outline" label="Suporte" onPress={() => { }} />
            <NavItem icon="information-outline" label="Sobre o ORIGIN" onPress={() => { }} />
        </View>
    );

    const renderProfileView = () => (
        <View style={styles.navGroup}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentView('MAIN')}>
                <MaterialCommunityIcons name="arrow-left" size={20} color={colors.primary} />
                <Text style={styles.backText}>VOLTAR</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>EDITAR PERFIL</Text>

            <View style={styles.card}>
                <Text style={styles.cardLabel}>FOCO ATUAL</Text>
                <TextInput
                    style={styles.input}
                    value={tempFocus}
                    onChangeText={setTempFocus}
                    placeholder="Ex: Resiliência, Força..."
                    placeholderTextColor="#475569"
                />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>SALVAR ALTERAÇÕES</Text>
            </TouchableOpacity>
        </View>
    );

    const renderTrainingView = () => (
        <View style={styles.navGroup}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentView('MAIN')}>
                <MaterialCommunityIcons name="arrow-left" size={20} color={colors.primary} />
                <Text style={styles.backText}>VOLTAR</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>PREFERÊNCIAS DE TREINO</Text>

            <View style={styles.card}>
                <Text style={styles.cardLabel}>AGENDA SEMANAL</Text>
                <View style={styles.daysRow}>
                    {days.map(day => (
                        <TouchableOpacity
                            key={day.id}
                            style={[
                                styles.dayBadge,
                                trainingDays.includes(day.id) && styles.dayBadgeActive
                            ]}
                            onPress={() => toggleDay(day.id)}
                        >
                            <Text style={[
                                styles.dayText,
                                trainingDays.includes(day.id) && styles.dayTextActive
                            ]}>
                                {day.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity style={styles.card} onPress={() => { onRefreshPlan(); onClose(); }}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.cardTitle}>Regerar Plano</Text>
                        <Text style={styles.cardDesc}>Atualiza rotinas com base na agenda</Text>
                    </View>
                    <MaterialCommunityIcons name="refresh" size={24} color={colors.primary} />
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={onRecalibrate}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.cardTitle}>Motor de Protocolo</Text>
                        <Text style={styles.cardDesc}>Refazer onboarding e metas</Text>
                    </View>
                    <MaterialCommunityIcons name="brain" size={24} color="#64748b" />
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderSettingsView = () => (
        <View style={styles.navGroup}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentView('MAIN')}>
                <MaterialCommunityIcons name="arrow-left" size={20} color={colors.primary} />
                <Text style={styles.backText}>VOLTAR</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>AJUSTES DO SISTEMA</Text>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.cardTitle}>Notificações</Text>
                        <Text style={styles.cardDesc}>Alertas de rituais e tarefas</Text>
                    </View>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: '#1e293b', true: colors.primary + '66' }}
                        thumbColor={notificationsEnabled ? colors.primary : '#475569'}
                    />
                </View>
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.cardTitle}>Modo Escuro</Text>
                        <Text style={styles.cardDesc}>Sempre ativo (Origin Deep)</Text>
                    </View>
                    <MaterialCommunityIcons name="weather-night" size={24} color={colors.primary} />
                </View>
            </View>
        </View>
    );

    return (
        <Modal
            visible={isVisible}
            animationType="none"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <SafeAreaView style={styles.drawer}>
                    {/* Profile Header */}
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={{ uri: 'https://lh3.googleusercontent.com/fife/AL36nXwf9...' }} // Sample or user avatar
                                style={styles.avatar}
                            />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{userProfile?.name || 'Guerreiro'}</Text>
                            <Text style={styles.phaseTag}>FASE {userProfile?.profile?.phase || '1'}: ESTABILIZAÇÃO</Text>
                        </View>
                    </View>

                    <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                        {currentView === 'MAIN' && renderMainView()}
                        {currentView === 'TRAINING' && renderTrainingView()}
                        {currentView === 'SETTINGS' && renderSettingsView()}
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                            <MaterialCommunityIcons name="logout" size={22} color="#cf4a4a" />
                            <Text style={styles.logoutText}>Sair</Text>
                        </TouchableOpacity>
                        <View style={styles.pullHandle} />
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    drawer: {
        width: width * 0.82,
        height: '100%',
        backgroundColor: '#0d1117', // Graphite
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 10, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
    },
    profileHeader: {
        padding: 24,
        paddingTop: 40,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatarWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: 'rgba(23, 115, 207, 0.2)',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
        backgroundColor: '#111921',
    },
    profileInfo: {
        flex: 1,
    },
    userName: {
        color: '#f1f5f9',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    phaseTag: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: 2,
    },
    scrollArea: {
        flex: 1,
        paddingHorizontal: 12,
    },
    navGroup: {
        paddingVertical: 20,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 4,
    },
    navItemActive: {
        backgroundColor: 'rgba(23, 115, 207, 0.1)',
    },
    navIcon: {
        width: 32,
    },
    navLabel: {
        color: '#94a3b8',
        fontSize: 15,
        fontWeight: '500',
    },
    navLabelActive: {
        color: colors.primary,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 16,
        marginHorizontal: 16,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    backText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
    },
    sectionTitle: {
        color: '#475569',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.5,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#111921',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        color: '#f1f5f9',
        fontSize: 15,
        fontWeight: '600',
    },
    cardDesc: {
        color: '#64748b',
        fontSize: 12,
        marginTop: 2,
    },
    cardLabel: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 12,
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayBadge: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#0d1117',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    dayBadgeActive: {
        backgroundColor: 'rgba(23, 115, 207, 0.2)',
        borderColor: colors.primary,
    },
    dayText: {
        color: '#475569',
        fontSize: 12,
        fontWeight: '700',
    },
    dayTextActive: {
        color: colors.primary,
    },
    footer: {
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 16,
    },
    logoutText: {
        color: '#cf4a4a',
        fontSize: 16,
        fontWeight: '600',
    },
    pullHandle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10,
    },
    input: {
        backgroundColor: '#0d1117',
        borderRadius: 12,
        padding: 16,
        color: '#f1f5f9',
        fontSize: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    saveBtn: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        padding: 18,
        alignItems: 'center',
        marginHorizontal: 8,
        marginTop: 12,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 1,
    }
});

export default MenuModal;
