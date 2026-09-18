import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import type {
  BusinessDTO,
  GalleryImageDTO,
  ProfessionalDTO,
  ReviewDTO,
  ServiceDTO,
} from '@slotix/types';

import {
  getBusiness,
  getBusinessGallery,
  getBusinessProfessionals,
  getBusinessReviews,
  getBusinessServices,
} from '../services/businesses';

import { useFavorites } from '../contexts/FavoritesContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  background: '#F4F4F1',
  white: '#FFFFFF',
  black: '#111111',
  gold: '#B08D57',
  text: '#151515',
  muted: '#777777',
  soft: '#A1A1A1',
  border: 'rgba(17,17,17,0.08)',
  glass: 'rgba(255,255,255,0.72)',
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace('AOA', 'Kz');

const formatReviewDate = (value: string) =>
  new Intl.DateTimeFormat('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));

const GlassCard = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) => (
  <View style={[styles.glassCard, style]}>
    <BlurView intensity={32} tint="light" style={StyleSheet.absoluteFill} />

    <LinearGradient
      colors={['rgba(255,255,255,0.86)', 'rgba(255,255,255,0.60)']}
      style={StyleSheet.absoluteFill}
    />

    <View style={styles.glassTopLine} />

    {children}
  </View>
);

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
      <Text style={styles.sectionNumberText}>{number}</Text>
    </View>

    <View style={styles.sectionHeaderContent}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {subtitle ? (
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      ) : null}
    </View>
  </View>
);

