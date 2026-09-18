import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ActivityIndicator,
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

import type { ProfessionalDTO, ServiceDTO } from '@slotix/types';
import { getBusinessProfessionals, getBusinessServices } from '../../services/businesses';

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

const formatPrice = (value: number) => `${value.toLocaleString('pt-AO')} Kz`;

export default function BookingProfessionalScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    businessId?: string | string[];
    serviceId?: string | string[];
  }>();

  const businessId = Array.isArray(params.businessId)
    ? params.businessId[0]
    : params.businessId;

  const serviceId = Array.isArray(params.serviceId)
    ? params.serviceId[0]
    : params.serviceId;

  const [professionals, setProfessionals] = useState<ProfessionalDTO[]>([]);
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [selectedProfessionalId, setSelectedProfessionalId] =
    useState<string | null>(null);

  const continueScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!businessId || !serviceId) {
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);

      try {
        const [professionalsData, servicesData] = await Promise.all([
          getBusinessProfessionals(businessId as string),
          getBusinessServices(businessId as string).catch(() => []),
        ]);

        if (cancelled) return;
        setProfessionals(professionalsData);
        setServices(servicesData);
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
  }, [businessId, serviceId]);

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId) ?? null,
    [services, serviceId],
  );

  const selectedProfessional = useMemo(
    () =>
      professionals.find(
        (professional) => professional.id === selectedProfessionalId,
      ) ?? null,
    [professionals, selectedProfessionalId],
  );

  const canContinue = Boolean(selectedProfessionalId);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSelect = useCallback((professional: ProfessionalDTO) => {
    setSelectedProfessionalId(professional.id);
  }, []);

  const handleContinue = useCallback(() => {
    if (!businessId || !serviceId || !selectedProfessionalId) {
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
      pathname: '/booking/date',
      params: {
        businessId,
        serviceId,
        professionalId: selectedProfessionalId,
      },
    });
  }, [businessId, continueScale, router, selectedProfessionalId, serviceId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.centerState}>
            <ActivityIndicator color={COLORS.black} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.centerState}>
            <Text style={styles.errorTitle}>
              Não foi possível carregar os profissionais
            </Text>

            <Pressable onPress={handleBack} style={styles.errorButton}>
              <Text style={styles.errorButtonText}>Voltar</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces
        >
          {/* HEADER */}
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
                <Ionicons name="arrow-back" size={20} color={COLORS.black} />
              </BlurView>
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.headerEyebrow}>AGENDAMENTO</Text>
              <Text style={styles.headerTitle}>Escolha o profissional</Text>
            </View>

            <View style={styles.stepBadge}>
              <Text style={styles.stepCurrent}>2</Text>
              <Text style={styles.stepDivider}>/</Text>
              <Text style={styles.stepTotal}>4</Text>
            </View>
          </View>

          {/* PROGRESSO */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={['#1D63FF', '#4B83FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.progressActive}
              />
            </View>

            <View style={styles.progressLabels}>
              <Text style={styles.progressDone}>Serviço</Text>
              <Text style={styles.progressActiveText}>Profissional</Text>
              <Text style={styles.progressText}>Data</Text>
              <Text style={styles.progressText}>Confirmar</Text>
            </View>
          </View>

          {/* SERVIÇO ESCOLHIDO */}
          {selectedService ? (
            <View style={styles.serviceSummary}>
              <View style={styles.serviceSummaryIcon}>
                <Ionicons name="cut-outline" size={19} color={COLORS.blue} />
              </View>

              <View style={styles.serviceSummaryInfo}>
                <Text style={styles.serviceSummaryLabel}>
                  SERVIÇO ESCOLHIDO
                </Text>

                <Text style={styles.serviceSummaryName} numberOfLines={1}>
                  {selectedService.name}
                </Text>

                <View style={styles.serviceMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={COLORS.muted}
                    />

                    <Text style={styles.metaText}>
                      {selectedService.duration} min
                    </Text>
                  </View>

                  <View style={styles.metaSeparator} />

                  <Text style={styles.metaText}>
                    {formatPrice(selectedService.price)}
                  </Text>
                </View>
              </View>

              <View style={styles.serviceCheck}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.blue}
                />
              </View>
            </View>
          ) : null}

          {/* INTRO */}
          <View style={styles.intro}>
            <Text style={styles.title}>Quem prefere?</Text>

            <Text style={styles.subtitle}>
              Escolha o profissional que vai realizar o seu atendimento.
            </Text>
          </View>

          {/* LIST HEADER */}
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.sectionTitle}>Profissionais</Text>

              <Text style={styles.sectionSubtitle}>
                {professionals.length}{' '}
                {professionals.length === 1 ? 'disponível' : 'disponíveis'}{' '}
                neste espaço
              </Text>
            </View>
          </View>

          {/* PROFISSIONAIS */}
          <View style={styles.professionalsList}>
            {professionals.map((professional, index) => {
              const selected = selectedProfessionalId === professional.id;

              return (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  selected={selected}
                  index={index}
                  onPress={() => handleSelect(professional)}
                />
              );
            })}
          </View>

          {professionals.length === 0 ? (
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
                  Nenhum profissional disponível
                </Text>

                <Text style={styles.emptyText}>
                  Este espaço ainda não tem profissionais cadastrados.
                </Text>
              </View>
            </View>
          ) : null}

          {/* SEGURANÇA */}
          <View style={styles.trustCard}>
            <View style={styles.trustIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={COLORS.blue}
              />
            </View>

            <View style={styles.trustContent}>
              <Text style={styles.trustTitle}>Profissionais verificados</Text>

              <Text style={styles.trustText}>
                Todos os profissionais apresentados fazem parte da equipa do
                espaço.
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>

      {/* CTA FIXO */}
      <View style={styles.bottomContainer}>
        <BlurView intensity={88} tint="light" style={styles.bottomBlur}>
          <View style={styles.bottomContent}>
            <View style={styles.summary}>
              <Text style={styles.summaryLabel}>
                {selectedProfessional ? 'Profissional escolhido' : 'Profissional'}
              </Text>

              <Text style={styles.summaryValue} numberOfLines={1}>
                {selectedProfessional
                  ? selectedProfessional.name
                  : 'Selecione um profissional'}
              </Text>
            </View>

            <Animated.View
              style={{ transform: [{ scale: continueScale }] }}
            >
              <Pressable
                onPress={handleContinue}
                disabled={!canContinue}
                style={({ pressed }) => [
                  styles.continueButton,
                  !canContinue && styles.continueButtonDisabled,
                  pressed && canContinue && styles.continueButtonPressed,
                ]}
              >
                <Text
                  style={[
                    styles.continueText,
                    !canContinue && styles.continueTextDisabled,
                  ]}
                >
                  Continuar
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={canContinue ? '#FFFFFF' : '#A0A0A0'}
                />
              </Pressable>
            </Animated.View>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

function ProfessionalCard({
  professional,
  selected,
  index,
  onPress,
}: {
  professional: ProfessionalDTO;
  selected: boolean;
  index: number;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

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
      style={[styles.professionalWrapper, { transform: [{ scale }] }]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.professionalCard,
          selected && styles.professionalCardSelected,
          pressed && styles.professionalPressed,
        ]}
      >
        <View style={styles.imageContainer}>
          {professional.imageUrl ? (
            <Image
              source={{ uri: professional.imageUrl }}
              style={styles.professionalImage}
            />
          ) : (
            <View style={[styles.professionalImage, styles.imageFallback]}>
              <Ionicons name="person-outline" size={32} color={COLORS.muted} />
            </View>
          )}

          <LinearGradient
            pointerEvents="none"
            colors={['transparent', 'rgba(0,0,0,0.60)']}
            style={styles.imageGradient}
          />

          {professional.ratingAvg !== null ? (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color={COLORS.gold} />

              <Text style={styles.ratingText}>
                {professional.ratingAvg.toFixed(1)}
              </Text>
            </View>
          ) : null}

          {selected && (
            <View style={styles.selectedBadge}>
              <Ionicons name="checkmark" size={17} color="#FFFFFF" />
            </View>
          )}

          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>
              {String(index + 1).padStart(2, '0')}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.nameRow}>
            <View style={styles.nameArea}>
              <Text style={styles.professionalName} numberOfLines={1}>
                {professional.name}
              </Text>

              {professional.specialty ? (
                <Text style={styles.specialty}>{professional.specialty}</Text>
              ) : null}
            </View>

            <Ionicons
              name={selected ? 'checkmark-circle' : 'chevron-forward'}
              size={19}
              color={selected ? COLORS.blue : COLORS.muted}
            />
          </View>

          {professional.bio ? (
            <Text style={styles.about} numberOfLines={2}>
              {professional.bio}
            </Text>
          ) : null}

          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={13}
                color={COLORS.muted}
              />

              <Text style={styles.footerText}>
                {professional.ratingCount} avaliações
              </Text>
            </View>
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

  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
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
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  scrollContent: {
    paddingBottom: 30,
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
    backgroundColor: 'rgba(255,255,255,0.60)',
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

  progressContainer: {
    marginTop: 3,
    paddingHorizontal: 20,
  },

  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.07)',
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

  imageFallback: {
    backgroundColor: '#EEEEEA',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(255,255,255,0.94)',
  },

  ratingText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.text,
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
    backgroundColor: 'rgba(255,255,255,0.88)',
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

  trustCard: {
    marginTop: 22,
    marginHorizontal: 16,
    padding: 15,
    borderRadius: 21,
    flexDirection: 'row',
    backgroundColor: COLORS.blueSoft,
    borderWidth: 1,
    borderColor: 'rgba(29,99,255,0.10)',
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

  bottomSpace: {
    height: 155,
  },

  bottomContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.07)',
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
    transform: [{ scale: 0.97 }],
  },
});
