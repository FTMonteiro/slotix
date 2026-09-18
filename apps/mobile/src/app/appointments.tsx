import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import type { AppointmentDTO, AppointmentStatus, BusinessDTO, ProfessionalDTO, ServiceDTO } from '@slotix/types';
import { cancelAppointment, listMyAppointments } from '../services/appointments';
import { getBusiness, getBusinessProfessionals, getBusinessServices } from '../services/businesses';

const COLORS = {
  background: '#F5F6F7',
  white: '#FFFFFF',
  black: '#08090A',
  text: '#111315',
  secondary: '#686D74',
  muted: '#9A9EA5',
  border: '#E5E7EA',

  blue: '#1769FF',
  blueSoft: '#EDF3FF',

  green: '#16A36B',
  greenSoft: '#EAF8F2',

  orange: '#E89A20',
  orangeSoft: '#FFF5E5',

  red: '#E5484D',
  redSoft: '#FFF0F1',

  purple: '#7659E8',
  purpleSoft: '#F1EEFF',

  dark: '#111214',
  darkSoft: '#1C1E21',
  darkBorder: '#2A2C30',
};

type AppointmentView = {
  id: string;
  date: string;
  time: string;
  endTime: string;
  space: string;
  service: string;
  professional: string;
  duration: string;
  price: string;
  priceValue: number;
  status: AppointmentStatus;
};

type FilterType =
  | 'Todos'
  | 'Confirmados'
  | 'Pendentes';

const TODAY = (() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
})();

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEK_DAYS = [
  'DOM',
  'SEG',
  'TER',
  'QUA',
  'QUI',
  'SEX',
  'SÁB',
];

function formatTimeOfDay(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return '—';
  if (minutes % 60 === 0) return `${minutes / 60}h`;
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;
}

const FILTERS: FilterType[] = [
  'Todos',
  'Confirmados',
  'Pendentes',
];

function formatDate(
  year: number,
  month: number,
  day: number,
) {
  return `${year}-${String(month + 1).padStart(
    2,
    '0',
  )}-${String(day).padStart(2, '0')}`;
}

function parseDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

function addDays(
  date: string,
  amount: number,
) {
  const current = parseDate(date);
  current.setDate(
    current.getDate() + amount,
  );

  return formatDate(
    current.getFullYear(),
    current.getMonth(),
    current.getDate(),
  );
}

function getStatusConfig(
  status: AppointmentStatus,
) {
  switch (status) {
    case 'CONFIRMED':
      return {
        color: COLORS.green,
        background: COLORS.greenSoft,
        icon: 'checkmark-circle-outline' as const,
      };

    case 'PENDING':
      return {
        color: COLORS.orange,
        background: COLORS.orangeSoft,
        icon: 'time-outline' as const,
      };

    case 'COMPLETED':
      return {
        color: COLORS.purple,
        background: COLORS.purpleSoft,
        icon: 'checkmark-done-outline' as const,
      };

    case 'CANCELLED':
      return {
        color: COLORS.red,
        background: COLORS.redSoft,
        icon: 'close-circle-outline' as const,
      };

    case 'NO_SHOW':
      return {
        color: COLORS.muted,
        background: COLORS.background,
        icon: 'alert-circle-outline' as const,
      };

    default:
      return {
        color: COLORS.muted,
        background: COLORS.background,
        icon: 'ellipse-outline' as const,
      };
  }
}

function statusLabel(status: AppointmentStatus): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmado';
    case 'PENDING':
      return 'Pendente';
    case 'COMPLETED':
      return 'Concluído';
    case 'CANCELLED':
      return 'Cancelado';
    case 'NO_SHOW':
      return 'Não compareceu';
    default:
      return status;
  }
}

