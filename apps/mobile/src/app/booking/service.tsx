import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const COLORS = {
  background: '#F3F3F0',
  white: '#FFFFFF',
  black: '#111111',
  text: '#171717',
  secondary: '#686868',
  muted: '#999999',
  blue: '#1D63FF',
  blueSoft: 'rgba(29, 99, 255, 0.07)',
  blueBorder: 'rgba(29, 99, 255, 0.28)',
  gold: '#B58A45',
  border: 'rgba(0, 0, 0, 0.07)',
};

type ServiceCategory =
  | 'Todos'
  | 'Cabelo'
  | 'Barba'
  | 'Tratamento'
  | 'Premium';

type Service = {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  category: Exclude<ServiceCategory, 'Todos'>;
  icon: keyof typeof Ionicons.glyphMap;
  popular?: boolean;
};

const categories: ServiceCategory[] = [
  'Todos',
  'Cabelo',
  'Barba',
  'Tratamento',
  'Premium',
];

const services: Service[] = [
  {
    id: 'service-001',
    name: 'Corte Premium',
    description:
      'Corte personalizado com acabamento detalhado.',
    duration: '45 min',
    price: 12000,
    category: 'Cabelo',
    icon: 'cut-outline',
    popular: true,
  },
  {
    id: 'service-002',
    name: 'Corte + Barba',
    description:
      'Corte completo acompanhado de barba premium.',
    duration: '1h 10 min',
    price: 18000,
    category: 'Barba',
    icon: 'cut-outline',
    popular: true,
  },
  {
    id: 'service-003',
    name: 'Barba Premium',
    description:
      'Modelagem, toalha quente e acabamento preciso.',
    duration: '30 min',
    price: 8000,
    category: 'Barba',
    icon: 'sparkles-outline',
  },
  {
    id: 'service-004',
    name: 'Tratamento Capilar',
    description:
      'Tratamento profundo para revitalizar o cabelo.',
    duration: '50 min',
    price: 15000,
    category: 'Tratamento',
    icon: 'water-outline',
  },
  {
    id: 'service-005',
    name: 'Experiência Executive',
    description:
      'Corte, barba, tratamento e finalização premium.',
    duration: '1h 40 min',
    price: 30000,
    category: 'Premium',
    icon: 'diamond-outline',
    popular: true,
  },
  {
    id: 'service-006',
    name: 'Finalização & Styling',
    description:
      'Styling profissional para completar o visual.',
    duration: '25 min',
    price: 7000,
    category: 'Cabelo',
    icon: 'brush-outline',
  },
];

const formatPrice = (value: number) => {
  return `${value.toLocaleString('pt-AO')} Kz`;
};

