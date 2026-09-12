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
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

type FavoriteSpace = {
  name: string;
  category: string;
  location: string;
  rating: string;
  reviews: string;
  image: string;
  service: string;
  duration: string;
  price: string;
  featured?: boolean;
};

const FAVORITES: FavoriteSpace[] = [
  {
    name: 'Maison Noir',
    category: 'Barbearia Premium',
    location: 'Talatona',
    rating: '4.9',
    reviews: '128',
    image:
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1400&q=90',
    service: 'Corte + Barba',
    duration: '60 min',
    price: '18.000 Kz',
    featured: true,
  },
  {
    name: 'The Gentlemen Club',
    category: 'Barbearia',
    location: 'Ilha de Luanda',
    rating: '4.8',
    reviews: '96',
    image:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1400&q=90',
    service: 'Corte Premium',
    duration: '45 min',
    price: '15.000 Kz',
  },
  {
    name: 'Lumière Beauty',
    category: 'Beauty & Wellness',
    location: 'Miramar',
    rating: '5.0',
    reviews: '74',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=90',
    service: 'Beauty Experience',
    duration: '90 min',
    price: '25.000 Kz',
    featured: true,
  },
  {
    name: 'Atelier 24',
    category: 'Hair Studio',
    location: 'Ingombota',
    rating: '4.9',
    reviews: '61',
    image:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=90',
    service: 'Hair Styling',
    duration: '75 min',
    price: '20.000 Kz',
  },
];

const FILTERS = ['Todos', 'Barbearia', 'Beauty', 'Hair'];

function getCategory(item: FavoriteSpace) {
  const value =
    `${item.name} ${item.category}`.toLowerCase();

  if (
    value.includes('barbear') ||
    value.includes('barber') ||
    value.includes('gentlemen')
  ) {
    return 'Barbearia';
  }

  if (
    value.includes('beauty') ||
    value.includes('wellness') ||
    value.includes('beleza')
  ) {
    return 'Beauty';
  }

  if (
    value.includes('hair') ||
    value.includes('cabelo') ||
    value.includes('studio')
  ) {
    return 'Hair';
  }

  return 'Todos';
}

type FavoriteCardProps = {
  item: FavoriteSpace;
  onRemove: (name: string) => void;
  onOpen: (item: FavoriteSpace) => void;
};

const FavoriteCard = memo(function FavoriteCard({
  item,
  onRemove,
  onOpen,
}: FavoriteCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.985,
      damping: 18,
      stiffness: 280,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 16,
      stiffness: 250,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const handleOpen = useCallback(() => {
    onOpen(item);
  }, [item, onOpen]);

  const handleRemove = useCallback(() => {
    onRemove(item.name);
  }, [item.name, onRemove]);

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
        onPress={handleOpen}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.imageOverlay} />

          <Pressable
            onPress={handleRemove}
            hitSlop={12}
            style={styles.heartButton}
          >
            <Ionicons
              name="heart"
              size={19}
              color="#111111"
            />
          </Pressable>

          <View style={styles.imageInfo}>
            <Text style={styles.category}>
              {item.category}
            </Text>

            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.locationLine}>
            <Ionicons
              name="location-outline"
              size={15}
              color="#777772"
            />

            <Text style={styles.location}>
              {item.location}
            </Text>
          </View>

          <View style={styles.mainInfo}>
            <View style={styles.serviceInfo}>
              <Text style={styles.service}>
                {item.service}
              </Text>

              <View style={styles.meta}>
                <View style={styles.rating}>
                  <Ionicons
                    name="star"
                    size={12}
                    color="#111111"
                  />

                  <Text style={styles.ratingText}>
                    {item.rating}
                  </Text>

                  <Text style={styles.reviews}>
                    {item.reviews}
                  </Text>
                </View>

                <View style={styles.metaDivider} />

                <Text style={styles.duration}>
                  {item.duration}
                </Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {item.price}
              </Text>

              <Text style={styles.priceCaption}>
                a partir de
              </Text>
            </View>
          </View>

          <View style={styles.cardAction}>
            <Text style={styles.actionText}>
              Ver espaço
            </Text>

            <View style={styles.actionIcon}>
              <Ionicons
                name="arrow-forward"
                size={15}
                color="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

