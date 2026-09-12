
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
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

type Space = {
  id: string;
  name: string;
  category: string;
  service: string;
  location: string;
  rating: number;
  reviews: number;
  distance: number;
  price: number;
  image: string;
};

type Filter =
  | 'Todos'
  | 'Mais perto'
  | 'Melhor avaliados'
  | 'Menor preço';

/* -------------------------------------------------------------------------- */
/* DATA                                                                       */
/* -------------------------------------------------------------------------- */

const spaces: Space[] = [
  {
    id: '1',
    name: 'Barbearia Executive',
    category: 'Barbearia',
    service: 'Corte + Barba',
    location: 'Alvalade',
    rating: 4.9,
    reviews: 128,
    distance: 1.2,
    price: 3500,
    image:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '2',
    name: 'Lumina Nails & Spa',
    category: 'Nails',
    service: 'Manicure Premium',
    location: 'Talatona',
    rating: 4.8,
    reviews: 94,
    distance: 2.5,
    price: 5000,
    image:
      'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '3',
    name: 'The Royal Spa',
    category: 'SPA',
    service: 'Ritual Relax',
    location: 'Ilha de Luanda',
    rating: 5.0,
    reviews: 76,
    distance: 3.8,
    price: 12000,
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '4',
    name: "Gentleman's Club",
    category: 'Barbearia',
    service: 'Corte masculino',
    location: 'Alvalade',
    rating: 4.9,
    reviews: 112,
    distance: 1.2,
    price: 3500,
    image:
      'https://images.unsplash.com/photo-1599351431202-1e0f0d5c9f4e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '5',
    name: 'Lumina Beauty Studio',
    category: 'Salão',
    service: 'Corte & Escova',
    location: 'Miramar',
    rating: 4.8,
    reviews: 83,
    distance: 2.0,
    price: 6000,
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: '6',
    name: 'Glow Skin Studio',
    category: 'Estética',
    service: 'Limpeza de pele',
    location: 'Talatona',
    rating: 4.7,
    reviews: 61,
    distance: 2.9,
    price: 7000,
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
  },
];

const categories = [
  'Barbearia',
  'Salão',
  'Nails',
  'SPA',
  'Estética',
];

const initialRecentSearches = [
  'Corte masculino',
  'Manicure',
  'SPA',
];

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function formatPrice(value: number): string {
  return `${value.toLocaleString('pt-AO')} Kz`;
}

/* -------------------------------------------------------------------------- */
/* SCREEN                                                                     */
/* -------------------------------------------------------------------------- */

