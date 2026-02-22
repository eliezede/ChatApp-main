import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { questions } from '../logic/questions';
import { calculateProfile } from '../logic/ScoringEngine';
import { db, auth } from '../config/firebase';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { AuthenticatedUserContext } from '../App';
import colors from '../colors';
import { generateDailyPlan } from '../logic/PlanEngine';

const { width } = Dimensions.get('window');

const Questionnaire = ({ navigation }) => {
    const { setOnboardingCompleted } = useContext(AuthenticatedUserContext);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const isMounted = useRef(true);

    const question = questions[currentStep];
    const progress = ((currentStep + 1) / questions.length) * 100;

    // Animation for progress bar
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 500,
            useNativeDriver: Platform.OS !== 'web',
        }).start();
    }, [progress]);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleAnswer = (option, index) => {
        setSelectedOption(index);
    };

    const handleContinue = () => {
        if (selectedOption === null) return;

        const op = question.type === 'scale' ? selectedOption : question.options[selectedOption];

        const updatedAnswers = {
            ...answers,
            [question.id]: op,
            [`${question.id}_weight`]: question.weights ? question.weights[selectedOption] : selectedOption
        };

        setAnswers(updatedAnswers);
        setSelectedOption(null);

        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            finishOnboarding(updatedAnswers);
        }
    };

    const finishOnboarding = async (finalAnswers) => {
        setLoading(true);
        try {
            const profile = calculateProfile(finalAnswers);
            const user = auth.currentUser;

            if (user) {
                await updateDoc(doc(db, 'users', user.uid), {
                    onboardingCompleted: true,
                    profile: profile,
                    lastPlanGeneration: serverTimestamp()
                });

                // Generate initial plan using the new engine
                await generateDailyPlan(user.uid, profile);
            }
            // Navigate to tutorial first — tutorial calls setOnboardingCompleted
            navigation.navigate('ProtocolTutorial');
        } catch (error) {
            console.error("Error finishing onboarding:", error);
            if (isMounted.current) {
                alert("Erro ao salvar dados. Tente novamente.");
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    const getIconForOption = (option, index) => {
        const icons = ['lightbulb-outline', 'clock-outline', 'weight-lifter', 'account-group-outline', 'dots-horizontal'];
        return icons[index % icons.length];
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Progress Header */}
            <View style={styles.progressHeader}>
                <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>ASSESSMENT</Text>
                    <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <Animated.View
                        style={[
                            styles.progressFill,
                            {
                                width: progressAnim.interpolate({
                                    inputRange: [0, 100],
                                    outputRange: ['0%', '100%'],
                                })
                            }
                        ]}
                    />
                </View>
            </View>

            {/* Navigation */}
            <View style={styles.navBar}>
                <TouchableOpacity
                    onPress={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigation.goBack()}
                    style={styles.navButton}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.exitText}>Sair</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Question Section */}
                <View style={styles.questionSection}>
                    <Text style={styles.questionText}>{question.question}</Text>
                    <Text style={styles.questionHint}>
                        {question.type === 'scale'
                            ? 'Selecione um valor de 0 a 10 que melhor representa seu estado atual.'
                            : 'Sua honestidade é o primeiro passo para uma reconstrução efetiva.'}
                    </Text>
                </View>

                {/* Options List */}
                <View style={styles.optionsList}>
                    {question.type === 'scale' ? (
                        <View style={styles.scaleContainer}>
                            {[...Array(11).keys()].map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={[
                                        styles.scaleItem,
                                        selectedOption === num && styles.scaleItemSelected
                                    ]}
                                    onPress={() => handleAnswer(num, num)}
                                >
                                    <Text style={[
                                        styles.scaleText,
                                        selectedOption === num && styles.scaleTextSelected
                                    ]}>{num}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        question.options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.optionCard,
                                    selectedOption === index && styles.optionCardSelected
                                ]}
                                onPress={() => handleAnswer(option, index)}
                            >
                                <View style={styles.cardLeft}>
                                    <View style={styles.iconWrapper}>
                                        <MaterialCommunityIcons
                                            name={getIconForOption(option, index)}
                                            size={22}
                                            color={selectedOption === index ? colors.primary : colors.textSecondary}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.optionLabel,
                                        selectedOption === index && styles.optionLabelSelected
                                    ]}>
                                        {option}
                                    </Text>
                                </View>
                                <View style={[
                                    styles.radioIndicator,
                                    selectedOption === index && styles.radioIndicatorSelected
                                ]}>
                                    {selectedOption === index && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        { opacity: (loading || selectedOption === null) ? 0.6 : 1 }
                    ]}
                    disabled={loading || selectedOption === null}
                    onPress={handleContinue}
                >
                    <Text style={styles.continueButtonText}>
                        {loading ? 'Processando...' : 'Continuar'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundDark,
    },
    progressHeader: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: 'rgba(17, 25, 33, 0.95)',
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    progressLabel: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
    },
    progressPercentage: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 4,
        backgroundColor: colors.borderDark,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 2,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    navButton: {
        padding: 8,
    },
    exitText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
        padding: 8,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 120,
    },
    questionSection: {
        marginTop: 24,
        marginBottom: 32,
    },
    questionText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        lineHeight: 34,
        letterSpacing: -0.5,
    },
    questionHint: {
        color: colors.textSecondary,
        fontSize: 14,
        marginTop: 12,
        lineHeight: 20,
    },
    optionsList: {
        gap: 12,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surfaceDark,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderDark,
    },
    optionCardSelected: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(23, 115, 207, 0.1)',
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.backgroundDark,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    optionLabel: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    optionLabelSelected: {
        color: '#fff',
    },
    radioIndicator: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#475569',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioIndicatorSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    radioInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    scaleContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
    },
    scaleItem: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: colors.surfaceDark,
        borderWidth: 1,
        borderColor: colors.borderDark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scaleItemSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    scaleText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    scaleTextSelected: {
        color: '#fff',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 24,
        paddingBottom: 40,
        backgroundColor: 'rgba(17, 25, 33, 0.95)',
        borderTopWidth: 1,
        borderTopColor: colors.borderDark,
    },
    continueButton: {
        backgroundColor: colors.primary,
        height: 58,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default Questionnaire;
