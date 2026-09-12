import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function BookingConfirmationScreen() {
  const [confirmed, setConfirmed] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0.82)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.96,
        duration: 80,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleConfirm = () => {
    if (confirmed) {
      return;
    }

    animateButton();

    setTimeout(() => {
      setConfirmed(true);

      successScale.setValue(0.82);
      successOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }, 180);
  };

  if (confirmed) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FFFFFF', '#F5F5F2', '#EDEDE9']}
          style={styles.background}
        />

        <SafeAreaView style={styles.successSafeArea}>
          <Animated.View
            style={[
              styles.successContainer,
              {
                opacity: successOpacity,
                transform: [{ scale: successScale }],
              },
            ]}
          >
            <View style={styles.successIconOuter}>
              <LinearGradient
                colors={['#111111', '#343434']}
                style={styles.successIcon}
              >
                <Ionicons
                  name="checkmark"
                  size={42}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>

            <Text style={styles.successEyebrow}>
              AGENDAMENTO CONFIRMADO
            </Text>

            <Text style={styles.successTitle}>
              Está tudo pronto.
            </Text>

            <Text style={styles.successDescription}>
              O seu horário foi reservado com sucesso. Estamos
              esperando por si no Gentleman&apos;s Club.
            </Text>

            <View style={styles.successBookingCard}>
              <View style={styles.successBookingHeader}>
                <View>
                  <Text style={styles.successBookingLabel}>
                    SEU AGENDAMENTO
                  </Text>
                  <Text style={styles.successBookingTitle}>
                    Gentleman&apos;s Club
                  </Text>
                </View>

                <View style={styles.confirmedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color="#111111"
                  />
                  <Text style={styles.confirmedBadgeText}>
                    Confirmado
                  </Text>
                </View>
              </View>

              <View style={styles.successDivider} />

              <View style={styles.successInfoRow}>
                <View style={styles.successInfoIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={17}
                    color="#111111"
                  />
                </View>

                <View>
                  <Text style={styles.successInfoLabel}>DATA</Text>
                  <Text style={styles.successInfoValue}>
                    Sexta-feira, 4 de Setembro
                  </Text>
                </View>
              </View>

              <View style={styles.successInfoRow}>
                <View style={styles.successInfoIcon}>
                  <Ionicons
                    name="time-outline"
                    size={17}
                    color="#111111"
                  />
                </View>

                <View>
                  <Text style={styles.successInfoLabel}>HORÁRIO</Text>
                  <Text style={styles.successInfoValue}>
                    14:30 · 45 min
                  </Text>
                </View>
              </View>

              <View style={styles.successInfoRow}>
                <View style={styles.successInfoIcon}>
                  <Ionicons
                    name="person-outline"
                    size={17}
                    color="#111111"
                  />
                </View>

                <View>
                  <Text style={styles.successInfoLabel}>
                    PROFISSIONAL
                  </Text>
                  <Text style={styles.successInfoValue}>
                    Daniel Monteiro
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              onPress={() => router.replace('/appointments')}
              style={({ pressed }) => [
                styles.successPrimaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.successPrimaryText}>
                Ver meus agendamentos
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#FFFFFF"
              />
            </Pressable>

            <Pressable
              onPress={() => router.replace('/')}
              style={({ pressed }) => [
                styles.homeButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.homeButtonText}>
                Voltar para o início
              </Text>
            </Pressable>
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#F7F7F5', '#EEEEEB']}
        style={styles.background}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={21}
                color="#111111"
              />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.eyebrow}>AGENDAMENTO</Text>
              <Text style={styles.headerTitle}>Confirmar</Text>
            </View>

            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>4/4</Text>
            </View>
          </View>

          {/* PROGRESS */}
          <View style={styles.progressArea}>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <View style={styles.progressLabels}>
              <Text style={styles.progressInactive}>Serviço</Text>
              <Text style={styles.progressInactive}>
                Profissional
              </Text>
              <Text style={styles.progressInactive}>Data</Text>
              <Text style={styles.progressActive}>Confirmar</Text>
            </View>
          </View>

          {/* HERO */}
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <LinearGradient
                colors={['#111111', '#333333']}
                style={styles.heroIconGradient}
              >
                <Ionicons
                  name="checkmark-done"
                  size={27}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </View>

            <Text style={styles.heroEyebrow}>
              QUASE TERMINADO
            </Text>

            <Text style={styles.heroTitle}>
              Revise os detalhes
            </Text>

            <Text style={styles.heroDescription}>
              Confirme se todas as informações estão corretas antes
              de finalizar o seu agendamento.
            </Text>
          </View>

          {/* SPACE */}
          <View style={styles.spaceCard}>
            <View style={styles.spaceImage}>
              <LinearGradient
                colors={['#222222', '#555555']}
                style={styles.spaceImageGradient}
              />

              <View style={styles.spaceImageContent}>
                <Text style={styles.spaceImageBrand}>
                  GENTLEMAN&apos;S
                </Text>
                <Text style={styles.spaceImageBrandSmall}>
                  CLUB
                </Text>
              </View>

              <View style={styles.ratingBadge}>
                <Ionicons
                  name="star"
                  size={12}
                  color="#FFFFFF"
                />
                <Text style={styles.ratingText}>4.9</Text>
              </View>
            </View>

            <View style={styles.spaceInfo}>
              <Text style={styles.spaceLabel}>ESPAÇO</Text>

              <Text style={styles.spaceTitle}>
                Gentleman&apos;s Club
              </Text>

              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color="#777773"
                />

                <Text style={styles.locationText}>
                  Talatona, Luanda
                </Text>
              </View>
            </View>
          </View>

          {/* MAIN SUMMARY */}
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardEyebrow}>RESUMO</Text>
                <Text style={styles.cardTitle}>
                  Seu agendamento
                </Text>
              </View>

              <View style={styles.lockIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color="#555551"
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* SERVICE */}
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="cut-outline"
                  size={19}
                  color="#111111"
                />
              </View>

              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>SERVIÇO</Text>
                <Text style={styles.detailValue}>
                  Corte Premium
                </Text>
                <Text style={styles.detailMeta}>
                  45 minutos
                </Text>
              </View>

              <Text style={styles.detailPrice}>
                12.000 Kz
              </Text>
            </View>

            {/* PROFESSIONAL */}
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color="#111111"
                />
              </View>

              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>
                  PROFISSIONAL
                </Text>
                <Text style={styles.detailValue}>
                  Daniel Monteiro
                </Text>
                <Text style={styles.detailMeta}>
                  Master Barber · ★ 4.9
                </Text>
              </View>
            </View>

            {/* DATE */}
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color="#111111"
                />
              </View>

              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>DATA</Text>
                <Text style={styles.detailValue}>
                  Sexta-feira, 4 de Setembro
                </Text>
                <Text style={styles.detailMeta}>
                  Setembro de 2026
                </Text>
              </View>
            </View>

            {/* TIME */}
            <View style={styles.detailRowLast}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name="time-outline"
                  size={19}
                  color="#111111"
                />
              </View>

              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>HORÁRIO</Text>
                <Text style={styles.detailValue}>
                  14:30
                </Text>
                <Text style={styles.detailMeta}>
                  Duração estimada: 45 min
                </Text>
              </View>
            </View>
          </View>

          {/* PRICE */}
          <View style={styles.priceCard}>
            <View>
              <Text style={styles.priceLabel}>
                TOTAL DO AGENDAMENTO
              </Text>

              <Text style={styles.priceTitle}>
                12.000 Kz
              </Text>
            </View>

            <View style={styles.priceIcon}>
              <Ionicons
                name="wallet-outline"
                size={21}
                color="#111111"
              />
            </View>
          </View>

          {/* POLICY */}
          <View style={styles.policyCard}>
            <View style={styles.policyIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#111111"
              />
            </View>

            <View style={styles.policyContent}>
              <Text style={styles.policyTitle}>
                Reserva segura
              </Text>

              <Text style={styles.policyText}>
                Pode cancelar ou alterar o seu agendamento de acordo
                com a política do espaço. Recomendamos chegar pelo
                menos 5 minutos antes.
              </Text>
            </View>
          </View>

          {/* CHECKLIST */}
          <View style={styles.checklist}>
            <View style={styles.checkItem}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#111111"
              />
              <Text style={styles.checkText}>
                Serviço selecionado
              </Text>
            </View>

            <View style={styles.checkItem}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#111111"
              />
              <Text style={styles.checkText}>
                Profissional selecionado
              </Text>
            </View>

            <View style={styles.checkItem}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#111111"
              />
              <Text style={styles.checkText}>
                Data e horário selecionados
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>

        {/* BOTTOM CTA */}
        <BlurView
          intensity={88}
          tint="light"
          style={styles.bottomBar}
        >
          <View style={styles.bottomBarInner}>
            <View style={styles.totalPreview}>
              <Text style={styles.totalPreviewLabel}>
                TOTAL
              </Text>

              <Text style={styles.totalPreviewValue}>
                12.000 Kz
              </Text>
            </View>

            <Animated.View
              style={[
                styles.confirmButtonWrapper,
                {
                  transform: [{ scale: buttonScale }],
                },
              ]}
            >
              <Pressable
                onPress={handleConfirm}
                style={({ pressed }) => [
                  styles.confirmButton,
                  pressed && styles.pressed,
                ]}
              >
                <LinearGradient
                  colors={['#111111', '#292929']}
                  style={styles.confirmGradient}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text style={styles.confirmText}>
                    Confirmar
                  </Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>
        </BlurView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F0',
  },

  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  safeArea: {
    flex: 1,
  },

  successSafeArea: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 135,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  eyebrow: {
    fontSize: 9,
    letterSpacing: 1.7,
    fontWeight: '800',
    color: '#8A8A86',
    marginBottom: 3,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111111',
  },

  stepBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
  },

  stepText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  progressArea: {
    marginBottom: 28,
  },

  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDDDD9',
    overflow: 'hidden',
  },

  progressFill: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: '#111111',
  },

  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },

  progressActive: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111111',
  },

  progressInactive: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A1A19D',
  },

  hero: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 27,
  },

  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 15,
  },

  heroIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroEyebrow: {
    fontSize: 9,
    letterSpacing: 1.6,
    fontWeight: '900',
    color: '#8D8D89',
    marginBottom: 5,
  },

  heroTitle: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -0.8,
    textAlign: 'center',
  },

  heroDescription: {
    marginTop: 8,
    maxWidth: 310,
    fontSize: 11,
    lineHeight: 17,
    color: '#777773',
    textAlign: 'center',
    fontWeight: '500',
  },

  spaceCard: {
    backgroundColor: 'rgba(255,255,255,0.84)',
    borderRadius: 23,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    marginBottom: 18,
  },

  spaceImage: {
    height: 125,
    overflow: 'hidden',
    position: 'relative',
  },

  spaceImageGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  spaceImageContent: {
    position: 'absolute',
    left: 18,
    bottom: 17,
  },

  spaceImageBrand: {
    fontSize: 17,
    letterSpacing: 3,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  spaceImageBrandSmall: {
    fontSize: 8,
    letterSpacing: 4,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.72)',
    marginTop: 1,
  },

  ratingBadge: {
    position: 'absolute',
    right: 14,
    top: 14,
    height: 29,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.48)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  ratingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  spaceInfo: {
    padding: 15,
  },

  spaceLabel: {
    fontSize: 8,
    letterSpacing: 1.2,
    fontWeight: '900',
    color: '#999995',
    marginBottom: 4,
  },

  spaceTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#161616',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 4,
  },

  locationText: {
    fontSize: 10,
    color: '#777773',
    fontWeight: '600',
  },

  summaryCard: {
    padding: 16,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardEyebrow: {
    fontSize: 8,
    letterSpacing: 1.4,
    fontWeight: '900',
    color: '#999995',
    marginBottom: 4,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#151515',
  },

  lockIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#EEEEEA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#E6E6E2',
    marginVertical: 15,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEA',
  },

  detailRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 11,
    paddingBottom: 2,
  },

  detailIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: '#EEEEEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 8,
    letterSpacing: 1.1,
    fontWeight: '900',
    color: '#A0A09C',
    marginBottom: 3,
  },

  detailValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A1A1A',
  },

  detailMeta: {
    fontSize: 9,
    color: '#888884',
    fontWeight: '600',
    marginTop: 2,
  },

  detailPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111111',
    marginLeft: 8,
  },

  priceCard: {
    marginTop: 15,
    padding: 16,
    borderRadius: 21,
    backgroundColor: '#111111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  priceLabel: {
    fontSize: 8,
    letterSpacing: 1.2,
    fontWeight: '900',
    color: '#969692',
    marginBottom: 4,
  },

  priceTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  priceIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#E7E7E3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  policyCard: {
    marginTop: 15,
    padding: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
  },

  policyIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: '#E8E8E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  policyContent: {
    flex: 1,
  },

  policyTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#202020',
    marginBottom: 4,
  },

  policyText: {
    fontSize: 10,
    lineHeight: 15,
    color: '#777773',
    fontWeight: '500',
  },

  checklist: {
    marginTop: 17,
    gap: 9,
    paddingHorizontal: 4,
  },

  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  checkText: {
    fontSize: 10,
    color: '#696965',
    fontWeight: '700',
  },

  bottomSpace: {
    height: 20,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },

  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  totalPreview: {
    flex: 1,
  },

  totalPreviewLabel: {
    fontSize: 8,
    letterSpacing: 1.2,
    fontWeight: '900',
    color: '#999995',
    marginBottom: 4,
  },

  totalPreviewValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#151515',
  },

  confirmButtonWrapper: {
    width: 155,
  },

  confirmButton: {
    height: 53,
    borderRadius: 17,
    overflow: 'hidden',
  },

  confirmGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  confirmText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  pressed: {
    opacity: 0.8,
  },

  successContainer: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 42,
    alignItems: 'center',
  },

  successIconOuter: {
    width: 92,
    height: 92,
    borderRadius: 32,
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.75)',
    marginBottom: 22,
  },

  successIcon: {
    flex: 1,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },

  successEyebrow: {
    fontSize: 9,
    letterSpacing: 1.7,
    fontWeight: '900',
    color: '#888884',
    marginBottom: 6,
  },

  successTitle: {
    fontSize: 31,
    lineHeight: 36,
    fontWeight: '900',
    color: '#111111',
    letterSpacing: -1,
    textAlign: 'center',
  },

  successDescription: {
    maxWidth: 320,
    fontSize: 11,
    lineHeight: 17,
    color: '#777773',
    textAlign: 'center',
    marginTop: 9,
    fontWeight: '500',
  },

  successBookingCard: {
    width: '100%',
    marginTop: 27,
    padding: 17,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
  },

  successBookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  successBookingLabel: {
    fontSize: 8,
    letterSpacing: 1.3,
    fontWeight: '900',
    color: '#999995',
    marginBottom: 4,
  },

  successBookingTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#151515',
  },

  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 27,
    borderRadius: 14,
    backgroundColor: '#E9E9E5',
  },

  confirmedBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#222222',
  },

  successDivider: {
    height: 1,
    backgroundColor: '#E5E5E1',
    marginVertical: 15,
  },

  successInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  successInfoIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: '#EAEAE6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  successInfoLabel: {
    fontSize: 8,
    letterSpacing: 1.1,
    fontWeight: '900',
    color: '#A0A09C',
    marginBottom: 3,
  },

  successInfoValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1A1A1A',
  },

  successPrimaryButton: {
    width: '100%',
    height: 53,
    borderRadius: 17,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    marginTop: 21,
  },

  successPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  homeButton: {
    height: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  homeButtonText: {
    color: '#777773',
    fontSize: 11,
    fontWeight: '800',
  },
});