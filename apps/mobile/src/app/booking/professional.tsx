import React, { useCallback, useMemo, useRef, useState } from 'react';

import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

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

type Service = {
  id: string;
  name: string;
  duration: string;
  price: string;
};

type Professional = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  about: string;
  image: string;
  available: boolean;
  tags: string[];
  serviceIds: string[];
};

/* -------------------------------------------------------------------------- */
/* SERVIÇOS                                                                    */
/* -------------------------------------------------------------------------- */

const services: Service[] = [
  {
    id: 'service-001',
    name: 'Corte Premium',
    duration: '45 min',
    price: '12.000 Kz',
  },
  {
    id: 'service-002',
    name: 'Corte + Barba',
    duration: '1h 15 min',
    price: '18.000 Kz',
  },
  {
    id: 'service-003',
    name: 'Barba Premium',
    duration: '30 min',
    price: '8.000 Kz',
  },
  {
    id: 'service-004',
    name: 'Styling',
    duration: '45 min',
    price: '10.000 Kz',
  },
  {
    id: 'service-005',
    name: 'Design',
    duration: '30 min',
    price: '7.000 Kz',
  },
  {
    id: 'service-006',
    name: 'Corte Executivo',
    duration: '45 min',
    price: '15.000 Kz',
  },
];

/* -------------------------------------------------------------------------- */
/* PROFISSIONAIS                                                               */
/* -------------------------------------------------------------------------- */

