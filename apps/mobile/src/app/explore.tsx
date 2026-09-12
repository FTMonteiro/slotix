import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

type IconName = keyof typeof Ionicons.glyphMap;

type Category = {
  name: string;
  icon: IconName;
};

type Space = {
  id: string;
  name: string;
  category: string;
  province: string;
  location: string;
  rating: number;
  reviews: number;
  distance: number;
  price: number;
  service: string;
  image: string;
  premium?: boolean;
  featured?: boolean;
  availableToday?: boolean;
  popular?: boolean;
};

type Filters = {
  category: string;
  distance: number | null;
  maxPrice: number | null;
  minRating: number | null;
  availableToday: boolean;
  premiumOnly: boolean;
};

type SortMode =
  | 'recommended'
  | 'rating'
  | 'popular'
  | 'distance';

const COLORS = {
  background: '#F5F5F3',
  surface: '#FFFFFF',
  black: '#0A0A0B',
  text: '#111214',
  muted: '#74777D',
  lightMuted: '#A4A7AC',
  border: '#E8E9EB',
  accent: '#1769E0',
  accentSoft: '#EAF2FF',
  white: '#FFFFFF',
  success: '#159447',
  danger: '#FF3158',
};

const PROVINCES = [
  'Bengo',
  'Benguela',
  'Bié',
  'Cabinda',
  'Cuando',
  'Cuanza Norte',
  'Cuanza Sul',
  'Cunene',
  'Cubango',
  'Huambo',
  'Huíla',
  'Icolo e Bengo',
  'Luanda',
  'Lunda Norte',
  'Lunda Sul',
  'Malanje',
  'Moxico',
  'Moxico Leste',
  'Namibe',
  'Uíge',
  'Zaire',
];

const CATEGORIES: Category[] = [
  {
    name: 'Todos',
    icon: 'apps-outline',
  },
  {
    name: 'Barbearia',
    icon: 'cut-outline',
  },
  {
    name: 'Salão',
    icon: 'sparkles-outline',
  },
  {
    name: 'Nails',
    icon: 'color-palette-outline',
  },
  {
    name: 'SPA',
    icon: 'water-outline',
  },
  {
    name: 'Estética',
    icon: 'flower-outline',
  },
];

const SPACES: Space[] = [
  {
    id: '1',
    name: 'Barbearia Executive',
    category: 'Barbearia',
    province: 'Luanda',
    location: 'Alvalade',
    rating: 4.9,
    reviews: 184,
    distance: 1.2,
    price: 7500,
    service: 'Corte + Barba',
    image:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=85',
    premium: true,
    featured: true,
    availableToday: true,
    popular: true,
  },
  {
    id: '2',
    name: 'Lumina Nails & Spa',
    category: 'Nails',
    province: 'Luanda',
    location: 'Talatona',
    rating: 4.8,
    reviews: 126,
    distance: 3.4,
    price: 10000,
    service: 'Manicure Premium',
    image:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=85',
    premium: true,
    featured: true,
    availableToday: true,
    popular: true,
  },
  {
    id: '3',
    name: 'The Royal Spa',
    category: 'SPA',
    province: 'Luanda',
    location: 'Ilha de Luanda',
    rating: 4.9,
    reviews: 98,
    distance: 4.1,
    price: 15000,
    service: 'Royal Relax',
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85',
    premium: true,
    featured: true,
    availableToday: true,
    popular: false,
  },
  {
    id: '4',
    name: "Gentleman's Club",
    category: 'Barbearia',
    province: 'Luanda',
    location: 'Alvalade',
    rating: 4.7,
    reviews: 211,
    distance: 1.8,
    price: 5000,
    service: 'Corte Executivo',
    image:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=85',
    premium: false,
    featured: false,
    availableToday: true,
    popular: true,
  },
  {
    id: '5',
    name: 'Lumina Beauty Studio',
    category: 'Salão',
    province: 'Luanda',
    location: 'Miramar',
    rating: 4.8,
    reviews: 157,
    distance: 2.9,
    price: 7500,
    service: 'Beauty Experience',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85',
    premium: true,
    featured: false,
    availableToday: true,
    popular: true,
  },
  {
    id: '6',
    name: 'Glow Skin Studio',
    category: 'Estética',
    province: 'Luanda',
    location: 'Talatona',
    rating: 4.9,
    reviews: 87,
    distance: 5.2,
    price: 10000,
    service: 'Skin Treatment',
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85',
    premium: true,
    featured: false,
    availableToday: false,
    popular: false,
  },
];

const PRICE_OPTIONS = [
  {
    label: 'Até 5.000 Kz',
    value: 5000,
  },
  {
    label: 'Até 7.500 Kz',
    value: 7500,
  },
  {
    label: 'Até 10.000 Kz',
    value: 10000,
  },
  {
    label: 'Qualquer preço',
    value: null,
  },
];

const DISTANCE_OPTIONS = [
  {
    label: 'Até 1 km',
    value: 1,
  },
  {
    label: 'Até 3 km',
    value: 3,
  },
  {
    label: 'Até 5 km',
    value: 5,
  },
  {
    label: 'Até 10 km',
    value: 10,
  },
  {
    label: 'Qualquer distância',
    value: null,
  },
];

const formatPrice = (price: number) =>
  `${price.toLocaleString('pt-AO')} Kz`;

const AbsoluteFill = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <View style={styles.absoluteFill}>
    {children}
  </View>
);