export default function SearchScreen() {
  const inputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('Todos');
  const [focused, setFocused] = useState(false);

  const [recentSearches, setRecentSearches] = useState<string[]>(
    initialRecentSearches,
  );

  const [favorites, setFavorites] = useState<string[]>([]);

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
  /* RESULTS                                                                  */
  /* ------------------------------------------------------------------------ */

  const results = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    let filtered = [...spaces];

    if (normalizedQuery.length > 0) {
      filtered = spaces.filter((space) => {
        const searchableText = normalizeText(
          [
            space.name,
            space.category,
            space.service,
            space.location,
          ].join(' '),
        );

        return searchableText.includes(normalizedQuery);
      });
    }

    switch (filter) {
      case 'Mais perto':
        filtered.sort((a, b) => a.distance - b.distance);
        break;

      case 'Melhor avaliados':
        filtered.sort((a, b) => b.rating - a.rating);
        break;

      case 'Menor preço':
        filtered.sort((a, b) => a.price - b.price);
        break;
    }

    return filtered;
  }, [query, filter]);

  const hasQuery = query.trim().length > 0;

  /* ------------------------------------------------------------------------ */
  /* SEARCH                                                                   */
  /* ------------------------------------------------------------------------ */

  const executeSearch = (value: string) => {
    const cleanValue = value.trim();

    setQuery(cleanValue);
    setFilter('Todos');

    if (!cleanValue) {
      return;
    }

    setRecentSearches((current) => {
      const filtered = current.filter(
        (item) =>
          normalizeText(item) !== normalizeText(cleanValue),
      );

      return [cleanValue, ...filtered].slice(0, 5);
    });
  };

  const clearSearch = () => {
    setQuery('');
    setFilter('Todos');

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const selectCategory = (category: string) => {
    executeSearch(category);
    Keyboard.dismiss();
  };

  const removeRecentSearch = (value: string) => {
    setRecentSearches((current) =>
      current.filter((item) => item !== value),
    );
  };

  /* ------------------------------------------------------------------------ */
  /* FAVORITES                                                                */
  /* ------------------------------------------------------------------------ */

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      return [...current, id];
    });
  };

  /* ------------------------------------------------------------------------ */
  /* OPEN SPACE                                                               */
  /* ------------------------------------------------------------------------ */

  const openSpace = (space: Space) => {
    Keyboard.dismiss();

    /*
      A navegação para o espaço será adicionada
      quando a página /space/[id] estiver pronta.

      Por enquanto apenas colocamos o nome na pesquisa.
    */

    executeSearch(space.name);
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
                onChangeText={(value) => {
                  setQuery(value);
                  setFilter('Todos');
                }}
                placeholder="Pesquisar espaços ou serviços"
                placeholderTextColor={COLORS.muted}
                style={styles.searchInput}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                selectionColor={COLORS.black}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onSubmitEditing={() => {
                  executeSearch(query);
                  Keyboard.dismiss();
                }}
              />

              {hasQuery && (
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

            {/* HOME */}

            {!hasQuery && (
              <>
                {recentSearches.length > 0 && (
                  <View style={styles.section}>
                    <SectionHeader
                      title="Pesquisas recentes"
                      subtitle="Continue de onde parou"
                      action="Limpar"
                      onAction={() =>
                        setRecentSearches([])
                      }
                    />

                    <View style={styles.recentCard}>
                      {recentSearches.map(
                        (search, index) => (
                          <View
                            key={`${search}-${index}`}
                            style={[
                              styles.recentRow,
                              index ===
                                recentSearches.length - 1 &&
                                styles.recentRowLast,
                            ]}
                          >
                            <Pressable
                              onPress={() =>
                                executeSearch(search)
                              }
                              style={styles.recentMain}
                            >
                              <View style={styles.recentIcon}>
                                <View style={styles.clockOuter}>
                                  <View
                                    style={
                                      styles.clockHandVertical
                                    }
                                  />
                                  <View
                                    style={
                                      styles.clockHandHorizontal
                                    }
                                  />
                                </View>
                              </View>

                              <Text style={styles.recentText}>
                                {search}
                              </Text>
                            </Pressable>

                            <Pressable
                              onPress={() =>
                                removeRecentSearch(search)
                              }
                              hitSlop={10}
                              style={styles.removeRecent}
                            >
                              <View
                                style={styles.removeLineOne}
                              />
                              <View
                                style={styles.removeLineTwo}
                              />
                            </Pressable>
                          </View>
                        ),
                      )}
                    </View>
                  </View>
                )}

                {/* CATEGORIES */}

                <View style={styles.section}>
                  <SectionHeader
                    title="Categorias"
                    subtitle="Escolha uma experiência"
                  />

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={
                      styles.categoryList
                    }
                  >
                    {categories.map((category, index) => (
                      <Pressable
                        key={category}
                        onPress={() =>
                          selectCategory(category)
                        }
                        style={({ pressed }) => [
                          styles.categoryCard,
                          pressed &&
                            styles.categoryCardPressed,
                        ]}
                      >
                        <View
                          style={styles.categoryVisual}
                        >
                          <Text
                            style={
                              styles.categoryNumber
                            }
                          >
                            {String(index + 1).padStart(
                              2,
                              '0',
                            )}
                          </Text>
                        </View>

                        <Text
                          style={styles.categoryText}
                        >
                          {category}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* FEATURED */}

                <View style={styles.section}>
                  <SectionHeader
                    title="Selecionados para si"
                    subtitle="Espaços de destaque"
                    badge="03"
                  />

                  {spaces.slice(0, 3).map(
                    (space, index) => (
                      <SearchResultCard
                        key={space.id}
                        space={space}
                        index={index}
                        favorite={favorites.includes(
                          space.id,
                        )}
                        onFavorite={() =>
                          toggleFavorite(space.id)
                        }
                        onPress={() =>
                          openSpace(space)
                        }
                      />
                    ),
                  )}
                </View>
              </>
            )}

            {/* RESULTS */}

            {hasQuery && (
              <View style={styles.resultsSection}>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsTitle}>
                    Resultados
                  </Text>

                  <Text style={styles.resultsSubtitle}>
                    {results.length}{' '}
                    {results.length === 1
                      ? 'espaço encontrado'
                      : 'espaços encontrados'}
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
                    onPress={() =>
                      setFilter('Todos')
                    }
                  />

                  <FilterButton
                    label="Mais perto"
                    active={filter === 'Mais perto'}
                    onPress={() =>
                      setFilter('Mais perto')
                    }
                  />

                  <FilterButton
                    label="Melhor avaliados"
                    active={
                      filter === 'Melhor avaliados'
                    }
                    onPress={() =>
                      setFilter('Melhor avaliados')
                    }
                  />

                  <FilterButton
                    label="Menor preço"
                    active={
                      filter === 'Menor preço'
                    }
                    onPress={() =>
                      setFilter('Menor preço')
                    }
                  />
                </ScrollView>

                <View style={styles.resultsList}>
                  {results.length > 0 ? (
                    results.map((space, index) => (
                      <SearchResultCard
                        key={space.id}
                        space={space}
                        index={index}
                        favorite={favorites.includes(
                          space.id,
                        )}
                        onFavorite={() =>
                          toggleFavorite(space.id)
                        }
                        onPress={() =>
                          openSpace(space)
                        }
                      />
                    ))
                  ) : (
                    <EmptySearch
                      query={query}
                      onClear={clearSearch}
                    />
                  )}
                </View>
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
/* SECTION HEADER                                                             */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  title,
  subtitle,
  action,
  onAction,
  badge,
}: {
  title: string;
  subtitle: string;
  action?: string;
  onAction?: () => void;
  badge?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        <Text style={styles.sectionSubtitle}>
          {subtitle}
        </Text>
      </View>

      {action && onAction && (
        <Pressable
          onPress={onAction}
          hitSlop={8}
        >
          <Text style={styles.sectionAction}>
            {action}
          </Text>
        </Pressable>
      )}

      {badge && (
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>
            {badge}
          </Text>
        </View>
      )}
    </View>
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
  space,
  favorite,
  onFavorite,
  onPress,
  index,
}: {
  space: Space;
  favorite: boolean;
  onFavorite: () => void;
  onPress: () => void;
  index: number;
}) {
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
          <Image
            source={{ uri: space.image }}
            style={styles.resultImage}
          />

          <View style={styles.resultContent}>
            <View style={styles.resultCategoryRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {space.category}
                </Text>
              </View>
            </View>

            <Text
              style={styles.resultName}
              numberOfLines={1}
            >
              {space.name}
            </Text>

            <Text
              style={styles.resultService}
              numberOfLines={1}
            >
              {space.service}
            </Text>

            <View style={styles.resultMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.ratingStar}>
                  ★
                </Text>

                <Text style={styles.metaStrong}>
                  {space.rating.toFixed(1)}
                </Text>

                <Text style={styles.metaMuted}>
                  ({space.reviews})
                </Text>
              </View>

              <View style={styles.metaDot} />

              <Text style={styles.metaMuted}>
                {space.distance} km
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                A partir de
              </Text>

              <Text style={styles.price}>
                {formatPrice(space.price)}
              </Text>
            </View>
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

  section: {
    marginTop: 34,
  },

  sectionHeader: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 18,
    lineHeight: 22,
    color: COLORS.text,
    fontWeight: '900',
    letterSpacing: -0.55,
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '500',
  },

  sectionAction: {
    fontSize: 10.5,
    color: COLORS.blue,
    fontWeight: '900',
  },

  sectionBadge: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionBadgeText: {
    fontSize: 9,
    color: COLORS.white,
    fontWeight: '900',
  },

  recentCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.025,
    shadowRadius: 14,
    elevation: 1,
  },

  recentRow: {
    minHeight: 59,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  recentRowLast: {
    borderBottomWidth: 0,
  },

  recentMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  recentIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    marginRight: 11,
    backgroundColor: COLORS.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clockOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
  },

  clockHandVertical: {
    position: 'absolute',
    width: 1.3,
    height: 5,
    backgroundColor: COLORS.secondary,
    left: 5.5,
    top: 2,
  },

  clockHandHorizontal: {
    position: 'absolute',
    width: 4,
    height: 1.3,
    backgroundColor: COLORS.secondary,
    left: 6,
    top: 6,
    transform: [{ rotate: '25deg' }],
  },

  recentText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '700',
  },

  removeRecent: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeLineOne: {
    position: 'absolute',
    width: 10,
    height: 1.5,
    backgroundColor: COLORS.muted,
    transform: [{ rotate: '45deg' }],
  },

  removeLineTwo: {
    position: 'absolute',
    width: 10,
    height: 1.5,
    backgroundColor: COLORS.muted,
    transform: [{ rotate: '-45deg' }],
  },

  categoryList: {
    paddingRight: 20,
  },

  categoryCard: {
    width: 94,
    height: 105,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.025,
    shadowRadius: 12,
    elevation: 1,
  },

  categoryCardPressed: {
    transform: [{ scale: 0.96 }],
  },

  categoryVisual: {
    width: 44,
    height: 44,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryNumber: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  categoryText: {
    fontSize: 10,
    color: COLORS.text,
    fontWeight: '900',
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

  resultsSection: {
    marginTop: 34,
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

