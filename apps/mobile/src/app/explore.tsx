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

import type { BusinessDTO, BusinessSortBy } from '@slotix/types';
import { listBusinesses } from '../services/businesses';
import { getCurrentCoordinates, type Coordinates } from '../services/location';
import { useFavorites } from '../contexts/FavoritesContext';

type IconName = keyof typeof Ionicons.glyphMap;

type Category = {
  name: string;
  icon: IconName;
};

// `category` here is free text sent as-is to ?category= (the backend has no fixed
// category enum) — these are just convenient, common shortcuts, like any app's filter
// chips. "Todos" is a client-only sentinel meaning "no category filter".
type Filters = {
  category: string;
  radiusKm: number | null;
  maxPrice: number | null;
  minRating: number | null;
};

type SortMode = Extract<BusinessSortBy, 'recommended' | 'nearest'> | 'topRated';

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
    space: BusinessDTO;
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
        {space.imageUrl ? (
          <Image
            source={{ uri: space.imageUrl }}
            style={styles.spaceImage}
            contentFit="cover"
            transition={250}
          />
        ) : (
          <View style={[styles.spaceImage, styles.imageFallback]}>
            <Ionicons name="storefront-outline" size={26} color="rgba(0,0,0,0.20)" />
          </View>
        )}

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
              {space.ratingAvg !== null ? space.ratingAvg.toFixed(1) : 'Novo'}
            </Text>
          </View>

          {space.category ? (
            <Text style={styles.cardService}>
              {space.category}
            </Text>
          ) : null}
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

            <Text style={styles.metaText} numberOfLines={1}>
              {space.address ?? '—'}
            </Text>
          </View>

          {space.distanceKm !== null ? (
            <View style={styles.metaItem}>
              <Ionicons
                name="navigate-outline"
                size={13}
                color={COLORS.muted}
              />

              <Text style={styles.metaText}>
                {space.distanceKm.toFixed(1)} km
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            Avaliações
          </Text>

          <Text style={styles.priceValue}>
            {space.ratingCount > 0 ? `${space.ratingCount}` : 'Sem avaliações'}
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
    space: BusinessDTO;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.featuredCard,
        pressed && styles.cardPressed,
      ]}
    >
      {space.imageUrl ? (
        <Image
          source={{ uri: space.imageUrl }}
          style={styles.featuredImage}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View style={[styles.featuredImage, styles.imageFallback]}>
          <Ionicons name="storefront-outline" size={40} color="rgba(0,0,0,0.20)" />
        </View>
      )}

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
            {space.ratingAvg !== null ? space.ratingAvg.toFixed(1) : 'Novo'}
          </Text>
        </View>
      </View>

      <View style={styles.featuredBottom}>
        <Text style={styles.featuredName}>
          {space.name}
        </Text>

        {space.address ? (
          <View style={styles.featuredMeta}>
            <Ionicons
              name="location-outline"
              size={13}
              color="rgba(255,255,255,0.78)"
            />

            <Text style={styles.featuredLocation}>
              {space.address}
            </Text>
          </View>
        ) : null}

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
  const { isFavorite, toggleFavorite } = useFavorites();

  const [filters, setFilters] =
    useState<Filters>({
      category: 'Todos',
      radiusKm: null,
      maxPrice: null,
      minRating: null,
    });

  const [draftFilters, setDraftFilters] =
    useState<Filters>(filters);

  const [sortMode, setSortMode] =
    useState<SortMode>('recommended');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [coordinates, setCoordinates] =
    useState<Coordinates | null>(null);

  const [results, setResults] = useState<BusinessDTO[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Debounce search text so every keystroke doesn't fire a request.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // "nearest" only means something with the device's location — requested lazily, the
  // first time it's actually needed, rather than on screen mount.
  const ensureCoordinates = useCallback(async () => {
    if (coordinates) return coordinates;
    const current = await getCurrentCoordinates();
    setCoordinates(current);
    return current;
  }, [coordinates]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await listBusinesses({
          category: filters.category !== 'Todos' ? filters.category : undefined,
          search: debouncedSearch || undefined,
          maxPrice: filters.maxPrice ?? undefined,
          minRating: filters.minRating ?? undefined,
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
          radiusKm: filters.radiusKm ?? undefined,
          sortBy: sortMode,
          limit: 30,
        });
        if (!cancelled) setResults(data.data);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [filters, debouncedSearch, sortMode, coordinates]);

  const isBrowsing = debouncedSearch.length === 0 && filters.category === 'Todos' && filters.maxPrice === null && filters.minRating === null;

  // Reuses the one fetch above (already carrying distanceKm when coordinates are known)
  // instead of a second request — no separate "nearby" endpoint call needed.
  const nearbySpaces = useMemo(
    () =>
      coordinates
        ? [...results]
            .filter((space) => space.distanceKm !== null)
            .sort((a, b) => a.distanceKm! - b.distanceKm!)
            .slice(0, 6)
        : [],
    [results, coordinates],
  );

  const heroSpaces = isBrowsing ? results : [];

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
      radiusKm: null,
      maxPrice: null,
      minRating: null,
    };

    setDraftFilters(cleanFilters);
    setFilters(cleanFilters);
  }, []);

  const navigateToSpace = useCallback(
    (businessId: string) => {
      router.push({ pathname: '/space', params: { businessId } } as any);
    },
    [router],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.category !== 'Todos') {
      count++;
    }

    if (filters.radiusKm !== null) {
      count++;
    }

    if (filters.maxPrice !== null) {
      count++;
    }

    if (filters.minRating !== null) {
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

  const selectQuickCategory = useCallback(
    (category: string) => {
      setFilters((current) => ({
        ...current,
        category,
      }));
    },
    [],
  );

  const selectSortMode = useCallback(
    async (mode: SortMode) => {
      if (mode === 'nearest') {
        const current = await ensureCoordinates();
        if (!current) return; // permission denied — stay on the current mode
      }
      setSortMode(mode);
    },
    [ensureCoordinates],
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
            onPress={() => void ensureCoordinates()}
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
                {coordinates ? 'Perto de si' : 'Ativar localização'}
              </Text>
            </View>

            {!coordinates && (
              <Ionicons
                name="chevron-forward"
                size={15}
                color={COLORS.muted}
              />
            )}
          </Pressable>

          <View style={styles.headerRight}>
            {/* PESQUISA — MANTIDA NO TOPO */}

            <Pressable
              onPress={() => router.push('/search')}
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
              onPress={() => router.push('/perfil/notifications')}
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
              onPress={() => navigateToSpace(hero.id)}
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

        {/* NEARBY — only meaningful once the device shares its location */}

        {coordinates && (
          <View style={styles.section}>
            <SectionHeader
              title="Na sua região"
              subtitle={
                nearbySpaces.length > 0
                  ? 'Espaços mais próximos de si'
                  : undefined
              }
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
                      favorite={isFavorite(space.id)}
                      onFavorite={() =>
                        toggleFavorite(
                          space.id,
                        )
                      }
                      onPress={() =>
                        navigateToSpace(space.id)
                      }
                    />
                  ))}
              </View>
            ) : null}
          </View>
        )}

        {/* RESULTS — the current filtered/sorted list */}

        <View style={styles.section}>
          <SectionHeader
            title="Espaços"
            subtitle={
              loading
                ? 'A carregar…'
                : `${results.length} espaço${results.length === 1 ? '' : 's'} encontrado${results.length === 1 ? '' : 's'}`
            }
          />

          <View style={styles.sortRow}>
            {(
              [
                { mode: 'recommended' as SortMode, label: 'Recomendado' },
                { mode: 'topRated' as SortMode, label: 'Melhor avaliado' },
                { mode: 'nearest' as SortMode, label: 'Mais próximo' },
              ]
            ).map((option) => {
              const active = sortMode === option.mode;
              return (
                <Pressable
                  key={option.mode}
                  onPress={() => void selectSortMode(option.mode)}
                  style={[
                    styles.sortChip,
                    active && styles.sortChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      active && styles.sortChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {results.length > 0 ? (
            <View
              style={styles.verticalCards}
            >
              {results.map(
                (space) => (
                  <SpaceCard
                    key={space.id}
                    space={space}
                    favorite={isFavorite(space.id)}
                    onFavorite={() =>
                      toggleFavorite(
                        space.id,
                      )
                    }
                    onPress={() =>
                      navigateToSpace(space.id)
                    }
                  />
                ),
              )}
            </View>
          ) : !loading ? (
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

              {activeFilterCount > 0 || debouncedSearch.length > 0 ? (
                <Pressable
                  onPress={() => {
                    clearFilters();
                    setSearch('');
                  }}
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
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>

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
                      draftFilters.radiusKm ===
                      option.value;

                    return (
                      <Pressable
                        key={option.label}
                        onPress={() =>
                          setDraftFilters(
                            (current) => ({
                              ...current,
                              radiusKm:
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

  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  sortRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },

  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
  },

  sortChipActive: {
    backgroundColor: COLORS.black,
  },

  sortChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.black,
  },

  sortChipTextActive: {
    color: COLORS.white,
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

  sheetEyebrow: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: COLORS.accent,
    marginBottom: 5,
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