const professionals: Professional[] = [
  {
    id: 'professional-001',
    name: 'Daniel Monteiro',
    specialty: 'Master Barber',
    rating: 4.9,
    reviews: 128,
    experience: '8 anos',
    about:
      'Especialista em cortes personalizados, barba e visuais executivos.',
    image:
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=700&q=90',
    available: true,
    tags: ['Cortes', 'Barba', 'Executive'],
    serviceIds: [
      'service-001',
      'service-002',
      'service-003',
      'service-005',
      'service-006',
    ],
  },

  {
    id: 'professional-002',
    name: 'Lucas Andrade',
    specialty: 'Senior Barber',
    rating: 4.8,
    reviews: 96,
    experience: '6 anos',
    about:
      'Focado em técnicas modernas, fade e acabamento de alta precisão.',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=90',
    available: true,
    tags: ['Fade', 'Styling', 'Barba'],
    serviceIds: [
      'service-001',
      'service-002',
      'service-003',
      'service-004',
      'service-006',
    ],
  },

  {
    id: 'professional-003',
    name: 'Miguel Costa',
    specialty: 'Barber Specialist',
    rating: 4.9,
    reviews: 84,
    experience: '5 anos',
    about:
      'Especialista em cortes clássicos e transformações de estilo.',
    image:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=700&q=90',
    available: true,
    tags: ['Clássico', 'Fade', 'Styling'],
    serviceIds: [
      'service-001',
      'service-004',
      'service-006',
    ],
  },

  {
    id: 'professional-004',
    name: 'André Martins',
    specialty: 'Creative Barber',
    rating: 4.7,
    reviews: 71,
    experience: '4 anos',
    about:
      'Criativo e especializado em visuais contemporâneos e design.',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=90',
    available: false,
    tags: ['Creative', 'Design', 'Styling'],
    serviceIds: [
      'service-001',
      'service-004',
      'service-005',
      'service-006',
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* TELA                                                                        */
/* -------------------------------------------------------------------------- */

export default function BookingProfessionalScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    service?: string | string[];
  }>();

  const serviceId = Array.isArray(params.service)
    ? params.service[0]
    : params.service;

  const selectedService = useMemo(() => {
    return services.find((service) => service.id === serviceId);
  }, [serviceId]);

  const availableProfessionals = useMemo(() => {
    if (!serviceId) {
      return [];
    }

    return professionals.filter(
      (professional) =>
        professional.available &&
        professional.serviceIds.includes(serviceId),
    );
  }, [serviceId]);

  const [selectedProfessional, setSelectedProfessional] =
    useState<string | null>(null);

  const continueScale = useRef(new Animated.Value(1)).current;

  const canContinue = Boolean(selectedService);

  const selectedProfessionalData = useMemo(() => {
    if (!selectedProfessional) {
      return null;
    }

    return professionals.find(
      (professional) =>
        professional.id === selectedProfessional,
    );
  }, [selectedProfessional]);

  /* ------------------------------------------------------------------------ */
  /* VOLTAR                                                                    */
  /* ------------------------------------------------------------------------ */

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  /* ------------------------------------------------------------------------ */
  /* ESCOLHER PROFISSIONAL                                                     */
  /* ------------------------------------------------------------------------ */

  const handleSelect = useCallback(
    (professional: Professional) => {
      if (!professional.available) {
        return;
      }

      setSelectedProfessional(professional.id);
    },
    [],
  );

  /* ------------------------------------------------------------------------ */
  /* QUALQUER PROFISSIONAL                                                     */
  /* ------------------------------------------------------------------------ */

  const handleSelectAny = useCallback(() => {
    setSelectedProfessional(null);
  }, []);

  /* ------------------------------------------------------------------------ */
  /* CONTINUAR                                                                 */
  /* ------------------------------------------------------------------------ */

  const handleContinue = useCallback(() => {
    if (!serviceId || !selectedService) {
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

    const nextParams: {
      service: string;
      professional?: string;
    } = {
      service: serviceId,
    };

    if (selectedProfessional) {
      nextParams.professional = selectedProfessional;
    }

    router.push({
      pathname: '/booking/date',
      params: nextParams,
    });
  }, [
    continueScale,
    router,
    selectedProfessional,
    selectedService,
    serviceId,
  ]);

  return (
    <View style={styles.container}>
      <SafeAreaView
        edges={['top']}
        style={styles.safeArea}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces
        >
          {/* ---------------------------------------------------------------- */}
          {/* HEADER                                                           */}
          {/* ---------------------------------------------------------------- */}

          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
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
                Escolha o profissional
              </Text>
            </View>

            <View style={styles.stepBadge}>
              <Text style={styles.stepCurrent}>2</Text>

              <Text style={styles.stepDivider}>
                /
              </Text>

              <Text style={styles.stepTotal}>
                4
              </Text>
            </View>
          </View>

          {/* ---------------------------------------------------------------- */}
          {/* PROGRESSO                                                         */}
          {/* ---------------------------------------------------------------- */}

          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[
                  '#1D63FF',
                  '#4B83FF',
                ]}
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 0,
                }}
                style={styles.progressActive}
              />
            </View>

            <View style={styles.progressLabels}>
              <Text style={styles.progressDone}>
                Serviço
              </Text>

              <Text style={styles.progressActiveText}>
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

          {/* ---------------------------------------------------------------- */}
          {/* SERVIÇO ESCOLHIDO                                                 */}
          {/* ---------------------------------------------------------------- */}

          <View style={styles.serviceSummary}>
            <View style={styles.serviceSummaryIcon}>
              <Ionicons
                name="cut-outline"
                size={19}
                color={COLORS.blue}
              />
            </View>

            <View style={styles.serviceSummaryInfo}>
              <Text style={styles.serviceSummaryLabel}>
                SERVIÇO ESCOLHIDO
              </Text>

              <Text
                style={styles.serviceSummaryName}
                numberOfLines={1}
              >
                {selectedService?.name ??
                  'Serviço não selecionado'}
              </Text>

              <View style={styles.serviceMeta}>
                <View style={styles.metaItem}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={COLORS.muted}
                  />

                  <Text style={styles.metaText}>
                    {selectedService?.duration ?? '—'}
                  </Text>
                </View>

                <View style={styles.metaSeparator} />

                <Text style={styles.metaText}>
                  {selectedService?.price ?? '—'}
                </Text>
              </View>
            </View>

            <View style={styles.serviceCheck}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={
                  selectedService
                    ? COLORS.blue
                    : COLORS.muted
                }
              />
            </View>
          </View>

          {/* ---------------------------------------------------------------- */}
          {/* INTRO                                                             */}
          {/* ---------------------------------------------------------------- */}

          <View style={styles.intro}>
            <Text style={styles.title}>
              Quem prefere?
            </Text>

            <Text style={styles.subtitle}>
              Escolha um profissional específico ou
              deixe que o espaço encontre o melhor
              profissional disponível para si.
            </Text>
          </View>

          {/* ---------------------------------------------------------------- */}
          {/* RECOMENDAÇÃO                                                      */}
          {/* ---------------------------------------------------------------- */}

          <View style={styles.recommendation}>
            <View style={styles.recommendationIcon}>
              <Ionicons
                name="sparkles"
                size={17}
                color={COLORS.gold}
              />
            </View>

            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>
                Escolha personalizada
              </Text>

              <Text style={styles.recommendationText}>
                Os profissionais abaixo foram filtrados
                de acordo com o serviço escolhido.
              </Text>
            </View>
          </View>

          {/* ---------------------------------------------------------------- */}
          {/* LIST HEADER                                                       */}
          {/* ---------------------------------------------------------------- */}

          <View style={styles.listHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Profissionais
              </Text>

              <Text style={styles.sectionSubtitle}>
                {availableProfessionals.length}{' '}
                {availableProfessionals.length === 1
                  ? 'disponível'
                  : 'disponíveis'}{' '}
                para este serviço
              </Text>
            </View>

            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />

              <Text style={styles.onlineText}>
                Online
              </Text>
            </View>
          </View>

          {/* ---------------------------------------------------------------- */}
          {/* QUALQUER PROFISSIONAL                                             */}
          {/* ---------------------------------------------------------------- */}

          <View style={styles.anyProfessionalWrapper}>
            <Pressable
              onPress={handleSelectAny}
              style={({ pressed }) => [
                styles.anyProfessionalCard,
                selectedProfessional === null &&
                  styles.anyProfessionalSelected,
                pressed &&
                  styles.anyProfessionalPressed,
              ]}
            >
              <View style={styles.anyIcon}>
                <Ionicons
                  name="sparkles-outline"
                  size={23}
                  color={COLORS.blue}
                />
              </View>

              <View style={styles.anyContent}>
                <Text style={styles.anyTitle}>
                  Qualquer especialista disponível
                </Text>

                <Text style={styles.anySubtitle}>
                  Deixe o espaço escolher o melhor
                  profissional para este serviço.
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  selectedProfessional === null &&
                    styles.radioSelected,
                ]}
              >
                {selectedProfessional === null && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </Pressable>
          </View>

          {/* ---------------------------------------------------------------- */}
          {/* PROFISSIONAIS                                                     */}
          {/* ---------------------------------------------------------------- */}

          <View style={styles.professionalsList}>
            {availableProfessionals.map(
              (professional, index) => {
                const selected =
                  selectedProfessional ===
                  professional.id;

                return (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    selected={selected}
                    index={index}
                    onPress={() =>
                      handleSelect(professional)
                    }
                  />
                );
              },
            )}
          </View>

          {/* ---------------------------------------------------------------- */}
          {/* SEM PROFISSIONAIS ESPECÍFICOS                                    */}
          {/* ---------------------------------------------------------------- */}

          {availableProfessionals.length === 0 &&
            selectedService && (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="people-outline"
                    size={21}
                    color={COLORS.blue}
                  />
                </View>

                <View style={styles.emptyContent}>
                  <Text style={styles.emptyTitle}>
                    Nenhum especialista específico
                  </Text>

                  <Text style={styles.emptyText}>
                    Pode continuar com qualquer especialista
                    disponível para realizar este serviço.
                  </Text>
                </View>
              </View>
            )}

          {/* ---------------------------------------------------------------- */}
          {/* SEGURANÇA                                                        */}
          {/* ---------------------------------------------------------------- */}

          <View style={styles.trustCard}>
            <View style={styles.trustIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={COLORS.blue}
              />
            </View>

            <View style={styles.trustContent}>
              <Text style={styles.trustTitle}>
                Profissionais verificados
              </Text>

              <Text style={styles.trustText}>
                Todos os profissionais apresentados fazem
                parte da equipa do espaço.
              </Text>
            </View>
          </View>

          {/* Espaço extra para não ficar atrás do CTA */}
          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>

      {/* -------------------------------------------------------------------- */}
      {/* CTA FIXO                                                             */}
      {/* -------------------------------------------------------------------- */}

      <View style={styles.bottomContainer}>
        <BlurView
          intensity={88}
          tint="light"
          style={styles.bottomBlur}
        >
          <View style={styles.bottomContent}>
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>
                {selectedProfessionalData
                  ? 'Profissional escolhido'
                  : 'Profissional'}
              </Text>

              <Text
                style={styles.summaryValue}
                numberOfLines={1}
              >
                {selectedProfessionalData
                  ? selectedProfessionalData.name
                  : 'Qualquer disponível'}
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
                onPress={handleContinue}
                disabled={!canContinue}
                style={({ pressed }) => [
                  styles.continueButton,
                  !canContinue &&
                    styles.continueButtonDisabled,
                  pressed &&
                    canContinue &&
                    styles.continueButtonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.continueText,
                    !canContinue &&
                      styles.continueTextDisabled,
                  ]}
                >
                  Continuar
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={
                    canContinue
                      ? '#FFFFFF'
                      : '#A0A0A0'
                  }
                />
              </Pressable>
            </Animated.View>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

/* ========================================================================== */
/* CARD PROFISSIONAL                                                          */
/* ========================================================================== */

function ProfessionalCard({
  professional,
  selected,
  index,
  onPress,
}: {
  professional: Professional;
  selected: boolean;
  index: number;
  onPress: () => void;
}) {
  const scale = useRef(
    new Animated.Value(1),
  ).current;

  const handlePressIn = () => {
    if (!professional.available) {
      return;
    }

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
        styles.professionalWrapper,
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
        disabled={!professional.available}
        style={({ pressed }) => [
          styles.professionalCard,
          selected &&
            styles.professionalCardSelected,
          !professional.available &&
            styles.professionalCardUnavailable,
          pressed &&
            professional.available &&
            styles.professionalPressed,
        ]}
      >
        {/* IMAGEM */}

        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: professional.image,
            }}
            style={[
              styles.professionalImage,
              !professional.available &&
                styles.imageUnavailable,
            ]}
          />

          <LinearGradient
            pointerEvents="none"
            colors={[
              'transparent',
              'rgba(0,0,0,0.60)',
            ]}
            style={styles.imageGradient}
          />

          {/* RATING */}

          <View style={styles.ratingBadge}>
            <Ionicons
              name="star"
              size={11}
              color={COLORS.gold}
            />

            <Text style={styles.ratingText}>
              {professional.rating.toFixed(1)}
            </Text>
          </View>

          {/* ESTADO */}

          <View
            style={[
              styles.statusBadge,
              professional.available
                ? styles.statusAvailable
                : styles.statusUnavailable,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                professional.available
                  ? styles.statusDotAvailable
                  : styles.statusDotUnavailable,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                professional.available
                  ? styles.statusTextAvailable
                  : styles.statusTextUnavailable,
              ]}
            >
              {professional.available
                ? 'Disponível'
                : 'Indisponível'}
            </Text>
          </View>

          {/* SELECIONADO */}

          {selected && (
            <View style={styles.selectedBadge}>
              <Ionicons
                name="checkmark"
                size={17}
                color="#FFFFFF"
              />
            </View>
          )}

          {/* POSIÇÃO */}

          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>
              {String(index + 1).padStart(2, '0')}
            </Text>
          </View>
        </View>

        {/* CONTEÚDO */}

        <View style={styles.cardContent}>
          <View style={styles.nameRow}>
            <View style={styles.nameArea}>
              <Text
                style={styles.professionalName}
                numberOfLines={1}
              >
                {professional.name}
              </Text>

              <Text style={styles.specialty}>
                {professional.specialty}
              </Text>
            </View>

            <Ionicons
              name={
                selected
                  ? 'checkmark-circle'
                  : 'chevron-forward'
              }
              size={19}
              color={
                selected
                  ? COLORS.blue
                  : COLORS.muted
              }
            />
          </View>

          <Text
            style={styles.about}
            numberOfLines={2}
          >
            {professional.about}
          </Text>

          {/* TAGS */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tags}
          >
            {professional.tags.map((tag) => (
              <View
                key={tag}
                style={styles.tag}
              >
                <Text style={styles.tagText}>
                  {tag}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* META */}

          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Ionicons
                name="briefcase-outline"
                size={13}
                color={COLORS.muted}
              />

              <Text style={styles.footerText}>
                {professional.experience}
              </Text>
            </View>

            <View style={styles.footerSeparator} />

            <View style={styles.footerItem}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={13}
                color={COLORS.muted}
              />

              <Text style={styles.footerText}>
                {professional.reviews} avaliações
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ========================================================================== */
/* STYLES                                                                     */
/* ========================================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  /* ------------------------------------------------------------------------ */
  /* HEADER                                                                   */
  /* ------------------------------------------------------------------------ */

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
    marginHorizontal: 8,
  },

  headerEyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.7,
    color: COLORS.blue,
  },

  headerTitle: {
    marginTop: 3,
    fontSize: 16,
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

  /* ------------------------------------------------------------------------ */
  /* PROGRESSO                                                                */
  /* ------------------------------------------------------------------------ */

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
    width: '50%',
    height: '100%',
    borderRadius: 2,
  },

  progressLabels: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressDone: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.secondary,
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

  /* ------------------------------------------------------------------------ */
  /* SERVIÇO                                                                  */
  /* ------------------------------------------------------------------------ */

  serviceSummary: {
    marginTop: 23,
    marginHorizontal: 16,
    padding: 13,
    minHeight: 74,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  serviceSummaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blueSoft,
  },

  serviceSummaryInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },

  serviceSummaryLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.muted,
  },

  serviceSummaryName: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
  },

  serviceMeta: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  metaText: {
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

  serviceCheck: {
    width: 32,
    alignItems: 'flex-end',
  },

  /* ------------------------------------------------------------------------ */
  /* INTRO                                                                    */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* RECOMENDAÇÃO                                                             */
  /* ------------------------------------------------------------------------ */

  recommendation: {
    marginTop: 19,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 21,
    flexDirection: 'row',
    backgroundColor: '#F8F3E9',
    borderWidth: 1,
    borderColor:
      'rgba(181,138,69,0.10)',
  },

  recommendationIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  recommendationContent: {
    flex: 1,
    marginLeft: 10,
  },

  recommendationTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.text,
  },

  recommendationText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.secondary,
  },

  /* ------------------------------------------------------------------------ */
  /* LISTA                                                                    */
  /* ------------------------------------------------------------------------ */

  listHeader: {
    marginTop: 29,
    marginHorizontal: 20,
    marginBottom: 13,
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

  onlineBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor:
      'rgba(48,177,98,0.08)',
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#35A867',
  },

  onlineText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#318A58',
  },

  /* ------------------------------------------------------------------------ */
  /* QUALQUER PROFISSIONAL                                                   */
  /* ------------------------------------------------------------------------ */

  anyProfessionalWrapper: {
    paddingHorizontal: 14,
  },

  anyProfessionalCard: {
    minHeight: 94,
    padding: 14,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  anyProfessionalSelected: {
    borderColor: COLORS.blueBorder,
    backgroundColor: COLORS.blueSoft,
  },

  anyProfessionalPressed: {
    opacity: 0.86,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  anyIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blueSoft,
  },

  anyContent: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 10,
  },

  anyTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
  },

  anySubtitle: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.secondary,
  },

  radio: {
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D1D1CD',
    backgroundColor: COLORS.white,
  },

  radioSelected: {
    borderColor: COLORS.blue,
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.blue,
  },

  /* ------------------------------------------------------------------------ */
  /* PROFISSIONAIS                                                            */
  /* ------------------------------------------------------------------------ */

  professionalsList: {
    marginTop: 12,
    paddingHorizontal: 14,
    gap: 12,
  },

  professionalWrapper: {
    width: '100%',
  },

  professionalCard: {
    overflow: 'hidden',
    borderRadius: 27,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  professionalCardSelected: {
    borderColor: COLORS.blueBorder,
    backgroundColor: COLORS.blueSoft,
  },

  professionalCardUnavailable: {
    opacity: 0.55,
  },

  professionalPressed: {
    opacity: 0.92,
  },

  imageContainer: {
    height: 260,
    position: 'relative',
    overflow: 'hidden',
  },

  professionalImage: {
    width: '100%',
    height: '100%',
  },

  imageUnavailable: {
    opacity: 0.65,
  },

  imageGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  ratingBadge: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor:
      'rgba(255,255,255,0.94)',
  },

  ratingText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.text,
  },

  statusBadge: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  statusAvailable: {
    backgroundColor:
      'rgba(255,255,255,0.94)',
  },

  statusUnavailable: {
    backgroundColor:
      'rgba(20,20,20,0.78)',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusDotAvailable: {
    backgroundColor: '#35A867',
  },

  statusDotUnavailable: {
    backgroundColor: '#AAAAAA',
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },

  statusTextAvailable: {
    color: '#318A58',
  },

  statusTextUnavailable: {
    color: '#FFFFFF',
  },

  selectedBadge: {
    position: 'absolute',
    top: 13,
    right: 13,
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blue,
  },

  numberBadge: {
    position: 'absolute',
    top: 13,
    left: 13,
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(255,255,255,0.88)',
  },

  numberText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.text,
  },

  cardContent: {
    padding: 15,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  nameArea: {
    flex: 1,
    minWidth: 0,
  },

  professionalName: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
  },

  specialty: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.blue,
  },

  about: {
    marginTop: 9,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.secondary,
  },

  tags: {
    paddingTop: 11,
    paddingRight: 5,
    gap: 6,
  },

  tag: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: '#F3F3F0',
  },

  tagText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  cardFooter: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  footerText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.muted,
  },

  footerSeparator: {
    width: 3,
    height: 3,
    marginHorizontal: 8,
    borderRadius: 2,
    backgroundColor: '#C8C8C8',
  },

  /* ------------------------------------------------------------------------ */
  /* EMPTY                                                                    */
  /* ------------------------------------------------------------------------ */

  emptyCard: {
    marginTop: 12,
    marginHorizontal: 14,
    padding: 15,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blueSoft,
  },

  emptyContent: {
    flex: 1,
    marginLeft: 11,
  },

  emptyTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.text,
  },

  emptyText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.secondary,
  },

  /* ------------------------------------------------------------------------ */
  /* SEGURANÇA                                                                */
  /* ------------------------------------------------------------------------ */

  trustCard: {
    marginTop: 22,
    marginHorizontal: 16,
    padding: 15,
    borderRadius: 21,
    flexDirection: 'row',
    backgroundColor: COLORS.blueSoft,
    borderWidth: 1,
    borderColor:
      'rgba(29,99,255,0.10)',
  },

  trustIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },

  trustContent: {
    flex: 1,
    marginLeft: 10,
  },

  trustTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.text,
  },

  trustText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.secondary,
  },

  /* ------------------------------------------------------------------------ */
  /* ESPAÇO INFERIOR                                                          */
  /* ------------------------------------------------------------------------ */

  bottomSpace: {
    height: 155,
  },

  /* ------------------------------------------------------------------------ */
  /* CTA                                                                      */
  /* ------------------------------------------------------------------------ */

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
    paddingRight: 10,
  },

  summaryLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.muted,
  },

  summaryValue: {
    marginTop: 3,
    fontSize: 14,
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