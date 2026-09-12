import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import {
  Animated,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  background: '#F4F4F1',
  white: '#FFFFFF',
  black: '#090909',
  text: '#111111',
  secondary: '#6D6D6D',
  muted: '#A1A1A1',
  gold: '#B59A67',
  glass: 'rgba(255,255,255,0.70)',
};

const HORIZONTAL = 20;
const CARD_GAP = 14;
const HERO_WIDTH = SCREEN_WIDTH - HORIZONTAL * 2;
const HERO_HEIGHT = 425;
const HERO_SNAP = HERO_WIDTH + CARD_GAP;

type IconName = keyof typeof Ionicons.glyphMap;

interface Space {
  name: string;
  type: string;
  location: string;
  rating: string;
  price: string;
  image: string;
  badge: string;
  description: string;
  distance?: string;
}

const featuredSpaces: Space[] = [
  {
    name: 'Lumina Beauty',
    type: 'Beauty & Wellness',
    location: 'Talatona, Luanda',
    rating: '4.9',
    price: '15.000 Kz',
    badge: 'EXCLUSIVO',
    description:
      'Um espaço sofisticado para beleza, bem-estar e experiências personalizadas.',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=90',
  },
  {
    name: 'The Royal Spa',
    type: 'Spa & Wellness',
    location: 'Ilha de Luanda',
    rating: '5.0',
    price: '25.000 Kz',
    badge: 'SIGNATURE',
    description:
      'Uma experiência premium de relaxamento, cuidado e exclusividade.',
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=90',
  },
  {
    name: "Gentleman's Club",
    type: 'Grooming',
    location: 'Alvalade, Luanda',
    rating: '4.9',
    price: '12.000 Kz',
    badge: 'PREMIUM',
    description:
      'Barbearia premium com ambiente privado e atendimento de alto padrão.',
    image:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=90',
  },
  {
    name: 'Aura Beauty',
    type: 'Hair & Makeup',
    location: 'Alvalade, Luanda',
    rating: '4.8',
    price: '18.000 Kz',
    badge: 'SELECIONADO',
    description:
      'Beleza contemporânea, atendimento personalizado e resultados impecáveis.',
    image:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=90',
  },
];

const categories: {
  title: string;
  icon: IconName;
}[] = [
  { title: 'Cabelo', icon: 'cut-outline' },
  { title: 'Grooming', icon: 'person-outline' },
  { title: 'Nails', icon: 'sparkles-outline' },
  { title: 'Spa', icon: 'leaf-outline' },
  { title: 'Estética', icon: 'flower-outline' },
  { title: 'Makeup', icon: 'brush-outline' },
  { title: 'Massagem', icon: 'hand-left-outline' },
];

const nearbySpaces: Space[] = [
  {
    name: "Gentleman's Club",
    type: 'Grooming',
    location: 'Alvalade',
    rating: '4.9',
    price: '12.000 Kz',
    badge: 'PREMIUM',
    description: 'Barbearia premium.',
    image:
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=90',
    distance: '1,2 km',
  },
  {
    name: 'Lumina Beauty',
    type: 'Beauty',
    location: 'Talatona',
    rating: '4.9',
    price: '15.000 Kz',
    badge: 'EXCLUSIVO',
    description: 'Espaço sofisticado.',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=90',
    distance: '2,4 km',
  },
  {
    name: 'The Royal Spa',
    type: 'Wellness',
    location: 'Ilha',
    rating: '5.0',
    price: '25.000 Kz',
    badge: 'SIGNATURE',
    description: 'Experiência premium.',
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=90',
    distance: '4,8 km',
  },
];

interface GlassProps {
  children: React.ReactNode;
  style?: any;
  intensity?: number;
}

