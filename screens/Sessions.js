import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../colors';

const Sessions = () => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="play-circle-outline" size={48} color={colors.primary} />
                </View>
                <Text style={styles.title}>SESSÕES</Text>
                <Text style={styles.subtitle}>
                    Em breve: Aumente sua resiliência com aulas de Estoicismo Prático e Meditações Stoicas.
                </Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>CONTEÚDO EXPERIMENTAL</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundDark,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(23, 115, 207, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 4,
        marginBottom: 16,
    },
    subtitle: {
        color: '#64748b',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 40,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    badgeText: {
        color: '#475569',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});

export default Sessions;
