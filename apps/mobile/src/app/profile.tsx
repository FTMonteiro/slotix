
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';

import {
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { listMyAppointments } from '../services/appointments';

/* CORES */

const COLORS = {
  background: '#F5F5F2',
  white: '#FFFFFF',
  black: '#0B0B0C',
  text: '#111214',
  secondary: '#6F7074',
  muted: '#9A9B9F',
  border: '#E7E7E3',

  blue: '#155EEF',
  success: '#16A66A',

  danger: '#D92D20',
  dangerSoft: '#FFF1F0',

  softBackground: '#F3F3F0',
  quickBackground: '#F1F1EE',
};

/* TIPOS */

type IconName = keyof typeof Ionicons.glyphMap;

type MenuItemProps = {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
};

/* MENU ITEM */

const MenuItem = memo(
  ({ icon, title, subtitle, onPress }: MenuItemProps) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scale, {
        toValue: 0.985,
        useNativeDriver: true,
        speed: 30,
        bounciness: 5,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 5,
      }).start();
    };

    return (
      <Animated.View
        style={[
          styles.menuAnimated,
          {
            transform: [{ scale }],
          },
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.menuItem}
        >
          <View style={styles.menuIcon}>
            <Ionicons
              name={icon}
              size={20}
              color={COLORS.text}
            />
          </View>

          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>
              {title}
            </Text>

            {subtitle ? (
              <Text style={styles.menuSubtitle}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={COLORS.muted}
          />
        </Pressable>
      </Animated.View>
    );
  },
);

MenuItem.displayName = 'MenuItem';

/* SECTION */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <View style={styles.sectionCard}>
        {children}
      </View>
    </View>
  );
}

/* STAT*/

function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

/* QUICK ACTION */

function QuickAction({
  icon,
  title,
  onPress,
}: {
  icon: IconName;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        pressed && styles.quickActionPressed,
      ]}
    >
      <View style={styles.quickIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={COLORS.text}
        />
      </View>

      <Text style={styles.quickTitle}>
        {title}
      </Text>

      <Ionicons
        name="chevron-forward"
        size={17}
        color={COLORS.muted}
      />
    </Pressable>
  );
}

