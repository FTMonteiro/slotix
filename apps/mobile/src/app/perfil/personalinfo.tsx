import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getMe, updateMe } from '../../services/users';

const COLORS = {
  background: '#F5F5F2',
  white: '#FFFFFF',
  black: '#0B0B0C',
  text: '#111214',
  secondary: '#6F7074',
  muted: '#9A9B9F',
  border: '#E7E7E3',
  inputBackground: '#FAFAF8',
  blue: '#155EEF',
  blueSoft: '#EEF4FF',
  success: '#16A66A',
  danger: '#D92D20',
  dangerSoft: '#FFF1F0',
};

type IconName = keyof typeof Ionicons.glyphMap;

type InputFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  icon: IconName;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  editable?: boolean;
  helperText?: string;
};

function InputField({
  label,
  value,
  placeholder,
  icon,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  helperText,
}: InputFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View
        style={[
          styles.inputWrapper,
          !editable && styles.inputWrapperDisabled,
        ]}
      >
        <View style={styles.inputIcon}>
          <Ionicons
            name={icon}
            size={18}
            color={editable ? COLORS.text : COLORS.muted}
          />
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.muted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          style={[
            styles.input,
            !editable && styles.inputDisabled,
          ]}
          selectionColor={COLORS.blue}
          returnKeyType="done"
        />

        {!editable && (
          <Ionicons
            name="lock-closed-outline"
            size={16}
            color={COLORS.muted}
          />
        )}
      </View>

      {helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

export default function PersonalInfoScreen() {
  const router = useRouter();

  // ==========================================================
  // DADOS
  // ==========================================================

  const [fullName, setFullName] = useState('');

  const [email, setEmail] = useState('');

  const [phone, setPhone] = useState('');

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // ==========================================================
  // FOTO
  // ==========================================================

  const [photoUri, setPhotoUri] = useState<string | null>(
    null,
  );

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);

  const saveScale = useRef(
    new Animated.Value(1),
  ).current;

  // ==========================================================
  // CARREGAR PERFIL
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const me = await getMe();
        if (cancelled) return;

        setFullName(me.name);
        setEmail(me.email);
        setPhone(me.phone ?? '');
        setAvatarUrl(me.avatarUrl);
      } catch (error) {
        if (!cancelled) {
          Alert.alert(
            'Erro',
            'Não foi possível carregar os seus dados.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================================
  // INICIAIS
  // ==========================================================

  const initials = useMemo(() => {
    const result = fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((name) =>
        name.charAt(0).toUpperCase(),
      )
      .join('');

    return result || '?';
  }, [fullName]);

  // ==========================================================
  // VALIDAÇÃO
  // ==========================================================

  const isFormValid =
    fullName.trim().length >= 2 &&
    phone.trim().length >= 6;

  // ==========================================================
  // ALTERAÇÃO
  // ==========================================================

  const markAsChanged = () => {
    setSaved(false);
  };

  // ==========================================================
  // GALERIA
  // ==========================================================

  const pickImageFromGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso às suas fotos para escolher uma foto de perfil.',
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.9,
        });

      if (result.canceled) {
        return;
      }

      const selectedImage =
        result.assets?.[0]?.uri;

      if (!selectedImage) {
        return;
      }

      setPhotoUri(selectedImage);

      markAsChanged();
    } catch (error) {
      console.error(
        'Erro ao escolher imagem:',
        error,
      );

      Alert.alert(
        'Erro',
        'Não foi possível abrir a galeria.',
      );
    }
  };

  // ==========================================================
  // CÂMARA
  // ==========================================================

  const takePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso à câmara para tirar uma foto de perfil.',
        );

        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.9,
        });

      if (result.canceled) {
        return;
      }

      const capturedImage =
        result.assets?.[0]?.uri;

      if (!capturedImage) {
        return;
      }

      setPhotoUri(capturedImage);

      markAsChanged();
    } catch (error) {
      console.error(
        'Erro ao tirar foto:',
        error,
      );

      Alert.alert(
        'Erro',
        'Não foi possível abrir a câmara.',
      );
    }
  };

  // ==========================================================
  // REMOVER FOTO
  // ==========================================================

  const removePhoto = () => {
    if (!photoUri) {
      return;
    }

    Alert.alert(
      'Remover foto',
      'Deseja realmente remover a sua foto de perfil?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setPhotoUri(null);
            markAsChanged();
          },
        },
      ],
    );
  };

  // ==========================================================
  // OPÇÕES DA FOTO
  // ==========================================================

  const openPhotoOptions = () => {
    const buttons: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }> = [
      {
        text: 'Escolher da galeria',
        onPress: pickImageFromGallery,
      },
      {
        text: 'Tirar uma foto',
        onPress: takePhoto,
      },
    ];

    if (photoUri) {
      buttons.push({
        text: 'Remover foto',
        style: 'destructive',
        onPress: removePhoto,
      });
    }

    buttons.push({
      text: 'Cancelar',
      style: 'cancel',
    });

    Alert.alert(
      'Foto de perfil',
      'Escolha uma opção',
      buttons,
    );
  };

  // ==========================================================
  // ANIMAÇÃO DO BOTÃO
  // ==========================================================

  const handleSavePressIn = () => {
    Animated.spring(saveScale, {
      toValue: 0.985,
      useNativeDriver: true,
      speed: 30,
      bounciness: 5,
    }).start();
  };

  const handleSavePressOut = () => {
    Animated.spring(saveScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 5,
    }).start();
  };

  // ==========================================================
  // GUARDAR
  // ==========================================================

  const handleSave = async () => {
    if (saving) {
      return;
    }

    const cleanName =
      fullName.trim();

    const cleanPhone =
      phone.trim();

    if (!cleanName) {
      Alert.alert(
        'Nome obrigatório',
        'Digite o seu nome completo.',
      );

      return;
    }

    if (cleanName.length < 2) {
      Alert.alert(
        'Nome inválido',
        'Digite um nome válido.',
      );

      return;
    }

    if (cleanPhone.length < 6) {
      Alert.alert(
        'Telefone inválido',
        'Digite um número de telefone válido.',
      );

      return;
    }

    setSaving(true);

    setSaved(false);

    try {
      const updated = await updateMe({
        name: cleanName,
        phone: cleanPhone,
      });

      setFullName(updated.name);
      setPhone(updated.phone ?? '');

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        'Erro ao guardar:',
        error,
      );

      Alert.alert(
        'Erro',
        'Não foi possível guardar as alterações.',
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // VOLTAR
  // ==========================================================

  const handleBack = () => {
    router.back();
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

        <View style={[styles.keyboardView, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={COLORS.black} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.backButtonPressed,
              ]}
              hitSlop={8}
            >
              <Ionicons
                name="chevron-back"
                size={23}
                color={COLORS.text}
              />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                Dados pessoais
              </Text>

              <Text style={styles.headerSubtitle}>
                Informações da sua conta
              </Text>
            </View>

            <View style={styles.headerSpacer} />
          </View>

          {/* ================================================= */}
          {/* PROFILE CARD */}
          {/* ================================================= */}

          <View style={styles.profileCard}>
            <Pressable
              onPress={openPhotoOptions}
              style={({ pressed }) => [
                styles.avatarWrapper,
                pressed &&
                  styles.avatarPressed,
              ]}
            >
              {photoUri || avatarUrl ? (
                <Image
                  source={{
                    uri: photoUri ?? avatarUrl ?? undefined,
                  }}
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
            </Pressable>

            <View style={styles.profileInfo}>
              <Text
                style={styles.profileName}
                numberOfLines={1}
              >
                {fullName || 'Seu nome'}
              </Text>

              <View style={styles.accountRow}>
                <View
                  style={styles.activeDot}
                />

                <Text
                  style={styles.accountStatus}
                >
                  Conta ativa
                </Text>
              </View>
            </View>

            <Pressable
              onPress={openPhotoOptions}
              style={({ pressed }) => [
                styles.photoButton,
                pressed &&
                  styles.photoButtonPressed,
              ]}
            >
              <Ionicons
                name="camera-outline"
                size={18}
                color={COLORS.text}
              />
            </Pressable>
          </View>

          {/* ================================================= */}
          {/* INFORMATION */}
          {/* ================================================= */}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View
                style={
                  styles.sectionHeaderText
                }
              >
                <Text style={styles.sectionTitle}>
                  Informações
                </Text>

                <Text
                  style={
                    styles.sectionDescription
                  }
                >
                  Mantenha os seus dados
                  atualizados.
                </Text>
              </View>

              <View
                style={styles.privateBadge}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color={COLORS.success}
                />

                <Text
                  style={
                    styles.privateBadgeText
                  }
                >
                  Privado
                </Text>
              </View>
            </View>

            <View style={styles.formCard}>
              <InputField
                label="Nome completo"
                value={fullName}
                placeholder="Digite o seu nome completo"
                icon="person-outline"
                onChangeText={(value) => {
                  setFullName(value);
                  markAsChanged();
                }}
                autoCapitalize="words"
              />

              <View
                style={styles.fieldDivider}
              />

              <InputField
                label="Email"
                value={email}
                placeholder="Digite o seu email"
                icon="mail-outline"
                onChangeText={() => {}}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
                helperText="O email está associado à sua conta."
              />

              <View
                style={styles.fieldDivider}
              />

              <InputField
                label="Telefone"
                value={phone}
                placeholder="+244 900 000 000"
                icon="call-outline"
                onChangeText={(value) => {
                  setPhone(value);
                  markAsChanged();
                }}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* ================================================= */}
          {/* PHOTO ACTION */}
          {/* ================================================= */}

          <Pressable
            onPress={openPhotoOptions}
            style={({ pressed }) => [
              styles.photoActionCard,
              pressed &&
                styles.photoActionCardPressed,
            ]}
          >
            <View
              style={styles.photoActionIcon}
            >
              <Ionicons
                name="image-outline"
                size={21}
                color={COLORS.blue}
              />
            </View>

            <View
              style={
                styles.photoActionContent
              }
            >
              <Text
                style={
                  styles.photoActionTitle
                }
              >
                {photoUri
                  ? 'Alterar foto de perfil'
                  : 'Adicionar foto de perfil'}
              </Text>

              <Text
                style={
                  styles.photoActionText
                }
              >
                Escolha uma foto da galeria
                ou tire uma nova.
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={COLORS.muted}
            />
          </Pressable>

          {/* ================================================= */}
          {/* SECURITY */}
          {/* ================================================= */}

          <View style={styles.securityCard}>
            <View
              style={styles.securityIcon}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={COLORS.blue}
              />
            </View>

            <View
              style={styles.securityContent}
            >
              <Text
                style={styles.securityTitle}
              >
                Os seus dados estão protegidos
              </Text>

              <Text
                style={styles.securityText}
              >
                As suas informações pessoais
                são utilizadas apenas para
                melhorar a sua experiência no
                SLOTIX.
              </Text>
            </View>
          </View>

          {/* ================================================= */}
          {/* SAVE BUTTON */}
          {/* ================================================= */}

          <Animated.View
            style={[
              styles.saveButtonWrapper,
              {
                transform: [
                  {
                    scale: saveScale,
                  },
                ],
              },
            ]}
          >
            <Pressable
              onPress={handleSave}
              onPressIn={handleSavePressIn}
              onPressOut={handleSavePressOut}
              disabled={
                !isFormValid || saving
              }
              style={[
                styles.saveButton,
                !isFormValid &&
                  styles.saveButtonDisabled,
                saved &&
                  styles.saveButtonSaved,
              ]}
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.white}
                />
              ) : saved ? (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={COLORS.white}
                  />

                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Alterações guardadas
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="checkmark"
                    size={19}
                    color={COLORS.white}
                  />

                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Guardar alterações
                  </Text>
                </>
              )}
            </Pressable>
          </Animated.View>

          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          <Text style={styles.bottomHint}>
            Pode alterar os seus dados pessoais
            a qualquer momento.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ==========================================================
  // BASE
  // ==========================================================

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardView: {
    flex: 1,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 70,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonPressed: {
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    color: COLORS.secondary,
    fontSize: 11,
    marginTop: 3,
  },

  headerSpacer: {
    width: 42,
  },

  // ==========================================================
  // PROFILE
  // ==========================================================

  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },

  avatarWrapper: {
    position: 'relative',
    marginRight: 13,
  },

  avatarPressed: {
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },

  avatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.4,
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
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileInfo: {
    flex: 1,
    minWidth: 0,
  },

  profileName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },

  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },

  accountStatus: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '700',
  },

  photoButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3F3F0',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoButtonPressed: {
    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  // ==========================================================
  // SECTION
  // ==========================================================

  section: {
    marginBottom: 27,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 11,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.1,
  },

  sectionDescription: {
    color: COLORS.secondary,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },

  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF3',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginLeft: 10,
  },

  privateBadgeText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },

  // ==========================================================
  // FORM
  // ==========================================================

  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  fieldContainer: {
    paddingHorizontal: 15,
    paddingVertical: 14,
  },

  fieldLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
  },

  inputWrapper: {
    minHeight: 50,
    borderRadius: 15,
    backgroundColor:
      COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  inputWrapperDisabled: {
    backgroundColor: '#F4F4F1',
  },

  inputIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  input: {
    flex: 1,
    minHeight: 48,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 0,
  },

  inputDisabled: {
    color: COLORS.secondary,
  },

  helperText: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 6,
    marginLeft: 2,
  },

  fieldDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 15,
  },

  // ==========================================================
  // PHOTO ACTION
  // ==========================================================

  photoActionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  photoActionCardPressed: {
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  photoActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  photoActionContent: {
    flex: 1,
  },

  photoActionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },

  photoActionText: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  // ==========================================================
  // SECURITY
  // ==========================================================

  securityCard: {
    backgroundColor: COLORS.blueSoft,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DCE7FF',
  },

  securityIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  securityContent: {
    flex: 1,
    paddingTop: 1,
  },

  securityTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },

  securityText: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  // ==========================================================
  // SAVE
  // ==========================================================

  saveButtonWrapper: {
    width: '100%',
  },

  saveButton: {
    minHeight: 56,
    borderRadius: 19,
    backgroundColor: COLORS.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  saveButtonDisabled: {
    backgroundColor: '#B8B9BB',
  },

  saveButtonSaved: {
    backgroundColor: COLORS.success,
  },

  saveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  bottomHint: {
    color: COLORS.muted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 15,
    marginTop: 12,
    paddingHorizontal: 20,
  },
});