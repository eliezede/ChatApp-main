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
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { AuthenticatedUserContext } from '../App';
import colors from '../colors';
import { generateDailyPlan } from '../logic/PlanEngine';

const { width } = Dimensions.get('window');

const Questionnaire = ({ navigation }) => {
    const { setOnboardingCompleted } = useContext(AuthenticatedUserContext);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const isMounted = useRef(true);

    const question = questions[currentStep];
    const progress = ((currentStep + 1) / questions.length) * 100;

    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleOptionPress = (index) => {
        if (question.type === 'multiple') {
            if (selectedOptions.includes(index)) {
                setSelectedOptions(selectedOptions.filter(i => i !== index));
            } else {
                if (selectedOptions.length < 2) {
                    setSelectedOptions([...selectedOptions, index]);
                }
            }
        } else {
            setSelectedOptions([index]);
        }
    };

    const handleContinue = () => {
        if (selectedOptions.length === 0) return;

        let finalValue;
        if (question.type === 'multiple') {
            finalValue = selectedOptions.map(i => question.options[i]);
        } else {
            finalValue = question.options[selectedOptions[0]];
        }

        const weightValue = question.type === 'multiple'
            ? selectedOptions.reduce((acc, i) => acc + question.weights[i], 0) / selectedOptions.length
            : question.weights[selectedOptions[0]];

        const updatedAnswers = {
            ...answers,
            [question.id]: finalValue,
            [`${question.id}_weight`]: weightValue
        };

        setAnswers(updatedAnswers);
        setSelectedOptions([]);

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

                await generateDailyPlan(user.uid, profile);
            }
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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigation.goBack()}
                    style={styles.backButton}
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Onboarding</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Progress Bar Section */}
            <View style={styles.progressSection}>
                <View style={styles.progressTextContainer}>
                    <Text style={styles.progressLabel}>Progresso da jornada</Text>
                    <Text style={styles.progressValue}>{currentStep + 1}/{questions.length}</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <Animated.View
                        style={[
                            styles.progressBarFill,
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

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.questionHeader}>
                    <Text style={styles.questionTitle}>{question.question}</Text>
                    <Text style={styles.questionSubtitle}>
                        {question.type === 'multiple' ? 'Escolha até 2 opções' : 'Isso nos ajuda a personalizar os exercícios para o seu momento atual.'}
                    </Text>
                </View>

                <View style={styles.optionsList}>
                    {question.options.map((option, index) => {
                        const isSelected = selectedOptions.includes(index);
                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.7}
                                style={[
                                    styles.optionCard,
                                    isSelected && styles.optionCardSelected
                                ]}
                                onPress={() => handleOptionPress(index)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    isSelected && styles.optionTextSelected
                                ]}>{option}</Text>
                                <View style={[
                                    styles.checkbox,
                                    isSelected && styles.checkboxSelected
                                ]}>
                                    {isSelected && (
                                        <MaterialCommunityIcons
                                            name={question.type === 'multiple' ? "check" : "circle"}
                                            size={question.type === 'multiple' ? 16 : 10}
                                            color="#fff"
                                        />
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        { opacity: selectedOptions.length === 0 || loading ? 0.6 : 1 }
                    ]}
                    disabled={selectedOptions.length === 0 || loading}
                    onPress={handleContinue}
                >
                    <Text style={styles.continueButtonText}>{loading ? 'Processando...' : 'Continuar'}</Text>
                    {!loading && <MaterialCommunityIcons name="arrow-right" size={20} color={colors.backgroundDark} />}
                </TouchableOpacity>
                <Text style={styles.footerHint}>
                    Suas respostas são privadas e usadas apenas para melhorar sua experiência.
                </Text>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    progressSection: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    progressTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
        fontWeight: '500',
    },
    progressValue: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(244, 157, 37, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 160,
    },
    questionHeader: {
        paddingTop: 32,
        paddingBottom: 32,
    },
    questionTitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '800',
        lineHeight: 40,
        marginBottom: 12,
    },
    questionSubtitle: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 16,
        lineHeight: 24,
    },
    optionsList: {
        gap: 16,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    optionCardSelected: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(244, 157, 37, 0.08)',
    },
    optionText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
        marginRight: 16,
    },
    optionTextSelected: {
        color: '#fff',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        backgroundColor: colors.backgroundDark,
    },
    continueButton: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    continueButtonText: {
        color: colors.backgroundDark,
        fontSize: 18,
        fontWeight: '800',
    },
    footerHint: {
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 12,
        marginTop: 16,
        paddingHorizontal: 20,
    },
});

export default Questionnaire;
