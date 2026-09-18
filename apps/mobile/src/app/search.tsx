
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import type { BusinessDTO, SearchResultDTO, SearchSortBy } from '@slotix/types';
import { search } from '../services/search';
import { getCurrentCoordinates, type Coordinates } from '../services/location';
import { useFavorites } from '../contexts/FavoritesContext';

/* -------------------------------------------------------------------------- */
/* COLORS                                                                     */
/* -------------------------------------------------------------------------- */

const COLORS = {
  background: '#F4F4F1',
  white: '#FFFFFF',
  black: '#0A0A0A',
  text: '#111111',
  secondary: '#666666',
  muted: '#999999',
  soft: '#F8F8F6',
  border: 'rgba(0,0,0,0.07)',
  blue: '#0758B8',
  gold: '#F4A000',
  red: '#E5484D',
};

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type Filter = 'Todos' | 'Mais perto' | 'Melhor avaliados' | 'Menor preço';

const FILTER_TO_SORT: Record<Filter, SearchSortBy> = {
  Todos: 'recommended',
  'Mais perto': 'nearest',
  'Melhor avaliados': 'topRated',
  'Menor preço': 'bestPrice',
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function formatPrice(value: number): string {
  return `${value.toLocaleString('pt-AO')} Kz`;
}

/* -------------------------------------------------------------------------- */
/* SCREEN                                                                     */
/* -------------------------------------------------------------------------- */

export default function SearchScreen() {
  const inputRef = useRef<TextInput>(null);
  const { isFavorite, toggleFavorite } = useFavorites();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('Todos');

  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  const [results, setResults] = useState<SearchResultDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const entrance = useRef(new Animated.Value(0)).current;

  /* ------------------------------------------------------------------------ */
  /* ENTRANCE                                                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  /* ------------------------------------------------------------------------ */
  /* DEBOUNCE                                                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  /* ------------------------------------------------------------------------ */
  /* LOCATION — requested lazily, only once "Mais perto" is actually picked   */
  /* ------------------------------------------------------------------------ */

  const ensureCoordinates = useCallback(async () => {
    if (coordinates) return coordinates;
    const current = await getCurrentCoordinates();
    setCoordinates(current);
    return current;
  }, [coordinates]);

  const selectFilter = useCallback(
    async (next: Filter) => {
      if (next === 'Mais perto') {
        const current = await ensureCoordinates();
        if (!current) {
          setFilter('Todos');
          return;
        }
      }

      setFilter(next);
    },
    [ensureCoordinates],
  );

  /* ------------------------------------------------------------------------ */
  /* RESULTS                                                                  */
  /* ------------------------------------------------------------------------ */

  const hasQuery = debouncedQuery.length > 0;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const response = await search({
          q: debouncedQuery,
          sortBy: FILTER_TO_SORT[filter],
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
        });
        if (!cancelled) setResults(response.data);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (hasQuery) {
      void load();
    } else {
      setResults([]);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, filter, coordinates, hasQuery]);

  /* ------------------------------------------------------------------------ */
  /* SEARCH FIELD                                                             */
  /* ------------------------------------------------------------------------ */

  const [focused, setFocused] = useState(false);

  const clearSearch = () => {
    setQuery('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const router = useRouter();

  const openSpace = (business: BusinessDTO) => {
    Keyboard.dismiss();
    router.push({ pathname: '/space', params: { businessId: business.id } } as any);
  };

  /* ------------------------------------------------------------------------ */
  /* ANIMATION                                                                */
  /* ------------------------------------------------------------------------ */

  const animatedStyle = {
    opacity: entrance,
    transform: [
      {
        translateY: entrance.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <View style={styles.container}>
        <View
          pointerEvents="none"
          style={styles.ambientOne}
        />

        <View
          pointerEvents="none"
          style={styles.ambientTwo}
        />

        <Animated.View
          style={[
            styles.flex,
            animatedStyle,
          ]}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {/* HEADER */}

            <View style={styles.header}>
              <Text style={styles.heroTitle}>
                Encontre o seu
                {'\n'}
                próximo espaço.
              </Text>

              <Text style={styles.heroSubtitle}>
                Serviços premium e experiências
                {'\n'}
                selecionadas para si.
              </Text>
            </View>

            {/* SEARCH */}

            <View
              style={[
                styles.searchContainer,
                focused &&
                  styles.searchContainerFocused,
              ]}
            >
              <View
                style={[
                  styles.searchIconBox,
                  focused &&
                    styles.searchIconBoxFocused,
                ]}
              >
                <View style={styles.searchIconDot} />
                <View style={styles.searchIconHandle} />
              </View>

              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                placeholder="Pesquisar espaços ou serviços"
                placeholderTextColor={COLORS.muted}
                style={styles.searchInput}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                selectionColor={COLORS.black}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onSubmitEditing={() => Keyboard.dismiss()}
              />

              {query.length > 0 && (
                <Pressable
                  onPress={clearSearch}
                  hitSlop={10}
                  style={({ pressed }) => [
                    styles.clearButton,
                    pressed && styles.smallPressed,
                  ]}
                >
                  <View style={styles.clearLineOne} />
                  <View style={styles.clearLineTwo} />
                </Pressable>
              )}
            </View>

            <Text style={styles.searchHint}>
              Pesquise por serviço, espaço ou categoria
            </Text>

            {/* RESULTS */}

            {hasQuery ? (
              <View style={styles.resultsSection}>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsTitle}>
                    Resultados
                  </Text>

                  <Text style={styles.resultsSubtitle}>
                    {loading
                      ? 'A procurar…'
                      : `${results.length} ${
                          results.length === 1
                            ? 'espaço encontrado'
                            : 'espaços encontrados'
                        }`}
                  </Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={
                    styles.filterList
                  }
                >
                  <FilterButton
                    label="Todos"
                    active={filter === 'Todos'}
                    onPress={() => void selectFilter('Todos')}
                  />

                  <FilterButton
                    label="Mais perto"
                    active={filter === 'Mais perto'}
                    onPress={() => void selectFilter('Mais perto')}
                  />

                  <FilterButton
                    label="Melhor avaliados"
                    active={filter === 'Melhor avaliados'}
                    onPress={() => void selectFilter('Melhor avaliados')}
                  />

                  <FilterButton
                    label="Menor preço"
                    active={filter === 'Menor preço'}
                    onPress={() => void selectFilter('Menor preço')}
                  />
                </ScrollView>

                <View style={styles.resultsList}>
                  {loading ? (
                    <View style={styles.loadingState}>
                      <ActivityIndicator size="large" color={COLORS.black} />
                    </View>
                  ) : results.length > 0 ? (
                    results.map((result, index) => (
                      <SearchResultCard
                        key={result.business.id}
                        result={result}
                        index={index}
                        favorite={isFavorite(result.business.id)}
                        onFavorite={() => void toggleFavorite(result.business.id)}
                        onPress={() => openSpace(result.business)}
                      />
                    ))
                  ) : (
                    <EmptySearch
                      query={debouncedQuery}
                      onClear={clearSearch}
                    />
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.promptState}>
                <View style={styles.promptIcon}>
                  <View style={styles.emptySearchCircle} />
                  <View style={styles.emptySearchHandle} />
                </View>

                <Text style={styles.promptTitle}>
                  O que procura hoje?
                </Text>

                <Text style={styles.promptDescription}>
                  Pesquise por um espaço, serviço ou categoria
                  {'\n'}
                  para ver resultados aqui.
                </Text>
              </View>
            )}

            <View style={styles.bottomSpace} />
          </ScrollView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/* FILTER                                                                     */
/* -------------------------------------------------------------------------- */

function FilterButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterButton,
        active && styles.filterButtonActive,
        pressed && styles.filterButtonPressed,
      ]}
    >
      <Text
        style={[
          styles.filterText,
          active && styles.filterTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* RESULT CARD                                                                */
/* -------------------------------------------------------------------------- */

function SearchResultCard({
  result,
  favorite,
  onFavorite,
  onPress,
  index,
}: {
  result: SearchResultDTO;
  favorite: boolean;
  onFavorite: () => void;
  onPress: () => void;
  index: number;
}) {
  const { business, matchedService } = result;

  const animation = useRef(
    new Animated.Value(0),
  ).current;

  const favoriteAnimation = useRef(
    new Animated.Value(1),
  ).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 420,
      delay: Math.min(index * 70, 210),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [animation, index]);

  const handleFavorite = () => {
    Animated.sequence([
      Animated.spring(favoriteAnimation, {
        toValue: 0.72,
        friction: 4,
        tension: 160,
        useNativeDriver: true,
      }),
      Animated.spring(favoriteAnimation, {
        toValue: 1,
        friction: 4,
        tension: 160,
        useNativeDriver: true,
      }),
    ]).start();

    onFavorite();
  };

  const animatedStyle = {
    opacity: animation,
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={animatedStyle}>
      <View style={styles.resultWrapper}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.resultCard,
            pressed && styles.resultCardPressed,
          ]}
        >
          {business.imageUrl ? (
            <Image
              source={{ uri: business.imageUrl }}
              style={styles.resultImage}
            />
          ) : (
            <View style={[styles.resultImage, styles.resultImageFallback]} />
          )}

          <View style={styles.resultContent}>
            {business.category ? (
              <View style={styles.resultCategoryRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {business.category}
                  </Text>
                </View>
              </View>
            ) : null}

            <Text
              style={styles.resultName}
              numberOfLines={1}
            >
              {business.name}
            </Text>

            <Text
              style={styles.resultService}
              numberOfLines={1}
            >
              {matchedService ? matchedService.name : (business.address ?? '—')}
            </Text>

            <View style={styles.resultMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.ratingStar}>
                  ★
                </Text>

                <Text style={styles.metaStrong}>
                  {business.ratingAvg !== null ? business.ratingAvg.toFixed(1) : 'Novo'}
                </Text>

                <Text style={styles.metaMuted}>
                  ({business.ratingCount})
                </Text>
              </View>

              {business.distanceKm !== null && (
                <>
                  <View style={styles.metaDot} />

                  <Text style={styles.metaMuted}>
                    {business.distanceKm.toFixed(1)} km
                  </Text>
                </>
              )}
            </View>

            {matchedService ? (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  A partir de
                </Text>

                <Text style={styles.price}>
                  {formatPrice(matchedService.price)}
                </Text>
              </View>
            ) : null}
          </View>
        </Pressable>

        <Pressable
          onPress={handleFavorite}
          hitSlop={8}
          style={({ pressed }) => [
            styles.favoriteButton,
            pressed && styles.favoritePressed,
          ]}
        >
          <Animated.View
            style={{
              transform: [
                {
                  scale: favoriteAnimation,
                },
              ],
            }}
          >
            <View
              style={[
                styles.heartShape,
                favorite &&
                  styles.heartShapeActive,
              ]}
            >
              <View
                style={[
                  styles.heartCircleLeft,
                  favorite &&
                    styles.heartActive,
                ]}
              />

              <View
                style={[
                  styles.heartCircleRight,
                  favorite &&
                    styles.heartActive,
                ]}
              />

              <View
                style={[
                  styles.heartTriangle,
                  favorite &&
                    styles.heartActive,
                ]}
              />
            </View>
          </Animated.View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

/* -------------------------------------------------------------------------- */
/* EMPTY                                                                      */
/* -------------------------------------------------------------------------- */

function EmptySearch({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  const animation = useRef(
    new Animated.Value(0),
  ).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(700),
      ]),
    );

    loop.start();

    return () => loop.stop();
  }, [animation]);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  return (
    <View style={styles.emptyState}>
      <Animated.View
        style={[
          styles.emptyIcon,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.emptySearchCircle} />
        <View style={styles.emptySearchHandle} />
      </Animated.View>

      <Text style={styles.emptyTitle}>
        Nenhum resultado
      </Text>

      <Text style={styles.emptyDescription}>
        Não encontramos espaços para
        {'\n'}
        "{query}".
      </Text>

      <Pressable
        onPress={onClear}
        style={({ pressed }) => [
          styles.emptyButton,
          pressed &&
            styles.emptyButtonPressed,
        ]}
      >
        <Text style={styles.emptyButtonText}>
          Nova pesquisa
        </Text>
      </Pressable>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  flex: {
    flex: 1,
  },

  ambientOne: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(255,255,255,0.58)',
    top: -120,
    right: -100,
  },

  ambientTwo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(225,225,220,0.35)',
    top: 350,
    left: -120,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 22,
  },

  heroTitle: {
    fontSize: 31,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: -1.3,
    color: COLORS.text,
  },

  heroSubtitle: {
    marginTop: 11,
    fontSize: 11.5,
    lineHeight: 18,
    color: COLORS.muted,
    fontWeight: '500',
  },

  searchContainer: {
    height: 64,
    borderRadius: 21,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.98)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.055,
    shadowRadius: 22,
    elevation: 3,
  },

  searchContainerFocused: {
    borderColor: 'rgba(0,0,0,0.13)',
  },

  searchIconBox: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchIconBoxFocused: {
    backgroundColor: '#F0F0ED',
  },

  searchIconDot: {
    width: 13,
    height: 13,
    borderWidth: 2,
    borderColor: COLORS.text,
    borderRadius: 7,
    position: 'absolute',
    top: 12,
    left: 13,
  },

  searchIconHandle: {
    width: 8,
    height: 2,
    borderRadius: 2,
    backgroundColor: COLORS.text,
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    right: 11,
    bottom: 12,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 13,
    fontSize: 12.5,
    color: COLORS.text,
    fontWeight: '600',
  },

  clearButton: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearLineOne: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    borderRadius: 2,
    backgroundColor: COLORS.text,
    transform: [{ rotate: '45deg' }],
  },

  clearLineTwo: {
    position: 'absolute',
    width: 12,
    height: 1.5,
    borderRadius: 2,
    backgroundColor: COLORS.text,
    transform: [{ rotate: '-45deg' }],
  },

  smallPressed: {
    transform: [{ scale: 0.9 }],
  },

  searchHint: {
    marginTop: 10,
    marginLeft: 4,
    fontSize: 9.5,
    color: COLORS.muted,
    fontWeight: '500',
  },

  promptState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  promptIcon: {
    width: 72,
    height: 72,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  promptTitle: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  promptDescription: {
    marginTop: 8,
    fontSize: 11.5,
    lineHeight: 19,
    color: COLORS.muted,
    textAlign: 'center',
  },

  resultsSection: {
    marginTop: 30,
  },

  resultsHeader: {
    marginBottom: 16,
  },

  resultsTitle: {
    fontSize: 23,
    lineHeight: 27,
    color: COLORS.text,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  resultsSubtitle: {
    marginTop: 5,
    fontSize: 10.5,
    color: COLORS.muted,
    fontWeight: '500',
  },

  filterList: {
    paddingRight: 20,
    paddingBottom: 20,
  },

  filterButton: {
    height: 38,
    paddingHorizontal: 13,
    marginRight: 8,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },

  filterButtonPressed: {
    transform: [{ scale: 0.96 }],
  },

  filterText: {
    fontSize: 10,
    color: COLORS.secondary,
    fontWeight: '800',
  },

  filterTextActive: {
    color: COLORS.white,
  },

  resultsList: {
    marginTop: 1,
  },

  loadingState: {
    paddingVertical: 50,
    alignItems: 'center',
  },

  resultWrapper: {
    position: 'relative',
    marginBottom: 13,
  },

  resultCard: {
    minHeight: 143,
    padding: 9,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.035,
    shadowRadius: 16,
    elevation: 1,
  },

  resultCardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },

  resultImage: {
    width: 108,
    height: 125,
    borderRadius: 17,
    backgroundColor: COLORS.soft,
  },

  resultImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultContent: {
    flex: 1,
    paddingLeft: 13,
    paddingTop: 2,
    paddingBottom: 1,
  },

  resultCategoryRow: {
    height: 22,
    paddingRight: 34,
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    height: 21,
    paddingHorizontal: 8,
    borderRadius: 7,
    backgroundColor: 'rgba(7,88,184,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryBadgeText: {
    fontSize: 7.5,
    color: COLORS.blue,
    fontWeight: '900',
    letterSpacing: 0.65,
    textTransform: 'uppercase',
  },

  resultName: {
    marginTop: 5,
    fontSize: 14.5,
    lineHeight: 18,
    color: COLORS.text,
    fontWeight: '900',
    letterSpacing: -0.3,
    paddingRight: 30,
  },

  resultService: {
    marginTop: 3,
    fontSize: 10.5,
    color: COLORS.secondary,
    fontWeight: '500',
  },

  resultMeta: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingStar: {
    fontSize: 11,
    color: COLORS.gold,
  },

  metaStrong: {
    marginLeft: 4,
    fontSize: 9.5,
    color: COLORS.text,
    fontWeight: '800',
  },

  metaMuted: {
    marginLeft: 3,
    fontSize: 9.5,
    color: COLORS.muted,
    fontWeight: '500',
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 8,
    backgroundColor: '#D5D5D5',
  },

  priceRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  priceLabel: {
    fontSize: 8,
    color: COLORS.muted,
    fontWeight: '500',
    marginRight: 5,
  },

  price: {
    fontSize: 11.5,
    color: COLORS.text,
    fontWeight: '900',
  },

  favoriteButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  favoritePressed: {
    transform: [{ scale: 0.9 }],
  },

  heartShape: {
    width: 18,
    height: 17,
    position: 'relative',
  },

  heartCircleLeft: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.6,
    borderColor: COLORS.text,
    left: 1,
    top: 1,
  },

  heartCircleRight: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.6,
    borderColor: COLORS.text,
    right: 1,
    top: 1,
  },

  heartTriangle: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRightWidth: 1.6,
    borderBottomWidth: 1.6,
    borderColor: COLORS.text,
    left: 3.5,
    top: 4,
    transform: [{ rotate: '45deg' }],
  },

  heartActive: {
    borderColor: COLORS.red,
    backgroundColor: COLORS.red,
  },

  heartShapeActive: {
    transform: [{ scale: 1.02 }],
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptySearchCircle: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.muted,
    position: 'absolute',
    top: 22,
    left: 22,
  },

  emptySearchHandle: {
    width: 10,
    height: 2,
    borderRadius: 2,
    backgroundColor: COLORS.muted,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    right: 20,
    bottom: 24,
  },

  emptyTitle: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  emptyDescription: {
    marginTop: 8,
    fontSize: 11.5,
    lineHeight: 19,
    color: COLORS.muted,
    textAlign: 'center',
  },

  emptyButton: {
    height: 45,
    paddingHorizontal: 22,
    marginTop: 21,
    borderRadius: 14,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyButtonPressed: {
    transform: [{ scale: 0.96 }],
  },

  emptyButtonText: {
    fontSize: 10.5,
    color: COLORS.white,
    fontWeight: '900',
  },

  bottomSpace: {
    height: 30,
  },
});
