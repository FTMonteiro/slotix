import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { AvailabilitySlotDTO, ProfessionalDTO, ServiceDTO } from '@slotix/types';
import { getBusinessProfessionals, getBusinessServices } from '../../services/businesses';
import { getAvailability } from '../../services/availability';

type DateItem = {
  key: string;
  day: string;
  number: string;
  month: string;
  fullDate: string;
};

const DAYS_TO_SHOW = 21;

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const capitalize = (value: string) =>
  value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const buildDates = (): DateItem[] => {
  const items: DateItem[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    items.push({
      key: formatDateKey(date),
      day: new Intl.DateTimeFormat('pt-AO', { weekday: 'short' })
        .format(date)
        .replace('.', '')
        .toUpperCase()
        .slice(0, 3),
      number: String(date.getDate()).padStart(2, '0'),
      month: new Intl.DateTimeFormat('pt-AO', { month: 'short' })
        .format(date)
        .replace('.', '')
        .toUpperCase()
        .slice(0, 3),
      fullDate: capitalize(
        new Intl.DateTimeFormat('pt-AO', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(date),
      ),
    });
  }

  return items;
};

const formatPrice = (value: number) => `${value.toLocaleString('pt-AO')} Kz`;

export default function BookingDateScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    businessId?: string | string[];
    serviceId?: string | string[];
    professionalId?: string | string[];
  }>();

  const businessId = Array.isArray(params.businessId)
    ? params.businessId[0]
    : params.businessId;

  const serviceId = Array.isArray(params.serviceId)
    ? params.serviceId[0]
    : params.serviceId;

  const professionalId = Array.isArray(params.professionalId)
    ? params.professionalId[0]
    : params.professionalId;

  const dates = useMemo(buildDates, []);

  const [selectedDateKey, setSelectedDateKey] = useState(dates[0].key);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [service, setService] = useState<ServiceDTO | null>(null);
  const [professional, setProfessional] = useState<ProfessionalDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [slots, setSlots] = useState<AvailabilitySlotDTO[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const selectionScale = useRef(new Animated.Value(1)).current;

  const currentDate = useMemo(
    () => dates.find((item) => item.key === selectedDateKey),
    [dates, selectedDateKey],
  );

  useEffect(() => {
    if (!businessId || !serviceId || !professionalId) {
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);

      try {
        const [services, professionals] = await Promise.all([
          getBusinessServices(businessId as string),
          getBusinessProfessionals(businessId as string),
        ]);

        if (cancelled) return;

        setService(services.find((item) => item.id === serviceId) ?? null);
        setProfessional(
          professionals.find((item) => item.id === professionalId) ?? null,
        );
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [businessId, serviceId, professionalId]);

  useEffect(() => {
    if (!businessId || !serviceId || !professionalId) {
      return;
    }

    let cancelled = false;

    async function loadSlots() {
      setSlotsLoading(true);
      setSlotsError(false);
      setSelectedTime(null);

      try {
        const data = await getAvailability({
          businessId: businessId as string,
          professionalId: professionalId as string,
          serviceId: serviceId as string,
          date: selectedDateKey,
        });

        if (!cancelled) setSlots(data);
      } catch {
        if (!cancelled) {
          setSlots([]);
          setSlotsError(true);
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }

    void loadSlots();

    return () => {
      cancelled = true;
    };
  }, [businessId, serviceId, professionalId, selectedDateKey]);

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
    setSelectedDateKey(date.key);
    animateSelection();
  };

  const handleTimePress = (time: string) => {
    setSelectedTime(time);
    animateSelection();
  };

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const pressButton = () => {
    if (!selectedTime || !businessId || !serviceId || !professionalId) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const [year, month, day] = selectedDateKey.split('-').map(Number);
    const scheduled = new Date(year, month - 1, day, hours, minutes, 0, 0);
    const scheduledAt = scheduled.toISOString();

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
      router.push({
        pathname: '/booking/confirmation',
        params: { businessId, serviceId, professionalId, scheduledAt },
      });
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.centerState}>
            <ActivityIndicator color="#111111" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.centerState}>
            <Text style={styles.errorTitle}>
              Não foi possível carregar esta reserva
            </Text>

            <Pressable onPress={handleBack} style={styles.errorButton}>
              <Text style={styles.errorButtonText}>Voltar</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
              onPress={handleBack}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="chevron-back" size={21} color="#111111" />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.eyebrow}>AGENDAMENTO</Text>
              <Text style={styles.headerTitle}>Data e horário</Text>
            </View>

            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>3/4</Text>
            </View>
          </View>

          {/* PROGRESS */}
          <View style={styles.progressArea}>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <View style={styles.progressLabels}>
              <Text style={styles.progressInactive}>Serviço</Text>
              <Text style={styles.progressInactive}>Profissional</Text>
              <Text style={styles.progressActive}>Data</Text>
              <Text style={styles.progressInactive}>Confirmar</Text>
            </View>
          </View>

          {/* SERVICE SUMMARY */}
          {service || professional ? (
            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <Ionicons name="cut-outline" size={20} color="#FFFFFF" />
              </View>

              <View style={styles.summaryInfo}>
                <Text style={styles.summaryLabel}>SERVIÇO SELECIONADO</Text>

                <Text style={styles.summaryTitle} numberOfLines={1}>
                  {service?.name ?? '—'}
                </Text>

                {service ? (
                  <Text style={styles.summaryMeta}>
                    {service.duration} min · {formatPrice(service.price)}
                  </Text>
                ) : null}
              </View>

              {professional ? (
                <>
                  <View style={styles.summaryDivider} />

                  <View style={styles.professionalMini}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {professional.name
                          .split(' ')
                          .slice(0, 2)
                          .map((part) => part.charAt(0).toUpperCase())
                          .join('')}
                      </Text>
                    </View>

                    <View>
                      <Text style={styles.summaryLabel}>PROFISSIONAL</Text>

                      <Text style={styles.professionalName} numberOfLines={1}>
                        {professional.name}
                      </Text>
                    </View>
                  </View>
                </>
              ) : null}
            </View>
          ) : null}

          {/* DATE HEADER */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>QUANDO?</Text>
              <Text style={styles.sectionTitle}>Escolha o melhor dia</Text>
            </View>

            <View style={styles.calendarIcon}>
              <Ionicons name="calendar-outline" size={19} color="#111111" />
            </View>
          </View>

          {/* DATES */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
          >
            {dates.map((date) => {
              const selected = selectedDateKey === date.key;

              return (
                <Pressable
                  key={date.key}
                  onPress={() => handleDatePress(date)}
                  style={({ pressed }) => [
                    styles.dateCard,
                    selected && styles.dateCardSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[styles.dateDay, selected && styles.dateSelectedText]}
                  >
                    {date.day}
                  </Text>

                  <Text
                    style={[
                      styles.dateNumber,
                      selected && styles.dateSelectedText,
                    ]}
                  >
                    {date.number}
                  </Text>

                  <Text
                    style={[
                      styles.dateMonth,
                      selected && styles.dateSelectedText,
                    ]}
                  >
                    {date.month}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* SELECTED DATE */}
          <Animated.View
            style={[
              styles.selectedDateCard,
              { transform: [{ scale: selectionScale }] },
            ]}
          >
            <View style={styles.selectedDateIcon}>
              <Ionicons name="calendar" size={19} color="#FFFFFF" />
            </View>

            <View style={styles.selectedDateInfo}>
              <Text style={styles.selectedDateLabel}>DATA SELECIONADA</Text>

              <Text style={styles.selectedDateTitle}>
                {currentDate?.fullDate}
              </Text>
            </View>

            <Ionicons name="checkmark-circle" size={23} color="#111111" />
          </Animated.View>

          {/* TIME HEADER */}
          <View style={styles.timeHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>HORÁRIO</Text>
              <Text style={styles.sectionTitle}>Quando prefere?</Text>
            </View>

            <View style={styles.timeZone}>
              <Ionicons name="time-outline" size={15} color="#666666" />
              <Text style={styles.timeZoneText}>Luanda</Text>
            </View>
          </View>

          {/* TIME GRID */}
          {slotsLoading ? (
            <View style={styles.slotsCenterState}>
              <ActivityIndicator color="#111111" />
            </View>
          ) : slots.length > 0 ? (
            <View style={styles.timeGrid}>
              {slots.map((slot) => {
                const selected = selectedTime === slot.time;

                return (
                  <Pressable
                    key={slot.time}
                    onPress={() => handleTimePress(slot.time)}
                    style={({ pressed }) => [
                      styles.timeCard,
                      selected && styles.timeCardSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    {selected && (
                      <LinearGradient
                        colors={['#111111', '#2B2B2B']}
                        style={styles.timeSelectedGradient}
                      />
                    )}

                    <Text
                      style={[
                        styles.timeText,
                        selected && styles.timeTextSelected,
                      ]}
                    >
                      {slot.time}
                    </Text>

                    {selected && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptySlots}>
              <View style={styles.emptySlotsIcon}>
                <Ionicons
                  name="time-outline"
                  size={22}
                  color="#999999"
                />
              </View>

              <Text style={styles.emptySlotsTitle}>
                {slotsError
                  ? 'Não foi possível carregar os horários'
                  : 'Sem horários disponíveis neste dia'}
              </Text>

              <Text style={styles.emptySlotsText}>
                Tente escolher outra data.
              </Text>
            </View>
          )}

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* BOTTOM CTA */}
        <BlurView intensity={85} tint="light" style={styles.bottomBar}>
          <View style={styles.bottomBarInner}>
            <View style={styles.bookingPreview}>
              <Text style={styles.previewLabel}>SEU AGENDAMENTO</Text>

              <View style={styles.previewRow}>
                <Text style={styles.previewDate}>
                  {currentDate?.number} {currentDate?.month}
                </Text>

                <View style={styles.previewDot} />

                <Text
                  style={[
                    styles.previewTime,
                    !selectedTime && styles.previewTimeEmpty,
                  ]}
                >
                  {selectedTime ?? 'Escolha o horário'}
                </Text>
              </View>
            </View>

            <Animated.View
              style={[
                styles.continueButtonWrapper,
                { transform: [{ scale: buttonScale }] },
              ]}
            >
              <Pressable
                onPress={pressButton}
                disabled={!selectedTime}
                style={[
                  styles.continueButton,
                  !selectedTime && styles.continueButtonDisabled,
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
                      !selectedTime && styles.continueTextDisabled,
                    ]}
                  >
                    Continuar
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={selectedTime ? '#FFFFFF' : '#999999'}
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

  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111111',
    textAlign: 'center',
  },

  errorButton: {
    marginTop: 18,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
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

  slotsCenterState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
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

  timeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#202020',
  },

  timeTextSelected: {
    color: '#FFFFFF',
  },

  emptySlots: {
    paddingVertical: 34,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },

  emptySlotsIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#ECECE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptySlotsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#222222',
    textAlign: 'center',
  },

  emptySlotsText: {
    marginTop: 5,
    fontSize: 11,
    color: '#777773',
    textAlign: 'center',
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
