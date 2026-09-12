import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ABSOLUTE_FILL = {
  position: 'absolute' as const,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const COLORS = {
  background: '#F4F4F1',
  white: '#FFFFFF',
  black: '#111111',
  gold: '#B08D57',
  goldLight: '#C9AA78',
  text: '#151515',
  muted: '#777777',
  soft: '#A1A1A1',
  border: 'rgba(17,17,17,0.08)',
  glass: 'rgba(255,255,255,0.72)',
  glassStrong: 'rgba(255,255,255,0.88)',
  success: '#2E7D5B',
};

type IconName = keyof typeof Ionicons.glyphMap;

type Professional = {
  id: string;
  name: string;
  role: string;
  image: string;
  services: string[];
};

type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
  icon: IconName;
};

type CalendarDay = {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

const spacePhotos = [
  'https://images.unsplash.com/photo-1622288432450-277d0fef5ed3?auto=format&fit=crop&w=1400&q=90',
  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1400&q=90',
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=90',
  'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1400&q=90',
  'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1400&q=90',
  'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1400&q=90',
];

const professionals: Professional[] = [
  {
    id: 'andre-miguel',
    name: 'André Miguel',
    role: 'Master Barber',
    image:
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=700&q=90',
    services: [
      'corte-premium',
      'corte-barba',
      'barba-signature',
      'corte-executivo',
      'skin-fade',
      'barba-classica',
      'experiencia-signature',
    ],
  },
  {
    id: 'carla-mendes',
    name: 'Carla Mendes',
    role: 'Beauty Specialist',
    image:
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=700&q=90',
    services: [
      'corte-premium',
      'tratamento-premium',
      'corte-executivo',
      'hidratacao-capilar',
      'massagem-facial',
      'experiencia-signature',
    ],
  },
  {
    id: 'daniel-costa',
    name: 'Daniel Costa',
    role: 'Senior Grooming',
    image:
      'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=700&q=90',
    services: [
      'corte-premium',
      'corte-barba',
      'barba-signature',
      'corte-executivo',
      'skin-fade',
      'barba-classica',
    ],
  },
];

const services: Service[] = [
  {
    id: 'corte-premium',
    name: 'Corte Premium',
    duration: 45,
    price: 12000,
    category: 'Cabelo',
    icon: 'cut-outline',
  },
  {
    id: 'corte-barba',
    name: 'Corte + Barba',
    duration: 60,
    price: 18000,
    category: 'Combos',
    icon: 'sparkles-outline',
  },
  {
    id: 'barba-signature',
    name: 'Barba Signature',
    duration: 30,
    price: 9000,
    category: 'Barba',
    icon: 'person-outline',
  },
  {
    id: 'tratamento-premium',
    name: 'Tratamento Premium',
    duration: 75,
    price: 25000,
    category: 'Tratamentos',
    icon: 'water-outline',
  },
  {
    id: 'corte-executivo',
    name: 'Corte Executivo',
    duration: 45,
    price: 15000,
    category: 'Cabelo',
    icon: 'business-outline',
  },
  {
    id: 'skin-fade',
    name: 'Skin Fade',
    duration: 50,
    price: 16000,
    category: 'Cabelo',
    icon: 'cut-outline',
  },
  {
    id: 'barba-classica',
    name: 'Barba Clássica',
    duration: 30,
    price: 8500,
    category: 'Barba',
    icon: 'person-outline',
  },
  {
    id: 'hidratacao-capilar',
    name: 'Hidratação Capilar',
    duration: 40,
    price: 11000,
    category: 'Tratamentos',
    icon: 'water-outline',
  },
  {
    id: 'massagem-facial',
    name: 'Massagem Facial',
    duration: 30,
    price: 10000,
    category: 'Wellness',
    icon: 'happy-outline',
  },
  {
    id: 'experiencia-signature',
    name: 'Experiência Signature',
    duration: 90,
    price: 32000,
    category: 'Experiências',
    icon: 'diamond-outline',
  },
];

const times = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
];

const weekdays = [
  'SEG',
  'TER',
  'QUA',
  'QUI',
  'SEX',
  'SÁB',
  'DOM',
];

const formatPrice = (value: number) =>
  new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace('AOA', 'Kz');

const startOfDay = (date: Date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatSelectedDate = (date: Date) =>
  new Intl.DateTimeFormat('pt-AO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);

const formatMonth = (date: Date) =>
  new Intl.DateTimeFormat('pt-AO', {
    month: 'long',
    year: 'numeric',
  }).format(date);

const getCalendarDays = (month: Date): CalendarDay[] => {
  const firstDay = new Date(
    month.getFullYear(),
    month.getMonth(),
    1,
  );

  const lastDay = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  );

  let startOffset = firstDay.getDay() - 1;

  if (startOffset < 0) {
    startOffset = 6;
  }

  const days: CalendarDay[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    const date = new Date(
      month.getFullYear(),
      month.getMonth(),
      -i,
    );

    days.push({
      date,
      day: date.getDate(),
      isCurrentMonth: false,
      isToday: isSameDay(date, new Date()),
    });
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(
      month.getFullYear(),
      month.getMonth(),
      day,
    );

    days.push({
      date,
      day,
      isCurrentMonth: true,
      isToday: isSameDay(date, new Date()),
    });
  }

  const remaining = 42 - days.length;

  for (let i = 1; i <= remaining; i++) {
    const date = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      i,
    );

    days.push({
      date,
      day: date.getDate(),
      isCurrentMonth: false,
      isToday: isSameDay(date, new Date()),
    });
  }

  return days;
};

const GlassCard = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) => {
  return (
    <View style={[styles.glassCard, style]}>
      <BlurView
        intensity={32}
        tint="light"
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={[
          'rgba(255,255,255,0.86)',
          'rgba(255,255,255,0.60)',
        ]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.glassTopLine} />

      {children}
    </View>
  );
};

