import React, {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

type IconName = keyof typeof Ionicons.glyphMap;

type Space = {
  id: string;
  name: string;
  category: string;
  province: string;
  neighborhood: string;
  rating: number;
  reviews: number;
  distance: number;
  price: number;
  service: string;
  image: string;
  premium?: boolean;
  availableToday?: boolean;
};

type SortMode =
  | 'recommended'
  | 'rating'
  | 'distance'
  | 'price-low'
  | 'price-high';

type Filters = {
  minRating: number | null;
  maxPrice: number | null;
  maxDistance: number | null;
  availableToday: boolean;
  premiumOnly: boolean;
};

const COLORS = {
  background: '#F6F6F4',
  white: '#FFFFFF',
  black: '#0B0B0C',
  text: '#151619',
  muted: '#85878D',
  softMuted: '#A3A5AA',
  line: '#E7E7E4',
  blue: '#1769E0',
  blueSoft: '#EAF2FF',
  success: '#1D9A62',
  gold: '#B28A42',
  goldSoft: '#FAF5E9',
};

const CATEGORIES: {
  label: string;
  icon: IconName;
}[] = [
  {
    label: 'Todos',
    icon: 'apps-outline',
  },
  {
    label: 'Barbearia',
    icon: 'cut-outline',
  },
  {
    label: 'Salão',
    icon: 'sparkles-outline',
  },
  {
    label: 'Nails',
    icon: 'color-palette-outline',
  },
  {
    label: 'SPA',
    icon: 'water-outline',
  },
  {
    label: 'Estética',
    icon: 'flower-outline',
  },
];

const PROVINCES = [
  'Todas',
  'Luanda',
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
  'Lunda Norte',
  'Lunda Sul',
  'Malanje',
  'Moxico',
  'Moxico Leste',
  'Namibe',
  'Uíge',
  'Zaire',
];

const SORT_OPTIONS: {
  value: SortMode;
  label: string;
}[] = [
  {
    value: 'recommended',
    label: 'Recomendados',
  },
  {
    value: 'rating',
    label: 'Melhor avaliação',
  },
  {
    value: 'distance',
    label: 'Mais próximos',
  },
  {
    value: 'price-low',
    label: 'Menor preço',
  },
  {
    value: 'price-high',
    label: 'Maior preço',
  },
];

const SPACES: Space[] = [
  {
    id: '1',
    name: 'Barbearia Executive',
    category: 'Barbearia',
    province: 'Luanda',
    neighborhood: 'Alvalade',
    rating: 4.9,
    reviews: 184,
    distance: 1.2,
    price: 7500,
    service: 'Corte + Barba',
    image:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=90',
    premium: true,
    availableToday: true,
  },
  {
    id: '2',
    name: 'Lumina Nails & Spa',
    category: 'Nails',
    province: 'Luanda',
    neighborhood: 'Talatona',
    rating: 4.8,
    reviews: 126,
    distance: 3.4,
    price: 10000,
    service: 'Manicure Premium',
    image:
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=90',
    premium: true,
    availableToday: true,
  },
  {
    id: '3',
    name: 'The Royal Spa',
    category: 'SPA',
    province: 'Luanda',
    neighborhood: 'Ilha de Luanda',
    rating: 4.9,
    reviews: 98,
    distance: 4.1,
    price: 15000,
    service: 'Royal Relax',
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=90',
    premium: true,
    availableToday: true,
  },
  {
    id: '4',
    name: "Gentleman's Club",
    category: 'Barbearia',
    province: 'Luanda',
    neighborhood: 'Alvalade',
    rating: 4.7,
    reviews: 211,
    distance: 1.8,
    price: 5000,
    service: 'Corte Executivo',
    image:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=90',
    availableToday: true,
  },
  {
    id: '5',
    name: 'Lumina Beauty Studio',
    category: 'Salão',
    province: 'Luanda',
    neighborhood: 'Miramar',
    rating: 4.8,
    reviews: 157,
    distance: 2.9,
    price: 7500,
    service: 'Beauty Experience',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=90',
    premium: true,
    availableToday: true,
  },
  {
    id: '6',
    name: 'Glow Skin Studio',
    category: 'Estética',
    province: 'Luanda',
    neighborhood: 'Talatona',
    rating: 4.9,
    reviews: 87,
    distance: 5.2,
    price: 10000,
    service: 'Skin Treatment',
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=90',
    premium: true,
  },
  {
    id: '7',
    name: 'Benguela Premium Beauty',
    category: 'Salão',
    province: 'Benguela',
    neighborhood: 'Centro',
    rating: 4.8,
    reviews: 74,
    distance: 6.8,
    price: 8500,
    service: 'Beauty Signature',
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=90',
    premium: true,
    availableToday: true,
  },
  {
    id: '8',
    name: 'Huíla Gentleman',
    category: 'Barbearia',
    province: 'Huíla',
    neighborhood: 'Lubango',
    rating: 4.7,
    reviews: 92,
    distance: 8.4,
    price: 5500,
    service: 'Executive Cut',
    image:
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=90',
    availableToday: true,
  },
  {
    id: '9',
    name: 'Aura Wellness',
    category: 'SPA',
    province: 'Luanda',
    neighborhood: 'Talatona',
    rating: 4.9,
    reviews: 64,
    distance: 5.9,
    price: 18000,
    service: 'Wellness Ritual',
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=90',
    premium: true,
  },
  {
    id: '10',
    name: 'Noble Men Studio',
    category: 'Barbearia',
    province: 'Luanda',
    neighborhood: 'Maianga',
    rating: 4.8,
    reviews: 143,
    distance: 2.2,
    price: 6500,
    service: 'Royal Haircut',
    image:
      'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1200&q=90',
    premium: true,
    availableToday: true,
  },
];

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('pt-AO').format(value)} Kz`;
}

function getSortLabel(mode: SortMode) {
  const option = SORT_OPTIONS.find((item) => item.value === mode);

  return option?.label ?? 'Recomendados';
}

type SpaceCardProps = {
  space: Space;
  favorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPress: (id: string) => void;
};

const SpaceCard = memo(
  ({
    space,
    favorite,
    onToggleFavorite,
    onPress,
  }: SpaceCardProps) => {
    const scale = useRef(new Animated.Value(1)).current;
    const favoriteScale = useRef(new Animated.Value(1)).current;

    const animatePressIn = useCallback(() => {
      Animated.spring(scale, {
        toValue: 0.985,
        useNativeDriver: true,
        speed: 25,
        bounciness: 0,
      }).start();
    }, [scale]);

    const animatePressOut = useCallback(() => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 5,
      }).start();
    }, [scale]);

    const handleFavorite = useCallback(() => {
      Animated.sequence([
        Animated.spring(favoriteScale, {
          toValue: 0.78,
          useNativeDriver: true,
          speed: 35,
          bounciness: 0,
        }),
        Animated.spring(favoriteScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 8,
        }),
      ]).start();

      onToggleFavorite(space.id);
    }, [favoriteScale, onToggleFavorite, space.id]);

    const handlePress = useCallback(() => {
      onPress(space.id);
    }, [onPress, space.id]);

    return (
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale }],
          },
        ]}
      >
        <Pressable
          onPressIn={animatePressIn}
          onPressOut={animatePressOut}
          onPress={handlePress}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: space.image }}
              style={styles.cardImage}
              contentFit="cover"
              transition={250}
            />

            <LinearGradient
              colors={[
                'rgba(0,0,0,0.04)',
                'rgba(0,0,0,0.08)',
                'rgba(0,0,0,0.68)',
              ]}
              style={styles.imageGradient}
            />

            {space.premium && (
              <View style={styles.premiumBadge}>
                <Ionicons
                  name="diamond"
                  size={11}
                  color={COLORS.gold}
                />

                <Text style={styles.premiumText}>
                  PREMIUM
                </Text>
              </View>
            )}

            <Animated.View
              style={[
                styles.favoriteButtonWrapper,
                {
                  transform: [{ scale: favoriteScale }],
                },
              ]}
            >
              <Pressable
                onPress={handleFavorite}
                style={styles.favoriteButton}
                hitSlop={8}
              >
                <BlurView
                  intensity={55}
                  tint="light"
                  style={styles.favoriteBlur}
                >
                  <Ionicons
                    name={favorite ? 'heart' : 'heart-outline'}
                    size={18}
                    color={
                      favorite
                        ? '#D94A5A'
                        : COLORS.black
                    }
                  />
                </BlurView>
              </Pressable>
            </Animated.View>

            {space.availableToday && (
              <View style={styles.availableBadge}>
                <View style={styles.availableDot} />

                <Text style={styles.availableText}>
                  Hoje
                </Text>
              </View>
            )}

            <View style={styles.ratingBadge}>
              <Ionicons
                name="star"
                size={12}
                color="#F2B84B"
              />

              <Text style={styles.ratingText}>
                {space.rating.toFixed(1)}
              </Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardTitleRow}>
              <Text
                style={styles.cardTitle}
                numberOfLines={1}
              >
                {space.name}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color={COLORS.softMuted}
              />
            </View>

            <Text
              style={styles.serviceText}
              numberOfLines={1}
            >
              {space.service}
            </Text>

            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={13}
                color={COLORS.muted}
              />

              <Text
                style={styles.locationText}
                numberOfLines={1}
              >
                {space.neighborhood} · {space.distance} km
              </Text>
            </View>

            <View style={styles.cardBottomRow}>
              <Text style={styles.priceText}>
                {formatPrice(space.price)}
              </Text>

              <Text style={styles.reviewsText}>
                {space.reviews} avaliações
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  },
);

SpaceCard.displayName = 'SpaceCard';

export default function SpacesScreen() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState('Todos');

  const [selectedProvince, setSelectedProvince] =
    useState('Luanda');

  const [favorites, setFavorites] = useState<string[]>(
    [],
  );

  const [filters, setFilters] = useState<Filters>({
    minRating: null,
    maxPrice: null,
    maxDistance: null,
    availableToday: false,
    premiumOnly: false,
  });

  const [draftFilters, setDraftFilters] =
    useState<Filters>(filters);

  const [sortMode, setSortMode] =
    useState<SortMode>('recommended');

  const [provinceVisible, setProvinceVisible] =
    useState(false);

  const [filterVisible, setFilterVisible] =
    useState(false);

  const [sortVisible, setSortVisible] =
    useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.minRating !== null) count += 1;
    if (filters.maxPrice !== null) count += 1;
    if (filters.maxDistance !== null) count += 1;
    if (filters.availableToday) count += 1;
    if (filters.premiumOnly) count += 1;

    return count;
  }, [filters]);

  const filteredSpaces = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    const result = SPACES.filter((space) => {
      const matchesProvince =
        selectedProvince === 'Todas' ||
        space.province === selectedProvince;

      const matchesCategory =
        selectedCategory === 'Todos' ||
        space.category === selectedCategory;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        space.name.toLowerCase().includes(normalizedSearch) ||
        space.category
          .toLowerCase()
          .includes(normalizedSearch) ||
        space.service
          .toLowerCase()
          .includes(normalizedSearch) ||
        space.neighborhood
          .toLowerCase()
          .includes(normalizedSearch) ||
        space.province
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesRating =
        filters.minRating === null ||
        space.rating >= filters.minRating;

      const matchesPrice =
        filters.maxPrice === null ||
        space.price <= filters.maxPrice;

      const matchesDistance =
        filters.maxDistance === null ||
        space.distance <= filters.maxDistance;

      const matchesToday =
        !filters.availableToday ||
        space.availableToday === true;

      const matchesPremium =
        !filters.premiumOnly ||
        space.premium === true;

      return (
        matchesProvince &&
        matchesCategory &&
        matchesSearch &&
        matchesRating &&
        matchesPrice &&
        matchesDistance &&
        matchesToday &&
        matchesPremium
      );
    });

    return [...result].sort((a, b) => {
      switch (sortMode) {
        case 'rating':
          return b.rating - a.rating;

        case 'distance':
          return a.distance - b.distance;

        case 'price-low':
          return a.price - b.price;

        case 'price-high':
          return b.price - a.price;

        case 'recommended':
        default:
          if (
            Boolean(a.premium) !==
            Boolean(b.premium)
          ) {
            return a.premium ? -1 : 1;
          }

          if (a.rating !== b.rating) {
            return b.rating - a.rating;
          }

          return b.reviews - a.reviews;
      }
    });
  }, [
    filters,
    search,
    selectedCategory,
    selectedProvince,
    sortMode,
  ]);

  const openSpace = useCallback(
    (_id: string) => {
      router.push('/space');
    },
    [router],
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((current) =>
        current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id],
      );
    },
    [],
  );

  const applyFilters = useCallback(() => {
    setFilters(draftFilters);
    setFilterVisible(false);
  }, [draftFilters]);

  const clearFilters = useCallback(() => {
    const emptyFilters: Filters = {
      minRating: null,
      maxPrice: null,
      maxDistance: null,
      availableToday: false,
      premiumOnly: false,
    };

    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
  }, []);

  const openFilters = useCallback(() => {
    setDraftFilters(filters);
    setFilterVisible(true);
  }, [filters]);

  const resetEverything = useCallback(() => {
    setSearch('');
    setSelectedCategory('Todos');
    setSelectedProvince('Luanda');
    setSortMode('recommended');

    const emptyFilters: Filters = {
      minRating: null,
      maxPrice: null,
      maxDistance: null,
      availableToday: false,
      premiumOnly: false,
    };

    setFilters(emptyFilters);
    setDraftFilters(emptyFilters);
  }, []);

  const renderSpace = useCallback(
    ({ item }: { item: Space }) => (
      <SpaceCard
        space={item}
        favorite={favorites.includes(item.id)}
        onToggleFavorite={toggleFavorite}
        onPress={openSpace}
      />
    ),
    [favorites, openSpace, toggleFavorite],
  );

  const keyExtractor = useCallback(
    (item: Space) => item.id,
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.container}>
        {/* HEADER — SOMENTE PESQUISA */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => setSearchVisible(true)}
            style={styles.searchHeaderButton}
            hitSlop={10}
          >
            <Ionicons
              name="search-outline"
              size={22}
              color={COLORS.black}
            />
          </Pressable>
        </View>

        <FlatList
          data={filteredSpaces}
          keyExtractor={keyExtractor}
          renderItem={renderSpace}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.listContent
          }
          columnWrapperStyle={
            styles.columnWrapper
          }
          ListHeaderComponent={
            <>
              {/* LOCATION */}
              <Pressable
                style={styles.locationSelector}
                onPress={() =>
                  setProvinceVisible(true)
                }
              >
                <View
                  style={styles.locationIconBox}
                >
                  <Ionicons
                    name="location"
                    size={17}
                    color={COLORS.black}
                  />
                </View>

                <View style={styles.locationInfo}>
                  <Text
                    style={styles.locationCaption}
                  >
                    LOCALIZAÇÃO
                  </Text>

                  <Text
                    style={styles.locationValue}
                  >
                    {selectedProvince}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-down"
                  size={17}
                  color={COLORS.muted}
                />
              </Pressable>

              {/* CATEGORIES */}
              <View style={styles.categorySection}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={
                    false
                  }
                  contentContainerStyle={
                    styles.categoryScroll
                  }
                >
                  {CATEGORIES.map((category) => {
                    const active =
                      selectedCategory ===
                      category.label;

                    return (
                      <Pressable
                        key={category.label}
                        onPress={() =>
                          setSelectedCategory(
                            category.label,
                          )
                        }
                        style={[
                          styles.categoryItem,
                          active &&
                            styles.categoryItemActive,
                        ]}
                      >
                        <Ionicons
                          name={category.icon}
                          size={16}
                          color={
                            active
                              ? COLORS.white
                              : COLORS.text
                          }
                        />

                        <Text
                          style={[
                            styles.categoryText,
                            active &&
                              styles.categoryTextActive,
                          ]}
                        >
                          {category.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>

              {/* CONTROLS */}
              <View style={styles.controlsRow}>
                <Pressable
                  style={[
                    styles.controlButton,
                    activeFilterCount > 0 &&
                      styles.controlButtonActive,
                  ]}
                  onPress={openFilters}
                >
                  <Ionicons
                    name="funnel-outline"
                    size={15}
                    color={
                      activeFilterCount > 0
                        ? COLORS.white
                        : COLORS.text
                    }
                  />

                  <Text
                    style={[
                      styles.controlText,
                      activeFilterCount > 0 &&
                        styles.controlTextActive,
                    ]}
                  >
                    Filtros
                  </Text>

                  {activeFilterCount > 0 && (
                    <View
                      style={styles.filterCount}
                    >
                      <Text
                        style={
                          styles.filterCountText
                        }
                      >
                        {activeFilterCount}
                      </Text>
                    </View>
                  )}
                </Pressable>

                <Pressable
                  style={styles.controlButton}
                  onPress={() =>
                    setSortVisible(true)
                  }
                >
                  <Ionicons
                    name="swap-vertical-outline"
                    size={16}
                    color={COLORS.text}
                  />

                  <Text
                    style={styles.controlText}
                  >
                    {getSortLabel(sortMode)}
                  </Text>
                </Pressable>
              </View>

              {/* RESULT HEADER */}
              <View style={styles.resultHeader}>
                <View>
                  <Text
                    style={styles.resultTitle}
                  >
                    Espaços
                  </Text>

                  <Text
                    style={styles.resultSubtitle}
                  >
                    {filteredSpaces.length}{' '}
                    disponíveis
                  </Text>
                </View>

                {search.length > 0 && (
                  <Pressable
                    onPress={resetEverything}
                    style={styles.resetButton}
                  >
                    <Text
                      style={
                        styles.resetButtonText
                      }
                    >
                      Limpar
                    </Text>
                  </Pressable>
                )}
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="search-outline"
                  size={25}
                  color={COLORS.muted}
                />
              </View>

              <Text style={styles.emptyTitle}>
                Nenhum espaço encontrado
              </Text>

              <Text style={styles.emptyText}>
                Tente alterar a pesquisa ou os
                filtros.
              </Text>

              <Pressable
                style={styles.emptyButton}
                onPress={resetEverything}
              >
                <Text
                  style={styles.emptyButtonText}
                >
                  Limpar filtros
                </Text>
              </Pressable>
            </View>
          }
        />

        {/* SEARCH MODAL */}
        <Modal
          visible={searchVisible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() =>
            setSearchVisible(false)
          }
        >
          <View style={styles.searchModalRoot}>
            <Pressable
              style={styles.searchModalBackdrop}
              onPress={() =>
                setSearchVisible(false)
              }
            />

            <View style={styles.searchPanel}>
              <View style={styles.searchPanelRow}>
                <View
                  style={styles.searchPanelInputWrap}
                >
                  <Ionicons
                    name="search-outline"
                    size={19}
                    color={COLORS.muted}
                  />

                  <TextInput
                    autoFocus
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Pesquisar espaços ou serviços"
                    placeholderTextColor={
                      '#A0A2A7'
                    }
                    style={
                      styles.searchPanelInput
                    }
                    returnKeyType="search"
                    autoCorrect={false}
                    autoCapitalize="none"
                  />

                  {search.length > 0 && (
                    <Pressable
                      onPress={() => setSearch('')}
                      hitSlop={8}
                    >
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={COLORS.softMuted}
                      />
                    </Pressable>
                  )}
                </View>

                <Pressable
                  onPress={() =>
                    setSearchVisible(false)
                  }
                  style={styles.searchCloseButton}
                  hitSlop={8}
                >
                  <Ionicons
                    name="close"
                    size={21}
                    color={COLORS.white}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* PROVINCE MODAL */}
        <Modal
          visible={provinceVisible}
          transparent
          animationType="slide"
          onRequestClose={() =>
            setProvinceVisible(false)
          }
        >
          <View style={styles.modalRoot}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() =>
                setProvinceVisible(false)
              }
            />

            <View style={styles.bottomSheet}>
              <View
                style={styles.sheetHandle}
              />

              <View style={styles.sheetHeader}>
                <View>
                  <Text
                    style={styles.sheetTitle}
                  >
                    Localização
                  </Text>

                  <Text
                    style={styles.sheetSubtitle}
                  >
                    Escolha uma província
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    setProvinceVisible(false)
                  }
                  style={styles.sheetClose}
                >
                  <Ionicons
                    name="close"
                    size={19}
                    color={COLORS.text}
                  />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                  styles.optionList
                }
              >
                {PROVINCES.map((province) => {
                  const active =
                    selectedProvince === province;

                  return (
                    <Pressable
                      key={province}
                      onPress={() => {
                        setSelectedProvince(
                          province,
                        );
                        setProvinceVisible(false);
                      }}
                      style={[
                        styles.optionRow,
                        active &&
                          styles.optionRowActive,
                      ]}
                    >
                      <View>
                        <Text
                          style={[
                            styles.optionText,
                            active &&
                              styles.optionTextActive,
                          ]}
                        >
                          {province}
                        </Text>
                      </View>

                      {active && (
                        <Ionicons
                          name="checkmark"
                          size={19}
                          color={COLORS.black}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* FILTER MODAL */}
        <Modal
          visible={filterVisible}
          transparent
          animationType="slide"
          onRequestClose={() =>
            setFilterVisible(false)
          }
        >
          <View style={styles.modalRoot}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() =>
                setFilterVisible(false)
              }
            />

            <View style={styles.bottomSheet}>
              <View
                style={styles.sheetHandle}
              />

              <View style={styles.sheetHeader}>
                <View>
                  <Text
                    style={styles.sheetTitle}
                  >
                    Filtros
                  </Text>

                  <Text
                    style={styles.sheetSubtitle}
                  >
                    Personalize a sua descoberta
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    setFilterVisible(false)
                  }
                  style={styles.sheetClose}
                >
                  <Ionicons
                    name="close"
                    size={19}
                    color={COLORS.text}
                  />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                  styles.filterContent
                }
              >
                {/* RATING */}
                <Text style={styles.filterLabel}>
                  Avaliação mínima
                </Text>

                <View
                  style={styles.filterOptions}
                >
                  {[4, 4.5, 4.8].map((rating) => {
                    const active =
                      draftFilters.minRating ===
                      rating;

                    return (
                      <Pressable
                        key={rating}
                        onPress={() =>
                          setDraftFilters(
                            (current) => ({
                              ...current,
                              minRating:
                                active
                                  ? null
                                  : rating,
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
                          name="star"
                          size={13}
                          color={
                            active
                              ? COLORS.white
                              : '#E1A63B'
                          }
                        />

                        <Text
                          style={[
                            styles.filterChipText,
                            active &&
                              styles.filterChipTextActive,
                          ]}
                        >
                          {rating.toFixed(1)}+
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* PRICE */}
                <Text
                  style={[
                    styles.filterLabel,
                    styles.filterLabelSpacing,
                  ]}
                >
                  Preço máximo
                </Text>

                <View
                  style={styles.filterOptions}
                >
                  {[5000, 10000, 15000, 20000].map(
                    (price) => {
                      const active =
                        draftFilters.maxPrice ===
                        price;

                      return (
                        <Pressable
                          key={price}
                          onPress={() =>
                            setDraftFilters(
                              (current) => ({
                                ...current,
                                maxPrice:
                                  active
                                    ? null
                                    : price,
                              }),
                            )
                          }
                          style={[
                            styles.filterChip,
                            active &&
                              styles.filterChipActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              active &&
                                styles.filterChipTextActive,
                            ]}
                          >
                            {formatPrice(price)}
                          </Text>
                        </Pressable>
                      );
                    },
                  )}
                </View>

                {/* DISTANCE */}
                <Text
                  style={[
                    styles.filterLabel,
                    styles.filterLabelSpacing,
                  ]}
                >
                  Distância máxima
                </Text>

                <View
                  style={styles.filterOptions}
                >
                  {[2, 5, 10, 20].map((distance) => {
                    const active =
                      draftFilters.maxDistance ===
                      distance;

                    return (
                      <Pressable
                        key={distance}
                        onPress={() =>
                          setDraftFilters(
                            (current) => ({
                              ...current,
                              maxDistance:
                                active
                                  ? null
                                  : distance,
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
                          name="location-outline"
                          size={13}
                          color={
                            active
                              ? COLORS.white
                              : COLORS.text
                          }
                        />

                        <Text
                          style={[
                            styles.filterChipText,
                            active &&
                              styles.filterChipTextActive,
                          ]}
                        >
                          {distance} km
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* TOGGLES */}
                <View
                  style={styles.toggleSection}
                >
                  <Pressable
                    style={styles.toggleRow}
                    onPress={() =>
                      setDraftFilters(
                        (current) => ({
                          ...current,
                          availableToday:
                            !current.availableToday,
                        }),
                      )
                    }
                  >
                    <View
                      style={
                        styles.toggleInfo
                      }
                    >
                      <View
                        style={
                          styles.toggleIcon
                        }
                      >
                        <Ionicons
                          name="flash-outline"
                          size={17}
                          color={
                            COLORS.text
                          }
                        />
                      </View>

                      <View>
                        <Text
                          style={
                            styles.toggleTitle
                          }
                        >
                          Disponível hoje
                        </Text>

                        <Text
                          style={
                            styles.toggleSubtitle
                          }
                        >
                          Mostrar apenas horários
                          disponíveis
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.switchTrack,
                        draftFilters.availableToday &&
                          styles.switchTrackActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.switchThumb,
                          draftFilters.availableToday &&
                            styles.switchThumbActive,
                        ]}
                      />
                    </View>
                  </Pressable>

                  <Pressable
                    style={styles.toggleRow}
                    onPress={() =>
                      setDraftFilters(
                        (current) => ({
                          ...current,
                          premiumOnly:
                            !current.premiumOnly,
                        }),
                      )
                    }
                  >
                    <View
                      style={
                        styles.toggleInfo
                      }
                    >
                      <View
                        style={
                          styles.toggleIcon
                        }
                      >
                        <Ionicons
                          name="diamond-outline"
                          size={17}
                          color={
                            COLORS.text
                          }
                        />
                      </View>

                      <View>
                        <Text
                          style={
                            styles.toggleTitle
                          }
                        >
                          Apenas Premium
                        </Text>

                        <Text
                          style={
                            styles.toggleSubtitle
                          }
                        >
                          Espaços selecionados
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.switchTrack,
                        draftFilters.premiumOnly &&
                          styles.switchTrackActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.switchThumb,
                          draftFilters.premiumOnly &&
                            styles.switchThumbActive,
                        ]}
                      />
                    </View>
                  </Pressable>
                </View>
              </ScrollView>

              <View
                style={styles.filterActions}
              >
                <Pressable
                  onPress={clearFilters}
                  style={styles.clearButton}
                >
                  <Text
                    style={styles.clearButtonText}
                  >
                    Limpar
                  </Text>
                </Pressable>

                <Pressable
                  onPress={applyFilters}
                  style={styles.applyButton}
                >
                  <Text
                    style={styles.applyButtonText}
                  >
                    Aplicar filtros
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={17}
                    color={COLORS.white}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* SORT MODAL */}
        <Modal
          visible={sortVisible}
          transparent
          animationType="slide"
          onRequestClose={() =>
            setSortVisible(false)
          }
        >
          <View style={styles.modalRoot}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={() =>
                setSortVisible(false)
              }
            />

            <View
              style={[
                styles.bottomSheet,
                styles.sortSheet,
              ]}
            >
              <View
                style={styles.sheetHandle}
              />

              <View style={styles.sheetHeader}>
                <View>
                  <Text
                    style={styles.sheetTitle}
                  >
                    Ordenar por
                  </Text>

                  <Text
                    style={styles.sheetSubtitle}
                  >
                    Encontre primeiro o que
                    procura
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    setSortVisible(false)
                  }
                  style={styles.sheetClose}
                >
                  <Ionicons
                    name="close"
                    size={19}
                    color={COLORS.text}
                  />
                </Pressable>
              </View>

              <View style={styles.sortOptions}>
                {SORT_OPTIONS.map((option) => {
                  const active =
                    sortMode === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.sortRow,
                        active &&
                          styles.sortRowActive,
                      ]}
                      onPress={() => {
                        setSortMode(
                          option.value,
                        );
                        setSortVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.sortText,
                          active &&
                            styles.sortTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>

                      {active && (
                        <View
                          style={
                            styles.sortCheck
                          }
                        >
                          <Ionicons
                            name="checkmark"
                            size={15}
                            color={
                              COLORS.white
                            }
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  /* HEADER */

  topBar: {
    height: 58,
    paddingHorizontal: 18,
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  searchHeaderButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },

  /* LIST */

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  /* LOCATION */

  locationSelector: {
    minHeight: 68,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  locationIconBox: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: '#F3F3F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  locationInfo: {
    flex: 1,
    marginLeft: 11,
  },

  locationCaption: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: COLORS.softMuted,
    marginBottom: 3,
  },

  locationValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },

  /* CATEGORIES */

  categorySection: {
    marginBottom: 14,
  },

  categoryScroll: {
    paddingRight: 8,
    gap: 8,
  },

  categoryItem: {
    height: 39,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  categoryItemActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },

  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },

  categoryTextActive: {
    color: COLORS.white,
  },

  /* CONTROLS */

  controlsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },

  controlButton: {
    minHeight: 39,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  controlButtonActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },

  controlText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },

  controlTextActive: {
    color: COLORS.white,
  },

  filterCount: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterCountText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.black,
  },

  /* RESULT HEADER */

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: COLORS.text,
  },

  resultSubtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.muted,
  },

  resetButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },

  resetButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
  },

  /* CARD */

  card: {
    width: '48.5%',
    borderRadius: 21,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.line,
  },

  imageContainer: {
    width: '100%',
    height: 166,
    position: 'relative',
    overflow: 'hidden',
  },

  cardImage: {
    width: '100%',
    height: '100%',
  },

  imageGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  premiumBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    height: 25,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  premiumText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: COLORS.gold,
  },

  favoriteButtonWrapper: {
    position: 'absolute',
    top: 9,
    right: 9,
  },

  favoriteButton: {
    width: 37,
    height: 37,
    borderRadius: 14,
    overflow: 'hidden',
  },

  favoriteBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  availableBadge: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },

  availableText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.success,
  },

  ratingBadge: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.72)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  ratingText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
  },

  cardContent: {
    padding: 11,
    paddingBottom: 13,
  },

  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  cardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },

  serviceText: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.muted,
  },

  locationRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  locationText: {
    flex: 1,
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.muted,
  },

  cardBottomRow: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  priceText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
  },

  reviewsText: {
    fontSize: 8,
    fontWeight: '500',
    color: COLORS.softMuted,
  },

  /* SEARCH MODAL */

  searchModalRoot: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  searchModalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },

  searchPanel: {
    marginTop: 72,
    marginHorizontal: 14,
    padding: 11,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    shadowOpacity: 0.18,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 12,
  },

  searchPanelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  searchPanelInputWrap: {
    flex: 1,
    height: 51,
    borderRadius: 17,
    backgroundColor: '#F4F4F2',
    borderWidth: 1,
    borderColor: COLORS.line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  searchPanelInput: {
    flex: 1,
    marginLeft: 9,
    paddingVertical: 0,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },

  searchCloseButton: {
    width: 51,
    height: 51,
    borderRadius: 17,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* MODALS */

  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },

  bottomSheet: {
    maxHeight: '88%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },

  sortSheet: {
    maxHeight: '65%',
  },

  sheetHandle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#D9D9D6',
    marginBottom: 18,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  sheetTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.4,
  },

  sheetSubtitle: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.muted,
  },

  sheetClose: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#F3F3F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionList: {
    paddingBottom: 20,
  },

  optionRow: {
    minHeight: 54,
    paddingHorizontal: 13,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  optionRowActive: {
    backgroundColor: '#F3F3F1',
  },

  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },

  optionTextActive: {
    fontWeight: '800',
  },

  /* FILTER */

  filterContent: {
    paddingBottom: 15,
  },

  filterLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
  },

  filterLabelSpacing: {
    marginTop: 20,
  },

  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  filterChip: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: '#F5F5F3',
    borderWidth: 1,
    borderColor: COLORS.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  filterChipActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },

  filterChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
  },

  filterChipTextActive: {
    color: COLORS.white,
  },

  toggleSection: {
    marginTop: 23,
  },

  toggleRow: {
    minHeight: 67,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  toggleInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  toggleIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: '#F3F3F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  toggleTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },

  toggleSubtitle: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: '500',
    color: COLORS.muted,
  },

  switchTrack: {
    width: 45,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#DDDDD9',
    padding: 3,
    justifyContent: 'center',
  },

  switchTrackActive: {
    backgroundColor: COLORS.black,
  },

  switchThumb: {
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: COLORS.white,
  },

  switchThumbActive: {
    alignSelf: 'flex-end',
  },

  filterActions: {
    flexDirection: 'row',
    gap: 9,
    paddingTop: 13,
  },

  clearButton: {
    width: 90,
    height: 51,
    borderRadius: 16,
    backgroundColor: '#F3F3F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
  },

  applyButton: {
    flex: 1,
    height: 51,
    borderRadius: 16,
    backgroundColor: COLORS.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  applyButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
  },

  /* SORT */

  sortOptions: {
    paddingBottom: 15,
  },

  sortRow: {
    minHeight: 53,
    paddingHorizontal: 14,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  sortRowActive: {
    backgroundColor: '#F3F3F1',
  },

  sortText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },

  sortTextActive: {
    fontWeight: '800',
  },

  sortCheck: {
    width: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* EMPTY */

  emptyState: {
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },

  emptyText: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.muted,
    textAlign: 'center',
  },

  emptyButton: {
    marginTop: 18,
    height: 43,
    paddingHorizontal: 17,
    borderRadius: 14,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },
});