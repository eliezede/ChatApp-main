import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const Plan = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Plano Semanal</Text>
                <Text style={styles.subtitle}>Visualize seu progresso e próximos passos.</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { color: '#888', fontSize: 16, textAlign: 'center' },
});

export default Plan;