const SectionHeader = ({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle?: string;
}) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionNumber}>
      <Text style={styles.sectionNumberText}>
        {number}
      </Text>
    </View>

    <View style={styles.sectionHeaderContent}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {subtitle ? (
        <Text style={styles.sectionSubtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  </View>
);

const SpaceCarousel = ({
  favorite,
  onFavorite,
}: {
  favorite: boolean;
  onFavorite: () => void;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const carouselRef =
    useRef<FlatList<string>>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex =
        activeIndex >= spacePhotos.length - 1
          ? 0
          : activeIndex + 1;

      carouselRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setActiveIndex(nextIndex);
    }, 4500);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const onScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x /
        SCREEN_WIDTH,
    );

    setActiveIndex(index);
  };

  return (
    <View style={styles.carouselWrapper}>
      <FlatList
        ref={carouselRef}
        data={spacePhotos}
        keyExtractor={(_, index) => String(index)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <View
            style={styles.carouselImageWrapper}
          >
            <Image
              source={{ uri: item }}
              style={styles.carouselImage}
              resizeMode="cover"
            />

            <LinearGradient
              colors={[
                'rgba(0,0,0,0.02)',
                'rgba(0,0,0,0.15)',
                'rgba(0,0,0,0.72)',
              ]}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.premiumBadge}>
              <Ionicons
                name="diamond-outline"
                size={13}
                color="#FFFFFF"
              />

              <Text
                style={styles.premiumBadgeText}
              >
                PREMIUM SPACE
              </Text>
            </View>

            <Pressable
              onPress={onFavorite}
              style={styles.favoriteButton}
            >
              <BlurView
                intensity={35}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />

              <Ionicons
                name={
                  favorite
                    ? 'heart'
                    : 'heart-outline'
                }
                size={21}
                color="#FFFFFF"
              />
            </Pressable>

            <View style={styles.carouselBottom}>
              <View>
                <Text style={styles.spaceLocation}>
                  Alvalade, Luanda
                </Text>

                <Text style={styles.spaceName}>
                  GENTLEMAN&apos;S CLUB
                </Text>
              </View>

              <View
                style={styles.ratingContainer}
              >
                <Ionicons
                  name="star"
                  size={14}
                  color="#D6B477"
                />

                <Text style={styles.ratingText}>
                  4.9
                </Text>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.carouselIndicators}>
        {spacePhotos.map((_, index) => (
          <View
            key={index}
            style={[
              styles.carouselIndicator,
              index === activeIndex &&
                styles.carouselIndicatorActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const ServiceRow = ({
  service,
  selected,
  onPress,
}: {
  service: Service;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.serviceRow,
      selected && styles.serviceRowSelected,
      pressed && styles.serviceRowPressed,
    ]}
  >
    <View
      style={[
        styles.serviceIcon,
        selected &&
          styles.serviceIconSelected,
      ]}
    >
      <Ionicons
        name={service.icon}
        size={19}
        color={
          selected
            ? COLORS.white
            : COLORS.black
        }
      />
    </View>

    <View style={styles.serviceInfo}>
      <Text style={styles.serviceName}>
        {service.name}
      </Text>

      <View style={styles.serviceMeta}>
        <Text style={styles.serviceCategory}>
          {service.category}
        </Text>

        <View style={styles.metaDot} />

        <Text style={styles.serviceDuration}>
          {service.duration} min
        </Text>
      </View>
    </View>

    <View
      style={styles.servicePriceContainer}
    >
      <Text style={styles.servicePrice}>
        {formatPrice(service.price)}
      </Text>

      <Ionicons
        name={
          selected
            ? 'checkmark-circle'
            : 'chevron-forward'
        }
        size={20}
        color={
          selected
            ? COLORS.gold
            : COLORS.soft
        }
      />
    </View>
  </Pressable>
);

const ServiceSelectorModal = ({
  visible,
  selectedService,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedService: Service | null;
  onSelect: (service: Service) => void;
  onClose: () => void;
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] =
    useState('Todos');

  const categories = useMemo(
    () => [
      'Todos',
      ...Array.from(
        new Set(
          services.map(
            (service) => service.category,
          ),
        ),
      ),
    ],
    [],
  );

  const filteredServices = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return services.filter((service) => {
      const matchesCategory =
        category === 'Todos' ||
        service.category === category;

      const matchesQuery =
        !normalizedQuery ||
        service.name
          .toLowerCase()
          .includes(normalizedQuery) ||
        service.category
          .toLowerCase()
          .includes(normalizedQuery);

      return (
        matchesCategory && matchesQuery
      );
    });
  }, [category, query]);

  useEffect(() => {
    if (visible) {
      setQuery('');
      setCategory('Todos');
    }
  }, [visible]);

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={onClose}
        />

        <View style={styles.modalSheet}>
          <BlurView
            intensity={45}
            tint="light"
            style={StyleSheet.absoluteFill}
          />

          <LinearGradient
            colors={[
              'rgba(255,255,255,0.98)',
              'rgba(246,246,243,0.98)',
            ]}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <View
              style={styles.modalHeaderText}
            >
              <Text
                style={styles.modalEyebrow}
              >
                EXPERIÊNCIA
              </Text>

              <Text
                style={styles.modalTitle}
              >
                Escolha o serviço
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              hitSlop={8}
              style={({ pressed }) => [
                styles.modalClose,
                pressed &&
                  styles.modalClosePressed,
              ]}
            >
              <Ionicons
                name="close"
                size={21}
                color={COLORS.black}
              />
            </Pressable>
          </View>

          <View
            style={styles.searchContainer}
          >
            <Ionicons
              name="search-outline"
              size={19}
              color={
                query.length > 0
                  ? COLORS.gold
                  : COLORS.muted
              }
            />

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Pesquisar serviço..."
              placeholderTextColor={
                COLORS.soft
              }
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              selectionColor={COLORS.gold}
              clearButtonMode="never"
            />

            {query.length > 0 ? (
              <Pressable
                onPress={clearSearch}
                hitSlop={10}
                style={styles.searchClear}
              >
                <View
                  style={
                    styles.searchClearCircle
                  }
                >
                  <Ionicons
                    name="close"
                    size={13}
                    color={COLORS.muted}
                  />
                </View>
              </Pressable>
            ) : null}
          </View>

          <View
            style={styles.categoryArea}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.categoryScroll
              }
            >
              {categories.map((item) => {
                const selected =
                  item === category;

                return (
                  <Pressable
                    key={item}
                    onPress={() =>
                      setCategory(item)
                    }
                    style={({ pressed }) => [
                      styles.categoryChip,
                      selected &&
                        styles.categoryChipSelected,
                      pressed &&
                        styles.categoryChipPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selected &&
                          styles.categoryChipTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View
            style={styles.modalResultsHeader}
          >
            <View>
              <Text
                style={
                  styles.modalResultsTitle
                }
              >
                Serviços disponíveis
              </Text>

              <Text
                style={
                  styles.modalResultsCount
                }
              >
                {filteredServices.length}{' '}
                {filteredServices.length === 1
                  ? 'opção'
                  : 'opções'}
              </Text>
            </View>

            {query.length > 0 ? (
              <View
                style={styles.searchActiveBadge}
              >
                <Ionicons
                  name="search"
                  size={11}
                  color={COLORS.gold}
                />

                <Text
                  style={
                    styles.searchActiveBadgeText
                  }
                >
                  Pesquisa
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.modalList}>
            <FlatList
              data={filteredServices}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              nestedScrollEnabled
              contentContainerStyle={
                filteredServices.length === 0
                  ? styles.modalEmptyListContent
                  : styles.modalListContent
              }
              renderItem={({ item }) => (
                <ServiceRow
                  service={item}
                  selected={
                    selectedService?.id ===
                    item.id
                  }
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                />
              )}
              ListEmptyComponent={
                <View
                  style={styles.emptyServices}
                >
                  <View
                    style={
                      styles.emptyServicesIcon
                    }
                  >
                    <Ionicons
                      name="search-outline"
                      size={25}
                      color={COLORS.soft}
                    />
                  </View>

                  <Text
                    style={
                      styles.emptyServicesTitle
                    }
                  >
                    Nenhum serviço encontrado
                  </Text>

                  <Text
                    style={
                      styles.emptyServicesText
                    }
                  >
                    Tente outra pesquisa ou
                    escolha uma categoria
                    diferente.
                  </Text>

                  {query.length > 0 ? (
                    <Pressable
                      onPress={clearSearch}
                      style={
                        styles.emptyServicesButton
                      }
                    >
                      <Text
                        style={
                          styles.emptyServicesButtonText
                        }
                      >
                        Limpar pesquisa
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              }
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const SummaryRow = ({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) => (
  <View style={styles.summaryRow}>
    <Text
      style={[
        styles.summaryLabel,
        muted &&
          styles.summaryLabelMuted,
      ]}
    >
      {label}
    </Text>

    <Text
      style={[
        styles.summaryValue,
        muted &&
          styles.summaryValueMuted,
      ]}
    >
      {value}
    </Text>
  </View>
);

const SpaceScreen = () => {
  const router = useRouter();

  const [
    selectedProfessional,
    setSelectedProfessional,
  ] = useState<Professional | null>(null);

  const [
    selectedService,
    setSelectedService,
  ] = useState<Service | null>(null);

  const [selectedDate, setSelectedDate] =
    useState<Date>(
      startOfDay(new Date()),
    );

  const [
    calendarMonth,
    setCalendarMonth,
  ] = useState<Date>(
    startOfDay(new Date()),
  );

  const [selectedTime, setSelectedTime] =
    useState<string | null>(null);

  const [favorite, setFavorite] =
    useState(false);

  const [
    serviceModalVisible,
    setServiceModalVisible,
  ] = useState(false);

  const [bookingStatus, setBookingStatus] =
    useState<
      'idle' | 'sending' | 'success'
    >('idle');

  const buttonTravel = useRef(
    new Animated.Value(0),
  ).current;

  const buttonOpacity = useRef(
    new Animated.Value(1),
  ).current;

  const buttonScale = useRef(
    new Animated.Value(1),
  ).current;

  const successOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const successScale = useRef(
    new Animated.Value(0.8),
  ).current;

  const successTranslate = useRef(
    new Animated.Value(18),
  ).current;

  const calendarDays = useMemo(
    () =>
      getCalendarDays(calendarMonth),
    [calendarMonth],
  );

  const availableProfessionals =
    useMemo(() => {
      if (!selectedService) {
        return [];
      }

      return professionals.filter(
        (professional) =>
          professional.services.includes(
            selectedService.id,
          ),
      );
    }, [selectedService]);

  const handleServiceSelect = (
    service: Service,
  ) => {
    setSelectedService(service);

    setSelectedProfessional(null);

    setSelectedTime(null);

    setBookingStatus('idle');

    resetBookingAnimation();
  };

  const handleProfessionalSelect = (
    professional: Professional,
  ) => {
    setSelectedProfessional(
      professional,
    );

    setSelectedTime(null);
  };

  const handleAnyProfessional = () => {
    setSelectedProfessional(null);

    setSelectedTime(null);
  };

  const canBook = Boolean(
    selectedService &&
      selectedDate &&
      selectedTime &&
      availableProfessionals.length > 0,
  );

  const goToPreviousMonth = () => {
    const currentMonth =
      startOfDay(new Date());

    const previousMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() - 1,
      1,
    );

    if (previousMonth < currentMonth) {
      return;
    }

    setCalendarMonth(previousMonth);
  };

  const goToNextMonth = () => {
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() + 1,
        1,
      ),
    );
  };

  const goToToday = () => {
    const today = startOfDay(new Date());

    setSelectedDate(today);

    setCalendarMonth(today);

    setSelectedTime(null);
  };

  const handleDateSelect = (
    date: Date,
  ) => {
    if (
      date < startOfDay(new Date())
    ) {
      return;
    }

    setSelectedDate(date);

    setSelectedTime(null);

    if (
      date.getMonth() !==
        calendarMonth.getMonth() ||
      date.getFullYear() !==
        calendarMonth.getFullYear()
    ) {
      setCalendarMonth(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          1,
        ),
      );
    }
  };

  const resetBookingAnimation = () => {
    buttonTravel.setValue(0);

    buttonOpacity.setValue(1);

    buttonScale.setValue(1);

    successOpacity.setValue(0);

    successScale.setValue(0.8);

    successTranslate.setValue(18);
  };

  const handleBooking = () => {
    if (!selectedService) {
      Alert.alert(
        'Escolha um serviço',
        'Selecione primeiro o serviço que deseja realizar.',
      );

      return;
    }

    if (
      availableProfessionals.length === 0
    ) {
      Alert.alert(
        'Profissional indisponível',
        'Não existem profissionais disponíveis para este serviço.',
      );

      return;
    }

    if (!selectedDate) {
      Alert.alert(
        'Escolha uma data',
        'Selecione a data da sua reserva.',
      );

      return;
    }

    if (!selectedTime) {
      Alert.alert(
        'Escolha um horário',
        'Selecione um horário disponível.',
      );

      return;
    }

    if (
      bookingStatus !== 'idle'
    ) {
      return;
    }

    setBookingStatus('sending');

    Animated.parallel([
      Animated.timing(buttonTravel, {
        toValue: 110,
        duration: 500,
        useNativeDriver: true,
      }),

      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),

      Animated.timing(buttonScale, {
        toValue: 0.84,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setBookingStatus('success');

      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),

        Animated.timing(
          successOpacity,
          {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          },
        ),

        Animated.spring(
          successTranslate,
          {
            toValue: 0,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          },
        ),
      ]).start(() => {
        setTimeout(() => {
          const professionalText =
            selectedProfessional?.name ??
            'Qualquer profissional disponível';

          Alert.alert(
            'Reserva enviada',
            `${selectedService.name}\n${formatSelectedDate(
              selectedDate,
            )}\n${selectedTime}\n${professionalText}`,
            [
              {
                text: 'Ver agendamentos',
                onPress: () =>
                  router.push(
                    '/appointments' as any,
                  ),
              },
              {
                text: 'Concluído',
                style: 'cancel',
              },
            ],
          );
        }, 500);
      });
    });
  };

  const resetBooking = () => {
    setBookingStatus('idle');

    resetBookingAnimation();
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          COLORS.background
        }
      />

      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'bottom']}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.content
          }
        >
          <SpaceCarousel
            favorite={favorite}
            onFavorite={() =>
              setFavorite(
                (value) => !value,
              )
            }
          />

          <View style={styles.intro}>
            <Text
              style={styles.introEyebrow}
            >
              EXPERIÊNCIA PERSONALIZADA
            </Text>

            <Text style={styles.introTitle}>
              Reserve o seu momento.
            </Text>

            <Text style={styles.introText}>
              Escolha o serviço primeiro.
              Depois encontre o profissional
              ideal para essa experiência.
            </Text>
          </View>

          {/* 01 — SERVIÇO */}
          <View style={styles.section}>
            <SectionHeader
              number="01"
              title="Escolha o serviço"
              subtitle="O serviço define os profissionais disponíveis."
            />

            <GlassCard>
              <Pressable
                onPress={() =>
                  setServiceModalVisible(
                    true,
                  )
                }
                style={[
                  styles.selectedServiceCard,
                  !selectedService &&
                    styles.selectedServiceCardEmpty,
                ]}
              >
                {selectedService ? (
                  <>
                    <View
                      style={[
                        styles.selectedServiceIcon,
                        {
                          backgroundColor:
                            COLORS.black,
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          selectedService.icon
                        }
                        size={21}
                        color={
                          COLORS.white
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.selectedServiceInfo
                      }
                    >
                      <Text
                        style={
                          styles.selectedServiceEyebrow
                        }
                      >
                        SERVIÇO SELECIONADO
                      </Text>

                      <Text
                        style={
                          styles.selectedServiceName
                        }
                      >
                        {selectedService.name}
                      </Text>

                      <View
                        style={
                          styles.selectedServiceMeta
                        }
                      >
                        <Text
                          style={
                            styles.selectedServiceMetaText
                          }
                        >
                          {
                            selectedService.duration
                          }{' '}
                          min
                        </Text>

                        <View
                          style={styles.metaDot}
                        />

                        <Text
                          style={
                            styles.selectedServiceMetaText
                          }
                        >
                          {formatPrice(
                            selectedService.price,
                          )}
                        </Text>
                      </View>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={21}
                      color={COLORS.soft}
                    />
                  </>
                ) : (
                  <>
                    <View
                      style={
                        styles.emptyServiceIcon
                      }
                    >
                      <Ionicons
                        name="add"
                        size={24}
                        color={
                          COLORS.black
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.selectedServiceInfo
                      }
                    >
                      <Text
                        style={
                          styles.selectedServiceName
                        }
                      >
                        Selecionar serviço
                      </Text>

                      <Text
                        style={
                          styles.selectServiceHint
                        }
                      >
                        Escolha primeiro o que
                        deseja realizar
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={21}
                      color={COLORS.soft}
                    />
                  </>
                )}
              </Pressable>
            </GlassCard>
          </View>

          {/* 02 — PROFISSIONAL */}
          {selectedService ? (
            <View style={styles.section}>
              <SectionHeader
                number="02"
                title="Escolha o profissional"
                subtitle={
                  availableProfessionals.length >
                  0
                    ? `Profissionais disponíveis para ${selectedService.name}.`
                    : 'Não existem profissionais disponíveis para este serviço.'
                }
              />

              <GlassCard
                style={
                  styles.professionalGlassCard
                }
              >
                {availableProfessionals.length >
                  0 && (
                  <Pressable
                    onPress={
                      handleAnyProfessional
                    }
                    style={[
                      styles.anyProfessionalCard,
                      selectedProfessional ===
                        null &&
                        styles.anyProfessionalCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.anyProfessionalIcon,
                        selectedProfessional ===
                          null &&
                          styles.anyProfessionalIconSelected,
                      ]}
                    >
                      <Ionicons
                        name="shuffle-outline"
                        size={20}
                        color={
                          selectedProfessional ===
                          null
                            ? COLORS.white
                            : COLORS.black
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.anyProfessionalInfo
                      }
                    >
                      <Text
                        style={
                          styles.anyProfessionalTitle
                        }
                      >
                        Qualquer profissional
                      </Text>

                      <Text
                        style={
                          styles.anyProfessionalSubtitle
                        }
                      >
                        O espaço escolhe o
                        profissional disponível
                      </Text>
                    </View>

                    {selectedProfessional ===
                    null ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={
                          COLORS.gold
                        }
                      />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={
                          COLORS.soft
                        }
                      />
                    )}
                  </Pressable>
                )}

                {availableProfessionals.length >
                  0 && (
                  <View
                    style={
                      styles.professionalDivider
                    }
                  />
                )}

                {availableProfessionals.map(
                  (professional) => {
                    const selected =
                      selectedProfessional?.id ===
                      professional.id;

                    return (
                      <Pressable
                        key={
                          professional.id
                        }
                        onPress={() =>
                          handleProfessionalSelect(
                            professional,
                          )
                        }
                        style={[
                          styles.professionalCard,
                          selected &&
                            styles.professionalCardSelected,
                        ]}
                      >
                        <View
                          style={
                            styles.professionalImageWrapper
                          }
                        >
                          <Image
                            source={{
                              uri: professional.image,
                            }}
                            style={
                              styles.professionalImage
                            }
                          />

                          {selected ? (
                            <View
                              style={
                                styles.professionalSelectedBadge
                              }
                            >
                              <Ionicons
                                name="checkmark"
                                size={11}
                                color={
                                  COLORS.white
                                }
                              />
                            </View>
                          ) : null}
                        </View>

                        <View
                          style={
                            styles.professionalInfo
                          }
                        >
                          <Text
                            style={
                              styles.professionalName
                            }
                          >
                            {
                              professional.name
                            }
                          </Text>

                          <Text
                            style={
                              styles.professionalRole
                            }
                          >
                            {
                              professional.role
                            }
                          </Text>

                          <Text
                            style={
                              styles.professionalAvailableText
                            }
                          >
                            Especialista neste
                            serviço
                          </Text>
                        </View>

                        {selected ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color={
                              COLORS.gold
                            }
                          />
                        ) : (
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={
                              COLORS.soft
                            }
                          />
                        )}
                      </Pressable>
                    );
                  },
                )}

                {availableProfessionals.length ===
                0 ? (
                  <View
                    style={
                      styles.noProfessionals
                    }
                  >
                    <View
                      style={
                        styles.noProfessionalsIcon
                      }
                    >
                      <Ionicons
                        name="people-outline"
                        size={28}
                        color={
                          COLORS.soft
                        }
                      />
                    </View>

                    <Text
                      style={
                        styles.noProfessionalsTitle
                      }
                    >
                      Nenhum profissional
                      disponível
                    </Text>

                    <Text
                      style={
                        styles.noProfessionalsText
                      }
                    >
                      Este serviço não possui
                      profissionais disponíveis
                      neste espaço.
                    </Text>

                    <Pressable
                      onPress={() =>
                        setServiceModalVisible(
                          true,
                        )
                      }
                      style={
                        styles.changeServiceButton
                      }
                    >
                      <Text
                        style={
                          styles.changeServiceButtonText
                        }
                      >
                        Escolher outro serviço
                      </Text>

                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={
                          COLORS.black
                        }
                      />
                    </Pressable>
                  </View>
                ) : null}
              </GlassCard>
            </View>
          ) : null}

          {/* 03 — CALENDÁRIO */}
          {selectedService ? (
            <View style={styles.section}>
              <SectionHeader
                number="03"
                title="Escolha a data"
                subtitle="Selecione o dia da sua experiência."
              />

              <GlassCard>
                <View
                  style={styles.calendarHeader}
                >
                  <Pressable
                    onPress={
                      goToPreviousMonth
                    }
                    style={
                      styles.calendarArrow
                    }
                  >
                    <Ionicons
                      name="chevron-back"
                      size={19}
                      color={
                        COLORS.black
                      }
                    />
                  </Pressable>

                  <Pressable
                    onPress={goToToday}
                  >
                    <Text
                      style={
                        styles.calendarMonth
                      }
                    >
                      {formatMonth(
                        calendarMonth,
                      )}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={
                      goToNextMonth
                    }
                    style={
                      styles.calendarArrow
                    }
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={19}
                      color={
                        COLORS.black
                      }
                    />
                  </Pressable>
                </View>

                <View
                  style={styles.weekHeader}
                >
                  {weekdays.map((day) => (
                    <Text
                      key={day}
                      style={
                        styles.weekDay
                      }
                    >
                      {day}
                    </Text>
                  ))}
                </View>

                <View
                  style={styles.calendarGrid}
                >
                  {calendarDays.map(
                    (item, index) => {
                      const disabled =
                        item.date <
                        startOfDay(
                          new Date(),
                        );

                      const selected =
                        isSameDay(
                          item.date,
                          selectedDate,
                        );

                      return (
                        <Pressable
                          key={`${item.date.toISOString()}-${index}`}
                          disabled={
                            disabled
                          }
                          onPress={() =>
                            handleDateSelect(
                              item.date,
                            )
                          }
                          style={[
                            styles.calendarDay,
                            selected &&
                              styles.calendarDaySelected,
                            disabled &&
                              styles.calendarDayDisabled,
                          ]}
                        >
                          <Text
                            style={[
                              styles.calendarDayText,
                              !item.isCurrentMonth &&
                                styles.calendarDayOutside,
                              selected &&
                                styles.calendarDayTextSelected,
                              disabled &&
                                styles.calendarDayTextDisabled,
                            ]}
                          >
                            {item.day}
                          </Text>

                          {item.isToday &&
                          !selected ? (
                            <View
                              style={
                                styles.todayIndicator
                              }
                            />
                          ) : null}
                        </Pressable>
                      );
                    },
                  )}
                </View>

                <View
                  style={
                    styles.selectedDateFooter
                  }
                >
                  <Ionicons
                    name="calendar-outline"
                    size={17}
                    color={
                      COLORS.gold
                    }
                  />

                  <Text
                    style={
                      styles.selectedDateFooterText
                    }
                  >
                    {formatSelectedDate(
                      selectedDate,
                    )}
                  </Text>
                </View>
              </GlassCard>
            </View>
          ) : null}

          {/* 04 — HORÁRIO */}
          {selectedService ? (
            <View style={styles.section}>
              <SectionHeader
                number="04"
                title="Escolha o horário"
                subtitle="Selecione o melhor horário para si."
              />

              <GlassCard>
                <View
                  style={styles.timeGrid}
                >
                  {times.map((time) => {
                    const selected =
                      selectedTime ===
                      time;

                    return (
                      <Pressable
                        key={time}
                        onPress={() =>
                          setSelectedTime(
                            time,
                          )
                        }
                        style={[
                          styles.timeButton,
                          selected &&
                            styles.timeButtonSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.timeButtonText,
                            selected &&
                              styles.timeButtonTextSelected,
                          ]}
                        >
                          {time}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </GlassCard>
            </View>
          ) : null}

          {/* 05 — RESUMO */}
          {selectedService ? (
            <View style={styles.section}>
              <SectionHeader
                number="05"
                title="Resumo"
                subtitle="Confirme os detalhes antes de continuar."
              />

              <GlassCard
                style={
                  styles.summaryCard
                }
              >
                <SummaryRow
                  label="Serviço"
                  value={
                    selectedService.name
                  }
                />

                <SummaryRow
                  label="Profissional"
                  value={
                    selectedProfessional?.name ??
                    'Qualquer profissional disponível'
                  }
                />

                <SummaryRow
                  label="Data"
                  value={new Intl.DateTimeFormat(
                    'pt-AO',
                    {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    },
                  ).format(selectedDate)}
                />

                <SummaryRow
                  label="Horário"
                  value={
                    selectedTime ??
                    'Selecionar horário'
                  }
                  muted={
                    !selectedTime
                  }
                />

                <View
                  style={
                    styles.summaryDivider
                  }
                />

                <View
                  style={styles.totalRow}
                >
                  <View>
                    <Text
                      style={
                        styles.totalLabel
                      }
                    >
                      TOTAL
                    </Text>

                    <Text
                      style={
                        styles.totalSubtext
                      }
                    >
                      {
                        selectedService.duration
                      }{' '}
                      minutos
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.totalValue
                    }
                  >
                    {formatPrice(
                      selectedService.price,
                    )}
                  </Text>
                </View>
              </GlassCard>
            </View>
          ) : null}

          {/* CTA */}
          {selectedService ? (
            <View
              style={styles.bookingArea}
            >
              <View
                style={
                  styles.bookingButtonWrapper
                }
              >
                <Animated.View
                  pointerEvents={
                    bookingStatus ===
                    'idle'
                      ? 'auto'
                      : 'none'
                  }
                  style={[
                    styles.bookingButtonAnimated,
                    {
                      transform: [
                        {
                          translateX:
                            buttonTravel,
                        },
                        {
                          scale:
                            buttonScale,
                        },
                      ],
                      opacity:
                        buttonOpacity,
                    },
                  ]}
                >
                  <Pressable
                    disabled={!canBook}
                    onPress={
                      handleBooking
                    }
                    style={[
                      styles.bookingButton,
                      !canBook &&
                        styles.bookingButtonDisabled,
                    ]}
                  >
                    <View
                      style={
                        styles.confirmContent
                      }
                    >
                      <Text
                        style={[
                          styles.bookingButtonTitle,
                          !canBook &&
                            styles.bookingButtonTitleDisabled,
                        ]}
                      >
                        Completar a compra
                      </Text>

                      <Text
                        style={[
                          styles.bookingButtonSubtitle,
                          !canBook &&
                            styles.bookingButtonSubtitleDisabled,
                        ]}
                      >
                        {canBook
                          ? 'Confirmar reserva'
                          : 'Complete os dados acima'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.bookingArrow,
                        !canBook &&
                          styles.bookingArrowDisabled,
                      ]}
                    >
                      <Ionicons
                        name="arrow-forward"
                        size={19}
                        color={
                          canBook
                            ? COLORS.white
                            : COLORS.soft
                        }
                      />
                    </View>
                  </Pressable>
                </Animated.View>

                {bookingStatus ===
                'success' ? (
                  <Animated.View
                    style={[
                      styles.successButton,
                      {
                        opacity:
                          successOpacity,
                        transform: [
                          {
                            scale:
                              successScale,
                          },
                          {
                            translateY:
                              successTranslate,
                          },
                        ],
                      },
                    ]}
                  >
                    <View
                      style={
                        styles.successIcon
                      }
                    >
                      <Ionicons
                        name="checkmark"
                        size={19}
                        color={
                          COLORS.white
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.successContent
                      }
                    >
                      <Text
                        style={
                          styles.successTitle
                        }
                      >
                        Reserva enviada
                      </Text>

                      <Text
                        style={
                          styles.successSubtitle
                        }
                      >
                        A sua experiência está a
                        ser preparada
                      </Text>
                    </View>
                  </Animated.View>
                ) : null}
              </View>

              {bookingStatus ===
              'success' ? (
                <Pressable
                  onPress={
                    resetBooking
                  }
                  style={
                    styles.resetBooking
                  }
                >
                  <Text
                    style={
                      styles.resetBookingText
                    }
                  >
                    Fazer outra reserva
                  </Text>
                </Pressable>
              ) : null}

              <Text
                style={
                  styles.bookingTerms
                }
              >
                Ao continuar, aceita os termos
                de reserva e a política de
                cancelamento do espaço.
              </Text>
            </View>
          ) : null}

          <View
            style={styles.bottomSpace}
          />
        </ScrollView>
      </SafeAreaView>

      <ServiceSelectorModal
        visible={
          serviceModalVisible
        }
        selectedService={
          selectedService
        }
        onSelect={
          handleServiceSelect
        }
        onClose={() =>
          setServiceModalVisible(
            false,
          )
        }
      />
    </View>
  );
};

export default SpaceScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  content: {
    paddingBottom: 36,
  },

  carouselWrapper: {
    width: SCREEN_WIDTH,
    height: 410,
    position: 'relative',
  },

  carouselImageWrapper: {
    width: SCREEN_WIDTH,
    height: 410,
    position: 'relative',
    overflow: 'hidden',
  },

  carouselImage: {
    width: '100%',
    height: '100%',
  },

  premiumBadge: {
    position: 'absolute',
    top: 24,
    left: 22,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor:
      'rgba(17,17,17,0.62)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  premiumBadgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.20)',
  },

  carouselBottom: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 38,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'flex-end',
  },

  spaceLocation: {
    color:
      'rgba(255,255,255,0.76)',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 5,
  },

  spaceName: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 1.3,
  },

  ratingContainer: {
    height: 35,
    paddingHorizontal: 11,
    borderRadius: 18,
    backgroundColor:
      'rgba(17,17,17,0.55)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  ratingText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },

  carouselIndicators: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 16,
    height: 3,
    flexDirection: 'row',
    gap: 5,
  },

  carouselIndicator: {
    flex: 1,
    height: 2,
    borderRadius: 2,
    backgroundColor:
      'rgba(255,255,255,0.30)',
  },

  carouselIndicatorActive: {
    backgroundColor:
      COLORS.white,
  },

  intro: {
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 10,
  },

  introEyebrow: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },

  introTitle: {
    color: COLORS.black,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.9,
  },

  introText: {
    marginTop: 10,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 350,
  },

  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 13,
  },

  sectionNumber: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor:
      COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionNumberText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
  },

  sectionHeaderContent: {
    flex: 1,
  },

  sectionTitle: {
    color: COLORS.black,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
  },

  glassCard: {
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.95)',
    backgroundColor:
      COLORS.glass,
    position: 'relative',
  },

  glassTopLine: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor:
      'rgba(255,255,255,0.95)',
    zIndex: 5,
  },

  selectedServiceCard: {
    minHeight: 92,
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedServiceCardEmpty: {
    minHeight: 82,
  },

  selectedServiceIcon: {
    width: 49,
    height: 49,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  emptyServiceIcon: {
    width: 49,
    height: 49,
    borderRadius: 17,
    backgroundColor:
      'rgba(17,17,17,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  selectedServiceInfo: {
    flex: 1,
    minWidth: 0,
  },

  selectedServiceEyebrow: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.gold,
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  selectedServiceName: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '800',
  },

  selectServiceHint: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
  },

  selectedServiceMeta: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedServiceMetaText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '500',
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor:
      COLORS.soft,
    marginHorizontal: 7,
  },

  professionalGlassCard: {
    paddingVertical: 6,
  },

  anyProfessionalCard: {
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  anyProfessionalCardSelected: {
    backgroundColor:
      'rgba(176,141,87,0.07)',
  },

  anyProfessionalIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor:
      'rgba(17,17,17,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  anyProfessionalIconSelected: {
    backgroundColor:
      COLORS.black,
  },

  anyProfessionalInfo: {
    flex: 1,
    minWidth: 0,
  },

  anyProfessionalTitle: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '800',
  },

  anyProfessionalSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  professionalDivider: {
    height: 1,
    backgroundColor:
      COLORS.border,
    marginHorizontal: 14,
  },

  professionalCard: {
    minHeight: 91,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  professionalCardSelected: {
    backgroundColor:
      'rgba(176,141,87,0.07)',
  },

  professionalImageWrapper: {
    width: 58,
    height: 58,
    borderRadius: 19,
    position: 'relative',
    marginRight: 13,
  },

  professionalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
  },

  professionalSelectedBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor:
      COLORS.gold,
    borderWidth: 2,
    borderColor:
      COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  professionalInfo: {
    flex: 1,
    minWidth: 0,
  },

  professionalName: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '800',
  },

  professionalRole: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },

  professionalAvailableText: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 5,
  },

  noProfessionals: {
    paddingHorizontal: 24,
    paddingVertical: 34,
    alignItems: 'center',
  },

  noProfessionalsIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor:
      'rgba(17,17,17,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  noProfessionalsTitle: {
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },

  noProfessionalsText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    maxWidth: 270,
    marginTop: 6,
  },

  changeServiceButton: {
    marginTop: 17,
    height: 40,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor:
      COLORS.white,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  changeServiceButtonText: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '700',
  },

  /* MODAL */

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackdrop: {
    ...ABSOLUTE_FILL,
    backgroundColor:
      'rgba(0,0,0,0.48)',
  },

  modalSheet: {
    width: '100%',
    height: '91%',
    overflow: 'hidden',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor:
      COLORS.background,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor:
      'rgba(255,255,255,0.90)',
  },

  modalHandle: {
    width: 42,
    height: 4,
    marginTop: 10,
    borderRadius: 3,
    alignSelf: 'center',
    backgroundColor:
      'rgba(17,17,17,0.16)',
  },

  modalHeader: {
    minHeight: 75,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  modalHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  modalEyebrow: {
    color: COLORS.gold,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 5,
  },

  modalTitle: {
    color: COLORS.black,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  modalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(17,17,17,0.06)',
  },

  modalClosePressed: {
    opacity: 0.65,
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  searchContainer: {
    height: 50,
    marginHorizontal: 20,
    borderRadius: 17,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.90)',
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    marginLeft: 9,
    paddingVertical: 0,
    color: COLORS.black,
    fontSize: 12,
    fontWeight: '600',
  },

  searchClear: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchClearCircle: {
    width: 21,
    height: 21,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(17,17,17,0.07)',
  },

  categoryArea: {
    height: 57,
    flexGrow: 0,
    flexShrink: 0,
  },

  categoryScroll: {
    paddingHorizontal: 20,
    paddingTop: 11,
    paddingBottom: 10,
    alignItems: 'center',
    gap: 7,
  },

  categoryChip: {
    height: 35,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(255,255,255,0.74)',
    borderWidth: 1,
    borderColor:
      COLORS.border,
  },

  categoryChipSelected: {
    backgroundColor:
      COLORS.black,
    borderColor:
      COLORS.black,
  },

  categoryChipPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  categoryChipText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '700',
  },

  categoryChipTextSelected: {
    color: COLORS.white,
  },

  modalResultsHeader: {
    height: 58,
    paddingHorizontal: 21,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    borderTopWidth: 1,
    borderTopColor:
      'rgba(17,17,17,0.045)',
    borderBottomWidth: 1,
    borderBottomColor:
      'rgba(17,17,17,0.045)',
  },

  modalResultsTitle: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '800',
  },

  modalResultsCount: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: '500',
  },

  searchActiveBadge: {
    height: 27,
    paddingHorizontal: 9,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor:
      'rgba(176,141,87,0.09)',
  },

  searchActiveBadgeText: {
    color: COLORS.gold,
    fontSize: 8,
    fontWeight: '800',
  },

  modalList: {
    flex: 1,
    minHeight: 0,
  },

  modalListContent: {
    paddingTop: 8,
    paddingBottom: 30,
  },

  modalEmptyListContent: {
    flexGrow: 1,
    justifyContent:
      'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  serviceRow: {
    minHeight: 76,
    marginHorizontal: 14,
    marginVertical: 4,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  serviceRowPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.992,
      },
    ],
  },

  serviceRowSelected: {
    backgroundColor:
      'rgba(176,141,87,0.09)',
  },

  serviceIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    marginRight: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(17,17,17,0.055)',
  },

  serviceIconSelected: {
    backgroundColor:
      COLORS.black,
  },

  serviceInfo: {
    flex: 1,
    minWidth: 0,
  },

  serviceName: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '800',
  },

  serviceMeta: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  serviceCategory: {
    color: COLORS.gold,
    fontSize: 9,
    fontWeight: '700',
  },

  serviceDuration: {
    color: COLORS.muted,
    fontSize: 9,
  },

  servicePriceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 7,
  },

  servicePrice: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '800',
  },

  emptyServices: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyServicesIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(17,17,17,0.055)',
  },

  emptyServicesTitle: {
    marginTop: 13,
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyServicesText: {
    maxWidth: 270,
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },

  emptyServicesButton: {
    marginTop: 15,
    height: 38,
    paddingHorizontal: 15,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.black,
  },

  emptyServicesButtonText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },

  /* CALENDÁRIO */

  calendarHeader: {
    height: 58,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  calendarArrow: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor:
      'rgba(17,17,17,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendarMonth: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'capitalize',
  },

  weekHeader: {
    flexDirection: 'row',
    paddingHorizontal: 9,
    paddingBottom: 5,
  },

  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.soft,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 9,
  },

  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    position: 'relative',
  },

  calendarDaySelected: {
    backgroundColor:
      COLORS.black,
  },

  calendarDayDisabled: {
    opacity: 0.3,
  },

  calendarDayText: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: '700',
  },

  calendarDayOutside: {
    color: COLORS.soft,
  },

  calendarDayTextSelected: {
    color: COLORS.white,
  },

  calendarDayTextDisabled: {
    color: COLORS.soft,
  },

  todayIndicator: {
    position: 'absolute',
    bottom: 7,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor:
      COLORS.gold,
  },

  selectedDateFooter: {
    marginHorizontal: 15,
    marginTop: 12,
    marginBottom: 15,
    paddingHorizontal: 13,
    height: 43,
    borderRadius: 15,
    backgroundColor:
      'rgba(176,141,87,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  selectedDateFooterText: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '700',
    textTransform:
      'capitalize',
  },

  /* HORÁRIOS */

  timeGrid: {
    padding: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  timeButton: {
    width: '23.2%',
    height: 44,
    borderRadius: 14,
    backgroundColor:
      'rgba(17,17,17,0.045)',
    borderWidth: 1,
    borderColor:
      'rgba(17,17,17,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  timeButtonSelected: {
    backgroundColor:
      COLORS.black,
    borderColor:
      COLORS.black,
  },

  timeButtonText: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '700',
  },

  timeButtonTextSelected: {
    color: COLORS.white,
  },

  /* RESUMO */

  summaryCard: {
    paddingHorizontal: 18,
    paddingVertical: 18,
  },

  summaryRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  summaryLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '500',
  },

  summaryLabelMuted: {
    color: COLORS.soft,
  },

  summaryValue: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '800',
    maxWidth: '60%',
    textAlign: 'right',
  },

  summaryValueMuted: {
    color: COLORS.soft,
    fontWeight: '500',
  },

  summaryDivider: {
    height: 1,
    backgroundColor:
      COLORS.border,
    marginVertical: 10,
  },

  totalRow: {
    minHeight: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  totalLabel: {
    color: COLORS.gold,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  totalSubtext: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  totalValue: {
    color: COLORS.black,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  /* BOOKING */

  bookingArea: {
    paddingHorizontal: 20,
    marginTop: 30,
    paddingBottom: 55,
    alignItems: 'center',
  },

  bookingButtonWrapper: {
    width: '100%',
    minHeight: 70,
    position: 'relative',
    overflow: 'hidden',
  },

  bookingButtonAnimated: {
    width: '100%',
    position: 'absolute',
    left: 0,
    right: 0,
  },

  bookingButton: {
    minHeight: 70,
    borderRadius: 23,
    paddingLeft: 24,
    paddingRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    backgroundColor:
      COLORS.black,
  },

  bookingButtonDisabled: {
    backgroundColor:
      'rgba(17,17,17,0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(17,17,17,0.07)',
  },

  confirmContent: {
    flex: 1,
    paddingVertical: 5,
    paddingRight: 12,
  },

  bookingButtonTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },

  bookingButtonTitleDisabled: {
    color: COLORS.muted,
  },

  bookingButtonSubtitle: {
    color:
      'rgba(255,255,255,0.54)',
    fontSize: 10,
    marginTop: 4,
  },

  bookingButtonSubtitleDisabled: {
    color: COLORS.soft,
  },

  bookingArrow: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor:
      COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bookingArrowDisabled: {
    backgroundColor:
      'rgba(17,17,17,0.06)',
  },

  successButton: {
    ...ABSOLUTE_FILL,
    minHeight: 70,
    borderRadius: 23,
    paddingHorizontal: 15,
    backgroundColor:
      COLORS.black,
    flexDirection: 'row',
    alignItems: 'center',
  },

  successIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor:
      COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  successContent: {
    flex: 1,
  },

  successTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },

  successSubtitle: {
    color:
      'rgba(255,255,255,0.55)',
    fontSize: 10,
    marginTop: 4,
  },

  resetBooking: {
    marginTop: 14,
    paddingVertical: 8,
  },

  resetBookingText: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine:
      'underline',
  },

  bookingTerms: {
    color: COLORS.soft,
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
    maxWidth: 330,
    marginTop: 14,
  },

  bottomSpace: {
    height: 80,
  },
});