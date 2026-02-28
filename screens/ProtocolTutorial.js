import React, { useRef, useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Dimensions,
    StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWindowDimensions } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { AuthenticatedUserContext } from '../App';
import colors from '../colors';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        icon: 'shield-star-outline',
        color: colors.primary,
        title: 'O Protocolo foi\nativado.',
        subtitle: 'Com base no seu assessment, geramos um plano único para você. A reconstrução começa agora.',
        accent: 'Você foi avaliado. Seu plano está pronto.',
    },
    {
        id: '2',
        icon: 'chart-timeline-variant',
        color: '#a78bfa',
        title: 'Os 3 pilares\ndo progresso.',
        subtitle: 'Cada tarefa que você completa avança um destes scores. Pequenos avanços, impacto composto.',
        accent: null,
        stats: [
            { color: '#4ade80', icon: 'shield-check-outline', label: 'ESTABILIDADE', desc: 'Completar tarefas de impulso e sessões emocionais (+1–1.5% cada)' },
            { color: colors.primary, icon: 'cube-outline', label: 'ESTRUTURA', desc: 'Completar rotinas e definir prioridades (+0.5–1.5% cada)' },
            { color: '#f472b6', icon: 'lightning-bolt-outline', label: 'DISCIPLINA', desc: 'Completar tarefas essenciais e de identidade (+1–1.5% cada)' },
        ],
    },
    {
        id: '3',
        icon: 'map-marker-path',
        color: '#f59e0b',
        title: 'Três fases.\nUma jornada.',
        subtitle: 'Seu progresso te move de fase em fase. Cada uma exige mais — e te entrega mais.',
        accent: null,
        phases: [
            { name: 'Estabilização', desc: 'Construir a base. Calma, consistência, rotina.', active: true },
            { name: 'Estrutura', desc: 'Otimizar. Foco, produtividade, hábitos profundos.', active: false },
            { name: 'Expansão', desc: 'Domínio. Operando em capacidade máxima.', active: false },
        ],
    },
    {
        id: '4',
        icon: 'seal-variant',
        color: '#4ade80',
        title: 'Seu Contrato\nSoberano.',
        subtitle: 'Este não é apenas um app de tarefas. É um compromisso que você assume consigo mesmo.',
        accent: '"A disciplina é a forma mais elevada de amor-próprio."',
    },
    {
        id: '5',
        icon: 'flag-outline',
        color: colors.primary,
        title: 'Sua missão\ncomeça hoje.',
        subtitle: 'Complete as tarefas do seu plano diário. Cada uma conta. O tempo não espera.',
        accent: 'O Protocolo foi ativado. Sua reconstrução começa agora.',
    },
];