const SectionHeader = memo(
  ({
    title,
    subtitle,
    action,
    onPress,
  }: {
    title: string;
    subtitle?: string;
    action?: string;
    onPress?: () => void;
  }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.sectionSubtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {action ? (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.sectionAction,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.sectionActionText}>
            {action}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={15}
            color={COLORS.accent}
          />
        </Pressable>
      ) : null}
    </View>
  ),
);

const SpaceCard = memo(
  ({
    space,
    favorite,
    onFavorite,
    onPress,
  }: {
    space: Space;
    favorite: boolean;
    onFavorite: () => void;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.spaceCard,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.spaceImageWrapper}>
        <Image
          source={{ uri: space.image }}
          style={styles.spaceImage}
          contentFit="cover"
          transition={250}
        />

        <AbsoluteFill>
          <LinearGradient
            colors={[
              'rgba(0,0,0,0.02)',
              'rgba(0,0,0,0.08)',
              'rgba(0,0,0,0.62)',
            ]}
            style={styles.gradient}
          />
        </AbsoluteFill>

        {space.premium ? (
          <View style={styles.premiumBadge}>
            <Ionicons
              name="diamond"
              size={11}
              color={COLORS.white}
            />

            <Text style={styles.premiumBadgeText}>
              PREMIUM
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={onFavorite}
          hitSlop={10}
          style={styles.favoriteButton}
        >
          <BlurView
            intensity={38}
            tint="dark"
            style={styles.favoriteBlur}
          >
            <Ionicons
              name={
                favorite
                  ? 'heart'
                  : 'heart-outline'
              }
              size={19}
              color={
                favorite
                  ? COLORS.danger
                  : COLORS.white
              }
            />
          </BlurView>
        </Pressable>

        <View style={styles.imageBottomInfo}>
          <View style={styles.ratingPill}>
            <Ionicons
              name="star"
              size={11}
              color={COLORS.white}
            />

            <Text style={styles.ratingText}>
              {space.rating}
            </Text>
          </View>

          <Text style={styles.cardService}>
            {space.service}
          </Text>
        </View>
      </View>

      <View style={styles.spaceCardContent}>
        <View style={styles.spaceCardTitleRow}>
          <Text
            style={styles.spaceCardName}
            numberOfLines={1}
          >
            {space.name}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={16}
            color={COLORS.lightMuted}
          />
        </View>

        <View style={styles.spaceMetaRow}>
          <View style={styles.metaItem}>
            <Ionicons
              name="location-outline"
              size={13}
              color={COLORS.muted}
            />

            <Text style={styles.metaText}>
              {space.location}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons
              name="navigate-outline"
              size={13}
              color={COLORS.muted}
            />

            <Text style={styles.metaText}>
              {space.distance} km
            </Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            A partir de
          </Text>

          <Text style={styles.priceValue}>
            {formatPrice(space.price)}
          </Text>
        </View>
      </View>
    </Pressable>
  ),
);

const FeaturedCard = memo(
  ({
    space,
    onPress,
  }: {
    space: Space;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.featuredCard,
        pressed && styles.cardPressed,
      ]}
    >
      <Image
        source={{ uri: space.image }}
        style={styles.featuredImage}
        contentFit="cover"
        transition={300}
      />

      <AbsoluteFill>
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.02)',
            'rgba(0,0,0,0.15)',
            'rgba(0,0,0,0.88)',
          ]}
          style={styles.gradient}
        />
      </AbsoluteFill>

      <View style={styles.featuredTop}>
        <View style={styles.featuredLabel}>
          <Ionicons
            name="sparkles-outline"
            size={12}
            color={COLORS.white}
          />

          <Text style={styles.featuredLabelText}>
            DESTAQUE
          </Text>
        </View>

        <View style={styles.featuredRating}>
          <Ionicons
            name="star"
            size={11}
            color={COLORS.white}
          />

          <Text style={styles.featuredRatingText}>
            {space.rating}
          </Text>
        </View>
      </View>

      <View style={styles.featuredBottom}>
        <Text style={styles.featuredName}>
          {space.name}
        </Text>

        <View style={styles.featuredMeta}>
          <Ionicons
            name="location-outline"
            size={13}
            color="rgba(255,255,255,0.78)"
          />

          <Text style={styles.featuredLocation}>
            {space.location}
          </Text>
        </View>

        <View style={styles.featuredAction}>
          <Text style={styles.featuredActionText}>
            Explorar espaço
          </Text>

          <View style={styles.featuredArrow}>
            <Ionicons
              name="arrow-forward"
              size={15}
              color={COLORS.black}
            />
          </View>
        </View>
      </View>
    </Pressable>
  ),
);

