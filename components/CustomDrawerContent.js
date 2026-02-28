import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import {
    DrawerContentScrollView,
    DrawerItemList,
} from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import colors from '../colors';

const STOIC_AVATAR = require('../assets/stoic_avatar.jpg');

const CustomDrawerContent = (props) => {
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
                setUserProfile(doc.data());
            }
        });

        return unsubscribe;
    }, []);

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

    return (
        <SafeAreaView style={styles.container}>
            {/* Profile Header */}
            <TouchableOpacity
                style={styles.profileHeader}
                onPress={() => props.navigation.navigate('MainTabs', { screen: 'Profile' })}
            >
                <View style={styles.avatarWrapper}>
                    <Image
                        source={userProfile?.photoURL ? { uri: userProfile.photoURL } : STOIC_AVATAR}
                        style={styles.avatar}
                    />
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.userName}>{userProfile?.name || 'Guerreiro'}</Text>
                    <Text style={styles.phaseTag}>FASE {userProfile?.profile?.phase || '1'}: ESTABILIZAÇÃO</Text>
                </View>
            </TouchableOpacity>

            <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                <View style={styles.navGroup}>
                    <NavItem
                        icon="compass"
                        label="Painel"
                        onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('MainTabs', { screen: 'Dashboard' }); }}
                        isActive={props.state.routes[props.state.index].name === 'MainTabs' && props.state.routes[props.state.index].state?.routes[props.state.routes[props.state.index].state?.index]?.name === 'Dashboard'}
                    />
                    <NavItem
                        icon="brain"
                        label="Diário Terapêutico"
                        onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('MainTabs', { screen: 'Diario' }); }}
                    />
                    <NavItem
                        icon="target"
                        label="Missões"
                        onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('MainTabs', { screen: 'Missoes' }); }}
                    />
                    <NavItem
                        icon="shield-check-outline"
                        label="Histórico Contato Zero"
                        onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('MainTabs', { screen: 'Dashboard' }); }}
                    />
                    <NavItem
                        icon="book-open-variant"
                        label="Biblioteca"
                        onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('MainTabs', { screen: 'Sessions' }); }}
                    />
                    <NavItem
                        icon="history"
                        label="Trajetória & Ciclos"
                        onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('MainTabs', { screen: 'Trajectory' }); }}
                    />

                    <View style={styles.divider} />

                    <NavItem
                        icon="account-cog"
                        label="Perfil & Ajustes"
                        onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('MainTabs', { screen: 'Perfil' }); }}
                        isActive={props.state.routes[props.state.index].name === 'Profile' || (props.state.routes[props.state.index].name === 'MainTabs' && props.state.routes[props.state.index].state?.routes[props.state.routes[props.state.index].state?.index]?.name === 'Perfil')}
                    />
                    <NavItem icon="help-circle-outline" label="Suporte" onPress={() => { }} />
                    <NavItem
                        icon="information-outline"
                        label="Sobre o ORIGIN"
                        onPress={() => { props.navigation.closeDrawer(); props.navigation.navigate('MainTabs', { screen: 'About' }); }}
                    />
                </View>
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d1117', // Graphite
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
    }
});

export default CustomDrawerContent;
