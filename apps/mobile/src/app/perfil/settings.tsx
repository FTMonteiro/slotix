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

type SwitchRowProps = {
  icon: IconName;
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

function SwitchRow({
  icon,
  title,
  description,
  value,
  onChange,
}: SwitchRowProps) {
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
        <Text style={styles.settingTitle}>
          {title}
        </Text>

        <Text style={styles.settingDescription}>
          {description}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
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

type NavigationRowProps = {
  icon: IconName;
  title: string;
  description?: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
};

function NavigationRow({
  icon,
  title,
  description,
  value,
  onPress,
  danger = false,
}: NavigationRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navigationRow,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.navigationIcon,
          danger && styles.dangerNavigationIcon,
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

      <View style={styles.navigationContent}>
        <Text
          style={[
            styles.navigationTitle,
            danger && styles.dangerNavigationTitle,
          ]}
        >
          {title}
        </Text>

        {description ? (
          <Text style={styles.navigationDescription}>
            {description}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text style={styles.navigationValue}>
          {value}
        </Text>
      ) : (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={
            danger ? COLORS.red : COLORS.muted
          }
        />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);

  const [hapticFeedback, setHapticFeedback] =
    useState(true);

  const [autoConfirm, setAutoConfirm] =
    useState(true);

  const [showPrices, setShowPrices] =
    useState(true);

  const [smartSuggestions, setSmartSuggestions] =
    useState(true);

  const [soundEffects, setSoundEffects] =
    useState(true);

  const handleDarkMode = (value: boolean) => {
    setDarkMode(value);

    Alert.alert(
      value ? 'Modo escuro' : 'Modo claro',
      value
        ? 'O modo escuro será aplicado à aplicação quando o tema global estiver conectado.'
        : 'O modo claro está selecionado.',
    );
  };

  const handleCurrency = () => {
    Alert.alert(
      'Moeda',
      'A moeda utilizada atualmente é o Kwanza Angolano (Kz).',
      [
        {
          text: 'OK',
        },
      ],
    );
  };

  const handleStartPage = () => {
    Alert.alert(
      'Página inicial',
      'Escolha onde deseja começar quando abrir o SLOTIX.',
      [
        {
          text: 'Explorar',
          onPress: () => {},
        },
        {
          text: 'Agendamentos',
          onPress: () => {},
        },
        {
          text: 'Perfil',
          onPress: () => {},
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpar dados temporários',
      'Isto irá limpar apenas dados temporários da aplicação.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar',
          onPress: () => {
            Alert.alert(
              'Concluído',
              'Os dados temporários foram limpos.',
            );
          },
        },
      ],
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Restaurar definições',
      'Todas as preferências desta tela voltarão aos valores padrão.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: () => {
            setDarkMode(false);
            setHapticFeedback(true);
            setAutoConfirm(true);
            setShowPrices(true);
            setSmartSuggestions(true);
            setSoundEffects(true);

            Alert.alert(
              'Definições restauradas',
              'As preferências voltaram aos valores padrão.',
            );
          },
        },
      ],
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'SLOTIX',
      'SLOTIX\n\nA sua experiência premium de agendamento.\n\nVersão 1.0.0',
      [
        {
          text: 'Fechar',
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Terminar sessão',
      'Deseja terminar a sessão?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            router.replace('/');
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
            Definições
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* EXPERIÊNCIA */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Experiência
            </Text>

            <Text style={styles.sectionSubtitle}>
              Personalize a forma como o SLOTIX funciona
              para si.
            </Text>

            <View style={styles.settingsCard}>
              <SwitchRow
                icon="moon-outline"
                title="Modo escuro"
                description="Usar uma aparência escura na aplicação."
                value={darkMode}
                onChange={handleDarkMode}
              />

              <View style={styles.separator} />

              <SwitchRow
                icon="phone-portrait-outline"
                title="Feedback háptico"
                description="Pequenas vibrações ao interagir com elementos."
                value={hapticFeedback}
                onChange={setHapticFeedback}
              />

              <View style={styles.separator} />

              <SwitchRow
                icon="volume-medium-outline"
                title="Sons da aplicação"
                description="Reproduzir sons em determinadas ações."
                value={soundEffects}
                onChange={setSoundEffects}
              />

              <View style={styles.separator} />

              <SwitchRow
                icon="sparkles-outline"
                title="Sugestões inteligentes"
                description="Receber sugestões personalizadas durante a utilização."
                value={smartSuggestions}
                onChange={setSmartSuggestions}
              />
            </View>
          </View>

          {/* AGENDAMENTOS */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Agendamentos
            </Text>

            <Text style={styles.sectionSubtitle}>
              Defina como deseja gerir os seus agendamentos.
            </Text>

            <View style={styles.settingsCard}>
              <SwitchRow
                icon="checkmark-done-outline"
                title="Confirmação rápida"
                description="Tornar a confirmação de agendamentos mais rápida."
                value={autoConfirm}
                onChange={setAutoConfirm}
              />

              <View style={styles.separator} />

              <SwitchRow
                icon="pricetag-outline"
                title="Mostrar preços"
                description="Mostrar os preços dos serviços antes da reserva."
                value={showPrices}
                onChange={setShowPrices}
              />

              <View style={styles.separator} />

              <NavigationRow
                icon="home-outline"
                title="Página inicial"
                description="Escolha a tela que aparece ao abrir a aplicação."
                value="Explorar"
                onPress={handleStartPage}
              />
            </View>
          </View>

          {/* REGIÃO */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Região
            </Text>

            <Text style={styles.sectionSubtitle}>
              Ajuste idioma e moeda da sua experiência.
            </Text>

            <View style={styles.navigationCard}>
              {/* IDIOMA */}

              <NavigationRow
                icon="language-outline"
                title="Idioma"
                description="Idioma utilizado na aplicação."
                value="Português"
                onPress={() =>
                  router.push('/perfil/language')
                }
              />

              <View style={styles.separator} />

              {/* MOEDA */}

              <NavigationRow
                icon="cash-outline"
                title="Moeda"
                description="Moeda utilizada para apresentar valores."
                value="AOA"
                onPress={handleCurrency}
              />
            </View>
          </View>

          {/* CONTA */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Conta
            </Text>

            <Text style={styles.sectionSubtitle}>
              Gerencie informações e acessos da sua conta.
            </Text>

            <View style={styles.navigationCard}>
              <NavigationRow
                icon="person-outline"
                title="Dados pessoais"
                description="Nome, telefone, localização e foto."
                onPress={() =>
                  router.push(
                    '/perfil/personalinfo',
                  )
                }
              />

              <View style={styles.separator} />

              <NavigationRow
                icon="lock-closed-outline"
                title="Privacidade"
                description="Controle os seus dados e permissões."
                onPress={() =>
                  router.push('/perfil/privacy')
                }
              />

              <View style={styles.separator} />

              <NavigationRow
                icon="notifications-outline"
                title="Notificações"
                description="Gerencie as suas notificações."
                onPress={() =>
                  router.push(
                    '/perfil/notifications',
                  )
                }
              />
            </View>
          </View>

          {/* APLICAÇÃO */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Aplicação
            </Text>

            <Text style={styles.sectionSubtitle}>
              Informações e manutenção da aplicação.
            </Text>

            <View style={styles.navigationCard}>
              <NavigationRow
                icon="trash-outline"
                title="Limpar dados temporários"
                description="Remover informações temporárias armazenadas localmente."
                onPress={handleClearCache}
              />

              <View style={styles.separator} />

              <NavigationRow
                icon="refresh-outline"
                title="Restaurar definições"
                description="Voltar às configurações padrão."
                onPress={handleResetSettings}
              />

              <View style={styles.separator} />

              <NavigationRow
                icon="information-circle-outline"
                title="Sobre o SLOTIX"
                description="Informações sobre a aplicação."
                onPress={handleAbout}
              />
            </View>
          </View>

          {/* ZONA DE RISCO */}

          <View style={styles.section}>
            <Text style={styles.dangerSectionTitle}>
              Zona de risco
            </Text>

            <View style={styles.dangerCard}>
              <View style={styles.dangerIcon}>
                <Ionicons
                  name="log-out-outline"
                  size={21}
                  color={COLORS.red}
                />
              </View>

              <View style={styles.dangerContent}>
                <Text style={styles.dangerTitle}>
                  Terminar sessão
                </Text>

                <Text style={styles.dangerDescription}>
                  Sair da sua conta neste dispositivo.
                </Text>
              </View>

              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [
                  styles.logoutButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.logoutButtonText}>
                  Sair
                </Text>
              </Pressable>
            </View>
          </View>

          {/* FOOTER */}

          <View style={styles.footer}>
            <View style={styles.footerLogo}>
              <Ionicons
                name="sparkles"
                size={13}
                color={COLORS.black}
              />
            </View>

            <Text style={styles.footerBrand}>
              SLOTIX
            </Text>

            <Text style={styles.footerVersion}>
              v1.0.0
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

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 45,
  },

  section: {
    marginTop: 25,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.secondary,
  },

  dangerSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.red,
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

  navigationCard: {
    marginTop: 13,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  navigationRow: {
    minHeight: 72,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  navigationIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F3F3F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  navigationContent: {
    flex: 1,
    marginHorizontal: 11,
  },

  navigationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },

  navigationDescription: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.secondary,
  },

  navigationValue: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.secondary,
    marginRight: 3,
  },

  dangerCard: {
    marginTop: 13,
    padding: 14,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#F2D6D2',
    flexDirection: 'row',
    alignItems: 'center',
  },

  dangerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dangerContent: {
    flex: 1,
    marginHorizontal: 10,
  },

  dangerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.red,
  },

  dangerDescription: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.secondary,
  },

  logoutButton: {
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: COLORS.redSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.red,
  },

  dangerNavigationIcon: {
    backgroundColor: COLORS.redSoft,
  },

  dangerNavigationTitle: {
    color: COLORS.red,
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },

  footer: {
    marginTop: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerLogo: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerBrand: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    color: COLORS.black,
  },

  footerVersion: {
    marginTop: 3,
    fontSize: 9,
    color: COLORS.muted,
  },
});