const GlassSurface = memo(
  ({ children, style, intensity = 55 }: GlassProps) => (
    <View style={[styles.glass, style]}>
      <BlurView
        intensity={intensity}
        tint="light"
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={[
          'rgba(255,255,255,0.82)',
          'rgba(255,255,255,0.10)',
          'rgba(255,255,255,0.34)',
        ]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={styles.glassHighlight} />

      {children}
    </View>
  ),
);

interface AnimatedIconProps {
  icon: IconName;
  size: number;
  color: string;
  containerStyle?: any;
}

const AnimatedIcon = memo(
  ({ icon, size, color, containerStyle }: AnimatedIconProps) => {
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -1.5,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      );

      animation.start();

      return () => animation.stop();
    }, [translateY]);

    return (
      <Animated.View
        style={[
          containerStyle,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <Ionicons name={icon} size={size} color={color} />
      </Animated.View>
    );
  },
);

const Reveal = memo(
  ({
    children,
    delay = 0,
    style,
  }: {
    children: React.ReactNode;
    delay?: number;
    style?: any;
  }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          delay,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          delay,
          speed: 15,
          bounciness: 4,
          useNativeDriver: true,
        }),
      ]).start();
    }, [delay, opacity, translateY]);

    return (
      <Animated.View
        style={[
          style,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        {children}
      </Animated.View>
    );
  },
);

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeSlide, setActiveSlide] = useState(0);

  const mainScrollY = useRef(new Animated.Value(0)).current;
  const heroScrollX = useRef(new Animated.Value(0)).current;
  const heroRef = useRef<any>(null);
  const heroDragging = useRef(false);

  const go = useCallback(
    (path: string) => {
      router.push(path as any);
    },
    [router],
  );

  const goSpace = useCallback(() => {
    router.push('/space' as any);
  }, [router]);

  const handleHeroEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.x;

      const index = Math.round(offset / HERO_SNAP);

      setActiveSlide(
        Math.max(
          0,
          Math.min(index, featuredSpaces.length - 1),
        ),
      );

      heroDragging.current = false;
    },
    [],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      if (heroDragging.current) return;

      setActiveSlide((current) => {
        const next =
          current + 1 >= featuredSpaces.length
            ? 0
            : current + 1;

        heroRef.current?.scrollToOffset({
          offset: next * HERO_SNAP,
          animated: true,
        });

        return next;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const introTranslate = mainScrollY.interpolate({
    inputRange: [0, 160],
    outputRange: [0, -35],
    extrapolate: 'clamp',
  });

  const introOpacity = mainScrollY.interpolate({
    inputRange: [0, 130],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={[styles.ambientOrb, styles.orbTop]} />
        <View style={[styles.ambientOrb, styles.orbRight]} />
        <View style={[styles.ambientOrb, styles.orbBottom]} />

        <View style={styles.topControls}>
          <GlassSurface style={styles.topGlass} intensity={90}>
            <Pressable
              onPress={() => go('/search')}
              style={styles.searchBox}
            >
              <Ionicons
                name="search-outline"
                size={19}
                color={COLORS.black}
              />

              <Text style={styles.searchText}>
                Procurar experiências
              </Text>

              <View style={styles.searchArrow}>
                <Ionicons
                  name="arrow-forward"
                  size={13}
                  color={COLORS.black}
                />
              </View>
            </Pressable>

            <View style={styles.topDivider} />

            <Pressable
              onPress={() => go('/notifications')}
              style={styles.topButton}
            >
              <Ionicons
                name="notifications-outline"
                size={19}
                color={COLORS.black}
              />

              <View style={styles.badge} />
            </Pressable>

            <Pressable
              onPress={() => go('/profile')}
              style={styles.topButton}
            >
              <Ionicons
                name="person-outline"
                size={19}
                color={COLORS.black}
              />
            </Pressable>
          </GlassSurface>
        </View>

        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {
                    y: mainScrollY,
                  },
                },
              },
            ],
            { useNativeDriver: true },
          )}
          contentContainerStyle={{
            paddingTop: 88,
            paddingBottom: 120 + insets.bottom,
          }}
        >
          <Animated.View
            style={[
              styles.intro,
              {
                opacity: introOpacity,
                transform: [{ translateY: introTranslate }],
              },
            ]}
          >
            <Text style={styles.introTitle}>
              O seu próximo{'\n'}
              momento começa aqui.
            </Text>

            <Text style={styles.introSubtitle}>
              Lugares excepcionais, escolhidos para o seu ritmo.
            </Text>
          </Animated.View>

          <Reveal delay={100}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Descubra
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Experiências selecionadas
                  </Text>
                </View>

                <Pressable
                  onPress={() => go('/explore')}
                  style={styles.viewAll}
                >
                  <Text style={styles.viewAllText}>
                    Ver tudo
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={COLORS.black}
                  />
                </Pressable>
              </View>

              <Animated.FlatList
                ref={heroRef}
                data={featuredSpaces}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.name}
                snapToInterval={HERO_SNAP}
                decelerationRate="fast"
                snapToAlignment="start"
                contentContainerStyle={{
                  paddingHorizontal: HORIZONTAL,
                }}
                ItemSeparatorComponent={() => (
                  <View style={{ width: CARD_GAP }} />
                )}
                onScrollBeginDrag={() => {
                  heroDragging.current = true;
                }}
                onScroll={Animated.event(
                  [
                    {
                      nativeEvent: {
                        contentOffset: {
                          x: heroScrollX,
                        },
                      },
                    },
                  ],
                  { useNativeDriver: true },
                )}
                scrollEventThrottle={16}
                onMomentumScrollEnd={handleHeroEnd}
                renderItem={({ item, index }) => (
                  <HeroCard
                    item={item}
                    index={index}
                    scrollX={heroScrollX}
                    onPress={goSpace}
                  />
                )}
              />

              <View style={styles.pagination}>
                {featuredSpaces.map((item, index) => (
                  <View
                    key={item.name}
                    style={[
                      styles.dot,
                      index === activeSlide && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          </Reveal>

          <Reveal delay={200}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Para si
              </Text>

              <View style={styles.quickGrid}>
                <QuickAction
                  icon="calendar-outline"
                  title="Agendamentos"
                  subtitle="As suas reservas"
                  onPress={() => go('/appointments')}
                />

                <QuickAction
                  icon="heart-outline"
                  title="Favoritos"
                  subtitle="Espaços guardados"
                  onPress={() => go('/favorites')}
                />

                <QuickAction
                  icon="compass-outline"
                  title="Explorar"
                  subtitle="Novos lugares"
                  onPress={() => go('/explore')}
                />

                <QuickAction
                  icon="time-outline"
                  title="Histórico"
                  subtitle="Experiências anteriores"
                  onPress={() => go('/appointments')}
                />
              </View>
            </View>
          </Reveal>

          <Reveal delay={300}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Escolha o seu momento
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
              >
                {categories.map((category) => (
                  <Pressable
                    key={category.title}
                    onPress={() => go('/explore')}
                    style={styles.categoryCard}
                  >
                    <GlassSurface
                      style={styles.categoryGlass}
                    >
                      <View style={styles.categoryIcon}>
                        <Ionicons
                          name={category.icon}
                          size={21}
                          color={COLORS.black}
                        />
                      </View>

                      <Text style={styles.categoryTitle}>
                        {category.title}
                      </Text>
                    </GlassSurface>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </Reveal>

          <Reveal delay={400}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Quando o tempo importa
              </Text>

              <Pressable
                onPress={goSpace}
                style={styles.experienceCard}
              >
                <Image
                  source={{
                    uri: featuredSpaces[1].image,
                  }}
                  style={StyleSheet.absoluteFill}
                />

                <LinearGradient
                  colors={[
                    'rgba(0,0,0,0)',
                    'rgba(0,0,0,0.35)',
                    'rgba(0,0,0,0.94)',
                  ]}
                  locations={[0, 0.45, 1]}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.experienceContent}>
                  <View style={styles.signatureBadge}>
                    <Ionicons
                      name="diamond-outline"
                      size={12}
                      color={COLORS.white}
                    />

                    <Text style={styles.signatureText}>
                      SIGNATURE
                    </Text>
                  </View>

                  <View>
                    <Text style={styles.experienceName}>
                      THE ROYAL SPA
                    </Text>

                    <Text style={styles.experienceTitle}>
                      O luxo de{'\n'}desacelerar.
                    </Text>

                    <Text style={styles.experienceDescription}>
                      Privacidade, cuidado e excelência num único
                      lugar.
                    </Text>

                    <View style={styles.experienceBottom}>
                      <View>
                        <Text style={styles.priceLabel}>
                          DESDE
                        </Text>

                        <Text style={styles.experiencePrice}>
                          25.000 Kz
                        </Text>
                      </View>

                      <View style={styles.experienceButton}>
                        <Text style={styles.experienceButtonText}>
                          Agendar
                        </Text>

                        <Ionicons
                          name="arrow-forward"
                          size={15}
                          color={COLORS.black}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </Pressable>
            </View>
          </Reveal>

          <Reveal delay={500}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    À sua volta
                  </Text>

                  <Text style={styles.sectionSubtitle}>
                    Lugares próximos
                  </Text>
                </View>

                <Pressable
                  onPress={() => go('/explore')}
                  style={styles.viewAll}
                >
                  <Text style={styles.viewAllText}>
                    Explorar
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={COLORS.black}
                  />
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.nearbyList}
              >
                {nearbySpaces.map((item) => (
                  <NearbyCard
                    key={item.name}
                    item={item}
                    onPress={goSpace}
                  />
                ))}
              </ScrollView>
            </View>
          </Reveal>

          <View style={styles.trustSection}>
            <GlassSurface style={styles.trustCard}>
              <View style={styles.trustIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={21}
                  color={COLORS.black}
                />
              </View>

              <View style={styles.trustContent}>
                <Text style={styles.trustTitle}>
                  Qualidade em cada escolha
                </Text>

                <Text style={styles.trustDescription}>
                  Espaços selecionados para oferecer uma experiência
                  simples, privada e memorável.
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={COLORS.muted}
              />
            </GlassSurface>
          </View>
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
}

function HeroCard({
  item,
  index,
  scrollX,
  onPress,
}: {
  item: Space;
  index: number;
  scrollX: Animated.Value;
  onPress: () => void;
}) {
  const position = index * HERO_SNAP;

  const scale = scrollX.interpolate({
    inputRange: [
      position - HERO_SNAP,
      position,
      position + HERO_SNAP,
    ],
    outputRange: [0.91, 1, 0.91],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange: [
      position - HERO_SNAP,
      position,
      position + HERO_SNAP,
    ],
    outputRange: [0.58, 1, 0.58],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{
        width: HERO_WIDTH,
        height: HERO_HEIGHT,
        transform: [{ scale }],
        opacity,
      }}
    >
      <Pressable
        onPress={onPress}
        style={styles.heroCard}
      >
        <Image
          source={{ uri: item.image }}
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={[
            'rgba(0,0,0,0)',
            'rgba(0,0,0,0.18)',
            'rgba(0,0,0,0.94)',
          ]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.heroTop}>
          <View style={styles.heroBadge}>
            <Ionicons
              name="diamond-outline"
              size={11}
              color={COLORS.white}
            />

            <Text style={styles.heroBadgeText}>
              {item.badge}
            </Text>
          </View>

          <View style={styles.heroRating}>
            <Ionicons
              name="star"
              size={10}
              color={COLORS.white}
            />

            <Text style={styles.heroRatingText}>
              {item.rating}
            </Text>
          </View>
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.heroType}>
            {item.type}
          </Text>

          <Text style={styles.heroTitle}>
            {item.name}
          </Text>

          <View style={styles.heroLocation}>
            <Ionicons
              name="location-outline"
              size={12}
              color="rgba(255,255,255,0.75)"
            />

            <Text style={styles.heroLocationText}>
              {item.location}
            </Text>
          </View>

          <Text style={styles.heroDescription}>
            {item.description}
          </Text>

          <View style={styles.heroFooter}>
            <View>
              <Text style={styles.priceLabel}>
                DESDE
              </Text>

              <Text style={styles.heroPrice}>
                {item.price}
              </Text>
            </View>

            <View style={styles.heroButton}>
              <Text style={styles.heroButtonText}>
                Agendar agora
              </Text>

              <View style={styles.heroButtonArrow}>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={COLORS.black}
                />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function QuickAction({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.quickAction}
    >
      <View style={styles.quickIcon}>
        <Ionicons
          name={icon}
          size={18}
          color={COLORS.black}
        />
      </View>

      <View style={styles.quickText}>
        <Text style={styles.quickTitle}>
          {title}
        </Text>

        <Text style={styles.quickSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={14}
        color={COLORS.muted}
      />
    </Pressable>
  );
}

function NearbyCard({
  item,
  onPress,
}: {
  item: Space;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.nearbyCard}
    >
      <View style={styles.nearbyImageWrapper}>
        <Image
          source={{ uri: item.image }}
          style={styles.nearbyImage}
        />

        <View style={styles.nearbyRating}>
          <Ionicons
            name="star"
            size={9}
            color={COLORS.white}
          />

          <Text style={styles.nearbyRatingText}>
            {item.rating}
          </Text>
        </View>
      </View>

      <View style={styles.nearbyInfo}>
        <Text style={styles.nearbyType}>
          {item.type}
        </Text>

        <Text
          style={styles.nearbyName}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        <View style={styles.nearbyLocation}>
          <Ionicons
            name="location-outline"
            size={10}
            color={COLORS.muted}
          />

          <Text style={styles.nearbyLocationText}>
            {item.location}
          </Text>

          <View style={styles.locationDivider} />

          <Text style={styles.nearbyLocationText}>
            {item.distance}
          </Text>
        </View>

        <View style={styles.nearbyBottom}>
          <Text style={styles.nearbyPrice}>
            {item.price}
          </Text>

          <Ionicons
            name="arrow-forward"
            size={14}
            color={COLORS.black}
          />
        </View>
      </View>
    </Pressable>
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

  ambientOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.22,
  },

  orbTop: {
    width: 260,
    height: 260,
    top: -130,
    left: -100,
    backgroundColor: '#FFFFFF',
  },

  orbRight: {
    width: 210,
    height: 210,
    top: 280,
    right: -120,
    backgroundColor: '#D8D1C0',
  },

  orbBottom: {
    width: 300,
    height: 300,
    bottom: 70,
    left: -160,
    backgroundColor: '#FFFFFF',
  },

  glass: {
    overflow: 'hidden',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.90)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },

  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },

  topControls: {
    position: 'absolute',
    top: 8,
    left: HORIZONTAL,
    right: HORIZONTAL,
    zIndex: 100,
  },

  topGlass: {
    height: 60,
    borderRadius: 22,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchBox: {
    flex: 1,
    height: 48,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.76)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 13,
    paddingRight: 6,
  },

  searchText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondary,
  },

  searchArrow: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.055)',
  },

  topDivider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(0,0,0,0.07)',
    marginHorizontal: 5,
  },

  topButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.52)',
  },

  badge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
    borderWidth: 1,
    borderColor: COLORS.white,
  },

  intro: {
    paddingHorizontal: HORIZONTAL,
    paddingTop: 28,
    paddingBottom: 5,
  },

  introTitle: {
    fontSize: 37,
    lineHeight: 39,
    fontWeight: '700',
    letterSpacing: -1.8,
    color: COLORS.black,
  },

  introSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.secondary,
    marginTop: 11,
    maxWidth: 300,
  },

  section: {
    marginTop: 31,
  },

  sectionHeader: {
    paddingHorizontal: HORIZONTAL,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    paddingHorizontal: HORIZONTAL,
    fontSize: 23,
    lineHeight: 27,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: COLORS.black,
    marginBottom: 15,
  },

  sectionSubtitle: {
    fontSize: 10.5,
    color: COLORS.secondary,
    marginTop: 4,
  },

  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 3,
  },

  viewAllText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.black,
    marginRight: 5,
  },

  heroCard: {
    width: HERO_WIDTH,
    height: HERO_HEIGHT,
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: COLORS.black,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 17,
    },
    shadowOpacity: 0.19,
    shadowRadius: 28,
    elevation: 12,
  },

  heroTop: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  heroBadge: {
    minHeight: 30,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.36)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: COLORS.white,
    marginLeft: 6,
  },

  heroRating: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.36)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroRatingText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 5,
  },

  heroContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
  },

  heroType: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 5,
  },

  heroTitle: {
    fontSize: 33,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1.2,
    color: COLORS.white,
  },

  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  heroLocationText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.74)',
    marginLeft: 5,
  },

  heroDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 9,
    maxWidth: 285,
  },

  heroFooter: {
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  priceLabel: {
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.50)',
  },

  heroPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 2,
  },

  heroButton: {
    height: 43,
    paddingLeft: 14,
    paddingRight: 5,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.black,
    marginRight: 9,
  },

  heroButtonArrow: {
    width: 33,
    height: 33,
    borderRadius: 11,
    backgroundColor: '#F0F0EE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pagination: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 4,
    marginHorizontal: 2.5,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  dotActive: {
    width: 22,
    backgroundColor: COLORS.black,
  },

  quickGrid: {
    paddingHorizontal: HORIZONTAL,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  quickAction: {
    width: (SCREEN_WIDTH - HORIZONTAL * 2 - 10) / 2,
    minHeight: 78,
    borderRadius: 20,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.90)',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.055,
    shadowRadius: 14,
    elevation: 4,
  },

  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  quickText: {
    flex: 1,
  },

  quickTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.black,
  },

  quickSubtitle: {
    fontSize: 8.5,
    color: COLORS.muted,
    marginTop: 3,
  },

  categoryList: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: 4,
  },

  categoryCard: {
    width: 93,
    height: 105,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 10,
  },

  categoryGlass: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.84)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  categoryTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.black,
  },

  experienceCard: {
    marginHorizontal: HORIZONTAL,
    height: 380,
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: COLORS.black,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 17,
    },
    shadowOpacity: 0.17,
    shadowRadius: 28,
    elevation: 11,
  },

  experienceContent: {
    flex: 1,
    padding: 19,
    justifyContent: 'space-between',
  },

  signatureBadge: {
    alignSelf: 'flex-start',
    height: 30,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.17)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  signatureText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: COLORS.white,
    marginLeft: 6,
  },

  experienceName: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.7,
    color: 'rgba(255,255,255,0.60)',
    marginBottom: 7,
  },

  experienceTitle: {
    fontSize: 35,
    lineHeight: 37,
    fontWeight: '700',
    letterSpacing: -1.3,
    color: COLORS.white,
  },

  experienceDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: 'rgba(255,255,255,0.67)',
    marginTop: 9,
    maxWidth: 260,
  },

  experienceBottom: {
    marginTop: 19,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  experiencePrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 2,
  },

  experienceButton: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
  },

  experienceButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.black,
    marginRight: 8,
  },

  nearbyList: {
    paddingHorizontal: HORIZONTAL,
    paddingBottom: 5,
  },

  nearbyCard: {
    width: 205,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.90)',
    marginRight: 13,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },

  nearbyImageWrapper: {
    height: 135,
    overflow: 'hidden',
  },

  nearbyImage: {
    width: '100%',
    height: '100%',
  },

  nearbyRating: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 25,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },

  nearbyRatingText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 4,
  },

  nearbyInfo: {
    padding: 13,
  },

  nearbyType: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.gold,
  },

  nearbyName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    marginTop: 4,
  },

  nearbyLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  nearbyLocationText: {
    fontSize: 9,
    color: COLORS.muted,
    marginLeft: 4,
  },

  locationDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.18)',
    marginHorizontal: 5,
  },

  nearbyBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 13,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },

  nearbyPrice: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.black,
  },

  trustSection: {
    paddingHorizontal: HORIZONTAL,
    marginTop: 30,
  },

  trustCard: {
    minHeight: 88,
    borderRadius: 22,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  trustIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  trustContent: {
    flex: 1,
  },

  trustTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.black,
  },

  trustDescription: {
    fontSize: 9.5,
    lineHeight: 14,
    color: COLORS.secondary,
    marginTop: 4,
  },
});