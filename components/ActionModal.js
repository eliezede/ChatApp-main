import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../colors';

const { width, height } = Dimensions.get('window');

// Local-safe date string helper
const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const CalendarPicker = ({ selectedDate, onSelect, onClose }) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate + 'T12:00:00'));

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const startDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase();

    const changeMonth = (offset) => {
        const next = new Date(currentMonth);
        next.setMonth(currentMonth.getMonth() + offset);
        setCurrentMonth(next);
    };

    return (
        <View style={styles.calendarPickerContainer}>
            <View style={styles.calendarPickerHeader}>
                <TouchableOpacity onPress={() => changeMonth(-1)}>
                    <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.calendarMonthName}>{monthName} {currentMonth.getFullYear()}</Text>
                <TouchableOpacity onPress={() => changeMonth(1)}>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
            <View style={styles.calendarPickerGrid}>
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                    <Text key={i} style={styles.calendarPickerDayName}>{d}</Text>
                ))}
                {Array.from({ length: startDayOfMonth }).map((_, i) => <View key={`p-${i}`} style={styles.calendarPickerDayEmpty} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = i + 1;
                    const year = currentMonth.getFullYear();
                    const month = currentMonth.getMonth();
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

                    const isSelected = dateStr === selectedDate;
                    const dateObj = new Date(year, month, d);
                    const isToday = dateObj.toDateString() === today.toDateString();

                    return (
                        <TouchableOpacity
                            key={d}
                            style={[styles.calendarPickerDay, isSelected && styles.calendarPickerDaySelected]}
                            onPress={() => onSelect(dateStr)}
                        >
                            <Text style={[styles.calendarPickerDayText, isSelected && { color: '#000', fontWeight: 'bold' }, isToday && !isSelected && { color: colors.primary }]}>
                                {d}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const ActionModal = ({ isVisible, onClose, task, onSave }) => {
    const { height } = useWindowDimensions();
    const [data, setData] = useState({});
    const [showCalendar, setShowCalendar] = useState(false);
    const [step, setStep] = useState(1);
    const [completedExercises, setCompletedExercises] = useState([]);
    const [exerciseDetail, setExerciseDetail] = useState(null);

    const actionType = task?.actionType || 'SIMPLE';

    const saveAndClose = () => {
        onSave(data);
        onClose();
        setData({});
        setStep(1);
    };

    const renderPriority = () => (
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>PLANEJAMENTO DO DIA</Text>
            <Text style={styles.modalSub}>Defina suas 3 prioridades inegociáveis. Estas se tornarão tarefas ativas no seu dashboard.</Text>

            <View style={styles.inputGroup}>
                {[1, 2, 3].map(i => (
                    <View key={i} style={styles.inputWrapper}>
                        <Text style={styles.inputNumber}>{i}</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ex: Ligar para o pai..."
                            placeholderTextColor="#475569"
                            onChangeText={(val) => setData({ ...data, [`p${i}`]: val })}
                            value={data[`p${i}`] || ''}
                        />
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveAndClose}>
                <Text style={styles.saveButtonText}>ESTABELECER FOCO</Text>
            </TouchableOpacity>
        </View>
    );

    const renderPhysicalTraining = () => {
        const workouts = [
            {
                id: 'calisthenics',
                title: 'Alicerces de Aço (Calistenia)',
                icon: 'weight-lifter',
                desc: 'Flexões, agachamentos e barra.',
                plan: [
                    { id: 'c1', text: '3x12 Flexões', detail: 'Foco em amplitude total. Peito encosta no chão.' },
                    { id: 'c2', text: '3x15 Agachamentos', detail: 'Lentos na descida, explosivos na subida.' },
                    { id: 'c3', text: '3x10 Barra ou Remada', detail: 'Fortalecimento de costas e puxada.' },
                    { id: 'c4', text: '3x45s Prancha', detail: 'Mantenha o core rígido e alinhado.' }
                ]
            },
            {
                id: 'cardio',
                title: 'Pulmões de Ferro (Cardio)',
                icon: 'run',
                desc: 'Corrida ou caminhada vigorosa.',
                plan: [
                    { id: 'ca1', text: '5 min Aquecimento', detail: 'Trote leve para preparar as articulações.' },
                    { id: 'ca2', text: '20 min Corrida/Caminhada', detail: 'Ritmo constante onde você consiga falar (Z2).' },
                    { id: 'ca3', text: '5 min Desaceleração', detail: 'Caminhada lenta para baixar o ritmo cardíaco.' },
                    { id: 'ca4', text: 'Respiração Nasal', detail: 'Mantenha a boca fechada durante todo o treino.' }
                ]
            },
            {
                id: 'mobility',
                title: 'Fluxo de Resiliência (Mobilidade)',
                icon: 'yoga',
                desc: 'Soltura articular e flexibilidade.',
                plan: [
                    { id: 'm1', text: 'Rotações Articulares', detail: '10x para cada lado: Pescoço, Ombros, Quadril.' },
                    { id: 'm2', text: 'Posição de Cócoras', detail: 'Fique 3 min na posição mais baixa do agachamento.' },
                    { id: 'm3', text: 'Saudação ao Sol', detail: '5 ciclos de Yoga Flow para despertar o corpo.' },
                    { id: 'm4', text: 'Alongamento Isquios', detail: 'Mantenha 90s em cada perna.' }
                ]
            },
            {
                id: 'high_intensity',
                title: 'Fogo na Alma (HIIT)',
                icon: 'lightning-bolt',
                desc: 'Treino curto e intenso.',
                plan: [
                    { id: 'h1', text: 'Polichinelos (45s)', detail: 'Intensidade máxima seguida de 15s descanso.' },
                    { id: 'h2', text: 'Burpees (45s)', detail: 'Movimento completo com salto e flexão.' },
                    { id: 'h3', text: 'Escaladores (45s)', detail: 'Joelho no cotovelo o mais rápido possível.' },
                    { id: 'h4', text: 'Repetir Ciclo x4', detail: 'Descanse 1 min entre os ciclos de 4 minutos.' }
                ]
            },
        ];

        const selectedWorkout = workouts.find(w => w.id === data.workoutId);

        const toggleExercise = (exId) => {
            const newList = completedExercises.includes(exId)
                ? completedExercises.filter(id => id !== exId)
                : [...completedExercises, exId];
            setCompletedExercises(newList);
            setData({ ...data, completedExercises: newList });
        };

        return (
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>TREINO FÍSICO</Text>

                {step === 1 ? (
                    <>
                        <Text style={styles.modalSub}>"O corpo é a ferramenta da alma". Escolha sua modalidade de hoje:</Text>
                        <View style={styles.workoutList}>
                            {workouts.map(w => (
                                <TouchableOpacity
                                    key={w.id}
                                    style={[styles.workoutCard, data.workoutId === w.id && styles.workoutCardSelected]}
                                    onPress={() => {
                                        setData({ ...data, workoutId: w.id, workoutTitle: w.title });
                                        setStep(2);
                                    }}
                                >
                                    <View style={styles.workoutInfo}>
                                        <MaterialCommunityIcons
                                            name={w.icon}
                                            size={24}
                                            color={data.workoutId === w.id ? colors.primary : '#64748b'}
                                        />
                                        <View style={{ marginLeft: 16 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={[styles.workoutTitleText, data.workoutId === w.id && styles.workoutTitleSelected]}>{w.title}</Text>
                                                {task.lastWorkoutId && task.lastWorkoutId !== w.id && (
                                                    <View style={styles.suggestedBadge}>
                                                        <Text style={styles.suggestedBadgeText}>SUGERIDO</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.workoutDesc}>{w.desc}</Text>
                                        </View>
                                    </View>
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#334155" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.modalSub}>Complete os exercícios do seu plano:</Text>
                        <View style={styles.planContainer}>
                            {selectedWorkout?.plan.map((item, idx) => (
                                <View key={item.id}>
                                    <TouchableOpacity
                                        style={styles.planItem}
                                        onPress={() => toggleExercise(item.id)}
                                    >
                                        <MaterialCommunityIcons
                                            name={completedExercises.includes(item.id) ? "checkbox-marked-circle" : "circle-outline"}
                                            size={24}
                                            color={completedExercises.includes(item.id) ? '#10b981' : '#475569'}
                                        />
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={[styles.planItemText, completedExercises.includes(item.id) && styles.planItemTextDone]}>
                                                {item.text}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setExerciseDetail(item)}>
                                            <MaterialCommunityIcons name="information-outline" size={20} color="#64748b" />
                                        </TouchableOpacity>
                                    </TouchableOpacity>

                                    {exerciseDetail?.id === item.id && (
                                        <View style={styles.exerciseDetailBox}>
                                            <Text style={styles.exerciseDetailText}>{item.detail}</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.backLink} onPress={() => { setStep(1); setExerciseDetail(null); }}>
                                <Text style={styles.backLinkText}>TROCAR</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, completedExercises.length === 0 && { opacity: 0.5 }]}
                                onPress={saveAndClose}
                                disabled={completedExercises.length === 0}
                            >
                                <Text style={styles.saveButtonText}>CONCLUIR TREINO</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        );
    };

    const renderEmotionLab = () => {
        const emotions = ['Angústia', 'Melancolia', 'Frustração', 'Inveja', 'Calmaria', 'Ansiedade', 'Resiliência', 'Foco'];

        return (
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>LABORATÓRIO DE EMOÇÕES</Text>

                {step === 1 ? (
                    <>
                        <Text style={styles.modalSub}>Qual emoção você está experimentando agora?</Text>
                        <View style={styles.emotionGrid}>
                            {emotions.map(e => (
                                <TouchableOpacity
                                    key={e}
                                    style={[styles.emotionBadge, data.emotion === e && styles.emotionBadgeSelected]}
                                    onPress={() => {
                                        setData({ ...data, emotion: e });
                                        setStep(2);
                                    }}
                                >
                                    <Text style={[styles.emotionText, data.emotion === e && styles.emotionTextSelected]}>{e}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.modalSub}>Prompt Estoico:</Text>
                        <Text style={styles.promptText}>
                            "Esta dor vem do evento ou do seu julgamento sobre o evento?"
                        </Text>
                        <TextInput
                            style={[styles.textInputLarge, { height: 120 }]}
                            placeholder="Reflita aqui..."
                            placeholderTextColor="#475569"
                            multiline
                            value={data.reflection || ''}
                            onChangeText={(val) => setData({ ...data, reflection: val })}
                        />
                        <TouchableOpacity style={styles.saveButton} onPress={saveAndClose}>
                            <Text style={styles.saveButtonText}>EXTERNALIZAR</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        );
    };

    const renderDialectic = () => (
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>FATO VS NARRATIVA</Text>
            <Text style={styles.modalSub}>Separe a percepção da realidade.</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.sectionLabel}>O QUE ACONTECEU? (FATO)</Text>
                <TextInput
                    style={styles.textInputLarge}
                    placeholder="Apenas os fatos brutos..."
                    placeholderTextColor="#475569"
                    multiline
                    value={data.fact || ''}
                    onChangeText={(val) => setData({ ...data, fact: val })}
                />

                <View style={{ height: 20 }} />

                <Text style={styles.sectionLabel}>O QUE VOCÊ CONTOU? (NARRATIVA)</Text>
                <TextInput
                    style={styles.textInputLarge}
                    placeholder="Seus julgamentos e dores..."
                    placeholderTextColor="#475569"
                    multiline
                    value={data.story || ''}
                    onChangeText={(val) => setData({ ...data, story: val })}
                />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveAndClose}>
                <Text style={styles.saveButtonText}>PRATICAR DISCERNIMENTO</Text>
            </TouchableOpacity>
        </View>
    );

    const renderTriad = () => (
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{task?.title || 'REGISTRO DE 3 PONTOS'}</Text>
            <Text style={styles.modalSub}>Sintetize seus pensamentos.</Text>

            <View style={styles.inputGroup}>
                {[1, 2, 3].map(i => (
                    <TextInput
                        key={i}
                        style={styles.textInput}
                        placeholder={`Ponto ${i}...`}
                        placeholderTextColor="#475569"
                        value={data[`item${i}`] || ''}
                        onChangeText={(val) => setData({ ...data, [`item${i}`]: val })}
                    />
                ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveAndClose}>
                <Text style={styles.saveButtonText}>REGISTRAR</Text>
            </TouchableOpacity>
        </View>
    );

    const renderIdentity = () => (
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>DECLARAÇÃO DE IDENTIDADE</Text>
            <Text style={styles.modalSub}>Quem você está se tornando hoje?</Text>

            <TextInput
                style={[styles.textInputLarge, { height: 150 }]}
                placeholder="Eu sou aquele que..."
                placeholderTextColor="#475569"
                multiline
                value={data.identity || ''}
                onChangeText={(val) => setData({ ...data, identity: val })}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveAndClose}>
                <Text style={styles.saveButtonText}>REFORÇAR IDENTIDADE</Text>
            </TouchableOpacity>
        </View>
    );

    const renderQuickAdd = () => {
        const periods = [
            { id: 'morning', label: 'Alvorada', sub: 'Manhã', icon: 'weather-sunset-up' },
            { id: 'afternoon', label: 'Ocupação', sub: 'Tarde', icon: 'briefcase-outline' },
            { id: 'evening', label: 'Recolhimento', sub: 'Noite', icon: 'weather-night' },
            { id: 'other', label: 'Outros', sub: 'Extra', icon: 'dots-horizontal' },
        ];

        const categories = [
            { id: 'essential', label: 'ESSENCIAL', color: colors.primary },
            { id: 'complementary', label: 'COMPLEMENTAR', color: '#64748b' },
            { id: 'impulse', label: 'GATILHO / IMPULSO', color: '#f43f5e' },
        ];

        return (
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>NOVA TAREFA</Text>
                <Text style={styles.modalSub}>Surgiu algo novo? Agende e continue focado.</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.sectionLabel}>O QUE PRECISA SER FEITO?</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Ex: Estudar Filosofia..."
                        placeholderTextColor="#475569"
                        autoFocus
                        value={data.title || ''}
                        onChangeText={(val) => setData({ ...data, title: val })}
                    />

                    <Text style={[styles.sectionLabel, { marginTop: 16 }]}>QUANDO?</Text>
                    <TouchableOpacity
                        style={styles.dateSelectorButton}
                        onPress={() => setShowCalendar(!showCalendar)}
                    >
                        <MaterialCommunityIcons name="calendar-edit" size={20} color={colors.primary} />
                        <Text style={styles.dateSelectorText}>
                            {data.targetDate ? new Date(data.targetDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Escolher data'}
                        </Text>
                    </TouchableOpacity>

                    {showCalendar && (
                        <CalendarPicker
                            selectedDate={data.targetDate || getLocalDateString()}
                            onSelect={(date) => {
                                setData({ ...data, targetDate: date });
                                setShowCalendar(false);
                            }}
                        />
                    )}

                    <Text style={[styles.sectionLabel, { marginTop: 16 }]}>PERÍODO</Text>
                    <View style={styles.periodRow}>
                        {periods.map(p => (
                            <TouchableOpacity
                                key={p.id}
                                style={[styles.periodCard, (data.period || 'other') === p.id && styles.periodCardActive]}
                                onPress={() => setData({ ...data, period: p.id })}
                            >
                                <MaterialCommunityIcons
                                    name={p.icon}
                                    size={20}
                                    color={(data.period || 'other') === p.id ? colors.primary : '#64748b'}
                                />
                                <Text style={[styles.periodLabel, (data.period || 'other') === p.id && { color: colors.primary }]}>{p.label}</Text>
                                <Text style={styles.periodSub}>{p.sub}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.sectionLabel, { marginTop: 16 }]}>CATEGORIA</Text>
                    <View style={styles.categoryRow}>
                        {categories.map(c => (
                            <TouchableOpacity
                                key={c.id}
                                style={[
                                    styles.categoryBadge,
                                    (data.category || 'essential') === c.id && { borderColor: c.color, backgroundColor: c.color + '22' }
                                ]}
                                onPress={() => setData({ ...data, category: c.id, isImpulse: c.id === 'impulse' })}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    (data.category || 'essential') === c.id && { color: c.color }
                                ]}>
                                    {c.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={saveAndClose}>
                    <Text style={styles.saveButtonText}>ADICIONAR AO PLANO</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderTrigger = () => (
        <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>DIÁRIO DE GATILHOS</Text>
            <Text style={styles.modalSub}>Externalize o impulso para recuperar o controle.</Text>

            <TextInput
                style={[styles.textInputLarge, { height: 120 }]}
                placeholder="Qual impulso você está sentindo agora?"
                placeholderTextColor="#475569"
                multiline
                autoFocus
                value={data.impulse || ''}
                onChangeText={(val) => setData({ ...data, impulse: val })}
            />

            <Text style={[styles.sectionLabel, { marginTop: 24 }]}>REENQUADRAMENTO ESTOICO</Text>
            <Text style={styles.promptText}>"Isso é algo que está sob o meu controle?"</Text>

            <TouchableOpacity style={styles.saveButton} onPress={saveAndClose}>
                <Text style={styles.saveButtonText}>REGISTRAR E ALIVIAR</Text>
            </TouchableOpacity>
        </View>
    );

    const renderContent = () => {
        switch (actionType) {
            case 'PRIORITY': return renderPriority();
            case 'PHYSICAL_TRAINING': return renderPhysicalTraining();
            case 'EMOTION_LAB': return renderEmotionLab();
            case 'DIALECTIC': return renderDialectic();
            case 'TRIAD': return renderTriad();
            case 'IDENTITY': return renderIdentity();
            case 'QUICK_ADD': return renderQuickAdd();
            case 'TRIGGER': return renderTrigger();
            default: return (
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{task?.title}</Text>
                    <Text style={styles.modalSub}>{task?.description}</Text>
                    <TouchableOpacity style={styles.saveButton} onPress={saveAndClose}>
                        <Text style={styles.saveButtonText}>CONCLUIR</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
                style={styles.overlay}
            >
                <View style={[styles.sheet, { maxHeight: height * 0.9 }]}>
                    <View style={styles.dragBar} />
                    <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                        <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                    </TouchableOpacity>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {renderContent()}
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        width: '100%',
    },
    sheet: {
        backgroundColor: colors.backgroundDark,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 12,
        paddingHorizontal: 24,
        width: '100%',
    },
    dragBar: {
        width: 40,
        height: 4,
        backgroundColor: '#334155',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    closeIcon: {
        position: 'absolute',
        top: 20,
        right: 24,
        zIndex: 10,
    },
    modalContent: {
        paddingTop: 10,
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 8,
    },
    modalSub: {
        color: '#64748b',
        fontSize: 14,
        marginBottom: 32,
        lineHeight: 20,
    },
    inputGroup: {
        gap: 16,
        marginBottom: 32,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceDark,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.borderDark,
    },
    inputNumber: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 12,
    },
    textInput: {
        flex: 1,
        height: 56,
        color: '#fff',
        fontSize: 16,
    },
    textInputLarge: {
        backgroundColor: colors.surfaceDark,
        borderRadius: 16,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: colors.borderDark,
    },
    sectionLabel: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: 8,
    },
    saveButton: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        flex: 2,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    planContainer: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: 16,
        marginTop: 10,
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    planItemText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },
    planItemTextDone: {
        color: '#475569',
        textDecorationLine: 'line-through',
    },
    exerciseDetailBox: {
        backgroundColor: 'rgba(23, 115, 207, 0.08)',
        padding: 12,
        borderRadius: 12,
        marginLeft: 36,
        marginBottom: 16,
        borderLeftWidth: 2,
        borderLeftColor: colors.primary,
    },
    exerciseDetailText: {
        color: '#cbd5e1',
        fontSize: 13,
        lineHeight: 18,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        gap: 16,
    },
    backLink: {
        flex: 1,
        alignItems: 'center',
        marginTop: 20,
    },
    backLinkText: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    emotionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    emotionBadge: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: colors.surfaceDark,
        borderWidth: 1,
        borderColor: colors.borderDark,
    },
    emotionBadgeSelected: {
        backgroundColor: colors.primary + '33',
        borderColor: colors.primary,
    },
    emotionText: {
        color: '#fff',
        fontSize: 14,
    },
    emotionTextSelected: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    promptText: {
        color: '#fff',
        fontSize: 18,
        fontStyle: 'italic',
        lineHeight: 26,
        marginBottom: 24,
        opacity: 0.9,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
        marginVertical: 24,
    },
    typeBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderDark,
        backgroundColor: colors.surfaceDark,
    },
    typeBadgeActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '22',
    },
    typeText: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    typeTextActive: {
        color: colors.primary,
    },
    workoutList: {
        gap: 12,
        marginBottom: 24,
    },
    workoutCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surfaceDark,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderDark,
    },
    workoutCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '11',
    },
    workoutInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    workoutTitleText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    workoutTitleSelected: {
        color: colors.primary,
    },
    workoutDesc: {
        color: '#64748b',
        fontSize: 12,
        marginTop: 2,
    },
    suggestedBadge: {
        backgroundColor: colors.primary + '33',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    suggestedBadgeText: {
        color: colors.primary,
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    dateSelectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    periodGrid: {
        flexDirection: 'row',
        gap: 8,
    },
    periodBadge: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.surfaceDark,
        borderWidth: 1,
        borderColor: colors.borderDark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    periodBadgeActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '22',
    },
    categoryRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderDark,
        backgroundColor: colors.surfaceDark,
    },
    categoryText: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    // Enhanced Quick Add styles
    dateSelectorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceDark,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderDark,
        gap: 12,
    },
    dateSelectorText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },
    periodRow: {
        flexDirection: 'row',
        gap: 10,
    },
    periodCard: {
        flex: 1,
        backgroundColor: colors.surfaceDark,
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderDark,
    },
    periodCardActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '11',
    },
    periodLabel: {
        color: '#94a3b8',
        fontSize: 10,
        fontWeight: '900',
        marginTop: 6,
        textAlign: 'center',
    },
    periodSub: {
        color: '#475569',
        fontSize: 8,
        fontWeight: 'bold',
        marginTop: 2,
    },
    // Calendar Picker styles
    calendarPickerContainer: {
        backgroundColor: colors.surfaceDark,
        borderRadius: 20,
        padding: 16,
        marginTop: 10,
        borderWidth: 1,
        borderColor: colors.borderDark,
    },
    calendarPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    calendarMonthName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
    },
    calendarPickerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarPickerDayName: {
        width: `${100 / 7}%`,
        textAlign: 'center',
        color: colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    calendarPickerDayEmpty: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
    },
    calendarPickerDay: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    calendarPickerDaySelected: {
        backgroundColor: colors.primary,
    },
    calendarPickerDayText: {
        color: '#64748b',
        fontSize: 12,
    },
});

export default ActionModal;
