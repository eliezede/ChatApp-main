import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../config/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import colors from '../colors';
import AppHeader from '../components/AppHeader';
import { AuthenticatedUserContext } from '../App';

const { width } = Dimensions.get('window');

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const CheckinHistory = ({ navigation }) => {
    const { user } = useContext(AuthenticatedUserContext);
    const [loading, setLoading] = useState(true);
    const [checkinDates, setCheckinDates] = useState({}); // { 'YYYY-MM-DD': { success: true } }
    const [moodData, setMoodData] = useState([]);       // [{ date, mood, contactZeroOk }]
    const [currentStreak, setCurrentStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [totalDays, setTotalDays] = useState(0);
    const [viewMonth, setViewMonth] = useState(new Date());

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch user profile for streak data
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setCurrentStreak(data?.contactZero?.currentStreak || 0);
                setBestStreak(data?.contactZero?.bestStreak || 0);
                // Build checkin map from history array
                const history = data?.contactZero?.history || [];
                const map = {};
                history.forEach(h => {
                    map[h.date] = { success: h.success };
                });
                setCheckinDates(map);
                setTotalDays(history.filter(h => h.success).length);
            }

            // Fetch mood entries
            const moodQ = query(
                collection(db, 'cbt_journal_entries'),
                where('user_id', '==', user.uid),
                where('entry_type', '==', 'mood_checkin'),
                orderBy('timestamp', 'desc')
            );
            const snap = await getDocs(moodQ);
            const moodArr = snap.docs.map(d => {
                const dt = d.data().timestamp?.toDate?.();
                const dateStr = dt ? dt.toISOString().split('T')[0] : null;
                return { date: dateStr, mood: d.data().mood_score };
            }).filter(m => m.date);
            setMoodData(moodArr);
        } catch (e) {
            console.error('Error fetching history:', e);
        } finally {
            setLoading(false);
        }
    };

    // Build calendar days for given month
    const getCalendarDays = () => {
        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({ day: d, dateStr });
        }
        return days;
    };

    const prevMonth = () => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
    const nextMonth = () => setViewMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));

    // Mood correlation: last 14 days
    const last14Days = () => {
        const result = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
            const checkin = checkinDates[dateStr];
            const moodEntry = moodData.find(m => m.date === dateStr);
            result.push({
                dateStr,
                dayLabel,
                success: checkin?.success ?? null,
                mood: moodEntry?.mood ?? null,
            });
        }
        return result;
    };

    const calendarDays = getCalendarDays();
    const correlationDays = last14Days();

    const moodEmoji = (v) => v === 1 ? '😫' : v === 2 ? '☹️' : v === 3 ? '😐' : v === 4 ? '🙂' : v === 5 ? '🤩' : '—';
    const moodColor = (v) => {
        if (!v) return '#334155';
        if (v <= 2) return '#f43f5e';
        if (v === 3) return '#fbbf24';
        return '#22c55e';
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <AppHeader variant="nav" title="Histórico" subtitle="CONTATO ZERO" onBack={() => navigation.goBack()} />

            {loading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: 80 }} />
            ) : (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statPill}>
                            <Text style={styles.statNumber}>{currentStreak}</Text>
                            <Text style={styles.statLabel}>Sequência{'\n'}Atual</Text>
                        </View>
                        <View style={[styles.statPill, styles.statPillHighlight]}>
                            <MaterialCommunityIcons name="fire" size={22} color={colors.primary} />
                            <Text style={[styles.statNumber, { color: colors.primary }]}>{totalDays}</Text>
                            <Text style={styles.statLabel}>Dias{'\n'}de Vitória</Text>
                        </View>
                        <View style={styles.statPill}>
                            <Text style={styles.statNumber}>{bestStreak}</Text>
                            <Text style={styles.statLabel}>Melhor{'\n'}Sequência</Text>
                        </View>
                    </View>

                    {/* Calendar */}
                    <View style={styles.section}>
                        <View style={styles.calendarHeader}>
                            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                                <MaterialCommunityIcons name="chevron-left" size={22} color="#94a3b8" />
                            </TouchableOpacity>
                            <Text style={styles.monthTitle}>
                                {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                            </Text>
                            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                                <MaterialCommunityIcons name="chevron-right" size={22} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        {/* Day labels */}
                        <View style={styles.calendarRow}>
                            {DAYS_SHORT.map(d => (
                                <Text key={d} style={styles.dayHeader}>{d}</Text>
                            ))}
                        </View>

                        {/* Days grid */}
                        <View style={styles.calendarGrid}>
                            {calendarDays.map((item, idx) => {
                                if (!item) return <View key={`empty-${idx}`} style={styles.dayCell} />;
                                const entry = checkinDates[item.dateStr];
                                const isSuccess = entry?.success === true;
                                const isRelapse = entry?.success === false;
                                const isToday = item.dateStr === new Date().toISOString().split('T')[0];
                                return (
                                    <View key={item.dateStr} style={[
                                        styles.dayCell,
                                        isSuccess && styles.dayCellSuccess,
                                        isRelapse && styles.dayCellRelapse,
                                        isToday && styles.dayCellToday,
                                    ]}>
                                        {isSuccess ? (
                                            <MaterialCommunityIcons name="shield-check" size={16} color="#22c55e" />
                                        ) : isRelapse ? (
                                            <MaterialCommunityIcons name="refresh" size={14} color="#f43f5e" />
                                        ) : (
                                            <Text style={[styles.dayNum, isToday && { color: colors.primary }]}>
                                                {item.day}
                                            </Text>
                                        )}
                                    </View>
                                );
                            })}
                        </View>

                        {/* Legend */}
                        <View style={styles.legend}>
                            <View style={styles.legendItem}>
                                <MaterialCommunityIcons name="shield-check" size={14} color="#22c55e" />
                                <Text style={styles.legendText}>Firme</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <MaterialCommunityIcons name="refresh" size={14} color="#f43f5e" />
                                <Text style={styles.legendText}>Recaída</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={styles.legendEmpty} />
                                <Text style={styles.legendText}>Sem Registo</Text>
                            </View>
                        </View>
                    </View>

                    {/* Correlation: Silence vs Mood */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>A Prova Científica</Text>
                        <Text style={styles.sectionSubtitle}>
                            Nos dias em que manteve o silêncio digital, o seu humor melhorou?
                        </Text>

                        <View style={styles.correlationGrid}>
                            {correlationDays.map((day) => (
                                <View key={day.dateStr} style={styles.correlationCell}>
                                    <Text style={styles.corrDate}>{day.dayLabel}</Text>
                                    {/* Silence indicator */}
                                    <View style={[
                                        styles.silenceBar,
                                        day.success === true && { backgroundColor: '#22c55e' },
                                        day.success === false && { backgroundColor: '#f43f5e' },
                                    ]} />
                                    {/* Mood dot */}
                                    <View style={[styles.moodDot, { backgroundColor: moodColor(day.mood) }]} />
                                    <Text style={styles.corrMood}>{moodEmoji(day.mood)}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.legend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendBar, { backgroundColor: '#22c55e' }]} />
                                <Text style={styles.legendText}>Silêncio Digital</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendBar, { backgroundColor: '#f43f5e' }]} />
                                <Text style={styles.legendText}>Recaída</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
                                <Text style={styles.legendText}>Humor</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const CELL_SIZE = Math.floor((width - 48) / 7);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundDark },
    scrollContent: { padding: 20 },

    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statPill: {
        flex: 1,
        backgroundColor: colors.surfaceDark,
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statPillHighlight: {
        borderColor: colors.primary + '40',
        backgroundColor: colors.primary + '10',
    },
    statNumber: { color: '#fff', fontSize: 28, fontWeight: '900', lineHeight: 32 },
    statLabel: { color: '#64748b', fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginTop: 4 },

    section: {
        backgroundColor: colors.surfaceDark,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 },
    sectionSubtitle: { color: '#64748b', fontSize: 12, lineHeight: 18, marginBottom: 20 },

    calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    monthTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    navBtn: { padding: 4 },

    calendarRow: { flexDirection: 'row', marginBottom: 8 },
    dayHeader: { width: CELL_SIZE, textAlign: 'center', color: '#475569', fontSize: 10, fontWeight: 'bold' },

    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    dayCell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: CELL_SIZE / 2,
        marginVertical: 2,
    },
    dayCellSuccess: { backgroundColor: '#22c55e15' },
    dayCellRelapse: { backgroundColor: '#f43f5e15' },
    dayCellToday: { borderWidth: 1, borderColor: colors.primary + '80' },
    dayNum: { color: '#94a3b8', fontSize: 13 },

    legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 16 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendText: { color: '#475569', fontSize: 11 },
    legendEmpty: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155' },
    legendBar: { width: 14, height: 6, borderRadius: 3 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },

    correlationGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    correlationCell: {
        width: (width - 80) / 7,
        alignItems: 'center',
        gap: 4,
    },
    corrDate: { color: '#475569', fontSize: 8, textAlign: 'center' },
    silenceBar: { width: 20, height: 8, borderRadius: 4, backgroundColor: '#1e293b' },
    moodDot: { width: 12, height: 12, borderRadius: 6 },
    corrMood: { fontSize: 14 },
});

export default CheckinHistory;
