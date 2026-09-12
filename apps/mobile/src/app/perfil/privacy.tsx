import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

type IconName = keyof typeof Ionicons.glyphMap;

const COLORS = {
  background: '#F5F5F2',
  white: '#FFFFFF',
  black: '#0B0B0C',
  text: '#111214',
  secondary: '#707176',
  muted: '#9A9B9F',
  border: '#E7E7E3',

  blue: '#155EEF',
  blueSoft: '#EEF4FF',

  green: '#16A66A',
  greenSoft: '#EAF9F2',

  orange: '#B54708',
  orangeSoft: '#FFF4E8',

  red: '#D92D20',
  redSoft: '#FFF0EE',
};

type SettingRowProps = {
  icon: IconName;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function SettingRow({
  icon,
  title,
  description,
  value,
  onValueChange,
}: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={COLORS.text}
        />
      </View>

      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>

        <Text style={styles.settingDescription}>
          {description}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: '#D9D9D5',
          true: '#AFC5FF',
        }}
        thumbColor={
          value ? COLORS.blue : COLORS.white
        }
      />
    </View>
  );
}

type LinkRowProps = {
  icon: IconName;
  title: string;
  description?: string;
  danger?: boolean;
  onPress: () => void;
};

function LinkRow({
  icon,
  title,
  description,
  danger = false,
  onPress,
}: LinkRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.linkRow,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.linkIcon,
          danger && styles.dangerIcon,
        ]}
      >
        <Ionicons
          name={icon}
          size={19}
          color={
            danger ? COLORS.red : COLORS.text
          }
        />
      </View>

      <View style={styles.linkContent}>
        <Text
          style={[
            styles.linkTitle,
            danger && styles.dangerTitle,
          ]}
        >
          {title}
        </Text>

        {description ? (
          <Text style={styles.linkDescription}>
            {description}
          </Text>
        ) : null}
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={
          danger ? COLORS.red : COLORS.muted
        }
      />
    </Pressable>
  );
}