export default function ExploreScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [selectedProvince, setSelectedProvince] =
    useState('Luanda');

  const [provinceVisible, setProvinceVisible] =
    useState(false);

  const [provinceSearch, setProvinceSearch] =
    useState('');

  const [filters, setFilters] =
    useState<Filters>({
      category: 'Todos',
      distance: null,
      maxPrice: null,
      minRating: null,
      availableToday: false,
      premiumOnly: false,
    });

  const [draftFilters, setDraftFilters] =
    useState<Filters>(filters);

  const [sortMode, setSortMode] =
    useState<SortMode>('recommended');

  const [search, setSearch] = useState('');

  const [favorites, setFavorites] =
    useState<string[]>([]);

  const [filterVisible, setFilterVisible] =
    useState(false);

  const [heroIndex, setHeroIndex] =
    useState(0);

  const filterY = useRef(
    new Animated.Value(700),
  ).current;

  const filterBackdrop = useRef(
    new Animated.Value(0),
  ).current;

  const provinceY = useRef(
    new Animated.Value(700),
  ).current;

  const provinceBackdrop = useRef(
    new Animated.Value(0),
  ).current;

  const provinceSpaces = useMemo(
    () =>
      SPACES.filter(
        (space) =>
          space.province ===
          selectedProvince,
      ),
    [selectedProvince],
  );

  const filteredProvinces = useMemo(() => {
    const value = provinceSearch
      .trim()
      .toLowerCase();

    if (!value) {
      return PROVINCES;
    }

    return PROVINCES.filter((province) =>
      province
        .toLowerCase()
        .includes(value),
    );
  }, [provinceSearch]);

  const filteredSpaces = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    let result = provinceSpaces.filter(
      (space) => {
        const matchesCategory =
          filters.category === 'Todos' ||
          space.category ===
            filters.category;

        const matchesDistance =
          filters.distance === null ||
          space.distance <=
            filters.distance;

        const matchesPrice =
          filters.maxPrice === null ||
          space.price <=
            filters.maxPrice;

        const matchesRating =
          filters.minRating === null ||
          space.rating >=
            filters.minRating;

        const matchesToday =
          !filters.availableToday ||
          space.availableToday;

        const matchesPremium =
          !filters.premiumOnly ||
          space.premium;

        const matchesSearch =
          !searchValue ||
          space.name
            .toLowerCase()
            .includes(searchValue) ||
          space.category
            .toLowerCase()
            .includes(searchValue) ||
          space.location
            .toLowerCase()
            .includes(searchValue) ||
          space.service
            .toLowerCase()
            .includes(searchValue);

        return (
          matchesCategory &&
          matchesDistance &&
          matchesPrice &&
          matchesRating &&
          matchesToday &&
          matchesPremium &&
          matchesSearch
        );
      },
    );

    result = [...result];

    if (sortMode === 'rating') {
      result.sort(
        (a, b) =>
          b.rating - a.rating,
      );
    }

    if (sortMode === 'popular') {
      result.sort(
        (a, b) =>
          Number(b.popular) -
          Number(a.popular),
      );
    }

    if (sortMode === 'distance') {
      result.sort(
        (a, b) =>
          a.distance -
          b.distance,
      );
    }

    if (sortMode === 'recommended') {
      result.sort((a, b) => {
        const premiumDifference =
          Number(b.premium) -
          Number(a.premium);

        if (premiumDifference !== 0) {
          return premiumDifference;
        }

        const ratingDifference =
          b.rating - a.rating;

        if (ratingDifference !== 0) {
          return ratingDifference;
        }

        return b.reviews - a.reviews;
      });
    }

    return result;
  }, [
    provinceSpaces,
    filters,
    search,
    sortMode,
  ]);

  const featuredSpaces = useMemo(
    () =>
      provinceSpaces.filter(
        (space) => space.featured,
      ),
    [provinceSpaces],
  );

  const availableSpaces = useMemo(
    () =>
      provinceSpaces.filter(
        (space) => space.availableToday,
      ),
    [provinceSpaces],
  );

  const nearbySpaces = useMemo(
    () =>
      [...provinceSpaces]
        .sort(
          (a, b) =>
            a.distance -
            b.distance,
        )
        .slice(0, 6),
    [provinceSpaces],
  );

  const premiumSpaces = useMemo(
    () =>
      provinceSpaces
        .filter(
          (space) => space.premium,
        )
        .slice(0, 5),
    [provinceSpaces],
  );

  const heroSpaces =
    featuredSpaces.length > 0
      ? featuredSpaces
      : provinceSpaces;

  const hero =
    heroSpaces.length > 0
      ? heroSpaces[
          heroIndex %
            heroSpaces.length
        ]
      : null;

  const openFilters = useCallback(() => {
    setDraftFilters(filters);
    setFilterVisible(true);

    filterY.setValue(700);
    filterBackdrop.setValue(0);

    Animated.parallel([
      Animated.timing(filterY, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(
          Easing.cubic,
        ),
        useNativeDriver: true,
      }),
      Animated.timing(
        filterBackdrop,
        {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        },
      ),
    ]).start();
  }, [
    filters,
    filterY,
    filterBackdrop,
  ]);

  const closeFilters = useCallback(() => {
    Animated.parallel([
      Animated.timing(filterY, {
        toValue: 700,
        duration: 320,
        easing: Easing.in(
          Easing.cubic,
        ),
        useNativeDriver: true,
      }),
      Animated.timing(
        filterBackdrop,
        {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        },
      ),
    ]).start(() => {
      setFilterVisible(false);
    });
  }, [filterY, filterBackdrop]);

  const openProvinceSelector =
    useCallback(() => {
      setProvinceSearch('');
      setProvinceVisible(true);

      provinceY.setValue(700);
      provinceBackdrop.setValue(0);

      Animated.parallel([
        Animated.timing(provinceY, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(
            Easing.cubic,
          ),
          useNativeDriver: true,
        }),
        Animated.timing(
          provinceBackdrop,
          {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          },
        ),
      ]).start();
    }, [
      provinceY,
      provinceBackdrop,
    ]);

  const closeProvinceSelector =
    useCallback(() => {
      Animated.parallel([
        Animated.timing(provinceY, {
          toValue: 700,
          duration: 320,
          easing: Easing.in(
            Easing.cubic,
          ),
          useNativeDriver: true,
        }),
        Animated.timing(
          provinceBackdrop,
          {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          },
        ),
      ]).start(() => {
        setProvinceVisible(false);
      });
    }, [
      provinceY,
      provinceBackdrop,
    ]);

  const selectProvince = useCallback(
    (province: string) => {
      setSelectedProvince(province);
      setSearch('');
      closeProvinceSelector();
    },
    [closeProvinceSelector],
  );

  const applyFilters = useCallback(() => {
    setFilters(draftFilters);
    closeFilters();
  }, [
    draftFilters,
    closeFilters,
  ]);

  const clearFilters = useCallback(() => {
    const cleanFilters: Filters = {
      category: 'Todos',
      distance: null,
      maxPrice: null,
      minRating: null,
      availableToday: false,
      premiumOnly: false,
    };

    setDraftFilters(cleanFilters);
    setFilters(cleanFilters);
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((current) =>
        current.includes(id)
          ? current.filter(
              (item) => item !== id,
            )
          : [...current, id],
      );
    },
    [],
  );

  const navigateToSpace = useCallback(() => {
    router.push('/space');
  }, [router]);

  const navigateToSpaces =
    useCallback(() => {
      router.push('/especes');
    }, [router]);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.category !== 'Todos') {
      count++;
    }

    if (filters.distance !== null) {
      count++;
    }

    if (filters.maxPrice !== null) {
      count++;
    }

    if (filters.minRating !== null) {
      count++;
    }

    if (filters.availableToday) {
      count++;
    }

    if (filters.premiumOnly) {
      count++;
    }

    return count;
  }, [filters]);

  useEffect(() => {
    if (heroSpaces.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setHeroIndex((current) =>
        (current + 1) %
        heroSpaces.length,
      );
    }, 5500);

    return () => clearInterval(interval);
  }, [heroSpaces.length]);

  useEffect(() => {
    setHeroIndex(0);
  }, [selectedProvince]);

  const selectQuickCategory = useCallback(
    (category: string) => {
      setFilters((current) => ({
        ...current,
        category,
      }));
    },
    [],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          COLORS.background
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              Platform.OS === 'ios'
                ? 130
                : 110,
          },
        ]}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            onPress={openProvinceSelector}
            style={({ pressed }) => [
              styles.locationButton,
              pressed &&
                styles.locationButtonPressed,
            ]}
          >
            <View
              style={styles.locationIcon}
            >
              <Ionicons
                name="location-outline"
                size={18}
                color={COLORS.black}
              />
            </View>

            <View
              style={
                styles.locationTextBlock
              }
            >
              <Text
                style={styles.locationLabel}
              >
                LOCALIZAÇÃO
              </Text>

              <Text
                style={styles.locationText}
                numberOfLines={1}
              >
                {selectedProvince}
              </Text>
            </View>

            <Ionicons
              name="chevron-down"
              size={15}
              color={COLORS.muted}
            />
          </Pressable>

          <View style={styles.headerRight}>
            {/* PESQUISA — MANTIDA NO TOPO */}

            <Pressable
              style={({ pressed }) => [
                styles.headerIconButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="search-outline"
                size={20}
                color={COLORS.black}
              />
            </Pressable>

            {/* NOTIFICAÇÕES */}

            <Pressable
              style={({ pressed }) => [
                styles.notificationButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={COLORS.black}
              />

              <View
                style={
                  styles.notificationDot
                }
              />
            </Pressable>
          </View>
        </View>

        {/* BRAND / INTRO */}

        <View style={styles.brandHeader}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>
              S
            </Text>
          </View>

          <View style={styles.brandTextBlock}>
            <Text style={styles.brandEyebrow}>
              SLOTIX DISCOVERY
            </Text>

            <Text style={styles.brandTitle}>
              Descubra o seu próximo espaço.
            </Text>

            <Text style={styles.brandSubtitle}>
              Experiências selecionadas para
              cuidar de si.
            </Text>
          </View>
        </View>

        {/* CATEGORIES */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.categoriesContent
          }
        >
          {CATEGORIES.map((category) => {
            const active =
              filters.category ===
              category.name;

            return (
              <Pressable
                key={category.name}
                onPress={() =>
                  selectQuickCategory(
                    category.name,
                  )
                }
                style={[
                  styles.categoryItem,
                  active &&
                    styles.categoryItemActive,
                ]}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    active &&
                      styles.categoryIconActive,
                  ]}
                >
                  <Ionicons
                    name={category.icon}
                    size={17}
                    color={
                      active
                        ? COLORS.white
                        : COLORS.black
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.categoryText,
                    active &&
                      styles.categoryTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* HERO */}

        {hero ? (
          <View style={styles.heroSection}>
            <FeaturedCard
              space={hero}
              onPress={navigateToSpace}
            />

            {heroSpaces.length > 1 ? (
              <View
                style={styles.heroDots}
              >
                {heroSpaces.map(
                  (_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.heroDot,
                        index ===
                          heroIndex %
                            heroSpaces.length &&
                          styles.heroDotActive,
                      ]}
                    />
                  ),
                )}
              </View>
            ) : null}
          </View>
        ) : null}

        {/* AVAILABLE TODAY */}

        {availableSpaces.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="Disponível hoje"
              subtitle={`${availableSpaces.length} espaços em ${selectedProvince}`}
              action="Ver todos"
              onPress={() => {
                setFilters((current) => ({
                  ...current,
                  availableToday: true,
                }));

                navigateToSpaces();
              }}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.horizontalCards
              }
            >
              {availableSpaces
                .slice(0, 5)
                .map((space) => (
                  <View
                    key={space.id}
                    style={{
                      width: Math.min(
                        width * 0.72,
                        300,
                      ),
                    }}
                  >
                    <SpaceCard
                      space={space}
                      favorite={favorites.includes(
                        space.id,
                      )}
                      onFavorite={() =>
                        toggleFavorite(
                          space.id,
                        )
                      }
                      onPress={
                        navigateToSpace
                      }
                    />
                  </View>
                ))}
            </ScrollView>
          </View>
        ) : null}

        {/* NEARBY */}

        <View style={styles.section}>
          <SectionHeader
            title="Na sua região"
            subtitle={`Espaços selecionados em ${selectedProvince}`}
            action="Ver todos"
            onPress={navigateToSpaces}
          />

          {nearbySpaces.length > 0 ? (
            <View
              style={styles.verticalCards}
            >
              {nearbySpaces
                .slice(0, 4)
                .map((space) => (
                  <SpaceCard
                    key={space.id}
                    space={space}
                    favorite={favorites.includes(
                      space.id,
                    )}
                    onFavorite={() =>
                      toggleFavorite(
                        space.id,
                      )
                    }
                    onPress={
                      navigateToSpace
                    }
                  />
                ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="location-outline"
                  size={23}
                  color={COLORS.black}
                />
              </View>

              <Text
                style={styles.emptyTitle}
              >
                Ainda não há espaços em{' '}
                {selectedProvince}
              </Text>

              <Text
                style={
                  styles.emptyDescription
                }
              >
                Estamos a expandir o SLOTIX
                para esta região. Escolha
                outra província para descobrir
                espaços disponíveis.
              </Text>

              <Pressable
                onPress={
                  openProvinceSelector
                }
                style={
                  styles.emptyButton
                }
              >
                <Text
                  style={
                    styles.emptyButtonText
                  }
                >
                  Escolher outra província
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={COLORS.white}
                />
              </Pressable>
            </View>
          )}
        </View>

        {/* RESULTS */}

        {search.trim().length > 0 ||
        activeFilterCount > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="Resultados"
              subtitle={`${filteredSpaces.length} espaços encontrados`}
            />

            {filteredSpaces.length > 0 ? (
              <View
                style={styles.verticalCards}
              >
                {filteredSpaces.map(
                  (space) => (
                    <SpaceCard
                      key={space.id}
                      space={space}
                      favorite={favorites.includes(
                        space.id,
                      )}
                      onFavorite={() =>
                        toggleFavorite(
                          space.id,
                        )
                      }
                      onPress={
                        navigateToSpace
                      }
                    />
                  ),
                )}
              </View>
            ) : (
              <View
                style={styles.emptyState}
              >
                <View
                  style={styles.emptyIcon}
                >
                  <Ionicons
                    name="search-outline"
                    size={23}
                    color={COLORS.black}
                  />
                </View>

                <Text
                  style={styles.emptyTitle}
                >
                  Nenhum espaço encontrado
                </Text>

                <Text
                  style={
                    styles.emptyDescription
                  }
                >
                  Tente remover alguns filtros
                  ou procurar por outro serviço.
                </Text>

                <Pressable
                  onPress={clearFilters}
                  style={
                    styles.emptyButton
                  }
                >
                  <Text
                    style={
                      styles.emptyButtonText
                    }
                  >
                    Limpar filtros
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : null}

        {/* PREMIUM */}

        {premiumSpaces.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title="Experiências premium"
              subtitle="Espaços selecionados para si"
              action="Ver todos"
              onPress={navigateToSpaces}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.horizontalCards
              }
            >
              {premiumSpaces.map((space) => (
                <View
                  key={space.id}
                  style={{
                    width: Math.min(
                      width * 0.72,
                      300,
                    ),
                  }}
                >
                  <SpaceCard
                    space={space}
                    favorite={favorites.includes(
                      space.id,
                    )}
                    onFavorite={() =>
                      toggleFavorite(
                        space.id,
                      )
                    }
                    onPress={
                      navigateToSpace
                    }
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      {/* PROVINCE SELECTOR */}

      <Modal
        visible={provinceVisible}
        transparent
        animationType="none"
        onRequestClose={
          closeProvinceSelector
        }
      >
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalBackdrop,
              {
                opacity:
                  provinceBackdrop,
              },
            ]}
          >
            <Pressable
              style={
                styles.backdropPressable
              }
              onPress={
                closeProvinceSelector
              }
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.provinceSheet,
              {
                transform: [
                  {
                    translateY: provinceY,
                  },
                ],
              },
            ]}
          >
            <View style={styles.sheetHandle} />

            <View
              style={styles.provinceHeader}
            >
              <View>
                <Text
                  style={styles.sheetEyebrow}
                >
                  LOCALIZAÇÃO
                </Text>

                <Text
                  style={
                    styles.provinceSheetTitle
                  }
                >
                  Escolha a sua província
                </Text>

                <Text
                  style={
                    styles.provinceSheetSubtitle
                  }
                >
                  Descubra espaços disponíveis
                  na região selecionada.
                </Text>
              </View>

              <Pressable
                onPress={
                  closeProvinceSelector
                }
                style={styles.sheetClose}
              >
                <Ionicons
                  name="close"
                  size={19}
                  color={COLORS.black}
                />
              </Pressable>
            </View>

            <View
              style={
                styles.provinceSearchContainer
              }
            >
              <Ionicons
                name="search-outline"
                size={18}
                color={COLORS.muted}
              />

              <TextInput
                value={provinceSearch}
                onChangeText={
                  setProvinceSearch
                }
                placeholder="Pesquisar província"
                placeholderTextColor={
                  COLORS.lightMuted
                }
                style={
                  styles.provinceSearchInput
                }
                returnKeyType="search"
              />

              {provinceSearch.length >
              0 ? (
                <Pressable
                  onPress={() =>
                    setProvinceSearch(
                      '',
                    )
                  }
                  hitSlop={10}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={
                      COLORS.lightMuted
                    }
                  />
                </Pressable>
              ) : null}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.provinceList
              }
            >
              {filteredProvinces.map(
                (province) => {
                  const active =
                    selectedProvince ===
                    province;

                  return (
                    <Pressable
                      key={province}
                      onPress={() =>
                        selectProvince(
                          province,
                        )
                      }
                      style={({ pressed }) => [
                        styles.provinceItem,
                        active &&
                          styles.provinceItemActive,
                        pressed &&
                          styles.provinceItemPressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.provinceIcon,
                          active &&
                            styles.provinceIconActive,
                        ]}
                      >
                        <Ionicons
                          name="location-outline"
                          size={17}
                          color={
                            active
                              ? COLORS.white
                              : COLORS.black
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.provinceItemText
                        }
                      >
                        <Text
                          style={[
                            styles.provinceName,
                            active &&
                              styles.provinceNameActive,
                          ]}
                        >
                          {province}
                        </Text>

                        {active ? (
                          <Text
                            style={
                              styles.provinceSelected
                            }
                          >
                            Localização atual
                          </Text>
                        ) : null}
                      </View>

                      {active ? (
                        <View
                          style={
                            styles.provinceCheck
                          }
                        >
                          <Ionicons
                            name="checkmark"
                            size={17}
                            color={
                              COLORS.white
                            }
                          />
                        </View>
                      ) : (
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={
                            COLORS.lightMuted
                          }
                        />
                      )}
                    </Pressable>
                  );
                },
              )}

              {filteredProvinces.length ===
              0 ? (
                <View
                  style={
                    styles.provinceEmpty
                  }
                >
                  <Ionicons
                    name="search-outline"
                    size={25}
                    color={COLORS.muted}
                  />

                  <Text
                    style={
                      styles.provinceEmptyTitle
                    }
                  >
                    Província não encontrada
                  </Text>

                  <Text
                    style={
                      styles.provinceEmptyText
                    }
                  >
                    Tente pesquisar por outro
                    nome.
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* FILTER SHEET */}

      <Modal
        visible={filterVisible}
        transparent
        animationType="none"
        onRequestClose={closeFilters}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <Animated.View
            style={[
              styles.modalBackdrop,
              {
                opacity:
                  filterBackdrop,
              },
            ]}
          >
            <Pressable
              style={
                styles.backdropPressable
              }
              onPress={closeFilters}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.filterSheet,
              {
                transform: [
                  {
                    translateY: filterY,
                  },
                ],
              },
            ]}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text
                  style={styles.sheetEyebrow}
                >
                  PERSONALIZAR
                </Text>

                <Text
                  style={styles.sheetTitle}
                >
                  Filtros
                </Text>
              </View>

              <Pressable
                onPress={closeFilters}
                style={styles.sheetClose}
              >
                <Ionicons
                  name="close"
                  size={19}
                  color={COLORS.black}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.filterContent
              }
            >
              <Text
                style={
                  styles.filterSectionTitle
                }
              >
                Categoria
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.filterChips
                }
              >
                {CATEGORIES.map(
                  (category) => {
                    const active =
                      draftFilters.category ===
                      category.name;

                    return (
                      <Pressable
                        key={category.name}
                        onPress={() =>
                          setDraftFilters(
                            (current) => ({
                              ...current,
                              category:
                                category.name,
                            }),
                          )
                        }
                        style={[
                          styles.filterChip,
                          active &&
                            styles.filterChipActive,
                        ]}
                      >
                        <Ionicons
                          name={category.icon}
                          size={15}
                          color={
                            active
                              ? COLORS.white
                              : COLORS.black
                          }
                        />

                        <Text
                          style={[
                            styles.filterChipText,
                            active &&
                              styles.filterChipTextActive,
                          ]}
                        >
                          {category.name}
                        </Text>
                      </Pressable>
                    );
                  },
                )}
              </ScrollView>

              <Text
                style={
                  styles.filterSectionTitle
                }
              >
                Distância
              </Text>

              <View style={styles.optionGrid}>
                {DISTANCE_OPTIONS.map(
                  (option) => {
                    const active =
                      draftFilters.distance ===
                      option.value;

                    return (
                      <Pressable
                        key={option.label}
                        onPress={() =>
                          setDraftFilters(
                            (current) => ({
                              ...current,
                              distance:
                                option.value,
                            }),
                          )
                        }
                        style={[
                          styles.optionButton,
                          active &&
                            styles.optionButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            active &&
                              styles.optionButtonTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  },
                )}
              </View>

              <Text
                style={
                  styles.filterSectionTitle
                }
              >
                Preço
              </Text>

              <View style={styles.optionGrid}>
                {PRICE_OPTIONS.map(
                  (option) => {
                    const active =
                      draftFilters.maxPrice ===
                      option.value;

                    return (
                      <Pressable
                        key={option.label}
                        onPress={() =>
                          setDraftFilters(
                            (current) => ({
                              ...current,
                              maxPrice:
                                option.value,
                            }),
                          )
                        }
                        style={[
                          styles.optionButton,
                          active &&
                            styles.optionButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            active &&
                              styles.optionButtonTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  },
                )}
              </View>

              <Text
                style={
                  styles.filterSectionTitle
                }
              >
                Preferências
              </Text>

              <Pressable
                onPress={() =>
                  setDraftFilters(
                    (current) => ({
                      ...current,
                      availableToday:
                        !current.availableToday,
                    }),
                  )
                }
                style={
                  styles.preferenceRow
                }
              >
                <View
                  style={
                    styles.preferenceIcon
                  }
                >
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={COLORS.black}
                  />
                </View>

                <View
                  style={
                    styles.preferenceText
                  }
                >
                  <Text
                    style={
                      styles.preferenceTitle
                    }
                  >
                    Disponível hoje
                  </Text>

                  <Text
                    style={
                      styles.preferenceSubtitle
                    }
                  >
                    Mostrar espaços com horários
                    disponíveis
                  </Text>
                </View>

                <View
                  style={[
                    styles.switch,
                    draftFilters.availableToday &&
                      styles.switchActive,
                  ]}
                >
                  <View
                    style={[
                      styles.switchKnob,
                      draftFilters.availableToday &&
                        styles.switchKnobActive,
                    ]}
                  />
                </View>
              </Pressable>

              <Pressable
                onPress={() =>
                  setDraftFilters(
                    (current) => ({
                      ...current,
                      premiumOnly:
                        !current.premiumOnly,
                    }),
                  )
                }
                style={
                  styles.preferenceRow
                }
              >
                <View
                  style={
                    styles.preferenceIcon
                  }
                >
                  <Ionicons
                    name="diamond-outline"
                    size={18}
                    color={COLORS.black}
                  />
                </View>

                <View
                  style={
                    styles.preferenceText
                  }
                >
                  <Text
                    style={
                      styles.preferenceTitle
                    }
                  >
                    Apenas Premium
                  </Text>

                  <Text
                    style={
                      styles.preferenceSubtitle
                    }
                  >
                    Experiências de nível superior
                  </Text>
                </View>

                <View
                  style={[
                    styles.switch,
                    draftFilters.premiumOnly &&
                      styles.switchActive,
                  ]}
                >
                  <View
                    style={[
                      styles.switchKnob,
                      draftFilters.premiumOnly &&
                        styles.switchKnobActive,
                    ]}
                  />
                </View>
              </Pressable>

              <View
                style={styles.filterActions}
              >
                <Pressable
                  onPress={clearFilters}
                  style={styles.clearButton}
                >
                  <Text
                    style={
                      styles.clearButtonText
                    }
                  >
                    Limpar
                  </Text>
                </Pressable>

                <Pressable
                  onPress={applyFilters}
                  style={styles.applyButton}
                >
                  <Text
                    style={
                      styles.applyButtonText
                    }
                  >
                    Aplicar filtros
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={COLORS.white}
                  />
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingTop:
      Platform.OS === 'ios' ? 12 : 8,
  },

  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  header: {
    minHeight: 62,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  locationButton: {
    minHeight: 48,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 12,
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  locationButtonPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  locationTextBlock: {
    minWidth: 72,
    maxWidth: 135,
  },

  locationLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.25,
    color: COLORS.lightMuted,
    marginBottom: 2,
  },

  locationText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  notificationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    position: 'absolute',
    top: 10,
    right: 10,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },

  pressed: {
    opacity: 0.65,
  },

  brandHeader: {
    marginTop: 22,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  brandMark: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandMarkText: {
    fontSize: 21,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -1,
  },

  brandTextBlock: {
    flex: 1,
  },

  brandEyebrow: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: COLORS.accent,
  },

  brandTitle: {
    marginTop: 4,
    fontSize: 21,
    lineHeight: 25,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: COLORS.text,
  },

  brandSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.muted,
    lineHeight: 16,
  },

  categoriesContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
    gap: 9,
  },

  categoryItem: {
    height: 76,
    minWidth: 70,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  categoryItemActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },

  categoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryIconActive: {
    backgroundColor:
      'rgba(255,255,255,0.14)',
  },

  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
  },

  categoryTextActive: {
    color: COLORS.white,
  },

  heroSection: {
    marginTop: 22,
  },

  featuredCard: {
    height: 390,
    marginHorizontal: 20,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: COLORS.black,
  },

  featuredImage: {
    width: '100%',
    height: '100%',
  },

  gradient: {
    width: '100%',
    height: '100%',
  },

  featuredTop: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  featuredLabel: {
    minHeight: 30,
    paddingHorizontal: 11,
    borderRadius: 15,
    backgroundColor:
      'rgba(0,0,0,0.36)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
  },

  featuredLabelText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  featuredRating: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor:
      'rgba(0,0,0,0.36)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  featuredRatingText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },

  featuredBottom: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
  },

  featuredName: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    letterSpacing: -0.7,
    color: COLORS.white,
  },

  featuredMeta: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  featuredLocation: {
    color:
      'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '600',
  },

  featuredAction: {
    marginTop: 17,
    height: 50,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    paddingLeft: 16,
    paddingRight: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  featuredActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.black,
  },

  featuredArrow: {
    width: 36,
    height: 36,
    borderRadius: 13,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroDots: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },

  heroDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D0D2D5',
  },

  heroDotActive: {
    width: 18,
    backgroundColor: COLORS.black,
  },

  section: {
    marginTop: 30,
  },

  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: -0.4,
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 11,
    color: COLORS.muted,
    lineHeight: 16,
  },

  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingBottom: 2,
  },

  sectionActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.accent,
  },

  horizontalCards: {
    paddingHorizontal: 20,
    gap: 12,
  },

  verticalCards: {
    paddingHorizontal: 20,
    gap: 14,
  },

  spaceCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cardPressed: {
    opacity: 0.86,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  spaceImageWrapper: {
    height: 205,
    position: 'relative',
    backgroundColor: '#EDEDED',
  },

  spaceImage: {
    width: '100%',
    height: '100%',
  },

  premiumBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 14,
    backgroundColor:
      'rgba(0,0,0,0.58)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  premiumBadgeText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.9,
  },

  favoriteButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
  },

  favoriteBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageBottomInfo: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  ratingPill: {
    minHeight: 27,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor:
      'rgba(0,0,0,0.48)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  ratingText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
  },

  cardService: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },

  spaceCardContent: {
    padding: 14,
  },

  spaceCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  spaceCardName: {
    flex: 1,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '900',
    color: COLORS.text,
  },

  spaceMetaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  metaText: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '600',
  },

  priceRow: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  priceLabel: {
    fontSize: 10,
    color: COLORS.lightMuted,
    fontWeight: '600',
  },

  priceValue: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '900',
  },

  emptyState: {
    marginHorizontal: 20,
    paddingHorizontal: 22,
    paddingVertical: 28,
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },

  emptyDescription: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
    textAlign: 'center',
    maxWidth: 290,
  },

  emptyButton: {
    marginTop: 18,
    minHeight: 44,
    paddingHorizontal: 17,
    borderRadius: 15,
    backgroundColor: COLORS.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  emptyButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      'rgba(0,0,0,0.52)',
  },

  backdropPressable: {
    flex: 1,
  },

  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D6D7D9',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 15,
  },

  provinceSheet: {
    maxHeight: '82%',
    minHeight: '58%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    paddingBottom:
      Platform.OS === 'ios'
        ? 26
        : 16,
  },

  provinceHeader: {
    paddingHorizontal: 20,
    paddingBottom: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 15,
  },

  sheetEyebrow: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: COLORS.accent,
    marginBottom: 5,
  },

  provinceSheetTitle: {
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: COLORS.text,
  },

  provinceSheetSubtitle: {
    marginTop: 5,
    maxWidth: 290,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
  },

  sheetClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  provinceSearchContainer: {
    marginHorizontal: 20,
    height: 50,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  provinceSearchInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },

  provinceList: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 8,
  },

  provinceItem: {
    minHeight: 62,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  provinceItemActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },

  provinceItemPressed: {
    transform: [
      {
        scale: 0.985,
      },
    ],
    opacity: 0.85,
  },

  provinceIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  provinceIconActive: {
    backgroundColor:
      'rgba(255,255,255,0.12)',
  },

  provinceItemText: {
    flex: 1,
  },

  provinceName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },

  provinceNameActive: {
    color: COLORS.white,
  },

  provinceSelected: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '600',
    color:
      'rgba(255,255,255,0.58)',
  },

  provinceCheck: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  provinceEmpty: {
    paddingVertical: 50,
    alignItems: 'center',
  },

  provinceEmptyTitle: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
  },

  provinceEmptyText: {
    marginTop: 5,
    fontSize: 11,
    color: COLORS.muted,
  },

  filterSheet: {
    maxHeight: '90%',
    minHeight: '72%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    paddingBottom:
      Platform.OS === 'ios'
        ? 26
        : 16,
  },

  sheetHeader: {
    paddingHorizontal: 20,
    paddingBottom: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  sheetTitle: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.6,
    color: COLORS.text,
  },

  filterContent: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },

  filterSectionTitle: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
  },

  filterChips: {
    gap: 8,
  },

  filterChip: {
    height: 40,
    paddingHorizontal: 13,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  filterChipActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },

  filterChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.text,
  },

  filterChipTextActive: {
    color: COLORS.white,
  },

  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  optionButton: {
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionButtonActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },

  optionButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
  },

  optionButtonTextActive: {
    color: COLORS.white,
  },

  preferenceRow: {
    minHeight: 70,
    padding: 10,
    marginBottom: 8,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  preferenceText: {
    flex: 1,
  },

  preferenceTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
  },

  preferenceSubtitle: {
    marginTop: 3,
    fontSize: 9,
    color: COLORS.muted,
  },

  switch: {
    width: 45,
    height: 26,
    padding: 3,
    borderRadius: 13,
    backgroundColor: '#D9DBDE',
    justifyContent: 'center',
  },

  switchActive: {
    backgroundColor: COLORS.black,
  },

  switchKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },

  switchKnobActive: {
    alignSelf: 'flex-end',
  },

  filterActions: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  clearButton: {
    width: 95,
    height: 52,
    borderRadius: 17,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.text,
  },

  applyButton: {
    flex: 1,
    height: 52,
    borderRadius: 17,
    backgroundColor: COLORS.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  applyButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.white,
  },
});