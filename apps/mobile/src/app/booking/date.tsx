
import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

type DateItem = {
  id: string;
  day: string;
  number: string;
  month: string;
  fullDate: string;
  available: boolean;
};

type TimeSlot = {
  id: string;
  time: string;
  available: boolean;
};

const DATES: DateItem[] = [
  {
    id: 'date-01',
    day: 'SEX',
    number: '04',
    month: 'SET',
    fullDate: 'Sexta-feira, 4 de Setembro',
    available: true,
  },
  {
    id: 'date-02',
    day: 'SÁB',
    number: '05',
    month: 'SET',
    fullDate: 'Sábado, 5 de Setembro',
    available: true,
  },
  {
    id: 'date-03',
    day: 'DOM',
    number: '06',
    month: 'SET',
    fullDate: 'Domingo, 6 de Setembro',
    available: false,
  },
  {
    id: 'date-04',
    day: 'SEG',
    number: '07',
    month: 'SET',
    fullDate: 'Segunda-feira, 7 de Setembro',
    available: true,
  },
  {
    id: 'date-05',
    day: 'TER',
    number: '08',
    month: 'SET',
    fullDate: 'Terça-feira, 8 de Setembro',
    available: true,
  },
  {
    id: 'date-06',
    day: 'QUA',
    number: '09',
    month: 'SET',
    fullDate: 'Quarta-feira, 9 de Setembro',
    available: true,
  },
  {
    id: 'date-07',
    day: 'QUI',
    number: '10',
    month: 'SET',
    fullDate: 'Quinta-feira, 10 de Setembro',
    available: true,
  },
  {
    id: 'date-08',
    day: 'SEX',
    number: '11',
    month: 'SET',
    fullDate: 'Sexta-feira, 11 de Setembro',
    available: true,
  },
];

const TIME_SLOTS: TimeSlot[] = [
  { id: 'time-01', time: '09:00', available: false },
  { id: 'time-02', time: '09:30', available: true },
  { id: 'time-03', time: '10:00', available: true },
  { id: 'time-04', time: '10:30', available: true },
  { id: 'time-05', time: '11:00', available: false },
  { id: 'time-06', time: '11:30', available: true },
  { id: 'time-07', time: '12:00', available: true },
  { id: 'time-08', time: '12:30', available: false },
  { id: 'time-09', time: '14:00', available: true },
  { id: 'time-10', time: '14:30', available: true },
  { id: 'time-11', time: '15:00', available: true },
  { id: 'time-12', time: '15:30', available: false },
  { id: 'time-13', time: '16:00', available: true },
  { id: 'time-14', time: '16:30', available: true },
  { id: 'time-15', time: '17:00', available: true },
  { id: 'time-16', time: '17:30', available: false },
];