/* PROFILE SCREEN */

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout: authLogout } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [locationEnabled, setLocationEnabled] =
    useState(true);

  const [appointmentCount, setAppointmentCount] =
    useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    listMyAppointments()
      .then((data) => {
        if (!cancelled) setAppointmentCount(data.length);
      })
      .catch(() => {
        if (!cancelled) setAppointmentCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const initials = useMemo(() => {
    const result = (user?.name ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name.charAt(0).toUpperCase())
      .join('');

    return result || '?';
  }, [user?.name]);

  /* ROTAS */

  const goToEditProfile = () => {
    router.push('/perfil/personalinfo');
  };

  const goToNotifications = () => {
    router.push('/perfil/notifications');
  };

  const goToHelp = () => {
    router.push('/perfil/help');
  };

  const goToPrivacy = () => {
    router.push('/perfil/privacy');
  };

  const goToTerms = () => {
    router.push('/perfil/terms');
  };

  const goToSettings = () => {
    router.push('/perfil/settings');
  };

  const goToAppointments = () => {
    router.push('/appointments');
  };

  const goToFavorites = () => {
    router.push('/favorites');
  };

  const goToLanguage = () => {
    router.push('/perfil/language');
  };

  /* LOGOUT */

  const logout = () => {
    void authLogout();
    router.replace('/login');
  };

  /* RENDER */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.avatarWrapper}>
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {initials}
                </Text>
              </View>
            )}

            <View style={styles.verifiedBadge}>
              <Ionicons
                name="checkmark"
                size={11}
                color={COLORS.white}
              />
            </View>
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.activeRow}>
              <View style={styles.activeDot} />

              <Text style={styles.activeText}>
                Conta ativa
              </Text>
            </View>

            <Text style={styles.name}>
              {user?.name ?? ''}
            </Text>

            <View style={styles.locationRow}>
              <Ionicons
                name="mail-outline"
                size={14}
                color={COLORS.secondary}
              />

              <Text style={styles.location}>
                {user?.email ?? ''}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={goToEditProfile}
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.editButtonPressed,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={COLORS.text}
            />
          </Pressable>
        </View>

        {/* ESTATÍSTICAS */}

        <View style={styles.statsCard}>
          <Stat
            value={appointmentCount !== null ? String(appointmentCount) : '—'}
            label="Agendas"
          />

          <View style={styles.statDivider} />

          <Stat
            value={favoritesLoading ? '—' : String(favorites.length)}
            label="Favoritos"
          />
        </View>

        {/* ACESSO RÁPIDO */}

        <View style={styles.quickSection}>
          <Text style={styles.sectionTitle}>
            Acesso rápido
          </Text>

          <View style={styles.quickGrid}>
            <QuickAction
              icon="calendar-outline"
              title="Minhas agendas"
              onPress={goToAppointments}
            />

            <QuickAction
              icon="heart-outline"
              title="Favoritos"
              onPress={goToFavorites}
            />
          </View>
        </View>

        {/* CONTA */}
        <Section title="Conta">
          <MenuItem
            icon="create-outline"
            title="Editar perfil"
            subtitle="Atualizar informações do perfil"
            onPress={goToEditProfile}
          />

          <View style={styles.itemDivider} />

          <MenuItem
            icon="notifications-outline"
            title="Notificações"
            subtitle="Alertas e lembretes"
            onPress={goToNotifications}
          />
        </Section>

        {/* =================================================
            PREFERÊNCIAS
        ================================================= */}

        <Section title="Preferências">
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceIcon}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={COLORS.text}
              />
            </View>

            <View style={styles.preferenceContent}>
              <Text style={styles.menuTitle}>
                Notificações push
              </Text>

              <Text style={styles.menuSubtitle}>
                Receber lembretes e atualizações
              </Text>
            </View>

            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{
                false: '#D9DADD',
                true: COLORS.blue,
              }}
              thumbColor={COLORS.white}
              ios_backgroundColor="#D9DADD"
            />
          </View>

          <View style={styles.itemDivider} />

          <View style={styles.preferenceRow}>
            <View style={styles.preferenceIcon}>
              <Ionicons
                name="location-outline"
                size={20}
                color={COLORS.text}
              />
            </View>

            <View style={styles.preferenceContent}>
              <Text style={styles.menuTitle}>
                Localização
              </Text>

              <Text style={styles.menuSubtitle}>
                Melhorar recomendações próximas
              </Text>
            </View>

            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{
                false: '#D9DADD',
                true: COLORS.blue,
              }}
              thumbColor={COLORS.white}
              ios_backgroundColor="#D9DADD"
            />
          </View>

          <View style={styles.itemDivider} />

          <MenuItem
            icon="language-outline"
            title="Idioma"
            subtitle="Português (Angola)"
            onPress={goToLanguage}
          />
        </Section>

        {/* SUPORTE */}

        <Section title="Suporte">
          <MenuItem
            icon="help-circle-outline"
            title="Central de ajuda"
            subtitle="Perguntas e suporte"
            onPress={goToHelp}
          />

          <View style={styles.itemDivider} />

          <MenuItem
            icon="shield-checkmark-outline"
            title="Privacidade"
            subtitle="Proteção dos seus dados"
            onPress={goToPrivacy}
          />

          <View style={styles.itemDivider} />

          <MenuItem
            icon="document-text-outline"
            title="Termos de utilização"
            subtitle="Condições do SLOTIX"
            onPress={goToTerms}
          />
        </Section>

        {/* APLICAÇÃO */}

        <Section title="Aplicação">
          <MenuItem
            icon="settings-outline"
            title="Definições"
            subtitle="Preferências gerais"
            onPress={goToSettings}
          />
        </Section>

        {/*LOGOUT*/}

        <Pressable
          onPress={logout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutPressed,
          ]}
        >
          <Ionicons
            name="log-out-outline"
            size={19}
            color={COLORS.danger}
          />

          <Text style={styles.logoutText}>
            Terminar sessão
          </Text>
        </Pressable>

        {/*FOOTER*/}

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>
            SLOTIX
          </Text>

          <Text style={styles.footerText}>
            Uma experiência de agendamento mais simples.
          </Text>

          <Text style={styles.version}>
            Versão 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/*ESTILOS*/

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 150,
  },

  /*  HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  avatarText: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  verifiedBadge: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.blue,
    borderWidth: 3,
    borderColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerInfo: {
    flex: 1,
  },

  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },

  activeText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '700',
  },

  name: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  location: {
    marginLeft: 4,
    color: COLORS.secondary,
    fontSize: 13,
  },

  editButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  editButtonPressed: {
    transform: [{ scale: 0.95 }],
  },

  /*STATS*/

  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 26,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },

  statLabel: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 3,
  },

  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: COLORS.border,
  },

  /* QUICK ACTIONS*/

  quickSection: {
    marginBottom: 26,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 11,
    letterSpacing: 0.1,
  },

  quickGrid: {
    flexDirection: 'row',
    gap: 10,
  },

  quickAction: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  quickActionPressed: {
    transform: [{ scale: 0.985 }],
  },

  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.quickBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  quickTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },

  /*  SECTIONS */

  section: {
    marginBottom: 26,
  },

  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  /* MENU*/

  menuAnimated: {
    width: '100%',
  },

  menuItem: {
    minHeight: 72,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.softBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  menuContent: {
    flex: 1,
    paddingRight: 10,
  },

  menuTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },

  menuSubtitle: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },

  itemDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 67,
  },

  /*PREFERÊNCIAS*/

  preferenceRow: {
    minHeight: 72,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.softBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  preferenceContent: {
    flex: 1,
    paddingRight: 10,
  },

  /*LOGOUT*/

  logoutButton: {
    height: 58,
    borderRadius: 19,
    backgroundColor: COLORS.dangerSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  logoutPressed: {
    transform: [{ scale: 0.985 }],
  },

  logoutText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },

  /* FOOTER*/

  footer: {
    alignItems: 'center',
    paddingBottom: 10,
  },

  footerBrand: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },

  version: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },
});
