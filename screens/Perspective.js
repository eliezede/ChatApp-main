import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../colors';

const { width } = Dimensions.get('window');

const Perspective = () => {
    const [viewMode, setViewMode] = useState('agenda'); // agenda, weekly, monthly, macro
    const [selectedDay, setSelectedDay] = useState(null);

    const ViewSelector = () => (
        <View style={styles.selectorContainer}>
            {['agenda', 'weekly', 'monthly', 'macro'].map((mode) => (
                <TouchableOpacity
                    key={mode}
                    onPress={() => setViewMode(mode)}
                    style={[styles.selectorItem, viewMode === mode && styles.selectorItemActive]}
                >
                    <Text style={[styles.selectorText, viewMode === mode && styles.selectorTextActive]}>
                        {mode.toUpperCase()}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderAgenda = () => (
        <ScrollView style={styles.agendaScroll} showsVerticalScrollIndicator={false}>
            {[0, 1, 2, 3, 4].map((offset) => {
                const date = new Date();
                date.setDate(date.getDate() + offset);
                const isToday = offset === 0;
                const dateStr = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });

                return (
                    <View key={offset} style={styles.agendaDay}>
                        <View style={styles.dayHeader}>
                            <Text style={[styles.dayName, isToday && { color: colors.primary }]}>
                                {isToday ? 'HOJE' : date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase()}
                            </Text>
                            <Text style={styles.dayDate}>
                                {dateStr.toUpperCase()}
                            </Text>
                        </View>

                        <View style={styles.dayContent}>
                            <TouchableOpacity
                                style={[
                                    styles.agendaItem,
                                    selectedDay?.value === 'Protocolo: Fase 2' && selectedDay?.date === dateStr && styles.agendaItemActive
                                ]}
                                onPress={() => setSelectedDay({
                                    type: 'agenda',
                                    value: 'Protocolo: Fase 2',
                                    date: dateStr
                                })}
                            >
                                <View style={styles.agendaDot} />
                                <Text style={styles.agendaTitle}>Protocolo: Fase 2</Text>
                                <Text style={styles.agendaTime}>06:00</Text>
                            </TouchableOpacity>
                            {offset === 2 && (
                                <TouchableOpacity
                                    style={[
                                        styles.agendaItem,
                                        selectedDay?.value === 'Revisão Semanal' && selectedDay?.date === dateStr && styles.agendaItemActive
                                    ]}
                                    onPress={() => setSelectedDay({
                                        type: 'agenda',
                                        value: 'Revisão Semanal',
                                        date: dateStr
                                    })}
                                >
                                    <View style={[styles.agendaDot, { backgroundColor: '#eab308' }]} />
                                    <Text style={styles.agendaTitle}>Revisão Semanal</Text>
                                    <Text style={styles.agendaTime}>18:00</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={styles.addItemRow}>
                                <MaterialCommunityIcons name="plus" size={16} color="#475569" />
                                <Text style={styles.addItemText}>Adicionar plano...</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );

    const renderMacro = () => (
        <View style={styles.macroContainer}>
            <View style={styles.macroHeader}>
                <Text style={styles.macroTitle}>A VISTA DO ALTO</Text>
                <Text style={styles.macroSub}>365 dias de reconstrução</Text>
            </View>

            <View style={styles.dotsGrid}>
                {Array.from({ length: 365 }).map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i < 42 && { backgroundColor: colors.primary, opacity: 0.8 },
                            i === 42 && { backgroundColor: '#fff', transform: [{ scale: 1.2 }] }
                        ]}
                    />
                ))}
            </View>

            <View style={styles.memento_mori_container}>
                <Text style={styles.mementoText}>"Você poderia deixar a vida agora mesmo. Deixe que isso determine o que você faz, diz e pensa."</Text>
                <Text style={styles.mementoAuthor}>— MARCO AURÉLIO</Text>
            </View>
        </View>
    );

    const renderWeekly = () => {
        const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
        return (
            <ScrollView style={styles.weeklyScroll}>
                <View style={styles.weeklyContainer}>
                    <Text style={styles.viewTitle}>PLANEJAMENTO SEMANAL</Text>
                    <View style={styles.weekGrid}>
                        {days.map((day, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.weekDayColumn}
                                onPress={() => setSelectedDay({ type: 'week', value: day, index: i })}
                            >
                                <Text style={styles.weekDayLabel}>{day}</Text>
                                <View style={[styles.weekDayCard, selectedDay?.index === i && styles.weekDayCardActive]}>
                                    <View style={[styles.weekProgress, { height: `${(i + 1) * 12}%` }]} />
                                </View>
                                <Text style={styles.weekDayNumber}>{i + 14}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.weeklyDetails}>
                        <Text style={styles.detailsTitle}>FOCO DA SEMANA</Text>
                        <View style={styles.detailsCard}>
                            <MaterialCommunityIcons name="target" size={20} color={colors.primary} />
                            <Text style={styles.detailsText}>Consolidar rotina de Alvorada e reduzir tempo de tela noturno.</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        );
    };

    const renderMonthly = () => {
        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        return (
            <ScrollView style={styles.monthlyScroll}>
                <View style={styles.monthlyContainer}>
                    <View style={styles.monthHeader}>
                        <Text style={styles.viewTitle}>FEVEREIRO 2026</Text>
                        <View style={styles.monthNav}>
                            <MaterialCommunityIcons name="chevron-left" size={24} color="#64748b" />
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#64748b" />
                        </View>
                    </View>
                    <View style={styles.calendarGrid}>
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                            <Text key={`${d}-${i}`} style={styles.calendarDayName}>{d}</Text>
                        ))}
                        {Array.from({ length: 3 }).map((_, i) => <View key={`p-${i}`} style={{ width: (width - 48) / 7 }} />)}
                        {days.map(d => (
                            <TouchableOpacity
                                key={d}
                                style={[
                                    styles.calendarDay,
                                    d === 21 && styles.calendarDayToday,
                                    selectedDay?.type === 'month' && selectedDay?.value === d && styles.calendarDaySelected
                                ]}
                                onPress={() => setSelectedDay({ type: 'month', value: d })}
                            >
                                <Text style={[
                                    styles.calendarDayText,
                                    d === 21 && { color: colors.primary },
                                    selectedDay?.type === 'month' && selectedDay?.value === d && { color: '#fff', fontWeight: 'bold' }
                                ]}>{d}</Text>
                                {d % 3 === 0 && <View style={styles.calendarDot} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        );
    };

    const DayDetails = ({ isVisible, onClose, day, date }) => (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                    <View style={styles.dragBar} />
                    <View style={styles.detailsHeader}>
                        <Text style={styles.detailsHeaderText}>{day} • {date}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.detailsList}>
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="check-circle-outline" size={18} color={colors.primary} />
                            <Text style={styles.detailItemText}>Protocolo de Alvorada (Estabilidade)</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="circle-outline" size={18} color="#475569" />
                            <Text style={styles.detailItemText}>Treino de Ataraxia (Físico)</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="circle-outline" size={18} color="#475569" />
                            <Text style={styles.detailItemText}>Revisão de Metas (Estrutura)</Text>
                        </View>
                        <View style={styles.detailItem}>
                            <MaterialCommunityIcons name="circle-outline" size={18} color="#475569" />
                            <Text style={styles.detailItemText}>Diário de Reflexão (Disciplina)</Text>
                        </View>
                    </View>
                    <View style={{ height: 40 }} />
                </View>
            </View>
        </Modal>
    );

    const renderContent = () => {
        switch (viewMode) {
            case 'agenda': return renderAgenda();
            case 'weekly': return renderWeekly();
            case 'monthly': return renderMonthly();
            case 'macro': return renderMacro();
            default: return null;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>PERSPECTIVA</Text>
                <ViewSelector />
            </View>

            {renderContent()}

            <DayDetails
                isVisible={!!selectedDay}
                onClose={() => setSelectedDay(null)}
                day={selectedDay?.value}
                date={selectedDay?.type === 'week' ? `${selectedDay.value} • ${selectedDay.index + 14}` : (selectedDay?.type === 'month' ? `${selectedDay.value} de Fev` : selectedDay?.date)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundDark,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 20,
    },
    selectorContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    selectorItem: {
        paddingBottom: 4,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    selectorItemActive: {
        borderBottomColor: colors.primary,
    },
    selectorText: {
        color: '#475569',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    selectorTextActive: {
        color: '#fff',
    },
    agendaScroll: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    agendaDay: {
        flexDirection: 'row',
        marginBottom: 32,
    },
    dayHeader: {
        width: 60,
        marginRight: 20,
    },
    dayName: {
        color: '#475569',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    dayDate: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 2,
    },
    dayContent: {
        flex: 1,
        gap: 12,
    },
    agendaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceDark,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    agendaItemActive: {
        borderColor: colors.primary + '60',
        backgroundColor: colors.primary + '10',
    },
    agendaDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginRight: 12,
    },
    agendaTitle: {
        flex: 1,
        color: '#cbd5e1',
        fontSize: 13,
        fontWeight: '500',
    },
    agendaTime: {
        color: '#475569',
        fontSize: 11,
        fontWeight: 'bold',
    },
    addItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingLeft: 4,
    },
    addItemText: {
        color: '#475569',
        fontSize: 12,
    },
    macroContainer: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
    },
    macroHeader: {
        alignItems: 'center',
        marginBottom: 40,
    },
    macroTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 4,
    },
    macroSub: {
        color: '#64748b',
        fontSize: 12,
        marginTop: 4,
    },
    dotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        justifyContent: 'center',
        width: width - 48,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 2,
        backgroundColor: '#1e293b',
    },
    memento_mori_container: {
        marginTop: 60,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    mementoText: {
        color: '#64748b',
        fontSize: 12,
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 18,
    },
    mementoAuthor: {
        color: colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 12,
        letterSpacing: 2,
    },
    weeklyContainer: {
        flex: 1,
        padding: 24,
    },
    viewTitle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 24,
    },
    weekGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    weekDayColumn: {
        alignItems: 'center',
        gap: 8,
    },
    weekDayLabel: {
        color: '#64748b',
        fontSize: 8,
        fontWeight: 'bold',
    },
    weekDayCard: {
        width: 36,
        height: 120,
        backgroundColor: colors.surfaceDark,
        borderRadius: 8,
        justifyContent: 'flex-end',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    weekProgress: {
        width: '100%',
        backgroundColor: colors.primary,
        opacity: 0.6,
    },
    weekDayNumber: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    weeklyDetails: {
        gap: 16,
    },
    detailsTitle: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    detailsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: colors.surfaceDark,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    detailsText: {
        flex: 1,
        color: '#cbd5e1',
        fontSize: 13,
        lineHeight: 20,
    },
    monthlyContainer: {
        flex: 1,
        padding: 24,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    monthNav: {
        flexDirection: 'row',
        gap: 16,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarDayName: {
        width: (width - 48) / 7,
        textAlign: 'center',
        color: '#475569',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    calendarDay: {
        width: (width - 48) / 7,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    calendarDayToday: {
        backgroundColor: 'rgba(23, 115, 207, 0.05)',
        borderRadius: 8,
    },
    calendarDayText: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: '500',
    },
    calendarDaySelected: {
        backgroundColor: colors.primary + '15',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary + '30',
    },
    calendarDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.primary,
        position: 'absolute',
        bottom: 8,
    },
    weeklyScroll: {
        flex: 1,
    },
    monthlyScroll: {
        flex: 1,
    },
    weekDayCardActive: {
        borderColor: colors.primary + '60',
        backgroundColor: colors.primary + '10',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: colors.backgroundDark,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    dragBar: {
        width: 40,
        height: 4,
        backgroundColor: '#334155',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    detailsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    detailsHeaderText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
    detailsList: {
        gap: 20,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    detailItemText: {
        color: '#cbd5e1',
        fontSize: 14,
    },
});

export default Perspective;