export default function FavoritesScreen() {
  const router = useRouter();

  const [favorites, setFavorites] =
    useState<FavoriteSpace[]>(FAVORITES);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] =
    useState('Todos');

  const [toast, setToast] = useState('');

  const toastOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const showToast = useCallback(
    (message: string) => {
      setToast(message);

      Animated.sequence([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),

        Animated.delay(1600),

        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToast('');
      });
    },
    [toastOpacity],
  );

  const handleRemove = useCallback(
    (name: string) => {
      setFavorites((current) =>
        current.filter(
          (item) => item.name !== name,
        ),
      );

      showToast('Removido dos favoritos');
    },
    [showToast],
  );

  const handleOpen = useCallback(
    (_item: FavoriteSpace) => {
      showToast('Detalhes do espaço em breve');
    },
    [showToast],
  );

  const filteredFavorites = useMemo(() => {
    const query = search.trim().toLowerCase();

    return favorites.filter((item) => {
      const matchesFilter =
        activeFilter === 'Todos' ||
        getCategory(item) === activeFilter;

      if (!matchesFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const content = [
        item.name,
        item.category,
        item.location,
        item.service,
      ]
        .join(' ')
        .toLowerCase();

      return content.includes(query);
    });
  }, [
    favorites,
    search,
    activeFilter,
  ]);

  const clearSearch = useCallback(() => {
    setSearch('');
    Keyboard.dismiss();
  }, []);

  const goToExplore = useCallback(() => {
    router.push('/explore');
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: FavoriteSpace }) => (
      <FavoriteCard
        item={item}
        onRemove={handleRemove}
        onOpen={handleOpen}
      />
    ),
    [handleRemove, handleOpen],
  );

  const keyExtractor = useCallback(
    (item: FavoriteSpace) => item.name,
    [],
  );

  const header = useMemo(
    () => (
      <View>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              FAVORITOS
            </Text>

            <Text style={styles.title}>
              Guardados
            </Text>

            <Text style={styles.subtitle}>
              Os espaços que escolheu.
            </Text>
          </View>

          <View style={styles.counter}>
            <Ionicons
              name="heart"
              size={18}
              color="#111111"
            />

            <Text style={styles.counterText}>
              {favorites.length}
            </Text>
          </View>
        </View>

        <View style={styles.search}>
          <Ionicons
            name="search"
            size={18}
            color="#777772"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Pesquisar"
            placeholderTextColor="#999994"
            style={styles.searchInput}
            returnKeyType="search"
            autoCorrect={false}
            selectionColor="#111111"
          />

          {search.length > 0 ? (
            <Pressable
              onPress={clearSearch}
              hitSlop={10}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color="#777772"
              />
            </Pressable>
          ) : null}
        </View>

        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filters
          }
          renderItem={({ item }) => {
            const active =
              item === activeFilter;

            return (
              <Pressable
                onPress={() =>
                  setActiveFilter(item)
                }
                style={[
                  styles.filter,
                  active &&
                    styles.filterActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active &&
                      styles.filterTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />

        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>
            {filteredFavorites.length}{' '}
            {filteredFavorites.length === 1
              ? 'espaço'
              : 'espaços'}
          </Text>
        </View>
      </View>
    ),
    [
      favorites.length,
      search,
      clearSearch,
      activeFilter,
      filteredFavorites.length,
    ],
  );

  const empty = useMemo(
    () => (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Ionicons
            name="heart-outline"
            size={28}
            color="#111111"
          />
        </View>

        <Text style={styles.emptyTitle}>
          A sua coleção está vazia
        </Text>

        <Text style={styles.emptyText}>
          Guarde os espaços que mais gosta
          e encontre-os aqui quando quiser.
        </Text>

        <Pressable
          onPress={
            search
              ? clearSearch
              : goToExplore
          }
          style={styles.emptyButton}
        >
          <Text style={styles.emptyButtonText}>
            {search
              ? 'Limpar pesquisa'
              : 'Explorar espaços'}
          </Text>

          <Ionicons
            name="arrow-forward"
            size={15}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    ),
    [
      search,
      clearSearch,
      goToExplore,
    ],
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <View style={styles.container}>
        <FlatList
          data={filteredFavorites}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={header}
          ListEmptyComponent={empty}
          contentContainerStyle={[
            styles.listContent,
            filteredFavorites.length === 0 &&
              styles.emptyContent,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />

        {toast ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.toast,
              {
                opacity: toastOpacity,
                transform: [
                  {
                    translateY:
                      toastOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [12, 0],
                      }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.toastIcon}>
              <Ionicons
                name="checkmark"
                size={14}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.toastText}>
              {toast}
            </Text>
          </Animated.View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F2',
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F5F2',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 150,
  },

  emptyContent: {
    flexGrow: 1,
  },

  header: {
    minHeight: 158,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 24,
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    marginBottom: 8,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.2,
    color: '#999994',
  },

  title: {
    fontSize: 42,
    lineHeight: 45,
    fontWeight: '700',
    letterSpacing: -1.8,
    color: '#111111',
  },

  subtitle: {
    marginTop: 7,
    fontSize: 14,
    color: '#777772',
  },

  counter: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E6E1',
  },

  counterText: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '800',
    color: '#111111',
  },

  search: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E6E1',
  },

  searchInput: {
    flex: 1,
    height: 54,
    marginLeft: 11,
    paddingVertical: 0,
    fontSize: 14,
    color: '#111111',
  },

  filters: {
    paddingTop: 16,
    paddingBottom: 21,
    paddingRight: 10,
    gap: 8,
  },

  filter: {
    height: 36,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E6E1',
  },

  filterActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },

  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#777772',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  resultHeader: {
    marginBottom: 12,
  },

  resultTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111111',
  },

  card: {
    marginBottom: 20,
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E7E2',
  },

  imageWrapper: {
    height: 245,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#DDDDD8',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.13)',
  },

  heartButton: {
    position: 'absolute',
    top: 13,
    right: 13,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor:
      'rgba(255,255,255,0.94)',
  },

  imageInfo: {
    position: 'absolute',
    right: 17,
    bottom: 17,
    left: 17,
  },

  category: {
    marginBottom: 4,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: 'rgba(255,255,255,0.78)',
    textTransform: 'uppercase',
  },

  name: {
    fontSize: 27,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: '#FFFFFF',
  },

  details: {
    padding: 16,
  },

  locationLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  location: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#777772',
  },

  mainInfo: {
    minHeight: 66,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  serviceInfo: {
    flex: 1,
    paddingRight: 12,
  },

  service: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111111',
  },

  meta: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '800',
    color: '#111111',
  },

  reviews: {
    marginLeft: 4,
    fontSize: 10,
    color: '#999994',
  },

  metaDivider: {
    width: 3,
    height: 3,
    marginHorizontal: 8,
    borderRadius: 2,
    backgroundColor: '#C3C3BE',
  },

  duration: {
    fontSize: 10,
    color: '#999994',
  },

  priceContainer: {
    alignItems: 'flex-end',
  },

  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111111',
  },

  priceCaption: {
    marginTop: 3,
    fontSize: 8,
    fontWeight: '600',
    color: '#A0A09A',
  },

  cardAction: {
    height: 44,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 5,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEA',
  },

  actionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111111',
  },

  actionIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#111111',
  },

  empty: {
    flex: 1,
    minHeight: 430,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E6E1',
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
    color: '#111111',
  },

  emptyText: {
    maxWidth: 285,
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: '#858580',
  },

  emptyButton: {
    height: 46,
    marginTop: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 23,
    backgroundColor: '#111111',
  },

  emptyButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  toast: {
    position: 'absolute',
    right: 20,
    bottom: 104,
    left: 20,
    minHeight: 52,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#111111',
  },

  toastIcon: {
    width: 25,
    height: 25,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#2A2A2A',
  },

  toastText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});