export default function BookingServiceScreen() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategory>('Todos');

  const [selectedService, setSelectedService] =
    useState<string | null>(null);

  const [selectedPrice, setSelectedPrice] =
    useState(0);

  const [searchQuery, setSearchQuery] =
    useState('');

  const continueScale =
    useRef(new Animated.Value(1)).current;

  const selectionOpacity =
    useRef(new Animated.Value(0)).current;

  const selectionTranslate =
    useRef(new Animated.Value(15)).current;

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return services.filter((service) => {
      const matchesCategory =
        selectedCategory === 'Todos' ||
        service.category === selectedCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        service.name.toLowerCase().includes(query) ||
        service.description
          .toLowerCase()
          .includes(query) ||
        service.category
          .toLowerCase()
          .includes(query)
      );
    });
  }, [searchQuery, selectedCategory]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSelectService = useCallback(
    (service: Service) => {
      setSelectedService(service.id);
      setSelectedPrice(service.price);

      selectionOpacity.setValue(0);
      selectionTranslate.setValue(15);

      Animated.parallel([
        Animated.timing(selectionOpacity, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.spring(selectionTranslate, {
          toValue: 0,
          damping: 18,
          stiffness: 180,
          mass: 0.7,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [
      selectionOpacity,
      selectionTranslate,
    ],
  );

  const handleContinuePress = useCallback(() => {
    if (!selectedService) {
      return;
    }

    Animated.sequence([
      Animated.timing(continueScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),

      Animated.spring(continueScale, {
        toValue: 1,
        damping: 14,
        stiffness: 250,
        useNativeDriver: true,
      }),
    ]).start();

    router.push({
      pathname: '/booking/professional',
      params: {
        service: selectedService,
      },
    });
  }, [
    continueScale,
    router,
    selectedService,
  ]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView
        edges={['top']}
        style={styles.safeArea}
      >
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled={false}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
              hitSlop={8}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.pressed,
              ]}
            >
              <BlurView
                intensity={70}
                tint="light"
                style={styles.headerButtonBlur}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={COLORS.black}
                />
              </BlurView>
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.headerEyebrow}>
                AGENDAMENTO
              </Text>

              <Text style={styles.headerTitle}>
                Escolha o serviço
              </Text>
            </View>

            <View style={styles.stepBadge}>
              <Text style={styles.stepCurrent}>
                1
              </Text>

              <Text style={styles.stepDivider}>
                /
              </Text>

              <Text style={styles.stepTotal}>
                4
              </Text>
            </View>
          </View>

          {/* PROGRESSO */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={styles.progressActive} />
            </View>

            <View style={styles.progressLabels}>
              <Text style={styles.progressActiveText}>
                Serviço
              </Text>

              <Text style={styles.progressText}>
                Profissional
              </Text>

              <Text style={styles.progressText}>
                Data
              </Text>

              <Text style={styles.progressText}>
                Confirmar
              </Text>
            </View>
          </View>

          {/* ESPAÇO */}
          <View style={styles.spaceCard}>
            <LinearGradient
              colors={[
                'rgba(255,255,255,0.96)',
                'rgba(248,248,245,0.92)',
              ]}
              style={styles.spaceGradient}
            >
              <View style={styles.spaceIcon}>
                <Ionicons
                  name="sparkles"
                  size={18}
                  color={COLORS.gold}
                />
              </View>

              <View style={styles.spaceInfo}>
                <Text style={styles.spaceLabel}>
                  ESPAÇO SELECIONADO
                </Text>

                <Text style={styles.spaceName}>
                  Gentleman&apos;s Club
                </Text>

                <View style={styles.spaceLocation}>
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={COLORS.muted}
                  />

                  <Text
                    style={styles.spaceLocationText}
                  >
                    Talatona, Luanda
                  </Text>
                </View>
              </View>

              <View style={styles.spaceRating}>
                <Ionicons
                  name="star"
                  size={12}
                  color={COLORS.gold}
                />

                <Text style={styles.spaceRatingText}>
                  4.9
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* INTRO */}
          <View style={styles.intro}>
            <Text style={styles.title}>
              O que deseja fazer?
            </Text>

            <Text style={styles.subtitle}>
              Escolha o serviço que melhor combina
              com a experiência que procura.
            </Text>
          </View>

          {/* PESQUISA */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={19}
                color={
                  searchQuery.length > 0
                    ? COLORS.blue
                    : COLORS.muted
                }
              />

              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Pesquisar serviço"
                placeholderTextColor={COLORS.muted}
                style={styles.searchInput}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="default"
                clearButtonMode="never"
                selectionColor={COLORS.blue}
              />

              {searchQuery.length > 0 && (
                <Pressable
                  onPress={handleClearSearch}
                  hitSlop={10}
                  style={styles.searchClearButton}
                >
                  <View
                    style={styles.searchClearIcon}
                  >
                    <Ionicons
                      name="close"
                      size={13}
                      color={COLORS.secondary}
                    />
                  </View>
                </Pressable>
              )}
            </View>
          </View>

          {/* CATEGORIAS */}
          <View style={styles.categoryContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={
                styles.categories
              }
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {categories.map((category) => {
                const active =
                  selectedCategory === category;

                return (
                  <Pressable
                    key={category}
                    onPress={() =>
                      setSelectedCategory(
                        category,
                      )
                    }
                    style={({ pressed }) => [
                      styles.category,
                      active &&
                        styles.categoryActive,
                      pressed &&
                        styles.categoryPressed,
                    ]}
                  >
                    {active && (
                      <View
                        style={styles.categoryDot}
                      />
                    )}

                    <Text
                      style={[
                        styles.categoryText,
                        active &&
                          styles.categoryTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* RESULTADOS */}
          <View style={styles.servicesSection}>
            <View style={styles.servicesHeader}>
              <View>
                <Text
                  style={styles.sectionTitle}
                >
                  Serviços disponíveis
                </Text>

                <Text
                  style={styles.sectionSubtitle}
                >
                  {filteredServices.length}{' '}
                  {filteredServices.length === 1
                    ? 'opção'
                    : 'opções'}
                </Text>
              </View>

              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={15}
                  color={COLORS.blue}
                />

                <Text
                  style={styles.verifiedText}
                >
                  Verificado
                </Text>
              </View>
            </View>

            <View style={styles.servicesList}>
              {filteredServices.length > 0 ? (
                filteredServices.map(
                  (service, index) => {
                    const selected =
                      selectedService ===
                      service.id;

                    return (
                      <ServiceItem
                        key={service.id}
                        service={service}
                        selected={selected}
                        index={index}
                        onPress={() =>
                          handleSelectService(
                            service,
                          )
                        }
                      />
                    );
                  },
                )
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="search-outline"
                      size={22}
                      color={COLORS.muted}
                    />
                  </View>

                  <Text
                    style={styles.emptyTitle}
                  >
                    Nenhum serviço encontrado
                  </Text>

                  <Text
                    style={styles.emptyText}
                  >
                    Tente pesquisar outro termo ou
                    selecione uma categoria diferente.
                  </Text>

                  {searchQuery.length > 0 && (
                    <Pressable
                      onPress={handleClearSearch}
                      style={styles.emptyButton}
                    >
                      <Text
                        style={
                          styles.emptyButtonText
                        }
                      >
                        Limpar pesquisa
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* NOTA */}
          <View style={styles.noteCard}>
            <View style={styles.noteIcon}>
              <Ionicons
                name="information-outline"
                size={17}
                color={COLORS.blue}
              />
            </View>

            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>
                Experiência personalizada
              </Text>

              <Text style={styles.noteText}>
                Depois de escolher o serviço, poderá
                selecionar o profissional que deseja.
                Esta escolha é opcional.
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>

      {/* BARRA INFERIOR */}
      <View style={styles.bottomContainer}>
        <BlurView
          intensity={88}
          tint="light"
          style={styles.bottomBlur}
        >
          <Animated.View
            style={[
              styles.bottomContent,
              {
                opacity: selectedService
                  ? selectionOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.72, 1],
                    })
                  : 1,

                transform: [
                  {
                    translateY: selectedService
                      ? selectionTranslate
                      : 0,
                  },
                ],
              },
            ]}
          >
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>
                {selectedService
                  ? 'Serviço selecionado'
                  : 'Selecione um serviço'}
              </Text>

              <Text style={styles.summaryValue}>
                {selectedService
                  ? formatPrice(selectedPrice)
                  : '—'}
              </Text>
            </View>

            <Animated.View
              style={{
                transform: [
                  {
                    scale: continueScale,
                  },
                ],
              }}
            >
              <Pressable
                onPress={handleContinuePress}
                disabled={!selectedService}
                style={({ pressed }) => [
                  styles.continueButton,
                  !selectedService &&
                    styles.continueButtonDisabled,
                  pressed &&
                    selectedService &&
                    styles.continueButtonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.continueText,
                    !selectedService &&
                      styles.continueTextDisabled,
                  ]}
                >
                  Continuar
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={
                    selectedService
                      ? '#FFFFFF'
                      : '#A0A0A0'
                  }
                />
              </Pressable>
            </Animated.View>
          </Animated.View>
        </BlurView>
      </View>
    </View>
  );
}

function ServiceItem({
  service,
  selected,
  index,
  onPress,
}: {
  service: Service;
  selected: boolean;
  index: number;
  onPress: () => void;
}) {
  const scale =
    useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.985,
      damping: 18,
      stiffness: 280,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 16,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.serviceWrapper,
        {
          transform: [
            {
              scale,
            },
          ],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.serviceCard,
          selected &&
            styles.serviceCardSelected,
          pressed &&
            styles.serviceCardPressed,
        ]}
      >
        {/* NÚMERO */}
        <View
          style={[
            styles.serviceNumber,
            selected &&
              styles.serviceNumberSelected,
          ]}
        >
          {selected ? (
            <Ionicons
              name="checkmark"
              size={17}
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={styles.serviceNumberText}
            >
              {String(index + 1).padStart(2, '0')}
            </Text>
          )}
        </View>

        {/* ÍCONE */}
        <View
          style={[
            styles.serviceIcon,
            selected &&
              styles.serviceIconSelected,
          ]}
        >
          <Ionicons
            name={service.icon}
            size={21}
            color={
              selected
                ? COLORS.blue
                : COLORS.black
            }
          />
        </View>

        {/* INFORMAÇÃO */}
        <View style={styles.serviceInfo}>
          <View style={styles.serviceTitleRow}>
            <Text
              style={styles.serviceName}
              numberOfLines={1}
            >
              {service.name}
            </Text>

            {service.popular && (
              <View style={styles.popularBadge}>
                <Text
                  style={styles.popularText}
                >
                  POPULAR
                </Text>
              </View>
            )}
          </View>

          <Text
            style={styles.serviceDescription}
            numberOfLines={2}
          >
            {service.description}
          </Text>

          <View style={styles.serviceMeta}>
            <View style={styles.metaItem}>
              <Ionicons
                name="time-outline"
                size={13}
                color={COLORS.muted}
              />

              <Text style={styles.metaText}>
                {service.duration}
              </Text>
            </View>

            <View
              style={styles.metaSeparator}
            />

            <Text
              style={styles.serviceCategory}
            >
              {service.category}
            </Text>
          </View>
        </View>

        {/* PREÇO */}
        <View style={styles.priceArea}>
          <Text style={styles.price}>
            {formatPrice(service.price)}
          </Text>

          <View
            style={[
              styles.radio,
              selected &&
                styles.radioSelected,
            ]}
          >
            {selected && (
              <View
                style={styles.radioInner}
              />
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  mainScroll: {
    flex: 1,
  },

  /*
   * IMPORTANTE:
   * Removido flexGrow: 1.
   * O conteúdo agora ocupa somente a altura real
   * dos elementos, evitando áreas vazias.
   */
  scrollContent: {
    paddingBottom: 150,
  },

  header: {
    minHeight: 72,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
  },

  headerButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(255,255,255,0.60)',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },

  headerEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.7,
    color: COLORS.blue,
  },

  headerTitle: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
  },

  stepBadge: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  stepCurrent: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.blue,
  },

  stepDivider: {
    marginHorizontal: 2,
    fontSize: 11,
    color: COLORS.muted,
  },

  stepTotal: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
  },

  progressContainer: {
    marginTop: 3,
    paddingHorizontal: 20,
  },

  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor:
      'rgba(0,0,0,0.07)',
  },

  progressActive: {
    width: '25%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: COLORS.blue,
  },

  progressLabels: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressActiveText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.blue,
  },

  progressText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.muted,
  },

  spaceCard: {
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  spaceGradient: {
    minHeight: 82,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  spaceIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F0E7',
  },

  spaceInfo: {
    flex: 1,
    marginLeft: 12,
  },

  spaceLabel: {
    fontSize: 8,
    letterSpacing: 1.1,
    fontWeight: '800',
    color: COLORS.muted,
  },

  spaceName: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },

  spaceLocation: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },

  spaceLocationText: {
    marginLeft: 3,
    fontSize: 10,
    color: COLORS.muted,
  },

  spaceRating: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0E7',
  },

  spaceRatingText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
  },

  intro: {
    marginTop: 28,
    marginHorizontal: 20,
  },

  title: {
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '900',
    color: COLORS.text,
  },

  subtitle: {
    maxWidth: 350,
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.secondary,
  },

  searchContainer: {
    marginTop: 18,
    marginHorizontal: 16,
  },

  searchBox: {
    height: 52,
    paddingHorizontal: 15,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.035,
    shadowRadius: 12,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
    paddingVertical: 0,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },

  searchClearButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchClearIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEEEEA',
  },

  /*
   * Container das categorias com altura natural.
   * Não existe espaço vertical reservado.
   */
  categoryContainer: {
    height: 48,
    marginTop: 6,
  },

  categories: {
    paddingLeft: 18,
    paddingRight: 18,
    paddingVertical: 5,
  },

  category: {
    height: 38,
    marginRight: 8,
    paddingHorizontal: 15,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  categoryActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },

  categoryDot: {
    width: 5,
    height: 5,
    marginRight: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },

  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  categoryTextActive: {
    color: '#FFFFFF',
  },

  categoryPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  /*
   * A seção começa praticamente imediatamente
   * depois dos menus.
   */
  servicesSection: {
    marginTop: 8,
  },

  servicesHeader: {
    marginHorizontal: 20,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.muted,
  },

  verifiedBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blueSoft,
  },

  verifiedText: {
    marginLeft: 4,
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.blue,
  },

  servicesList: {
    paddingHorizontal: 14,
  },

  serviceWrapper: {
    width: '100%',
    marginBottom: 10,
  },

  serviceCard: {
    minHeight: 112,
    padding: 11,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  serviceCardSelected: {
    backgroundColor: COLORS.blueSoft,
    borderColor: COLORS.blueBorder,
  },

  serviceCardPressed: {
    opacity: 0.9,
  },

  serviceNumber: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F1EE',
  },

  serviceNumberSelected: {
    backgroundColor: COLORS.blue,
  },

  serviceNumberText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.muted,
  },

  serviceIcon: {
    width: 46,
    height: 46,
    marginLeft: 8,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F2',
  },

  serviceIconSelected: {
    backgroundColor: '#FFFFFF',
  },

  serviceInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 5,
  },

  serviceName: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
  },

  popularBadge: {
    marginLeft: 6,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F5F0E7',
  },

  popularText: {
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.6,
    color: COLORS.gold,
  },

  serviceDescription: {
    marginTop: 4,
    paddingRight: 4,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.muted,
  },

  serviceMeta: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaText: {
    marginLeft: 3,
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.muted,
  },

  metaSeparator: {
    width: 3,
    height: 3,
    marginHorizontal: 7,
    borderRadius: 2,
    backgroundColor: '#C8C8C8',
  },

  serviceCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  priceArea: {
    minWidth: 69,
    marginLeft: 6,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingVertical: 4,
  },

  price: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'right',
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
  },

  radioSelected: {
    borderColor: COLORS.blue,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.blue,
  },

  emptyState: {
    minHeight: 190,
    paddingHorizontal: 25,
    paddingVertical: 28,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(255,255,255,0.70)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECECE8',
  },

  emptyTitle: {
    marginTop: 13,
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },

  emptyText: {
    maxWidth: 280,
    marginTop: 5,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.muted,
    textAlign: 'center',
  },

  emptyButton: {
    marginTop: 14,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 13,
    backgroundColor: COLORS.black,
  },

  emptyButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  noteCard: {
    marginTop: 22,
    marginHorizontal: 16,
    padding: 15,
    borderRadius: 21,
    flexDirection: 'row',
    backgroundColor:
      'rgba(29,99,255,0.055)',
    borderWidth: 1,
    borderColor:
      'rgba(29,99,255,0.10)',
  },

  noteIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  noteContent: {
    flex: 1,
    marginLeft: 10,
  },

  noteTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.text,
  },

  noteText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.secondary,
  },

  bottomSpace: {
    height: 150,
  },

  bottomContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor:
      'rgba(0,0,0,0.07)',
  },

  bottomBlur: {
    paddingHorizontal: 15,
    paddingTop: 11,
    paddingBottom: 12,
  },

  bottomContent: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
  },

  summary: {
    flex: 1,
    minWidth: 0,
  },

  summaryLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.muted,
  },

  summaryValue: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },

  continueButton: {
    minWidth: 132,
    height: 50,
    paddingHorizontal: 17,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: COLORS.black,
  },

  continueButtonDisabled: {
    backgroundColor: '#E2E2DE',
  },

  continueButtonPressed: {
    opacity: 0.82,
  },

  continueText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  continueTextDisabled: {
    color: '#A0A0A0',
  },

  pressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },
});