const SlideItem = ({ item }) => (
    <View style={[styles.slide, { width }]}>
        <View style={[styles.iconCircle, { borderColor: `${item.color}30`, backgroundColor: `${item.color}10` }]}>
            <MaterialCommunityIcons name={item.icon} size={44} color={item.color} />
        </View>

        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>

        {item.accent && (
            <View style={[styles.accentBox, { borderColor: `${item.color}30` }]}>
                <Text style={[styles.accentText, { color: item.color }]}>{item.accent}</Text>
            </View>
        )}

        {item.stats && (
            <View style={styles.statsContainer}>
                {item.stats.map(stat => (
                    <View key={stat.label} style={styles.statRow}>
                        <View style={[styles.statIconBox, { backgroundColor: `${stat.color}15`, borderColor: `${stat.color}30` }]}>
                            <MaterialCommunityIcons name={stat.icon} size={16} color={stat.color} />
                        </View>
                        <View style={styles.statInfo}>
                            <Text style={[styles.statLabel, { color: stat.color }]}>{stat.label}</Text>
                            <Text style={styles.statDesc}>{stat.desc}</Text>
                        </View>
                    </View>
                ))}
            </View>
        )}

        {item.phases && (
            <View style={styles.phasesContainer}>
                {item.phases.map((phase, idx) => (
                    <View key={phase.name} style={styles.phaseRow}>
                        <View style={[
                            styles.phaseDot,
                            phase.active && { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
                            !phase.active && { backgroundColor: 'transparent', borderColor: '#1e293b' }
                        ]} />
                        {idx < 2 && <View style={styles.phaseConnector} />}
                        <View style={styles.phaseTextGroup}>
                            <Text style={[styles.phaseName, phase.active && { color: '#f59e0b' }]}>{phase.name}</Text>
                            <Text style={styles.phaseDesc}>{phase.desc}</Text>
                        </View>
                    </View>
                ))}
            </View>
        )}
    </View>
);

const ProtocolTutorial = () => {
    const { setOnboardingCompleted } = useContext(AuthenticatedUserContext);
    const { width } = useWindowDimensions();
    const flatListRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = async () => {
        if (currentIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
            setCurrentIndex(currentIndex + 1);
        } else {
            const user = auth.currentUser;
            if (user) {
                try {
                    await updateDoc(doc(db, 'users', user.uid), {
                        onboardingCompleted: true
                    });
                } catch (error) {
                    console.error("Error updating onboarding status:", error);
                }
            }
            setOnboardingCompleted(true);
        }
    };

    const handleSkip = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                await updateDoc(doc(db, 'users', user.uid), {
                    onboardingCompleted: true
                });
            } catch (error) {
                console.error("Error updating onboarding status:", error);
            }
        }
        setOnboardingCompleted(true);
    };

    const isLast = currentIndex === slides.length - 1;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Skip */}
            <View style={styles.header}>
                <Text style={styles.logoText}>ORIGIN</Text>
                <TouchableOpacity onPress={handleSkip}>
                    <Text style={styles.skipText}>Pular</Text>
                </TouchableOpacity>
            </View>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={({ item }) => <SlideItem item={item} />}
                keyExtractor={item => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                style={{ flex: 1 }}
                getItemLayout={(_, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
            />

            {/* Footer */}
            <View style={styles.footer}>
                {/* Dots */}
                <View style={styles.dotsRow}>
                    {slides.map((_, idx) => (
                        <View key={idx} style={[
                            styles.dot,
                            idx === currentIndex && styles.dotActive
                        ]} />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.nextButton, isLast && styles.nextButtonFinal]}
                    onPress={handleNext}
                    activeOpacity={0.85}
                >
                    <Text style={styles.nextButtonText}>
                        {isLast ? 'INICIAR PROTOCOLO' : 'CONTINUAR'}
                    </Text>
                    <MaterialCommunityIcons
                        name={isLast ? 'arrow-right-circle' : 'arrow-right'}
                        size={20}
                        color="#fff"
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0e13',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingVertical: 20,
    },
    logoText: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 4,
    },
    skipText: {
        color: '#475569',
        fontSize: 13,
        fontWeight: '600',
    },
    slide: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingBottom: 20,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 36,
    },
    slideTitle: {
        color: '#fff',
        fontSize: 30,
        fontWeight: '900',
        textAlign: 'center',
        lineHeight: 36,
        letterSpacing: -0.5,
        marginBottom: 16,
    },
    slideSubtitle: {
        color: '#64748b',
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 28,
    },
    accentBox: {
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 20,
        paddingVertical: 14,
        marginTop: 4,
    },
    accentText: {
        fontSize: 13,
        fontStyle: 'italic',
        textAlign: 'center',
        fontWeight: '600',
    },
    // Stats (slide 2)
    statsContainer: {
        width: '100%',
        gap: 14,
        marginTop: 4,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statIconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statInfo: {
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
        marginBottom: 3,
    },
    statDesc: {
        color: '#475569',
        fontSize: 12,
        lineHeight: 17,
    },
    // Phases (slide 3)
    phasesContainer: {
        width: '100%',
        gap: 0,
        marginTop: 4,
    },
    phaseRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        position: 'relative',
        paddingLeft: 32,
        marginBottom: 22,
    },
    phaseDot: {
        position: 'absolute',
        left: 4,
        top: 4,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        zIndex: 1,
    },
    phaseConnector: {
        position: 'absolute',
        left: 10,
        top: 18,
        width: 2,
        height: 28,
        backgroundColor: '#1e293b',
    },
    phaseTextGroup: {
        flex: 1,
    },
    phaseName: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 3,
    },
    phaseDesc: {
        color: '#475569',
        fontSize: 12,
        lineHeight: 17,
    },
    // Footer
    footer: {
        paddingHorizontal: 28,
        paddingBottom: 32,
        paddingTop: 16,
        gap: 20,
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#1e293b',
    },
    dotActive: {
        width: 22,
        backgroundColor: colors.primary,
    },
    nextButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        borderRadius: 18,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
    },
    nextButtonFinal: {
        backgroundColor: '#166534',
        shadowColor: '#4ade80',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 1,
    },
});

export default ProtocolTutorial;
