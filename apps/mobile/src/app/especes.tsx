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

import type { BusinessDTO, BusinessSortBy } from '@slotix/types';
import { listBusinesses } from '../services/businesses';
import { getCurrentCoordinates, type Coordinates } from '../services/location';
import { useFavorites } from '../contexts/FavoritesContext';

type IconName = keyof typeof Ionicons.glyphMap;

type CategoryOption = {
  label: string;
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

const CATEGORIES: CategoryOption[] = [
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

const SORT_MODES: { mode: SortMode; label: string }[] = [
  {
    mode: 'recommended',
    label: 'Recomendado',
  },
  {
    mode: 'topRated',
    label: 'Melhor avaliado',
  },
  {
    mode: 'nearest',
    label: 'Mais próximo',
  },
];

type SpaceCardProps = {
  space: BusinessDTO;
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
            {space.imageUrl ? (
              <Image
                source={{ uri: space.imageUrl }}
                style={styles.cardImage}
                contentFit="cover"
                transition={250}
              />
            ) : (
              <View style={[styles.cardImage, styles.imageFallback]}>
                <Ionicons name="storefront-outline" size={26} color="rgba(0,0,0,0.20)" />
              </View>
            )}

            <LinearGradient
              colors={[
                'rgba(0,0,0,0.04)',
                'rgba(0,0,0,0.08)',
                'rgba(0,0,0,0.68)',
              ]}
              style={styles.imageGradient}
            />

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

            <View style={styles.ratingBadge}>
              <Ionicons
                name="star"
                size={12}
                color="#F2B84B"
              />

              <Text style={styles.ratingText}>
                {space.ratingAvg !== null ? space.ratingAvg.toFixed(1) : 'Novo'}
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

            {space.category ? (
              <Text
                style={styles.serviceText}
                numberOfLines={1}
              >
                {space.category}
              </Text>
            ) : null}

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
                {space.address ?? '—'}
              </Text>
            </View>

            <View style={styles.cardBottomRow}>
              <Text style={styles.priceText}>
                {space.ratingCount > 0 ? `${space.ratingCount} avaliações` : 'Sem avaliações'}
              </Text>

              {space.distanceKm !== null ? (
                <Text style={styles.reviewsText}>
                  {space.distanceKm.toFixed(1)} km
                </Text>
              ) : null}
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
  const { isFavorite, toggleFavorite } = useFavorites();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);

  const [coordinates, setCoordinates] =
    useState<Coordinates | null>(null);

  const [results, setResults] = useState<BusinessDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<Filters>({
    category: 'Todos',
    radiusKm: null,
    maxPrice: null,
    minRating: null,
  });

  const [draftFilters, setDraftFilters] =
    useState<Filters>(filters);

  const [sortMode, setSortMode] =
    useState<SortMode>('recommended');

  const [filterVisible, setFilterVisible] =
    useState(false);

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

  const activeFilterCount = useMemo(() => {
    let count = 0;

    if (filters.category !== 'Todos') count += 1;
    if (filters.radiusKm !== null) count += 1;
    if (filters.maxPrice !== null) count += 1;
    if (filters.minRating !== null) count += 1;

    return count;
  }, [filters]);

  const navigateToSpace = useCallback(
    (businessId: string) => {
      router.push({ pathname: '/space', params: { businessId } } as any);
    },
    [router],
  );

  const openFilters = useCallback(() => {
    setDraftFilters(filters);
    setFilterVisible(true);
  }, [filters]);

  const closeFilters = useCallback(() => {
    setFilterVisible(false);
  }, []);

  const applyFilters = useCallback(() => {
    setFilters(draftFilters);
    closeFilters();
  }, [draftFilters, closeFilters]);

  const clearFilters = useCallback(() => {
    const emptyFilters: Filters = {
      category: 'Todos',
      radiusKm: null,
      maxPrice: null,
      minRating: null,
    };

    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
  }, []);

  const resetEverything = useCallback(() => {
    setSearch('');
    clearFilters();
    setSortMode('recommended');
  }, [clearFilters]);

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

  const renderSpace = useCallback(
    ({ item }: { item: BusinessDTO }) => (
      <SpaceCard
        space={item}
        favorite={isFavorite(item.id)}
        onToggleFavorite={toggleFavorite}
        onPress={navigateToSpace}
      />
    ),
    [isFavorite, toggleFavorite, navigateToSpace],
  );

  const keyExtractor = useCallback(
    (item: BusinessDTO) => item.id,
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
          data={results}
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
                onPress={() => void ensureCoordinates()}
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
                    {coordinates ? 'Perto de si' : 'Ativar localização'}
                  </Text>
                </View>

                {!coordinates && (
                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color={COLORS.muted}
                  />
                )}
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
                      filters.category ===
                      category.label;

                    return (
                      <Pressable
                        key={category.label}
                        onPress={() =>
                          selectQuickCategory(
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
                    {loading
                      ? 'A carregar…'
                      : `${results.length} disponíve${results.length === 1 ? 'l' : 'is'}`}
                  </Text>
                </View>

                {(search.length > 0 || activeFilterCount > 0) && (
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

              {/* SORT */}
              <View style={styles.sortRow}>
                {SORT_MODES.map((option) => {
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
            </>
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  A carregar espaços…
                </Text>
              </View>
            ) : (
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
            )
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

        {/* FILTER MODAL */}
        <Modal
          visible={filterVisible}
          transparent
          animationType="slide"
          onRequestClose={closeFilters}
        >
          <View style={styles.modalRoot}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={closeFilters}
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
                  onPress={closeFilters}
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
                            {new Intl.NumberFormat('pt-AO').format(price)} Kz
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
                      draftFilters.radiusKm ===
                      distance;

                    return (
                      <Pressable
                        key={distance}
                        onPress={() =>
                          setDraftFilters(
                            (current) => ({
                              ...current,
                              radiusKm:
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

  /* SORT */

  sortRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },

  sortChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },

  sortChipActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },

  sortChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.text,
  },

  sortChipTextActive: {
    color: COLORS.white,
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

  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDEDED',
  },

  imageGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