export default function AppointmentsScreen() {
  const router = useRouter();

  const [appointmentsRaw, setAppointmentsRaw] =
    useState<AppointmentDTO[]>([]);

  const [businessMap, setBusinessMap] =
    useState<Record<string, BusinessDTO>>({});

  const [serviceMap, setServiceMap] =
    useState<Record<string, ServiceDTO>>({});

  const [professionalMap, setProfessionalMap] =
    useState<Record<string, ProfessionalDTO>>({});

  const [loading, setLoading] = useState(true);

  const [cancelling, setCancelling] = useState(false);

  const [selectedDate, setSelectedDate] =
    useState(TODAY);

  const [activeFilter, setActiveFilter] =
    useState<FilterType>('Todos');

  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState<string | null>(null);

  const [detailsVisible, setDetailsVisible] =
    useState(false);

  const [calendarVisible, setCalendarVisible] =
    useState(false);

  const [calendarMonth, setCalendarMonth] =
    useState(() => new Date().getMonth());

  const [calendarYear, setCalendarYear] =
    useState(() => new Date().getFullYear());

  const calendarAnimation = useRef(
    new Animated.Value(0),
  ).current;

  // Only the business is embedded on the DTO — service/professional names come from
  // the same business, so one batch of per-business lookups (not one per appointment)
  // covers space, service and professional display data.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const data = await listMyAppointments();
        if (cancelled) return;
        setAppointmentsRaw(data);

        const uniqueBusinessIds = [
          ...new Set(data.map((appointment) => appointment.businessId)),
        ];

        const details = await Promise.all(
          uniqueBusinessIds.map(async (businessId) => {
            const [business, services, professionals] = await Promise.all([
              getBusiness(businessId),
              getBusinessServices(businessId),
              getBusinessProfessionals(businessId),
            ]);

            return { businessId, business, services, professionals };
          }),
        );

        if (cancelled) return;

        const nextBusinessMap: Record<string, BusinessDTO> = {};
        const nextServiceMap: Record<string, ServiceDTO> = {};
        const nextProfessionalMap: Record<string, ProfessionalDTO> = {};

        for (const detail of details) {
          nextBusinessMap[detail.businessId] = detail.business;

          for (const service of detail.services) {
            nextServiceMap[service.id] = service;
          }

          for (const professional of detail.professionals) {
            nextProfessionalMap[professional.id] = professional;
          }
        }

        setBusinessMap(nextBusinessMap);
        setServiceMap(nextServiceMap);
        setProfessionalMap(nextProfessionalMap);
      } catch {
        if (!cancelled) setAppointmentsRaw([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const appointments: AppointmentView[] = useMemo(
    () =>
      appointmentsRaw.map((appointment) => {
        const business = businessMap[appointment.businessId];
        const service = serviceMap[appointment.serviceId];
        const professional = professionalMap[appointment.professionalId];

        const scheduledAt = new Date(appointment.scheduledAt);
        const durationMinutes = service?.duration ?? 0;
        const endAt = new Date(
          scheduledAt.getTime() + durationMinutes * 60000,
        );

        return {
          id: appointment.id,
          date: formatDate(
            scheduledAt.getFullYear(),
            scheduledAt.getMonth(),
            scheduledAt.getDate(),
          ),
          time: formatTimeOfDay(scheduledAt),
          endTime: formatTimeOfDay(endAt),
          space: business?.name ?? 'Espaço',
          service: service?.name ?? 'Serviço',
          professional: professional?.name ?? 'Profissional',
          duration: formatDuration(durationMinutes),
          price: `${appointment.price.toLocaleString('pt-AO')} Kz`,
          priceValue: appointment.price,
          status: appointment.status,
        };
      }),
    [appointmentsRaw, businessMap, serviceMap, professionalMap],
  );

  const selectedAppointment = useMemo(
    () =>
      appointments.find(
        (appointment) => appointment.id === selectedAppointmentId,
      ) ?? null,
    [appointments, selectedAppointmentId],
  );

  const selectedDateObject =
    parseDate(selectedDate);

  const selectedDay =
    selectedDateObject.getDate();

  const selectedMonth =
    MONTHS[selectedDateObject.getMonth()];

  const selectedWeekDay =
    WEEK_DAYS[selectedDateObject.getDay()];

  const dayAppointments = useMemo(() => {
    return appointments
      .filter(
        (appointment) =>
          appointment.date === selectedDate,
      )
      .sort((a, b) =>
        a.time.localeCompare(b.time),
      );
  }, [appointments, selectedDate]);

  const filteredAppointments = useMemo(() => {
    if (activeFilter === 'Todos') {
      return dayAppointments;
    }

    return dayAppointments.filter(
      (appointment) =>
        appointment.status ===
        (activeFilter === 'Confirmados'
          ? 'CONFIRMED'
          : 'PENDING'),
    );
  }, [
    activeFilter,
    dayAppointments,
  ]);

  const nextAppointment = useMemo(() => {
    return dayAppointments.find(
      (appointment) =>
        appointment.status ===
          'CONFIRMED' ||
        appointment.status ===
          'PENDING',
    );
  }, [dayAppointments]);

  const confirmedCount =
    dayAppointments.filter(
      (appointment) =>
        appointment.status ===
        'CONFIRMED',
    ).length;

  const pendingCount =
    dayAppointments.filter(
      (appointment) =>
        appointment.status ===
        'PENDING',
    ).length;

  const totalRevenue =
    dayAppointments.reduce(
      (total, appointment) =>
        total + appointment.priceValue,
      0,
    );

  const progress =
    dayAppointments.length > 0
      ? Math.min(
          confirmedCount /
            dayAppointments.length,
          1,
        )
      : 0;

  const openCalendar = () => {
    setCalendarVisible(true);

    Animated.spring(
      calendarAnimation,
      {
        toValue: 1,
        damping: 18,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      },
    ).start();
  };

  const closeCalendar = () => {
    Animated.timing(
      calendarAnimation,
      {
        toValue: 0,
        duration: 180,
        easing: Easing.out(
          Easing.cubic,
        ),
        useNativeDriver: true,
      },
    ).start(() => {
      setCalendarVisible(false);
    });
  };

  const selectDate = (date: string) => {
    setSelectedDate(date);

    const dateObject = parseDate(date);

    setCalendarMonth(
      dateObject.getMonth(),
    );

    setCalendarYear(
      dateObject.getFullYear(),
    );

    setActiveFilter('Todos');
  };

  const handleToday = () => {
    selectDate(TODAY);
    closeCalendar();
  };

  const handleNewAppointment = () => {
    router.push('/explore');
  };

  const openAppointment = (
    appointment: AppointmentView,
  ) => {
    setSelectedAppointmentId(
      appointment.id,
    );
    setDetailsVisible(true);
  };

  const closeDetails = () => {
    setDetailsVisible(false);
  };

  const handleCancel = async () => {
    if (!selectedAppointment || cancelling) {
      return;
    }

    setCancelling(true);

    try {
      const updated = await cancelAppointment(selectedAppointment.id);

      setAppointmentsRaw((current) =>
        current.map((appointment) =>
          appointment.id === updated.id ? updated : appointment,
        ),
      );
    } catch {
      Alert.alert(
        'Erro',
        'Não foi possível cancelar o agendamento.',
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
        <View
          style={[
            styles.container,
            { alignItems: 'center', justifyContent: 'center' },
          ]}
        >
          <ActivityIndicator
            size="large"
            color={COLORS.black}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (appointments.length === 0) {
    return (
      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
        <View style={styles.container}>
          <EmptyState
            title="Nenhum agendamento ainda"
            text="Ainda não tens compromissos marcados. Explora espaços e reserva o teu primeiro horário."
            onPress={handleNewAppointment}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* HEADER */}

          <View style={styles.header}>
            <View>
              <Text
                style={styles.headerEyebrow}
              >
                AGENDA
              </Text>

              <Text
                style={styles.headerTitle}
              >
                Os teus compromissos
              </Text>
            </View>

            <Pressable
              onPress={openCalendar}
              style={({ pressed }) => [
                styles.headerButton,
                pressed &&
                  styles.headerButtonPressed,
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={COLORS.black}
              />

              {dayAppointments.length >
                0 && (
                <View
                  style={
                    styles.headerBadge
                  }
                >
                  <Text
                    style={
                      styles.headerBadgeText
                    }
                  >
                    {dayAppointments.length}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* HORIZONTAL DATE PICKER */}

          <View style={styles.dateSection}>
            <View
              style={
                styles.dateSectionHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.dateMonth
                  }
                >
                  {selectedMonth}{' '}
                  {selectedDateObject.getFullYear()}
                </Text>

                <Text
                  style={
                    styles.dateHint
                  }
                >
                  Seleciona um dia
                </Text>
              </View>

              {selectedDate !== TODAY && (
                <Pressable
                  onPress={() =>
                    selectDate(TODAY)
                  }
                  style={
                    styles.todayMiniButton
                  }
                >
                  <Text
                    style={
                      styles.todayMiniText
                    }
                  >
                    Hoje
                  </Text>
                </Pressable>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.dateList
              }
            >
              {Array.from(
                { length: 11 },
                (_, index) =>
                  addDays(
                    selectedDate,
                    index - 5,
                  ),
              ).map((date) => {
                const object =
                  parseDate(date);

                const active =
                  date === selectedDate;

                const today =
                  date === TODAY;

                const hasAppointments =
                  appointments.some(
                    (appointment) =>
                      appointment.date ===
                      date,
                  );

                return (
                  <Pressable
                    key={date}
                    onPress={() =>
                      selectDate(date)
                    }
                    style={({ pressed }) => [
                      styles.dateItem,
                      active &&
                        styles.dateItemActive,
                      pressed &&
                        styles.dateItemPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateWeekday,
                        active &&
                          styles.dateWeekdayActive,
                      ]}
                    >
                      {WEEK_DAYS[
                        object.getDay()
                      ]}
                    </Text>

                    <Text
                      style={[
                        styles.dateNumber,
                        active &&
                          styles.dateNumberActive,
                        today &&
                          !active &&
                          styles.dateNumberToday,
                      ]}
                    >
                      {object.getDate()}
                    </Text>

                    <View
                      style={[
                        styles.dateIndicator,
                        hasAppointments &&
                          styles.dateIndicatorVisible,
                        active &&
                          styles.dateIndicatorActive,
                      ]}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* DAY OVERVIEW */}

          <View style={styles.overview}>
            <View style={styles.overviewTop}>
              <View>
                <View
                  style={
                    styles.overviewPill
                  }
                >
                  <View
                    style={
                      styles.overviewDot
                    }
                  />

                  <Text
                    style={
                      styles.overviewPillText
                    }
                  >
                    {selectedDate ===
                    TODAY
                      ? 'HOJE'
                      : selectedWeekDay}
                  </Text>
                </View>

                <Text
                  style={
                    styles.overviewDate
                  }
                >
                  {selectedDay}{' '}
                  {selectedMonth}
                </Text>

                <Text
                  style={
                    styles.overviewWeekday
                  }
                >
                  {selectedWeekDay}
                </Text>
              </View>

              <View
                style={
                  styles.overviewIcon
                }
              >
                <Ionicons
                  name="sparkles-outline"
                  size={22}
                  color={COLORS.white}
                />
              </View>
            </View>

            <View
              style={styles.overviewDivider}
            />

            <View
              style={styles.overviewStats}
            >
              <OverviewStat
                value={String(
                  dayAppointments.length,
                )}
                label="reservas"
              />

              <View
                style={
                  styles.overviewSeparator
                }
              />

              <OverviewStat
                value={String(
                  confirmedCount,
                )}
                label="confirmadas"
              />

              <View
                style={
                  styles.overviewSeparator
                }
              />

              <OverviewStat
                value={totalRevenue
                  .toLocaleString(
                    'pt-AO',
                  )}
                label="Kz estimados"
              />
            </View>

            <View
              style={styles.progressContainer}
            >
              <View
                style={
                  styles.progressHeader
                }
              >
                <Text
                  style={
                    styles.progressLabel
                  }
                >
                  Agenda preenchida
                </Text>

                <Text
                  style={
                    styles.progressValue
                  }
                >
                  {Math.round(
                    progress * 100,
                  )}
                  %
                </Text>
              </View>

              <View
                style={
                  styles.progressTrack
                }
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(
                        progress * 100,
                        dayAppointments.length >
                          0
                          ? 4
                          : 0,
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* NEXT APPOINTMENT */}

          {nextAppointment && (
            <View
              style={styles.nextSection}
            >
              <View
                style={
                  styles.sectionHeading
                }
              >
                <View>
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Próximo
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    O teu próximo compromisso
                  </Text>
                </View>

                <View
                  style={
                    styles.liveBadge
                  }
                >
                  <View
                    style={
                      styles.liveDot
                    }
                  />

                  <Text
                    style={
                      styles.liveText
                    }
                  >
                    A SEGUIR
                  </Text>
                </View>
              </View>

              <NextAppointmentCard
                appointment={
                  nextAppointment
                }
                onPress={() =>
                  openAppointment(
                    nextAppointment,
                  )
                }
              />
            </View>
          )}

          {/* TIMELINE */}

          <View style={styles.timelineSection}>
            <View
              style={styles.sectionHeading}
            >
              <View>
                <Text
                  style={styles.sectionTitle}
                >
                  Hoje
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  A tua linha do tempo
                </Text>
              </View>

              {pendingCount > 0 && (
                <View
                  style={
                    styles.pendingBadge
                  }
                >
                  <View
                    style={
                      styles.pendingDot
                    }
                  />

                  <Text
                    style={
                      styles.pendingText
                    }
                  >
                    {pendingCount}{' '}
                    pendente
                    {pendingCount > 1
                      ? 's'
                      : ''}
                  </Text>
                </View>
              )}
            </View>

            {/* FILTERS */}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.filterList
              }
            >
              {FILTERS.map((filter) => {
                const active =
                  activeFilter === filter;

                return (
                  <Pressable
                    key={filter}
                    onPress={() =>
                      setActiveFilter(
                        filter,
                      )
                    }
                    style={({ pressed }) => [
                      styles.filter,
                      active &&
                        styles.filterActive,
                      pressed &&
                        styles.filterPressed,
                    ]}
                  >
                    {filter !==
                      'Todos' && (
                      <View
                        style={[
                          styles.filterDot,
                          {
                            backgroundColor:
                              active
                                ? COLORS.white
                                : filter ===
                                    'Confirmados'
                                  ? COLORS.green
                                  : COLORS.orange,
                          },
                        ]}
                      />
                    )}

                    <Text
                      style={[
                        styles.filterText,
                        active &&
                          styles.filterTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {filteredAppointments.length >
            0 ? (
              <View
                style={
                  styles.timelineList
                }
              >
                {filteredAppointments.map(
                  (appointment, index) => (
                    <TimelineAppointment
                      key={appointment.id}
                      appointment={
                        appointment
                      }
                      last={
                        index ===
                        filteredAppointments.length -
                          1
                      }
                      onPress={() =>
                        openAppointment(
                          appointment,
                        )
                      }
                    />
                  ),
                )}
              </View>
            ) : (
              <EmptyState
                onPress={
                  handleNewAppointment
                }
              />
            )}
          </View>

          {/* NEW APPOINTMENT */}

          <Pressable
            onPress={handleNewAppointment}
            style={({ pressed }) => [
              styles.newAppointment,
              pressed &&
                styles.newAppointmentPressed,
            ]}
          >
            <View
              style={styles.newIcon}
            >
              <Ionicons
                name="add"
                size={21}
                color={COLORS.white}
              />
            </View>

            <View
              style={styles.newContent}
            >
              <Text
                style={styles.newTitle}
              >
                Novo agendamento
              </Text>

              <Text
                style={
                  styles.newSubtitle
                }
              >
                Explora espaços e encontra o
                horário ideal.
              </Text>
            </View>

            <View
              style={styles.newArrow}
            >
              {/* arrow-up-right removido:
                  não existe em algumas versões
                  do Ionicons */}
              <Ionicons
                name="arrow-forward"
                size={17}
                color={COLORS.black}
              />
            </View>
          </Pressable>

          <View
            style={styles.bottomSpacing}
          />
        </ScrollView>

        {/* DETAILS MODAL */}

        <AppointmentDetailsModal
          visible={detailsVisible}
          appointment={
            selectedAppointment
          }
          onClose={closeDetails}
          onCancel={
            handleCancel
          }
          onReschedule={() => {
            closeDetails();
            router.push('/explore');
          }}
        />

        {/* CALENDAR MODAL */}

        <CalendarModal
          visible={calendarVisible}
          selectedDate={selectedDate}
          month={calendarMonth}
          year={calendarYear}
          appointments={appointments}
          animation={calendarAnimation}
          onClose={closeCalendar}
          onSelect={selectDate}
          onToday={handleToday}
          onPrevious={() => {
            if (calendarMonth === 0) {
              setCalendarMonth(11);
              setCalendarYear(
                calendarYear - 1,
              );
            } else {
              setCalendarMonth(
                calendarMonth - 1,
              );
            }
          }}
          onNext={() => {
            if (calendarMonth === 11) {
              setCalendarMonth(0);
              setCalendarYear(
                calendarYear + 1,
              );
            } else {
              setCalendarMonth(
                calendarMonth + 1,
              );
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   OVERVIEW STAT
========================================================= */

function OverviewStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={styles.overviewStat}>
      <Text
        style={styles.overviewStatValue}
        numberOfLines={1}
      >
        {value}
      </Text>

      <Text
        style={styles.overviewStatLabel}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

/* =========================================================
   NEXT APPOINTMENT
========================================================= */

function NextAppointmentCard({
  appointment,
  onPress,
}: {
  appointment: AppointmentView;
  onPress: () => void;
}) {
  const animation = useRef(
    new Animated.Value(0),
  ).current;

  const status = getStatusConfig(
    appointment.status,
  );

  const pressIn = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 100,
      easing: Easing.out(
        Easing.cubic,
      ),
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(
        Easing.cubic,
      ),
      useNativeDriver: true,
    }).start();
  };

  const scale =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.975],
    });

  return (
    <Animated.View
      style={[
        styles.nextCard,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.nextPressable}
      >
        <View
          style={styles.nextTop}
        >
          <View
            style={styles.nextTimeBlock}
          >
            <Text
              style={styles.nextTime}
            >
              {appointment.time}
            </Text>

            <Text
              style={styles.nextEndTime}
            >
              até {appointment.endTime}
            </Text>
          </View>

          <View
            style={[
              styles.nextStatus,
              {
                backgroundColor:
                  status.background,
              },
            ]}
          >
            <View
              style={[
                styles.nextStatusDot,
                {
                  backgroundColor:
                    status.color,
                },
              ]}
            />

            <Text
              style={[
                styles.nextStatusText,
                {
                  color:
                    status.color,
                },
              ]}
            >
              {statusLabel(appointment.status)}
            </Text>
          </View>
        </View>

        <View
          style={styles.nextDivider}
        />

        <View
          style={styles.nextBody}
        >
          <View
            style={styles.nextIcon}
          >
            <Ionicons
              name="business-outline"
              size={19}
              color={COLORS.white}
            />
          </View>

          <View
            style={styles.nextInfo}
          >
            <Text
              style={styles.nextSpace}
              numberOfLines={1}
            >
              {appointment.space}
            </Text>

            <Text
              style={styles.nextService}
              numberOfLines={1}
            >
              {appointment.service}
            </Text>

            <View
              style={
                styles.nextMeta
              }
            >
              <Ionicons
                name="person-outline"
                size={12}
                color="#85888E"
              />

              <Text
                style={styles.nextMetaText}
              >
                {appointment.professional}
              </Text>
            </View>
          </View>

          <View
            style={styles.nextArrow}
          >
            <Ionicons
              name="chevron-forward"
              size={17}
              color={COLORS.white}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* =========================================================
   TIMELINE
========================================================= */

function TimelineAppointment({
  appointment,
  last,
  onPress,
}: {
  appointment: AppointmentView;
  last: boolean;
  onPress: () => void;
}) {
  const animation = useRef(
    new Animated.Value(0),
  ).current;

  const status = getStatusConfig(
    appointment.status,
  );

  const pressIn = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(
        Easing.cubic,
      ),
      useNativeDriver: true,
    }).start();
  };

  const scale =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.985],
    });

  return (
    <View style={styles.timelineRow}>
      <View
        style={styles.timelineTime}
      >
        <Text
          style={styles.timelineHour}
        >
          {appointment.time}
        </Text>

        <Text
          style={styles.timelineEnd}
        >
          {appointment.endTime}
        </Text>
      </View>

      <View
        style={styles.timelineRail}
      >
        <View
          style={[
            styles.timelineDot,
            {
              backgroundColor:
                status.color,
            },
          ]}
        />

        {!last && (
          <View
            style={
              styles.timelineLine
            }
          />
        )}
      </View>

      <Animated.View
        style={[
          styles.timelineCard,
          {
            transform: [{ scale }],
          },
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          style={styles.timelinePressable}
        >
          <View
            style={
              styles.timelineCardTop
            }
          >
            <View
              style={[
                styles.timelineStatus,
                {
                  backgroundColor:
                    status.background,
                },
              ]}
            >
              <View
                style={[
                  styles.timelineStatusDot,
                  {
                    backgroundColor:
                      status.color,
                  },
                ]}
              />

              <Text
                style={[
                  styles.timelineStatusText,
                  {
                    color:
                      status.color,
                  },
                ]}
              >
                {statusLabel(appointment.status)}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={15}
              color={COLORS.muted}
            />
          </View>

          <Text
            style={styles.timelineSpace}
            numberOfLines={1}
          >
            {appointment.space}
          </Text>

          <Text
            style={styles.timelineService}
            numberOfLines={1}
          >
            {appointment.service}
          </Text>

          <View
            style={styles.timelineMeta}
          >
            <View
              style={styles.timelineMetaItem}
            >
              <Ionicons
                name="person-outline"
                size={12}
                color={COLORS.muted}
              />

              <Text
                style={
                  styles.timelineMetaText
                }
                numberOfLines={1}
              >
                {appointment.professional}
              </Text>
            </View>

            <View
              style={styles.timelineMetaItem}
            >
              <Ionicons
                name="time-outline"
                size={12}
                color={COLORS.muted}
              />

              <Text
                style={
                  styles.timelineMetaText
                }
              >
                {appointment.duration}
              </Text>
            </View>
          </View>

          <View
            style={styles.timelineBottom}
          >
            <Text
              style={styles.timelinePrice}
            >
              {appointment.price}
            </Text>

            <Text
              style={
                styles.timelineTapText
              }
            >
              Ver detalhes
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  onPress,
  title = 'Dia livre',
  text = 'Não tens compromissos neste dia. Explora espaços e encontra algo especial para reservar.',
}: {
  onPress: () => void;
  title?: string;
  text?: string;
}) {
  return (
    <View style={styles.emptyState}>
      <View
        style={styles.emptyIcon}
      >
        <Ionicons
          name="calendar-clear-outline"
          size={26}
          color={COLORS.black}
        />
      </View>

      <Text
        style={styles.emptyTitle}
      >
        {title}
      </Text>

      <Text
        style={styles.emptyText}
      >
        {text}
      </Text>

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.emptyButton,
          pressed &&
            styles.emptyButtonPressed,
        ]}
      >
        <Ionicons
          name="search-outline"
          size={16}
          color={COLORS.white}
        />

        <Text
          style={styles.emptyButtonText}
        >
          Explorar espaços
        </Text>
      </Pressable>
    </View>
  );
}

/* =========================================================
   APPOINTMENT DETAILS
========================================================= */

function AppointmentDetailsModal({
  visible,
  appointment,
  onClose,
  onCancel,
  onReschedule,
}: {
  visible: boolean;
  appointment: AppointmentView | null;
  onClose: () => void;
  onCancel: () => void;
  onReschedule: () => void;
}) {
  if (!appointment) {
    return null;
  }

  const status = getStatusConfig(
    appointment.status,
  );

  const canManage =
    appointment.status !== 'CANCELLED' &&
    appointment.status !== 'COMPLETED' &&
    appointment.status !== 'NO_SHOW';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={styles.detailsOverlay}
      >
        <Pressable
          style={styles.detailsBackdrop}
          onPress={onClose}
        />

        <View
          style={styles.detailsSheet}
        >
          <View
            style={styles.sheetHandle}
          />

          <View
            style={styles.detailsHeader}
          >
            <View>
              <Text
                style={
                  styles.detailsEyebrow
                }
              >
                AGENDAMENTO
              </Text>

              <Text
                style={
                  styles.detailsTitle
                }
              >
                Detalhes
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={
                styles.detailsClose
              }
            >
              <Ionicons
                name="close"
                size={19}
                color={COLORS.black}
              />
            </Pressable>
          </View>

          <View
            style={styles.detailsHero}
          >
            <View
              style={
                styles.detailsDateBlock
              }
            >
              <Text
                style={
                  styles.detailsTime
                }
              >
                {appointment.time}
              </Text>

              <Text
                style={
                  styles.detailsEnd
                }
              >
                até {appointment.endTime}
              </Text>
            </View>

            <View
              style={[
                styles.detailsStatus,
                {
                  backgroundColor:
                    status.background,
                },
              ]}
            >
              <Ionicons
                name={status.icon}
                size={14}
                color={status.color}
              />

              <Text
                style={[
                  styles.detailsStatusText,
                  {
                    color:
                      status.color,
                  },
                ]}
              >
                {statusLabel(appointment.status)}
              </Text>
            </View>
          </View>

          <View
            style={styles.detailsSpace}
          >
            <View
              style={styles.detailsSpaceIcon}
            >
              <Ionicons
                name="business-outline"
                size={21}
                color={COLORS.white}
              />
            </View>

            <View
              style={
                styles.detailsSpaceContent
              }
            >
              <Text
                style={
                  styles.detailsSpaceName
                }
              >
                {appointment.space}
              </Text>

              <Text
                style={
                  styles.detailsService
                }
              >
                {appointment.service}
              </Text>
            </View>
          </View>

          <View
            style={styles.detailsGrid}
          >
            <DetailItem
              icon="person-outline"
              label="PROFISSIONAL"
              value={
                appointment.professional
              }
            />

            <DetailItem
              icon="time-outline"
              label="DURAÇÃO"
              value={
                appointment.duration
              }
            />

            <DetailItem
              icon="calendar-outline"
              label="DATA"
              value={`${appointment.time} · ${appointment.date.slice(
                8,
              )}/${appointment.date.slice(
                5,
                7,
              )}`}
            />

            <DetailItem
              icon="card-outline"
              label="TOTAL"
              value={appointment.price}
            />
          </View>

          {canManage && (
            <View
              style={
                styles.detailsActions
              }
            >
              <Pressable
                onPress={onReschedule}
                style={({ pressed }) => [
                  styles.rescheduleAction,
                  pressed &&
                    styles.actionPressed,
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color={COLORS.blue}
                />

                <Text
                  style={
                    styles.rescheduleActionText
                  }
                >
                  Reagendar
                </Text>
              </Pressable>

              <Pressable
                onPress={onCancel}
                style={({ pressed }) => [
                  styles.cancelAction,
                  pressed &&
                    styles.actionPressed,
                ]}
              >
                <Ionicons
                  name="close-outline"
                  size={18}
                  color={COLORS.red}
                />

                <Text
                  style={
                    styles.cancelActionText
                  }
                >
                  Cancelar
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<
    typeof Ionicons
  >['name'];
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.detailItem}
    >
      <View
        style={styles.detailIcon}
      >
        <Ionicons
          name={icon}
          size={14}
          color={COLORS.secondary}
        />
      </View>

      <View style={styles.detailText}>
        <Text
          style={styles.detailLabel}
        >
          {label}
        </Text>

        <Text
          style={styles.detailValue}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/* =========================================================
   CALENDAR MODAL
========================================================= */

function CalendarModal({
  visible,
  selectedDate,
  month,
  year,
  appointments,
  animation,
  onClose,
  onSelect,
  onToday,
  onPrevious,
  onNext,
}: {
  visible: boolean;
  selectedDate: string;
  month: number;
  year: number;
  appointments: AppointmentView[];
  animation: Animated.Value;
  onClose: () => void;
  onSelect: (date: string) => void;
  onToday: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const days = useMemo(() => {
    const firstDay = new Date(
      year,
      month,
      1,
    ).getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0,
    ).getDate();

    const previousMonthDays =
      new Date(
        year,
        month,
        0,
      ).getDate();

    const result: {
      date: string;
      day: number;
      currentMonth: boolean;
    }[] = [];

    for (
      let i = firstDay - 1;
      i >= 0;
      i--
    ) {
      const day =
        previousMonthDays - i;

      const previousMonth =
        month === 0
          ? 11
          : month - 1;

      const previousYear =
        month === 0
          ? year - 1
          : year;

      result.push({
        date: formatDate(
          previousYear,
          previousMonth,
          day,
        ),
        day,
        currentMonth: false,
      });
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      result.push({
        date: formatDate(
          year,
          month,
          day,
        ),
        day,
        currentMonth: true,
      });
    }

    let nextDay = 1;

    while (result.length % 7 !== 0) {
      const nextMonth =
        month === 11
          ? 0
          : month + 1;

      const nextYear =
        month === 11
          ? year + 1
          : year;

      result.push({
        date: formatDate(
          nextYear,
          nextMonth,
          nextDay,
        ),
        day: nextDay,
        currentMonth: false,
      });

      nextDay++;
    }

    return result;
  }, [month, year]);

  if (!visible) {
    return null;
  }

  return (
    <View
      style={styles.calendarOverlay}
    >
      <Pressable
        style={styles.calendarBackdrop}
        onPress={onClose}
      />

      <Animated.View
        style={[
          styles.calendarModal,
          {
            opacity: animation,
            transform: [
              {
                translateY:
                  animation.interpolate(
                    {
                      inputRange: [0, 1],
                      outputRange: [
                        -25,
                        0,
                      ],
                    },
                  ),
              },
              {
                scale:
                  animation.interpolate(
                    {
                      inputRange: [0, 1],
                      outputRange: [
                        0.96,
                        1,
                      ],
                    },
                  ),
              },
            ],
          },
        ]}
      >
        <View
          style={
            styles.calendarHeader
          }
        >
          <View>
            <Text
              style={
                styles.calendarEyebrow
              }
            >
              ESCOLHER DATA
            </Text>

            <Text
              style={
                styles.calendarTitle
              }
            >
              {MONTHS[month]} {year}
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            style={
              styles.calendarClose
            }
          >
            <Ionicons
              name="close"
              size={18}
              color={COLORS.black}
            />
          </Pressable>
        </View>

        <View
          style={
            styles.calendarControls
          }
        >
          <Pressable
            onPress={onPrevious}
            style={
              styles.calendarControl
            }
          >
            <Ionicons
              name="chevron-back"
              size={17}
              color={COLORS.black}
            />
          </Pressable>

          <Pressable
            onPress={onToday}
            style={
              styles.calendarToday
            }
          >
            <Text
              style={
                styles.calendarTodayText
              }
            >
              Hoje
            </Text>
          </Pressable>

          <Pressable
            onPress={onNext}
            style={
              styles.calendarControl
            }
          >
            <Ionicons
              name="chevron-forward"
              size={17}
              color={COLORS.black}
            />
          </Pressable>
        </View>

        <View
          style={
            styles.calendarWeek
          }
        >
          {WEEK_DAYS.map((day) => (
            <Text
              key={day}
              style={
                styles.calendarWeekText
              }
            >
              {day}
            </Text>
          ))}
        </View>

        <View
          style={
            styles.calendarGrid
          }
        >
          {days.map((item) => {
            const active =
              item.date ===
              selectedDate;

            const today =
              item.date === TODAY;

            const hasAppointments =
              appointments.some(
                (appointment) =>
                  appointment.date ===
                  item.date,
              );

            return (
              <Pressable
                key={item.date}
                onPress={() => {
                  onSelect(item.date);
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.calendarDay,
                  !item.currentMonth &&
                    styles.calendarOutside,
                  active &&
                    styles.calendarDayActive,
                  pressed &&
                    styles.calendarDayPressed,
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    !item.currentMonth &&
                      styles.calendarOutsideText,
                    active &&
                      styles.calendarDayActiveText,
                    today &&
                      !active &&
                      styles.calendarTodayNumber,
                  ]}
                >
                  {item.day}
                </Text>

                {hasAppointments && (
                  <View
                    style={[
                      styles.calendarIndicator,
                      active &&
                        styles.calendarIndicatorActive,
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  scrollContent: {
    paddingTop: 4,
    paddingBottom: 35,
  },

  /* HEADER */

  header: {
    paddingHorizontal: 20,
    paddingTop: 9,
    paddingBottom: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  headerEyebrow: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.8,
  },

  headerTitle: {
    marginTop: 4,
    color: COLORS.black,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.7,
  },

  headerButton: {
    width: 47,
    height: 47,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  headerButtonPressed: {
    transform: [
      {
        scale: 0.92,
      },
    ],
    opacity: 0.7,
  },

  headerBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 15,
    height: 15,
    paddingHorizontal: 3,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.blue,
  },

  headerBadgeText: {
    color: COLORS.white,
    fontSize: 7,
    fontWeight: '900',
  },

  /* DATE */

  dateSection: {
    marginBottom: 18,
  },

  dateSectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  dateMonth: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '800',
  },

  dateHint: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 9,
  },

  todayMiniButton: {
    paddingHorizontal: 12,
    height: 31,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.black,
  },

  todayMiniText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
  },

  dateList: {
    paddingHorizontal: 20,
  },

  dateItem: {
    width: 52,
    height: 69,
    marginRight: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  dateItemActive: {
    backgroundColor:
      COLORS.black,
    borderColor:
      COLORS.black,
  },

  dateItemPressed: {
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  dateWeekday: {
    color: COLORS.muted,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  dateWeekdayActive: {
    color: '#85888E',
  },

  dateNumber: {
    marginTop: 6,
    color: COLORS.black,
    fontSize: 17,
    fontWeight: '800',
  },

  dateNumberActive: {
    color: COLORS.white,
  },

  dateNumberToday: {
    color: COLORS.blue,
  },

  dateIndicator: {
    width: 4,
    height: 4,
    marginTop: 5,
    borderRadius: 2,
    backgroundColor:
      'transparent',
  },

  dateIndicatorVisible: {
    backgroundColor:
      COLORS.blue,
  },

  dateIndicatorActive: {
    backgroundColor:
      COLORS.white,
  },

  /* OVERVIEW */

  overview: {
    position: 'relative',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor:
      COLORS.dark,
  },

  overviewTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent:
      'space-between',
  },

  overviewPill: {
    alignSelf: 'flex-start',
    height: 23,
    paddingHorizontal: 9,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      COLORS.darkSoft,
  },

  overviewDot: {
    width: 5,
    height: 5,
    marginRight: 5,
    borderRadius: 3,
    backgroundColor:
      COLORS.green,
  },

  overviewPillText: {
    color: '#A7ABB0',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },

  overviewDate: {
    marginTop: 9,
    color: COLORS.white,
    fontSize: 31,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -1.1,
  },

  overviewWeekday: {
    marginTop: 3,
    color: '#898D93',
    fontSize: 10,
    fontWeight: '600',
  },

  overviewIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      '#202226',
    borderWidth: 1,
    borderColor:
      COLORS.darkBorder,
  },

  overviewDivider: {
    height: 1,
    marginTop: 19,
    marginBottom: 16,
    backgroundColor:
      '#292B2F',
  },

  overviewStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  overviewStat: {
    flex: 1,
  },

  overviewStatValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },

  overviewStatLabel: {
    marginTop: 3,
    color: '#7E8288',
    fontSize: 8,
  },

  overviewSeparator: {
    width: 1,
    height: 27,
    marginHorizontal: 9,
    backgroundColor:
      '#292B2F',
  },

  progressContainer: {
    marginTop: 18,
  },

  progressHeader: {
    marginBottom: 7,
    flexDirection: 'row',
    justifyContent:
      'space-between',
  },

  progressLabel: {
    color: '#85888E',
    fontSize: 8,
    fontWeight: '600',
  },

  progressValue: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '800',
  },

  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor:
      '#27292C',
  },

  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor:
      COLORS.white,
  },

  /* SECTIONS */

  nextSection: {
    marginTop: 28,
  },

  timelineSection: {
    marginTop: 30,
  },

  sectionHeading: {
    paddingHorizontal: 20,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  sectionTitle: {
    color: COLORS.black,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  sectionSubtitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 9,
  },

  liveBadge: {
    paddingHorizontal: 9,
    height: 25,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      COLORS.black,
  },

  liveDot: {
    width: 5,
    height: 5,
    marginRight: 5,
    borderRadius: 3,
    backgroundColor:
      COLORS.green,
  },

  liveText: {
    color: COLORS.white,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  pendingBadge: {
    paddingHorizontal: 8,
    height: 25,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      COLORS.orangeSoft,
  },

  pendingDot: {
    width: 5,
    height: 5,
    marginRight: 5,
    borderRadius: 3,
    backgroundColor:
      COLORS.orange,
  },

  pendingText: {
    color: COLORS.orange,
    fontSize: 7,
    fontWeight: '900',
  },

  /* NEXT CARD */

  nextCard: {
    marginHorizontal: 20,
    borderRadius: 23,
    overflow: 'hidden',
    backgroundColor:
      COLORS.black,
    shadowColor:
      COLORS.black,
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.13,
    shadowRadius: 18,
    elevation: 5,
  },

  nextPressable: {
    padding: 17,
  },

  nextTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  nextTimeBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  nextTime: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -1,
  },

  nextEndTime: {
    marginLeft: 7,
    color: '#777B81',
    fontSize: 9,
    fontWeight: '600',
  },

  nextStatus: {
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  nextStatusDot: {
    width: 5,
    height: 5,
    marginRight: 5,
    borderRadius: 3,
  },

  nextStatusText: {
    fontSize: 7,
    fontWeight: '900',
  },

  nextDivider: {
    height: 1,
    marginVertical: 15,
    backgroundColor:
      '#292B2F',
  },

  nextBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  nextIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      '#232529',
    borderWidth: 1,
    borderColor:
      '#33353A',
  },

  nextInfo: {
    flex: 1,
    marginLeft: 11,
    minWidth: 0,
  },

  nextSpace: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },

  nextService: {
    marginTop: 3,
    color: '#8E9298',
    fontSize: 10,
    fontWeight: '600',
  },

  nextMeta: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  nextMetaText: {
    marginLeft: 5,
    color: '#7D8187',
    fontSize: 8,
  },

  nextArrow: {
    width: 33,
    height: 33,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      '#232529',
  },

  /* FILTER */

  filterList: {
    paddingHorizontal: 20,
    marginBottom: 17,
  },

  filter: {
    height: 34,
    marginRight: 7,
    paddingHorizontal: 13,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  filterActive: {
    backgroundColor:
      COLORS.black,
    borderColor:
      COLORS.black,
  },

  filterPressed: {
    transform: [
      {
        scale: 0.95,
      },
    ],
  },

  filterDot: {
    width: 5,
    height: 5,
    marginRight: 6,
    borderRadius: 3,
  },

  filterText: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: '700',
  },

  filterTextActive: {
    color: COLORS.white,
  },

  /* TIMELINE */

  timelineList: {
    paddingHorizontal: 20,
  },

  timelineRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },

  timelineTime: {
    width: 46,
    paddingTop: 13,
    alignItems: 'flex-end',
  },

  timelineHour: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '800',
  },

  timelineEnd: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 7,
  },

  timelineRail: {
    width: 25,
    marginHorizontal: 8,
    alignItems: 'center',
  },

  timelineDot: {
    width: 9,
    height: 9,
    marginTop: 16,
    borderRadius: 5,
    borderWidth: 2,
    borderColor:
      COLORS.background,
  },

  timelineLine: {
    width: 1,
    flex: 1,
    marginTop: 4,
    backgroundColor:
      COLORS.border,
  },

  timelineCard: {
    flex: 1,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    shadowColor:
      COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 1,
  },

  timelinePressable: {
    padding: 14,
  },

  timelineCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  timelineStatus: {
    paddingHorizontal: 7,
    height: 21,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  timelineStatusDot: {
    width: 5,
    height: 5,
    marginRight: 5,
    borderRadius: 3,
  },

  timelineStatusText: {
    fontSize: 7,
    fontWeight: '900',
  },

  timelineSpace: {
    marginTop: 11,
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '800',
  },

  timelineService: {
    marginTop: 3,
    color: COLORS.blue,
    fontSize: 9,
    fontWeight: '700',
  },

  timelineMeta: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  timelineMetaItem: {
    flex: 1,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  timelineMetaText: {
    flex: 1,
    marginLeft: 5,
    color: COLORS.secondary,
    fontSize: 8,
  },

  timelineBottom: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  timelinePrice: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '800',
  },

  timelineTapText: {
    color: COLORS.muted,
    fontSize: 7,
    fontWeight: '700',
  },

  /* EMPTY */

  emptyState: {
    marginHorizontal: 20,
    paddingHorizontal: 25,
    paddingVertical: 35,
    borderRadius: 22,
    alignItems: 'center',
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    marginBottom: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.background,
  },

  emptyTitle: {
    color: COLORS.black,
    fontSize: 17,
    fontWeight: '800',
  },

  emptyText: {
    maxWidth: 280,
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
  },

  emptyButton: {
    marginTop: 18,
    paddingHorizontal: 17,
    height: 40,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.black,
  },

  emptyButtonPressed: {
    transform: [
      {
        scale: 0.96,
      },
    ],
    opacity: 0.8,
  },

  emptyButtonText: {
    marginLeft: 6,
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900',
  },

  /* NEW */

  newAppointment: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 13,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  newAppointmentPressed: {
    transform: [
      {
        scale: 0.975,
      },
    ],
    opacity: 0.8,
  },

  newIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.black,
  },

  newContent: {
    flex: 1,
    marginLeft: 11,
  },

  newTitle: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: '800',
  },

  newSubtitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 8,
  },

  newArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.background,
  },

  bottomSpacing: {
    height: 100,
  },

  /* DETAILS */

  detailsOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  detailsBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor:
      'rgba(0,0,0,0.42)',
  },

  detailsSheet: {
    paddingHorizontal: 20,
    paddingTop: 9,
    paddingBottom: 28,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor:
      COLORS.white,
  },

  sheetHandle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    marginBottom: 19,
    borderRadius: 2,
    backgroundColor:
      COLORS.border,
  },

  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  detailsEyebrow: {
    color: COLORS.muted,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  detailsTitle: {
    marginTop: 3,
    color: COLORS.black,
    fontSize: 22,
    fontWeight: '800',
  },

  detailsClose: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.background,
  },

  detailsHero: {
    marginTop: 21,
    padding: 15,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    backgroundColor:
      COLORS.background,
  },

  detailsDateBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  detailsTime: {
    color: COLORS.black,
    fontSize: 25,
    fontWeight: '800',
  },

  detailsEnd: {
    marginLeft: 7,
    color: COLORS.muted,
    fontSize: 9,
  },

  detailsStatus: {
    paddingHorizontal: 9,
    height: 26,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailsStatusText: {
    marginLeft: 5,
    fontSize: 7,
    fontWeight: '900',
  },

  detailsSpace: {
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailsSpaceIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.black,
  },

  detailsSpaceContent: {
    flex: 1,
    marginLeft: 11,
  },

  detailsSpaceName: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '800',
  },

  detailsService: {
    marginTop: 3,
    color: COLORS.blue,
    fontSize: 9,
    fontWeight: '700',
  },

  detailsGrid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  detailItem: {
    width: '50%',
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailIcon: {
    width: 32,
    height: 32,
    marginRight: 8,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.background,
  },

  detailText: {
    flex: 1,
  },

  detailLabel: {
    color: COLORS.muted,
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  detailValue: {
    marginTop: 2,
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: '700',
  },

  detailsActions: {
    marginTop: 4,
    flexDirection: 'row',
  },

  rescheduleAction: {
    flex: 1,
    height: 46,
    marginRight: 7,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.blueSoft,
  },

  rescheduleActionText: {
    marginLeft: 6,
    color: COLORS.blue,
    fontSize: 9,
    fontWeight: '900',
  },

  cancelAction: {
    width: 105,
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.redSoft,
  },

  cancelActionText: {
    marginLeft: 5,
    color: COLORS.red,
    fontSize: 9,
    fontWeight: '900',
  },

  actionPressed: {
    transform: [
      {
        scale: 0.96,
      },
    ],
    opacity: 0.75,
  },

  /* CALENDAR MODAL */

  calendarOverlay: {
    position: 'absolute',
    zIndex: 100,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  calendarBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor:
      'rgba(0,0,0,0.34)',
  },

  calendarModal: {
    position: 'absolute',
    top: 68,
    left: 16,
    right: 16,
    padding: 18,
    borderRadius: 27,
    backgroundColor:
      COLORS.white,
    shadowColor:
      COLORS.black,
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 12,
  },

  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  calendarEyebrow: {
    color: COLORS.muted,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  calendarTitle: {
    marginTop: 4,
    color: COLORS.black,
    fontSize: 22,
    fontWeight: '800',
  },

  calendarClose: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.background,
  },

  calendarControls: {
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  calendarControl: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.background,
  },

  calendarToday: {
    height: 35,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.black,
  },

  calendarTodayText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900',
  },

  calendarWeek: {
    marginTop: 19,
    flexDirection: 'row',
  },

  calendarWeekText: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 7,
    fontWeight: '900',
  },

  calendarGrid: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  calendarDay: {
    width: '14.2857%',
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendarOutside: {
    opacity: 0.28,
  },

  calendarDayActive: {
    backgroundColor:
      COLORS.black,
  },

  calendarDayPressed: {
    transform: [
      {
        scale: 0.88,
      },
    ],
  },

  calendarDayText: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '700',
  },

  calendarOutsideText: {
    color: COLORS.muted,
  },

  calendarDayActiveText: {
    color: COLORS.white,
  },

  calendarTodayNumber: {
    color: COLORS.blue,
    fontWeight: '900',
  },

  calendarIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor:
      COLORS.blue,
  },

  calendarIndicatorActive: {
    backgroundColor:
      COLORS.white,
  },
});