import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

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
};

type Language = {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
};

const LANGUAGES: Language[] = [
  {
    id: 'pt',
    name: 'Português',
    nativeName: 'Português',
    flag: '🇵🇹',
  },
  {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    id: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  {
    id: 'es',
    name: 'Español',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
];

export default function LanguageScreen() {
  const router = useRouter();

  const [selectedLanguage, setSelectedLanguage] = useState('pt');

  const currentLanguage = LANGUAGES.find(
    (language) => language.id === selectedLanguage,
  );

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
              size={22}
              color={COLORS.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>Idioma</Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* HERO */}
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="globe-outline"
                size={28}
                color={COLORS.blue}
              />
            </View>

            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>
                Escolha o seu idioma
              </Text>

              <Text style={styles.heroDescription}>
                Selecione o idioma que pretende utilizar no SLOTIX.
              </Text>
            </View>
          </View>

          {/* CURRENT LANGUAGE */}
          <View style={styles.currentCard}>
            <View style={styles.currentLeft}>
              <View style={styles.currentIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={21}
                  color={COLORS.blue}
                />
              </View>

              <View>
                <Text style={styles.currentLabel}>
                  IDIOMA ATUAL
                </Text>

                <Text style={styles.currentLanguage}>
                  {currentLanguage?.name || 'Português'}
                </Text>
              </View>
            </View>

            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />

              <Text style={styles.activeText}>
                Ativo
              </Text>
            </View>
          </View>

          {/* SECTION HEADER */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              IDIOMAS DISPONÍVEIS
            </Text>

            <Text style={styles.sectionCount}>
              {LANGUAGES.length}
            </Text>
          </View>

          {/* LANGUAGES */}
          <View style={styles.languageCard}>
            {LANGUAGES.map((language, index) => {
              const selected =
                selectedLanguage === language.id;

              return (
                <React.Fragment key={language.id}>
                  <Pressable
                    onPress={() =>
                      setSelectedLanguage(language.id)
                    }
                    style={({ pressed }) => [
                      styles.languageRow,
                      pressed && styles.languagePressed,
                    ]}
                  >
                    <View style={styles.languageLeft}>
                      <View
                        style={[
                          styles.flagContainer,
                          selected &&
                            styles.flagContainerSelected,
                        ]}
                      >
                        <Text style={styles.flag}>
                          {language.flag}
                        </Text>
                      </View>

                      <View style={styles.languageInfo}>
                        <Text
                          style={[
                            styles.languageName,
                            selected &&
                              styles.languageNameSelected,
                          ]}
                        >
                          {language.name}
                        </Text>

                        <Text style={styles.nativeName}>
                          {language.nativeName}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.radio,
                        selected && styles.radioSelected,
                      ]}
                    >
                      {selected && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </Pressable>

                  {index < LANGUAGES.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* INFORMATION */}
          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.secondary}
              style={styles.infoIcon}
            />

            <Text style={styles.infoText}>
              O idioma escolhido será utilizado na interface
              do SLOTIX. Algumas informações poderão continuar
              no idioma original enquanto a tradução estiver
              indisponível.
            </Text>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
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
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  headerPlaceholder: {
    width: 42,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  hero: {
    backgroundColor: COLORS.black,
    borderRadius: 24,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blueSoft,
    marginRight: 16,
  },

  heroTextContainer: {
    flex: 1,
  },

  heroTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 5,
  },

  heroDescription: {
    color: '#B8B8BD',
    fontSize: 13,
    lineHeight: 19,
  },

  currentCard: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
  },

  currentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  currentIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  currentLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    marginBottom: 4,
  },

  currentLanguage: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
    marginRight: 6,
  },

  activeText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: '600',
  },

  sectionHeader: {
    paddingHorizontal: 4,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.9,
  },

  sectionCount: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '600',
  },

  languageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  languageRow: {
    minHeight: 82,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  languagePressed: {
    opacity: 0.7,
  },

  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  flagContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F5F5F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  flagContainerSelected: {
    backgroundColor: COLORS.blueSoft,
  },

  flag: {
    fontSize: 25,
  },

  languageInfo: {
    flex: 1,
  },

  languageName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },

  languageNameSelected: {
    color: COLORS.blue,
  },

  nativeName: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '400',
  },

  radio: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C8C9CD',
    alignItems: 'center',
    justifyContent: 'center',
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

  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 77,
  },

  infoCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 19,
    backgroundColor: '#EEEEEB',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  infoIcon: {
    marginRight: 10,
    marginTop: 1,
  },

  infoText: {
    flex: 1,
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 18,
  },

  footer: {
    alignItems: 'center',
    marginTop: 34,
  },

  footerBrand: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },

  footerVersion: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },
});