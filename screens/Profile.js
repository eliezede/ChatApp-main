import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Image,
    Switch,
    TextInput,
    Alert,
    Platform,
    StatusBar,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { auth, db, storage } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AuthenticatedUserContext } from '../App';
import * as ImagePicker from 'expo-image-picker';
import colors from '../colors';

const STOIC_AVATAR = require('../assets/stoic_avatar.jpg');

const Profile = ({ navigation }) => {
    const { setOnboardingCompleted } = React.useContext(AuthenticatedUserContext);
    const [userProfile, setUserProfile] = React.useState(null);
    const [isEditingProfile, setIsEditingProfile] = React.useState(false);
    const [editName, setEditName] = React.useState('');
    const [editFocus, setEditFocus] = React.useState('');
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [uploading, setUploading] = React.useState(false);

    React.useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setUserProfile(data);
                setEditName(data.name || '');
                setEditFocus(data.profile?.focus || '');
            }
        });

        return unsubscribe;
    }, []);

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                name: editName,
                'profile.focus': editFocus
            });
            setIsEditingProfile(false);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão Necessária', 'Precisamos de acesso às suas fotos.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.3,
            base64: false,
        });

        if (!result.cancelled) {
            const user = auth.currentUser;
            const uri = result.uri;

            setUploading(true);
            try {
                // Robust XHR-based blob conversion (Standard practice for local files)
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        resolve(xhr.response);
                    };
                    xhr.onerror = function (e) {
                        console.log(e);
                        reject(new TypeError("Network request failed"));
                    };
                    xhr.responseType = "blob";
                    xhr.open("GET", uri, true);
                    xhr.send(null);
                });

                const storageRef = ref(storage, `profile_photos/${user.uid}.jpg`);
                await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
                const downloadURL = await getDownloadURL(storageRef);

                await updateDoc(doc(db, 'users', user.uid), { photoURL: downloadURL });
                Alert.alert('Sucesso', 'Foto de perfil atualizada!');
            } catch (error) {
                console.error("Error uploading image:", error);
                Alert.alert('Erro', 'Não foi possível atualizar a foto.');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleUpdatePhoto = async () => {
        if (Platform.OS === 'web') {
            const choice = window.confirm('Deseja alterar sua fotografia?\n\nOK = Escolher da Galeria\nCancelar = Restaurar Avatar Estoico');
            if (choice) { pickImage(); }
            else {
                const user = auth.currentUser;
                await updateDoc(doc(db, 'users', user.uid), { photoURL: null });
            }
            return;
        }
        Alert.alert('Identidade Visual', 'Como deseja proceder?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Restaurar Estoico', onPress: async () => {
                    const user = auth.currentUser;
                    await updateDoc(doc(db, 'users', user.uid), { photoURL: null });
                }, style: 'destructive'
            },
            { text: 'Escolher Foto', onPress: pickImage }
        ]);
    };

    const handleLogout = () => {
        if (Platform.OS === 'web') {
            const choice = window.confirm('Deseja realmente encerrar a sessão?');
            if (choice) signOut(auth);
            return;
        }
        Alert.alert('Encerrar Sessão', 'Deseja realmente sair?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', onPress: () => signOut(auth), style: 'destructive' }
        ]);
    };

    const phase = userProfile?.profile?.phase;
    const roleLabel = phase === 3 ? 'MESTRE' : phase === 2 ? 'ARQUITETO' : 'NEÓFITO';
    const phaseDisplay = phase === 3 ? 'Expansão' : phase === 2 ? 'Estrutura' : 'Estabilização';
    const disciplineScore = Math.round(userProfile?.profile?.disciplineScore || 0);
    const stabilityScore = Math.round(userProfile?.profile?.stabilityScore || 0);
    const structureScore = Math.round(userProfile?.profile?.structureScore || 0);
    const czStreak = userProfile?.contactZero?.currentStreak || 0;
    const czBest = userProfile?.contactZero?.bestStreak || 0;
    const czTotal = (userProfile?.contactZero?.history || []).filter(h => h.success).length;

    // --- Sub-components ---
    const SettingsRow = ({ icon, label, onPress, rightContent, rightText, isDestructive = false }) => (
        <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
            <View style={styles.settingsRowLeft}>
                <MaterialCommunityIcons
                    name={icon}
                    size={20}
                    color={isDestructive ? '#ef4444' : colors.textSecondary}
                    style={{ marginRight: 16 }}
                />
                <Text style={[styles.settingsRowLabel, isDestructive && { color: '#ef4444' }]}>{label}</Text>
            </View>
            {rightContent || (
                rightText
                    ? <Text style={styles.settingsRowRight}>{rightText}</Text>
                    : onPress && <MaterialCommunityIcons name="chevron-right" size={18} color="#334155" />
            )}
        </TouchableOpacity>
    );

    const SectionTitle = ({ children }) => (
        <Text style={styles.sectionTitle}>{children}</Text>
    );

    const SettingsGroup = ({ children }) => (
        <View style={styles.settingsGroup}>{children}</View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <AppHeader
                variant="brand"
                rightIcon={isEditingProfile ? "check" : null}
                rightAction={isEditingProfile ? handleSave : null}
            />

            <View style={{ flex: 1, overflow: 'hidden' }}>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Hero */}
                    <View style={styles.heroSection}>
                        <TouchableOpacity
                            style={styles.avatarWrapper}
                            onPress={handleUpdatePhoto}
                            activeOpacity={0.85}
                            disabled={uploading}
                        >
                            <View style={styles.avatarBorder}>
                                <Image
                                    source={userProfile?.photoURL ? { uri: userProfile.photoURL } : STOIC_AVATAR}
                                    style={[styles.avatar, uploading && { opacity: 0.5 }]}
                                />
                                {uploading && (
                                    <View style={styles.loaderOverlay}>
                                        <ActivityIndicator color={colors.primary} size="large" />
                                    </View>
                                )}
                            </View>
                            {!uploading && (
                                <View style={styles.editBadge}>
                                    <MaterialCommunityIcons name="pencil" size={13} color={colors.primary} />
                                </View>
                            )}
                        </TouchableOpacity>

                        {isEditingProfile ? (
                            <TextInput
                                style={styles.nameInput}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Seu Nome"
                                placeholderTextColor="#475569"
                                autoFocus
                            />
                        ) : (
                            <Text style={styles.userName}>{(userProfile?.name || 'GUERREIRO').toUpperCase()}</Text>
                        )}
                    </View>


                    {/* Contato Zero Stats */}
                    <View style={styles.czStatsRow}>
                        <View style={styles.czCardHeader}>
                            <MaterialCommunityIcons name="shield-check-outline" size={14} color={colors.primary} />
                            <Text style={styles.czCardTitle}>CONTATO ZERO</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={styles.czStatItem}>
                                <MaterialCommunityIcons name="fire" size={18} color={colors.primary} />
                                <Text style={styles.czStatValue}>{czStreak}</Text>
                                <Text style={styles.czStatLabel}>Sequência{`\n`}Atual</Text>
                            </View>
                            <View style={styles.czStatDivider} />
                            <View style={styles.czStatItem}>
                                <MaterialCommunityIcons name="shield-check" size={18} color="#22c55e" />
                                <Text style={[styles.czStatValue, { color: '#22c55e' }]}>{czTotal}</Text>
                                <Text style={styles.czStatLabel}>Dias de{`\n`}Vitória</Text>
                            </View>
                            <View style={styles.czStatDivider} />
                            <View style={styles.czStatItem}>
                                <MaterialCommunityIcons name="trophy-outline" size={18} color="#fbbf24" />
                                <Text style={[styles.czStatValue, { color: '#fbbf24' }]}>{czBest}</Text>
                                <Text style={styles.czStatLabel}>Melhor{`\n`}Sequência</Text>
                            </View>
                        </View>
                    </View>

                    {/* === SETTINGS SECTIONS === */}
                    <View style={styles.settingsSections}>

                        {/* Identity */}
                        <SectionTitle>IDENTIDADE</SectionTitle>
                        <SettingsGroup>
                            <SettingsRow
                                icon="account-edit-outline"
                                label="Editar Nome & Foco"
                                onPress={() => setIsEditingProfile(true)}
                            />
                            {isEditingProfile && (
                                <View style={styles.inlineEditContainer}>
                                    <Text style={styles.inputLabel}>FOCO ATUAL</Text>
                                    <TextInput
                                        style={styles.focusInput}
                                        value={editFocus}
                                        onChangeText={setEditFocus}
                                        placeholder="Ex: Resiliência"
                                        placeholderTextColor="#475569"
                                    />
                                </View>
                            )}
                            <SettingsRow
                                icon="camera-outline"
                                label="Alterar Foto"
                                onPress={handleUpdatePhoto}
                            />
                            <SettingsRow
                                icon="chart-line"
                                label="Detalhes do Protocolo"
                                onPress={() => navigation.navigate('ProgressDetail')}
                            />
                            <SettingsRow
                                icon="run-fast"
                                label="Ajustes de Rotina"
                                onPress={() => navigation.navigate('TrainingSettings')}
                            />
                        </SettingsGroup>

                        {/* Journey */}
                        <SectionTitle>A MINHA JORNADA</SectionTitle>
                        <SettingsGroup>
                            <SettingsRow
                                icon="shield-check-outline"
                                label="Histórico Contato Zero"
                                rightText={`${czStreak} dias`}
                                onPress={() => navigation.navigate('CheckinHistory')}
                            />
                            <SettingsRow
                                icon="brain"
                                label="Diário Terapêutico"
                                onPress={() => navigation.navigate('Diario')}
                            />
                            <SettingsRow
                                icon="target"
                                label="Missões Ativas"
                                onPress={() => navigation.navigate('Missoes')}
                            />
                            <SettingsRow
                                icon="view-dashboard-outline"
                                label="Relatório de Equilíbrio"
                                onPress={() => navigation.navigate('Dashboard')}
                            />
                        </SettingsGroup>

                        {/* System */}
                        <SectionTitle>SISTEMA</SectionTitle>
                        <SettingsGroup>
                            <SettingsRow
                                icon="bell-outline"
                                label="Notificações"
                                rightContent={
                                    <Switch
                                        value={notificationsEnabled}
                                        onValueChange={setNotificationsEnabled}
                                        trackColor={{ false: '#1e293b', true: colors.primary }}
                                        thumbColor="#fff"
                                    />
                                }
                            />
                            <SettingsRow
                                icon="weather-night"
                                label="Modo Escuro"
                                rightText="Ativo"
                            />
                            <SettingsRow
                                icon="cloud-sync-outline"
                                label="Status de Sincronização"
                                rightContent={
                                    <View style={styles.syncStatus}>
                                        <View style={styles.syncDot} />
                                        <Text style={styles.syncText}>Ativo</Text>
                                    </View>
                                }
                            />
                        </SettingsGroup>

                        {/* Support */}
                        <SectionTitle>SUPORTE</SectionTitle>
                        <SettingsGroup>
                            <SettingsRow
                                icon="book-open-outline"
                                label="Manual Estoico"
                                onPress={() => Linking.openURL('https://en.wikisource.org/wiki/Meditations')}
                            />
                            <SettingsRow
                                icon="message-text-outline"
                                label="Enviar Feedback"
                                onPress={() => Linking.openURL('mailto:feedback@originprotocol.app')}
                            />
                        </SettingsGroup>

                        {/* Danger Zone */}
                        <View style={styles.dangerZone}>
                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                                <MaterialCommunityIcons name="logout" size={18} color="#ef4444" />
                                <Text style={styles.logoutText}>Encerrar Sessão</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Quote */}
                        <View style={styles.quoteSection}>
                            <Text style={styles.quoteText}>"Não perca mais tempo argumentando sobre como um bom homem deve ser. Seja um."</Text>
                            <Text style={styles.quoteAuthor}>— MARCO AURÉLIO</Text>
                        </View>

                    </View>
                </ScrollView>
            </View>
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
        paddingHorizontal: 24,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    headerTitle: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 3,
    },
    headerBtn: {
        padding: 4,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    // Hero
    heroSection: {
        alignItems: 'center',
        paddingTop: 32,
        paddingBottom: 24,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 4,
    },
    avatarBorder: {
        padding: 4,
        borderRadius: 64,
        borderWidth: 2,
        borderColor: `${colors.primary}40`,
    },
    avatar: {
        width: 108,
        height: 108,
        borderRadius: 54,
        backgroundColor: '#1c2530',
    },
    editBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: colors.surfaceDark,
        borderWidth: 1,
        borderColor: colors.borderDark,
        borderRadius: 14,
        padding: 5,
    },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 54,
    },
    userName: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
        marginTop: 14,
        letterSpacing: 1,
    },
    nameInput: {
        color: colors.primary,
        fontSize: 22,
        fontWeight: '900',
        marginTop: 14,
        letterSpacing: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 6,
        textAlign: 'center',
        width: '75%',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 10,
    },
    roleBadge: {
        backgroundColor: `${colors.primary}25`,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: `${colors.primary}30`,
    },
    roleBadgeText: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    phaseText: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surfaceDark,
        borderWidth: 1,
        borderColor: colors.borderDark,
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
    },
    statValue: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 4,
    },
    statUnit: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '400',
    },
    statLabel: {
        color: colors.textSecondary,
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    // Settings
    settingsSections: {
        paddingHorizontal: 16,
        gap: 4,
    },
    sectionTitle: {
        color: '#475569',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.5,
        paddingHorizontal: 4,
        marginBottom: 8,
        marginTop: 24,
    },
    settingsGroup: {
        backgroundColor: colors.surfaceDark,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderDark,
        overflow: 'hidden',
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    settingsRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingsRowLabel: {
        color: '#d1d5db',
        fontSize: 14,
        fontWeight: '500',
    },
    settingsRowRight: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    // Sync
    syncStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    syncDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: '#22c55e',
    },
    syncText: {
        color: '#22c55e',
        fontSize: 12,
        fontWeight: '600',
    },
    // Inline Edit
    inlineEditContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    inputLabel: {
        color: '#475569',
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    focusInput: {
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 10,
        padding: 12,
        color: '#fff',
        fontSize: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    // Danger Zone
    dangerZone: {
        marginTop: 32,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        backgroundColor: 'rgba(239, 68, 68, 0.04)',
        gap: 10,
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: '700',
        fontSize: 14,
    },
    // Quote
    quoteSection: {
        alignItems: 'center',
        marginTop: 40,
        paddingHorizontal: 24,
        paddingBottom: 10,
        opacity: 0.4,
    },
    quoteText: {
        color: colors.textSecondary,
        fontSize: 11,
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 18,
    },
    quoteAuthor: {
        color: colors.textSecondary,
        fontSize: 9,
        marginTop: 6,
        letterSpacing: 2,
    },

    // Contato Zero row
    czStatsRow: {
        flexDirection: 'column',
        backgroundColor: 'rgba(23, 28, 35, 0.7)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 242, 255, 0.1)',
        marginHorizontal: 24,
        marginBottom: 24,
        paddingTop: 14,
        paddingBottom: 18,
        paddingHorizontal: 16,
    },
    czCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    czCardTitle: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    czStatItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    czStatValue: {
        color: colors.primary,
        fontSize: 26,
        fontWeight: '900',
        lineHeight: 30,
    },
    czStatLabel: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 14,
    },
    czStatDivider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
});

export default Profile;