export default function BookingDateScreen() {
  const [selectedDate, setSelectedDate] = useState('date-01');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const selectionScale = useRef(new Animated.Value(1)).current;

  const currentDate = useMemo(
    () => DATES.find((item) => item.id === selectedDate),
    [selectedDate]
  );

  const animateSelection = () => {
    selectionScale.setValue(0.94);

    Animated.spring(selectionScale, {
      toValue: 1,
      friction: 7,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleDatePress = (date: DateItem) => {
    if (!date.available) return;

    setSelectedDate(date.id);
    setSelectedTime(null);
    animateSelection();
  };

  const handleTimePress = (slot: TimeSlot) => {
    if (!slot.available) return;

    setSelectedTime(slot.time);
    animateSelection();
  };

  const pressButton = () => {
    if (!selectedTime) return;

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 80,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Temporariamente usamos any porque o typedRoutes
      // do Expo Router pode ainda não ter regenerado a rota.
      router.push('/booking/confirmation' as any);
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#F7F7F5', '#EEEEEB']}
        style={styles.background}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={21}
                color="#111111"
              />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.eyebrow}>
                AGENDAMENTO
              </Text>

              <Text style={styles.headerTitle}>
                Data e horário
              </Text>
            </View>

            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>
                3/4
              </Text>
            </View>
          </View>

          {/* PROGRESS */}
          <View style={styles.progressArea}>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <View style={styles.progressLabels}>
              <Text style={styles.progressInactive}>
                Serviço
              </Text>

              <Text style={styles.progressInactive}>
                Profissional
              </Text>

              <Text style={styles.progressActive}>
                Data
              </Text>

              <Text style={styles.progressInactive}>
                Confirmar
              </Text>
            </View>
          </View>

          {/* SERVICE SUMMARY */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="cut-outline"
                size={20}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>
                SERVIÇO SELECIONADO
              </Text>

              <Text style={styles.summaryTitle}>
                Corte Premium
              </Text>

              <Text style={styles.summaryMeta}>
                45 min · 12.000 Kz
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.professionalMini}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  DM
                </Text>
              </View>

              <View>
                <Text style={styles.summaryLabel}>
                  PROFISSIONAL
                </Text>

                <Text style={styles.professionalName}>
                  Daniel Monteiro
                </Text>
              </View>
            </View>
          </View>

          {/* DATE HEADER */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                QUANDO?
              </Text>

              <Text style={styles.sectionTitle}>
                Escolha o melhor dia
              </Text>
            </View>

            <View style={styles.calendarIcon}>
              <Ionicons
                name="calendar-outline"
                size={19}
                color="#111111"
              />
            </View>
          </View>

          {/* DATES */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
          >
            {DATES.map((date) => {
              const selected =
                selectedDate === date.id;

              return (
                <Pressable
                  key={date.id}
                  onPress={() => handleDatePress(date)}
                  disabled={!date.available}
                  style={({ pressed }) => [
                    styles.dateCard,
                    selected && styles.dateCardSelected,
                    !date.available &&
                      styles.dateCardDisabled,
                    pressed &&
                      date.available &&
                      styles.pressed,
                  ]}
                >
                  {selected && (
                    <LinearGradient
                      colors={[
                        '#151515',
                        '#303030',
                      ]}
                      style={styles.dateGradient}
                    />
                  )}

                  <Text
                    style={[
                      styles.dateDay,
                      selected &&
                        styles.dateSelectedText,
                      !date.available &&
                        styles.disabledText,
                    ]}
                  >
                    {date.day}
                  </Text>

                  <Text
                    style={[
                      styles.dateNumber,
                      selected &&
                        styles.dateSelectedText,
                      !date.available &&
                        styles.disabledText,
                    ]}
                  >
                    {date.number}
                  </Text>

                  <Text
                    style={[
                      styles.dateMonth,
                      selected &&
                        styles.dateSelectedText,
                      !date.available &&
                        styles.disabledText,
                    ]}
                  >
                    {date.month}
                  </Text>

                  {selected && (
                    <View style={styles.selectedDot}>
                      <View
                        style={styles.selectedDotInner}
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* SELECTED DATE */}
          <Animated.View
            style={[
              styles.selectedDateCard,
              {
                transform: [
                  {
                    scale: selectionScale,
                  },
                ],
              },
            ]}
          >
            <View style={styles.selectedDateIcon}>
              <Ionicons
                name="calendar"
                size={19}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.selectedDateInfo}>
              <Text style={styles.selectedDateLabel}>
                DATA SELECIONADA
              </Text>

              <Text style={styles.selectedDateTitle}>
                {currentDate?.fullDate}
              </Text>
            </View>

            <Ionicons
              name="checkmark-circle"
              size={23}
              color="#111111"
            />
          </Animated.View>

          {/* TIME HEADER */}
          <View style={styles.timeHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                HORÁRIO
              </Text>

              <Text style={styles.sectionTitle}>
                Quando prefere?
              </Text>
            </View>

            <View style={styles.timeZone}>
              <Ionicons
                name="time-outline"
                size={15}
                color="#666666"
              />

              <Text style={styles.timeZoneText}>
                Luanda
              </Text>
            </View>
          </View>

          {/* LEGEND */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={styles.legendAvailable} />

              <Text style={styles.legendText}>
                Disponível
              </Text>
            </View>

            <View style={styles.legendItem}>
              <View style={styles.legendUnavailable} />

              <Text style={styles.legendText}>
                Indisponível
              </Text>
            </View>
          </View>

          {/* TIME GRID */}
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((slot) => {
              const selected =
                selectedTime === slot.time;

              return (
                <Pressable
                  key={slot.id}
                  onPress={() =>
                    handleTimePress(slot)
                  }
                  disabled={!slot.available}
                  style={({ pressed }) => [
                    styles.timeCard,
                    selected &&
                      styles.timeCardSelected,
                    !slot.available &&
                      styles.timeCardDisabled,
                    pressed &&
                      slot.available &&
                      styles.pressed,
                  ]}
                >
                  {selected && (
                    <LinearGradient
                      colors={[
                        '#111111',
                        '#2B2B2B',
                      ]}
                      style={
                        styles.timeSelectedGradient
                      }
                    />
                  )}

                  <Text
                    style={[
                      styles.timeText,
                      selected &&
                        styles.timeTextSelected,
                      !slot.available &&
                        styles.timeTextDisabled,
                    ]}
                  >
                    {slot.time}
                  </Text>

                  {selected && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color="#FFFFFF"
                    />
                  )}

                  {!slot.available && (
                    <View
                      style={
                        styles.unavailableLine
                      }
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* INFORMATION */}
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="information-circle-outline"
                size={21}
                color="#111111"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Sobre o horário
              </Text>

              <Text style={styles.infoText}>
                Os horários apresentados refletem a
                disponibilidade atual do profissional.
                Recomendamos chegar 5 minutos antes
                do seu agendamento.
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* BOTTOM CTA */}
        <BlurView
          intensity={85}
          tint="light"
          style={styles.bottomBar}
        >
          <View style={styles.bottomBarInner}>
            <View style={styles.bookingPreview}>
              <Text style={styles.previewLabel}>
                SEU AGENDAMENTO
              </Text>

              <View style={styles.previewRow}>
                <Text style={styles.previewDate}>
                  {currentDate?.number}{' '}
                  {currentDate?.month}
                </Text>

                <View style={styles.previewDot} />

                <Text
                  style={[
                    styles.previewTime,
                    !selectedTime &&
                      styles.previewTimeEmpty,
                  ]}
                >
                  {selectedTime ??
                    'Escolha o horário'}
                </Text>
              </View>
            </View>

            <Animated.View
              style={[
                styles.continueButtonWrapper,
                {
                  transform: [
                    {
                      scale: buttonScale,
                    },
                  ],
                },
              ]}
            >
              <Pressable
                onPress={pressButton}
                disabled={!selectedTime}
                style={[
                  styles.continueButton,
                  !selectedTime &&
                    styles.continueButtonDisabled,
                ]}
              >
                <LinearGradient
                  colors={
                    selectedTime
                      ? ['#111111', '#292929']
                      : ['#D7D7D4', '#D7D7D4']
                  }
                  style={styles.continueGradient}
                >
                  <Text
                    style={[
                      styles.continueText,
                      !selectedTime &&
                        styles.continueTextDisabled,
                    ]}
                  >
                    Continuar
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={
                      selectedTime
                        ? '#FFFFFF'
                        : '#999999'
                    }
                  />
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>
        </BlurView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F0',
  },

  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  safeArea: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 130,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },

  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },

  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.7,
    fontWeight: '800',
    color: '#8A8A86',
    marginBottom: 3,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111111',
  },

  stepBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
  },

  stepText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  progressArea: {
    marginBottom: 26,
  },

  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDDDD9',
    overflow: 'hidden',
  },

  progressFill: {
    width: '75%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#111111',
  },

  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },

  progressActive: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111111',
  },

  progressInactive: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A1A19D',
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    marginBottom: 30,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    marginRight: 11,
  },

  summaryInfo: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 8,
    letterSpacing: 1.1,
    fontWeight: '800',
    color: '#9A9A96',
    marginBottom: 3,
  },

  summaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#171717',
  },

  summaryMeta: {
    fontSize: 10,
    color: '#777773',
    marginTop: 2,
    fontWeight: '600',
  },

  summaryDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#E2E2DE',
    marginHorizontal: 12,
  },

  professionalMini: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E5E5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  avatarText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#222222',
  },

  professionalName: {
    fontSize: 10,
    fontWeight: '800',
    color: '#222222',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionEyebrow: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '900',
    color: '#8C8C87',
    marginBottom: 4,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -0.5,
  },

  calendarIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },

  dateList: {
    gap: 10,
    paddingVertical: 3,
    paddingRight: 10,
  },

  dateCard: {
    width: 67,
    height: 92,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: '#E4E4E0',
  },

  dateCardSelected: {
    borderColor: '#111111',
    backgroundColor: '#111111',
  },

  dateGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  dateCardDisabled: {
    opacity: 0.42,
  },

  dateDay: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A8A86',
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  dateNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -0.8,
  },

  dateMonth: {
    fontSize: 8,
    fontWeight: '800',
    color: '#8A8A86',
    marginTop: 3,
  },

  dateSelectedText: {
    color: '#FFFFFF',
  },

  disabledText: {
    color: '#999999',
  },

  selectedDot: {
    position: 'absolute',
    bottom: 7,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedDotInner: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },

  selectedDateCard: {
    marginTop: 18,
    padding: 14,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: '#E4E4E0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedDateIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  selectedDateInfo: {
    flex: 1,
  },

  selectedDateLabel: {
    fontSize: 8,
    letterSpacing: 1.1,
    fontWeight: '900',
    color: '#999995',
    marginBottom: 3,
  },

  selectedDateTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#181818',
  },

  timeHeader: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  timeZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },

  timeZoneText: {
    fontSize: 10,
    color: '#777773',
    fontWeight: '700',
  },

  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginBottom: 14,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  legendAvailable: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#111111',
  },

  legendUnavailable: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D2D2CE',
  },

  legendText: {
    fontSize: 9,
    color: '#888884',
    fontWeight: '600',
  },

  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  timeCard: {
    width: '23.5%',
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: '#E2E2DE',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
    overflow: 'hidden',
  },

  timeCardSelected: {
    borderColor: '#111111',
    backgroundColor: '#111111',
  },

  timeSelectedGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  timeCardDisabled: {
    backgroundColor: '#ECECE8',
    borderColor: '#E3E3DF',
  },

  timeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#202020',
  },

  timeTextSelected: {
    color: '#FFFFFF',
  },

  timeTextDisabled: {
    color: '#AAAAA6',
  },

  unavailableLine: {
    position: 'absolute',
    width: 30,
    height: 1,
    backgroundColor: '#B9B9B5',
    transform: [{ rotate: '-18deg' }],
  },

  infoCard: {
    marginTop: 25,
    padding: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#E9E9E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#222222',
    marginBottom: 4,
  },

  infoText: {
    fontSize: 10,
    lineHeight: 15,
    color: '#777773',
    fontWeight: '500',
  },

  bottomSpace: {
    height: 20,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },

  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  bookingPreview: {
    flex: 1,
  },

  previewLabel: {
    fontSize: 8,
    letterSpacing: 1.1,
    fontWeight: '900',
    color: '#999995',
    marginBottom: 4,
  },

  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  previewDate: {
    fontSize: 13,
    fontWeight: '900',
    color: '#171717',
  },

  previewDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B8B87',
    marginHorizontal: 7,
  },

  previewTime: {
    fontSize: 13,
    fontWeight: '900',
    color: '#171717',
  },

  previewTimeEmpty: {
    color: '#A2A29E',
    fontWeight: '700',
  },

  continueButtonWrapper: {
    width: 142,
  },

  continueButton: {
    height: 52,
    borderRadius: 17,
    overflow: 'hidden',
  },

  continueButtonDisabled: {
    opacity: 0.9,
  },

  continueGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  continueTextDisabled: {
    color: '#999999',
  },

  pressed: {
    opacity: 0.8,
  },
});

