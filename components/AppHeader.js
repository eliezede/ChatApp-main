import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import colors from '../colors';

const AppHeader = ({
    variant = 'brand', // 'brand' or 'nav'
    title,
    subtitle,
    rightAction,
    rightIcon,
    progress = 0,
    showProgress = false
}) => {
    const navigation = useNavigation();

    if (variant === 'brand') {
        return (
            <View style={styles.container}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                        style={styles.iconBtn}
                    >
                        <MaterialCommunityIcons name="menu" size={24} color="#fff" />
                    </TouchableOpacity>

                    <Text style={styles.logoText}>ORIGIN</Text>

                    <TouchableOpacity style={styles.iconBtn}>
                        <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                </View>

                {showProgress && (
                    <View style={styles.headerProgressBase}>
                        <View style={[styles.headerProgressFill, { width: `${Math.min(100, progress)}%` }]} />
                    </View>
                )}
            </View>
        );
    }

    // Navigation Mode
    return (
        <View style={[styles.container, styles.navContainer]}>
            <View style={styles.headerTop}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.iconBtn}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    {subtitle && <Text style={styles.headerSubtitle}>{subtitle.toUpperCase()}</Text>}
                    <Text style={styles.headerTitle}>{title || 'ORIGIN'}</Text>
                </View>

                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={rightAction}
                    disabled={!rightAction}
                >
                    {rightIcon && <MaterialCommunityIcons name={rightIcon} size={24} color={colors.primary} />}
                    {!rightIcon && <View style={{ width: 24 }} />}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.backgroundDark,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    navContainer: {
        paddingBottom: 15,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
    },
    iconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 4,
    },
    notificationBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        borderWidth: 1.5,
        borderColor: colors.backgroundDark,
    },
    headerProgressBase: {
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.05)',
        width: '100%',
    },
    headerProgressFill: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    titleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    headerSubtitle: {
        color: colors.primary,
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 2,
    }
});

export default AppHeader;