const SpaceCarousel = ({
  photos,
  name,
  location,
  ratingAvg,
  ratingCount,
  favorite,
  onFavorite,
}: {
  photos: string[];
  name: string;
  location: string | null;
  ratingAvg: number | null;
  ratingCount: number;
  favorite: boolean;
  onFavorite: () => void;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<FlatList<string>>(null);

  useEffect(() => {
    if (photos.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      const nextIndex =
        activeIndex >= photos.length - 1 ? 0 : activeIndex + 1;

      carouselRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setActiveIndex(nextIndex);
    }, 4500);

    return () => clearInterval(interval);
  }, [activeIndex, photos.length]);

  const onScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
    );

    setActiveIndex(index);
  };

  const Overlay = () => (
    <>
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.02)',
          'rgba(0,0,0,0.15)',
          'rgba(0,0,0,0.72)',
        ]}
        style={StyleSheet.absoluteFill}
      />

      <Pressable onPress={onFavorite} style={styles.favoriteButton}>
        <BlurView
          intensity={35}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />

        <Ionicons
          name={favorite ? 'heart' : 'heart-outline'}
          size={21}
          color="#FFFFFF"
        />
      </Pressable>

      <View style={styles.carouselBottom}>
        <View style={styles.carouselBottomText}>
          {location ? (
            <Text style={styles.spaceLocation} numberOfLines={1}>
              {location}
            </Text>
          ) : null}

          <Text style={styles.spaceName} numberOfLines={2}>
            {name}
          </Text>
        </View>

        {ratingAvg !== null ? (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#D6B477" />

            <Text style={styles.ratingText}>
              {ratingAvg.toFixed(1)} ({ratingCount})
            </Text>
          </View>
        ) : null}
      </View>
    </>
  );

  if (photos.length === 0) {
    return (
      <View style={styles.carouselWrapper}>
        <View style={[styles.carouselImageWrapper, styles.imageFallback]}>
          <Ionicons
            name="storefront-outline"
            size={48}
            color="rgba(255,255,255,0.45)"
          />

          <Overlay />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.carouselWrapper}>
      <FlatList
        ref={carouselRef}
        data={photos}
        keyExtractor={(_, index) => String(index)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <View style={styles.carouselImageWrapper}>
            <Image
              source={{ uri: item }}
              style={styles.carouselImage}
              resizeMode="cover"
            />

            <Overlay />
          </View>
        )}
      />

      {photos.length > 1 ? (
        <View style={styles.carouselIndicators}>
          {photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.carouselIndicator,
                index === activeIndex && styles.carouselIndicatorActive,
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

const ServiceRow = ({
  service,
  last,
}: {
  service: ServiceDTO;
  last: boolean;
}) => (
  <View style={[styles.listRow, !last && styles.listRowDivider]}>
    <View style={styles.listRowIcon}>
      <Ionicons name="cut-outline" size={19} color={COLORS.black} />
    </View>

    <View style={styles.listRowInfo}>
      <Text style={styles.listRowName} numberOfLines={1}>
        {service.name}
      </Text>

      <Text style={styles.listRowMeta}>{service.duration} min</Text>
    </View>

    <Text style={styles.listRowPrice}>{formatPrice(service.price)}</Text>
  </View>
);

const ProfessionalRow = ({
  professional,
  last,
}: {
  professional: ProfessionalDTO;
  last: boolean;
}) => (
  <View style={[styles.listRow, !last && styles.listRowDivider]}>
    {professional.imageUrl ? (
      <Image
        source={{ uri: professional.imageUrl }}
        style={styles.professionalImage}
      />
    ) : (
      <View style={[styles.professionalImage, styles.imageFallbackSmall]}>
        <Ionicons name="person-outline" size={20} color={COLORS.soft} />
      </View>
    )}

    <View style={styles.listRowInfo}>
      <Text style={styles.listRowName} numberOfLines={1}>
        {professional.name}
      </Text>

      {professional.specialty || professional.bio ? (
        <Text style={styles.listRowMeta} numberOfLines={1}>
          {professional.specialty ?? professional.bio}
        </Text>
      ) : null}
    </View>

    {professional.ratingAvg !== null ? (
      <View style={styles.professionalRating}>
        <Ionicons name="star" size={12} color={COLORS.gold} />

        <Text style={styles.professionalRatingText}>
          {professional.ratingAvg.toFixed(1)}
        </Text>
      </View>
    ) : null}
  </View>
);

const ReviewRow = ({
  review,
  last,
}: {
  review: ReviewDTO;
  last: boolean;
}) => (
  <View style={[styles.reviewRow, !last && styles.listRowDivider]}>
    <View style={styles.reviewHeader}>
      <Text style={styles.reviewName} numberOfLines={1}>
        {review.clientName}
      </Text>

      <View style={styles.reviewRating}>
        <Ionicons name="star" size={12} color={COLORS.gold} />

        <Text style={styles.reviewRatingText}>{review.rating}</Text>
      </View>
    </View>

    {review.comment ? (
      <Text style={styles.reviewComment}>{review.comment}</Text>
    ) : null}

    <Text style={styles.reviewDate}>
      {formatReviewDate(review.createdAt)}
    </Text>
  </View>
);

const SpaceScreen = () => {
  const router = useRouter();

  const params = useLocalSearchParams<{ businessId?: string | string[] }>();
  const businessId = Array.isArray(params.businessId)
    ? params.businessId[0]
    : params.businessId;

  const { isFavorite, toggleFavorite } = useFavorites();

  const [business, setBusiness] = useState<BusinessDTO | null>(null);
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalDTO[]>([]);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [gallery, setGallery] = useState<GalleryImageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);

      try {
        const businessData = await getBusiness(businessId as string);
        if (cancelled) return;
        setBusiness(businessData);

        const [servicesData, professionalsData, reviewsData, galleryData] =
          await Promise.all([
            getBusinessServices(businessId as string).catch(() => []),
            getBusinessProfessionals(businessId as string).catch(() => []),
            getBusinessReviews(businessId as string).catch(() => []),
            getBusinessGallery(businessId as string).catch(() => []),
          ]);

        if (cancelled) return;

        setServices(servicesData);
        setProfessionals(professionalsData);
        setReviews(reviewsData);
        setGallery(galleryData);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [businessId]);

  const photos = useMemo(() => {
    if (gallery.length > 0) {
      return [...gallery]
        .sort((a, b) => a.position - b.position)
        .map((image) => image.url);
    }

    return business?.imageUrl ? [business.imageUrl] : [];
  }, [gallery, business]);

  const handleReserve = () => {
    if (!businessId) return;

    router.push({
      pathname: '/booking/service',
      params: { businessId },
    });
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.centerState}>
            <ActivityIndicator color={COLORS.black} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error || !business || !businessId) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.centerState}>
            <View style={styles.errorIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={28}
                color={COLORS.muted}
              />
            </View>

            <Text style={styles.errorTitle}>
              Não foi possível carregar este espaço
            </Text>

            <Pressable
              onPress={() => router.back()}
              style={styles.errorButton}
            >
              <Text style={styles.errorButtonText}>Voltar</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  let sectionIndex = 0;
  const nextNumber = () => String(++sectionIndex).padStart(2, '0');

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <SpaceCarousel
            photos={photos}
            name={business.name}
            location={business.address ?? business.category}
            ratingAvg={business.ratingAvg}
            ratingCount={business.ratingCount}
            favorite={isFavorite(businessId)}
            onFavorite={() => void toggleFavorite(businessId)}
          />

          {business.description ? (
            <View style={styles.section}>
              <SectionHeader number={nextNumber()} title="Sobre o espaço" />

              <GlassCard style={styles.aboutCard}>
                <Text style={styles.aboutText}>{business.description}</Text>
              </GlassCard>
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionHeader
              number={nextNumber()}
              title="Serviços"
              subtitle={
                services.length > 0
                  ? `${services.length} ${
                      services.length === 1
                        ? 'serviço disponível'
                        : 'serviços disponíveis'
                    }`
                  : undefined
              }
            />

            {services.length > 0 ? (
              <GlassCard>
                {services.map((service, index) => (
                  <ServiceRow
                    key={service.id}
                    service={service}
                    last={index === services.length - 1}
                  />
                ))}
              </GlassCard>
            ) : (
              <Text style={styles.emptyText}>
                Sem serviços disponíveis neste espaço.
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              number={nextNumber()}
              title="Profissionais"
              subtitle={
                professionals.length > 0
                  ? `${professionals.length} ${
                      professionals.length === 1
                        ? 'profissional'
                        : 'profissionais'
                    }`
                  : undefined
              }
            />

            {professionals.length > 0 ? (
              <GlassCard>
                {professionals.map((professional, index) => (
                  <ProfessionalRow
                    key={professional.id}
                    professional={professional}
                    last={index === professionals.length - 1}
                  />
                ))}
              </GlassCard>
            ) : (
              <Text style={styles.emptyText}>
                Sem profissionais disponíveis neste espaço.
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader
              number={nextNumber()}
              title="Avaliações"
              subtitle={
                reviews.length > 0
                  ? `${reviews.length} ${
                      reviews.length === 1 ? 'avaliação' : 'avaliações'
                    }`
                  : undefined
              }
            />

            {reviews.length > 0 ? (
              <GlassCard>
                {reviews.map((review, index) => (
                  <ReviewRow
                    key={review.id}
                    review={review}
                    last={index === reviews.length - 1}
                  />
                ))}
              </GlassCard>
            ) : (
              <Text style={styles.emptyText}>Sem avaliações ainda.</Text>
            )}
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>

      <View style={styles.reserveBar}>
        <BlurView intensity={88} tint="light" style={styles.reserveBlur}>
          <Pressable
            onPress={handleReserve}
            style={({ pressed }) => [
              styles.reserveButton,
              pressed && styles.reserveButtonPressed,
            ]}
          >
            <Text style={styles.reserveButtonText}>Reservar</Text>

            <View style={styles.reserveArrow}>
              <Ionicons name="arrow-forward" size={19} color={COLORS.white} />
            </View>
          </Pressable>
        </BlurView>
      </View>
    </View>
  );
};

export default SpaceScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  content: {
    paddingBottom: 36,
  },

  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  errorIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(17,17,17,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  errorTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },

  errorButton: {
    marginTop: 18,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
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

  imageFallback: {
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageFallbackSmall: {
    backgroundColor: 'rgba(17,17,17,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
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
    borderColor: 'rgba(255,255,255,0.20)',
  },

  carouselBottom: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 38,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  carouselBottomText: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },

  spaceLocation: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 5,
  },

  spaceName: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  ratingContainer: {
    height: 35,
    paddingHorizontal: 11,
    borderRadius: 18,
    backgroundColor: 'rgba(17,17,17,0.55)',
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
    backgroundColor: 'rgba(255,255,255,0.30)',
  },

  carouselIndicatorActive: {
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.black,
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
    borderColor: 'rgba(255,255,255,0.95)',
    backgroundColor: COLORS.glass,
    position: 'relative',
  },

  glassTopLine: {
    position: 'absolute',
    top: 0,
    left: 18,
    right: 18,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    zIndex: 5,
  },

  aboutCard: {
    padding: 18,
  },

  aboutText: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.text,
  },

  emptyText: {
    fontSize: 12,
    color: COLORS.muted,
    paddingHorizontal: 2,
  },

  listRow: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  listRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  listRowIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17,17,17,0.055)',
  },

  professionalImage: {
    width: 45,
    height: 45,
    borderRadius: 15,
    marginRight: 12,
  },

  listRowInfo: {
    flex: 1,
    minWidth: 0,
  },

  listRowName: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '800',
  },

  listRowMeta: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 11,
  },

  listRowPrice: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
  },

  professionalRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },

  professionalRatingText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '800',
  },

  reviewRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  reviewName: {
    flex: 1,
    marginRight: 8,
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '800',
  },

  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  reviewRatingText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '800',
  },

  reviewComment: {
    marginTop: 6,
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
  },

  reviewDate: {
    marginTop: 8,
    color: COLORS.soft,
    fontSize: 10,
    fontWeight: '600',
  },

  bottomSpace: {
    height: 100,
  },

  reserveBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.07)',
  },

  reserveBlur: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },

  reserveButton: {
    height: 58,
    borderRadius: 22,
    paddingLeft: 24,
    paddingRight: 8,
    backgroundColor: COLORS.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  reserveButtonPressed: {
    opacity: 0.9,
  },

  reserveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },

  reserveArrow: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