export default function PrivacyScreen() {
  const router = useRouter();

  const [profileVisible, setProfileVisible] =
    useState(true);

  const [locationEnabled, setLocationEnabled] =
    useState(true);

  const [personalizedExperience, setPersonalizedExperience] =
    useState(true);

  const [analyticsEnabled, setAnalyticsEnabled] =
    useState(true);

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [securityAlerts, setSecurityAlerts] =
    useState(true);

  const handleLocationToggle = (value: boolean) => {
    setLocationEnabled(value);

    if (value) {
      Alert.alert(
        'Localização ativada',
        'O SLOTIX poderá usar a sua localização para melhorar a descoberta de espaços próximos.',
      );
    }
  };

  const handleProfileVisibility = (value: boolean) => {
    setProfileVisible(value);

    Alert.alert(
      value
        ? 'Perfil visível'
        : 'Perfil privado',
      value
        ? 'O seu perfil poderá aparecer em experiências personalizadas do SLOTIX.'
        : 'O seu perfil ficará mais restrito dentro da plataforma.',
    );
  };

  const handleAnalytics = (value: boolean) => {
    setAnalyticsEnabled(value);
  };

  const handlePersonalization = (value: boolean) => {
    setPersonalizedExperience(value);
  };

  const handleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
  };

  const handleSecurityAlerts = (value: boolean) => {
    setSecurityAlerts(value);
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Política de Privacidade',
      'Nesta versão do frontend, esta área é apenas demonstrativa. A política completa será apresentada quando a camada legal e o backend do SLOTIX forem integrados.',
      [
        {
          text: 'Entendi',
        },
      ],
    );
  };

  const handleTerms = () => {
    Alert.alert(
      'Termos de utilização',
      'Os termos completos do SLOTIX serão disponibilizados nesta área quando a versão final do serviço estiver pronta.',
      [
        {
          text: 'Fechar',
        },
      ],
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Os seus dados',
      'A exportação dos dados será disponibilizada quando o backend estiver conectado. Nesta fase, os dados desta tela são apenas locais.',
      [
        {
          text: 'OK',
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Apagar conta',
      'Esta ação é permanente. Na versão final, todos os dados associados à sua conta poderão ser eliminados.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Ação indisponível',
              'A eliminação da conta será ligada ao backend numa próxima etapa.',
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.container}>
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={23}
              color={COLORS.black}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Privacidade
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* SECURITY CARD */}

          <View style={styles.securityCard}>
            <View style={styles.securityTop}>
              <View style={styles.securityIcon}>
                <Ionicons
                  name="shield-checkmark"
                  size={25}
                  color={COLORS.green}
                />
              </View>

              <View style={styles.securityBadge}>
                <View style={styles.securityDot} />

                <Text style={styles.securityBadgeText}>
                  Protegido
                </Text>
              </View>
            </View>

            <Text style={styles.securityTitle}>
              A sua privacidade importa
            </Text>

            <Text style={styles.securityDescription}>
              Controle como o SLOTIX utiliza os seus dados
              e personalize a sua experiência.
            </Text>
          </View>

          {/* PROFILE */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Perfil e visibilidade
            </Text>

            <Text style={styles.sectionSubtitle}>
              Controle quem pode encontrar e interagir
              com o seu perfil.
            </Text>

            <View style={styles.settingsCard}>
              <SettingRow
                icon="eye-outline"
                title="Perfil visível"
                description="Permitir que o seu perfil seja utilizado nas experiências do SLOTIX."
                value={profileVisible}
                onValueChange={handleProfileVisibility}
              />

              <View style={styles.separator} />

              <SettingRow
                icon="location-outline"
                title="Localização"
                description="Usar a localização para mostrar espaços próximos."
                value={locationEnabled}
                onValueChange={handleLocationToggle}
              />
            </View>
          </View>

          {/* EXPERIENCE */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Experiência
            </Text>

            <Text style={styles.sectionSubtitle}>
              Escolha como o SLOTIX personaliza a sua
              experiência.
            </Text>

            <View style={styles.settingsCard}>
              <SettingRow
                icon="sparkles-outline"
                title="Experiência personalizada"
                description="Receber sugestões baseadas nos seus interesses."
                value={personalizedExperience}
                onValueChange={handlePersonalization}
              />

              <View style={styles.separator} />

              <SettingRow
                icon="analytics-outline"
                title="Dados de utilização"
                description="Permitir dados anónimos para melhorar o SLOTIX."
                value={analyticsEnabled}
                onValueChange={handleAnalytics}
              />
            </View>
          </View>

          {/* NOTIFICATIONS */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Comunicações
            </Text>

            <Text style={styles.sectionSubtitle}>
              Controle as comunicações relacionadas à sua
              conta.
            </Text>

            <View style={styles.settingsCard}>
              <SettingRow
                icon="notifications-outline"
                title="Notificações"
                description="Receber atualizações e informações importantes."
                value={notificationsEnabled}
                onValueChange={handleNotifications}
              />

              <View style={styles.separator} />

              <SettingRow
                icon="warning-outline"
                title="Alertas de segurança"
                description="Receber alertas sobre atividades importantes da conta."
                value={securityAlerts}
                onValueChange={handleSecurityAlerts}
              />
            </View>
          </View>

          {/* DATA */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Os seus dados
            </Text>

            <Text style={styles.sectionSubtitle}>
              Consulte e controle os dados associados à
              sua conta.
            </Text>

            <View style={styles.linksCard}>
              <LinkRow
                icon="download-outline"
                title="Obter os meus dados"
                description="Solicitar uma cópia dos seus dados."
                onPress={handleDownloadData}
              />

              <View style={styles.separator} />

              <LinkRow
                icon="document-text-outline"
                title="Política de privacidade"
                description="Saiba como os seus dados são tratados."
                onPress={handlePrivacyPolicy}
              />

              <View style={styles.separator} />

              <LinkRow
                icon="reader-outline"
                title="Termos de utilização"
                description="Consulte os termos do SLOTIX."
                onPress={handleTerms}
              />
            </View>
          </View>

          {/* SECURITY */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Segurança
            </Text>

            <Text style={styles.sectionSubtitle}>
              Mantenha a sua conta protegida.
            </Text>

            <View style={styles.securitySettingsCard}>
              <View style={styles.securitySettingsRow}>
                <View style={styles.securitySettingsIcon}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={19}
                    color={COLORS.text}
                  />
                </View>

                <View style={styles.securitySettingsText}>
                  <Text style={styles.securitySettingsTitle}>
                    Proteção da conta
                  </Text>

                  <Text
                    style={styles.securitySettingsDescription}
                  >
                    A sua conta está protegida.
                  </Text>
                </View>

                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />

                  <Text style={styles.activeBadgeText}>
                    Ativa
                  </Text>
                </View>
              </View>

              <View style={styles.separator} />

              <Pressable
                onPress={() =>
                  Alert.alert(
                    'Sessões',
                    'A gestão de sessões será ligada ao sistema de autenticação quando o backend for integrado.',
                  )
                }
                style={({ pressed }) => [
                  styles.securitySettingsRow,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.securitySettingsIcon}>
                  <Ionicons
                    name="phone-portrait-outline"
                    size={19}
                    color={COLORS.text}
                  />
                </View>

                <View style={styles.securitySettingsText}>
                  <Text style={styles.securitySettingsTitle}>
                    Dispositivos conectados
                  </Text>

                  <Text
                    style={styles.securitySettingsDescription}
                  >
                    Gerir onde a sua conta está ativa.
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.muted}
                />
              </Pressable>
            </View>
          </View>

          {/* DANGER ZONE */}

          <View style={styles.section}>
            <Text style={styles.dangerSectionTitle}>
              Zona de risco
            </Text>

            <Text style={styles.sectionSubtitle}>
              Ações que podem afetar permanentemente a sua
              conta.
            </Text>

            <View style={styles.dangerCard}>
              <View style={styles.dangerTop}>
                <View style={styles.dangerMainIcon}>
                  <Ionicons
                    name="trash-outline"
                    size={21}
                    color={COLORS.red}
                  />
                </View>

                <View style={styles.dangerContent}>
                  <Text style={styles.dangerTitle}>
                    Apagar conta
                  </Text>

                  <Text style={styles.dangerDescription}>
                    Esta ação é permanente e não poderá ser
                    desfeita.
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={handleDeleteAccount}
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.deleteButtonText}>
                  Apagar minha conta
                </Text>
              </Pressable>
            </View>
          </View>

          {/* FOOTER */}

          <View style={styles.footer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color={COLORS.muted}
            />

            <Text style={styles.footerText}>
              A sua privacidade e segurança são prioridades
              do SLOTIX.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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

  header: {
    height: 68,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  headerSpacer: {
    width: 42,
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 45,
  },

  securityCard: {
    padding: 18,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  securityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  securityIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: COLORS.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  securityBadge: {
    height: 27,
    paddingHorizontal: 9,
    borderRadius: 14,
    backgroundColor: COLORS.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  securityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },

  securityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.green,
  },

  securityTitle: {
    marginTop: 15,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  securityDescription: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.secondary,
  },

  section: {
    marginTop: 27,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  dangerSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.red,
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.secondary,
  },

  settingsCard: {
    marginTop: 13,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  settingRow: {
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F3F3F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingContent: {
    flex: 1,
    marginHorizontal: 11,
  },

  settingTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },

  settingDescription: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.secondary,
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 65,
  },

  linksCard: {
    marginTop: 13,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  linkRow: {
    minHeight: 72,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F3F3F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  linkContent: {
    flex: 1,
    marginHorizontal: 11,
  },

  linkTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },

  linkDescription: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.secondary,
  },

  dangerIcon: {
    backgroundColor: COLORS.redSoft,
  },

  dangerTitle: {
    color: COLORS.red,
  },

  securitySettingsCard: {
    marginTop: 13,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  securitySettingsRow: {
    minHeight: 72,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  securitySettingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F3F3F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  securitySettingsText: {
    flex: 1,
    marginHorizontal: 11,
  },

  securitySettingsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },

  securitySettingsDescription: {
    marginTop: 3,
    fontSize: 10,
    color: COLORS.secondary,
  },

  activeBadge: {
    height: 25,
    paddingHorizontal: 8,
    borderRadius: 13,
    backgroundColor: COLORS.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },

  activeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.green,
  },

  dangerCard: {
    marginTop: 13,
    padding: 15,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#F2D6D2',
  },

  dangerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  dangerMainIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dangerContent: {
    flex: 1,
    marginLeft: 11,
  },

  dangerDescription: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.secondary,
  },

  deleteButton: {
    height: 45,
    marginTop: 15,
    borderRadius: 14,
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: '#F2D6D2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  deleteButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.red,
  },

  footer: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  footerText: {
    maxWidth: 280,
    fontSize: 9,
    lineHeight: 14,
    color: COLORS.muted,
    textAlign: 'center',
  },
});