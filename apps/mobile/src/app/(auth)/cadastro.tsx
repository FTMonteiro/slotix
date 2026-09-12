
import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiRequestError } from '../../services/api-client';
import { register } from '../../services/auth';

const COLORS = {
  background: '#F4F4F1',
  white: '#FFFFFF',
  black: '#111111',
  gold: '#B08D57',
  text: '#151515',
  muted: '#777777',
  soft: '#A1A1A1',
  border: 'rgba(17,17,17,0.08)',
  input: 'rgba(255,255,255,0.90)',
  danger: '#B33A3A',
  success: '#3F7A57',
};

const SPACE_NAME = 'SLOTIX';

export default function CadastroScreen() {
  const router = useRouter();

  // --------------------------------------------------
  // CAMPOS
  // --------------------------------------------------

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --------------------------------------------------
  // VISIBILIDADE DAS PASSWORDS
  // --------------------------------------------------

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // --------------------------------------------------
  // ERROS
  // --------------------------------------------------

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] =
    useState('');

  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // ANIMAÇÕES
  // --------------------------------------------------

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslate = useRef(
    new Animated.Value(-20),
  ).current;

  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(
    new Animated.Value(30),
  ).current;

  const footerOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const buttonScale = useRef(
    new Animated.Value(1),
  ).current;

  // --------------------------------------------------
  // ENTRADA DA TELA
  // --------------------------------------------------

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(logoTranslate, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 700,
        delay: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(cardTranslate, {
        toValue: 0,
        duration: 700,
        delay: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 700,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    logoOpacity,
    logoTranslate,
    cardOpacity,
    cardTranslate,
    footerOpacity,
  ]);

  // --------------------------------------------------
  // VALIDAÇÕES
  // --------------------------------------------------

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value.trim(),
    );
  };

  const validatePhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');

    return numbers.length >= 9;
  };

  const validateForm = () => {
    let valid = true;

    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmPasswordError('');

    if (!name.trim()) {
      setNameError(
        'Digite o seu nome completo.',
      );
      valid = false;
    } else if (name.trim().length < 3) {
      setNameError(
        'O nome deve ter pelo menos 3 caracteres.',
      );
      valid = false;
    }

    if (!email.trim()) {
      setEmailError(
        'Digite o seu e-mail.',
      );
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError(
        'Digite um e-mail válido.',
      );
      valid = false;
    }

    if (!phone.trim()) {
      setPhoneError(
        'Digite o seu número de telefone.',
      );
      valid = false;
    } else if (!validatePhone(phone)) {
      setPhoneError(
        'Digite um número de telefone válido.',
      );
      valid = false;
    }

    if (!password) {
      setPasswordError(
        'Digite uma palavra-passe.',
      );
      valid = false;
    } else if (password.length < 6) {
      setPasswordError(
        'A palavra-passe deve ter pelo menos 6 caracteres.',
      );
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(
        'Confirme a sua palavra-passe.',
      );
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(
        'As palavras-passe não coincidem.',
      );
      valid = false;
    }

    return valid;
  };

  // --------------------------------------------------
  // CRIAR CONTA
  // --------------------------------------------------

  const handleCreateAccount = async () => {
    if (loading) {
      return;
    }

    const valid = validateForm();

    if (!valid) {
      return;
    }

    try {
      setLoading(true);

      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.97,
          duration: 100,
          useNativeDriver: true,
        }),

        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      router.replace('/login');
    } catch (error) {
      const message =
        error instanceof ApiRequestError
          ? error.message
          : 'Não foi possível criar a conta. Tente novamente.';

      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  // IR PARA LOGIN

  const handleGoToLogin = () => {
    if (loading) {
      return;
    }

    router.replace('/login');
  };

   // GOOGLE
  

  const handleGoogle = () => {
    if (loading) {
      return;
    }

    console.log('Google Sign Up');
  };

  // APPLE
  

  const handleApple = () => {
    if (loading) {
      return;
    }

    console.log('Apple Sign Up');
  };

  
  // RENDER
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.container}>
        {/* DECORAÇÕES */}
        <View style={styles.decorCircleOne} />

        <View style={styles.decorCircleTwo} />

        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <ScrollView
            contentContainerStyle={
              styles.scrollContent
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ================================================= */}
            {/* LOGO + NOME DO ESPAÇO */}
            {/* ================================================= */}

            <Animated.View
              style={[
                styles.logoArea,
                {
                  opacity: logoOpacity,
                  transform: [
                    {
                      translateY: logoTranslate,
                    },
                  ],
                },
              ]}
            >
              <View style={styles.logoGlow}>
                <LinearGradient
                  colors={[
                    COLORS.black,
                    '#242424',
                    COLORS.black,
                  ]}
                  style={styles.logo}
                >
                  <Text style={styles.logoLetter}>
                    S
                  </Text>
                </LinearGradient>
              </View>

              <Text style={styles.spaceName}>
                {SPACE_NAME}
              </Text>

              <View style={styles.goldLine} />
            </Animated.View>

            {/* ================================================= */}
            {/* FORMULÁRIO */}
            {/* ================================================= */}

            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  opacity: cardOpacity,
                  transform: [
                    {
                      translateY: cardTranslate,
                    },
                  ],
                },
              ]}
            >
              <BlurView
                intensity={28}
                tint="light"
                style={styles.card}
              >
                <View style={styles.cardInner}>
                  {/* TÍTULO */}

                  <Text style={styles.cardTitle}>
                    Criar conta
                  </Text>

                  <Text
                    style={styles.cardSubtitle}
                  >
                    Preencha os seus dados para
                    começar.
                  </Text>

                  {/* ================================================= */}
                  {/* NOME */}
                  {/* ================================================= */}

                  <View style={styles.inputGroup}>
                    <Text
                      style={styles.inputLabel}
                    >
                      NOME COMPLETO
                    </Text>

                    <View
                      style={[
                        styles.inputWrapper,
                        nameError &&
                          styles.inputWrapperError,
                      ]}
                    >
                      <Ionicons
                        name="person-outline"
                        size={19}
                        color={
                          nameError
                            ? COLORS.danger
                            : COLORS.muted
                        }
                        style={styles.inputIcon}
                      />

                      <TextInput
                        value={name}
                        onChangeText={text => {
                          setName(text);

                          if (nameError) {
                            setNameError('');
                          }
                        }}
                        placeholder="Digite o seu nome"
                        placeholderTextColor="#A7A7A7"
                        style={styles.input}
                        autoCapitalize="words"
                        autoCorrect={false}
                        editable={!loading}
                      />

                      {name.trim().length >
                        0 &&
                      !nameError ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={19}
                          color={COLORS.success}
                          style={
                            styles.validIcon
                          }
                        />
                      ) : null}
                    </View>

                    {nameError ? (
                      <View
                        style={styles.errorRow}
                      >
                        <Ionicons
                          name="alert-circle-outline"
                          size={13}
                          color={
                            COLORS.danger
                          }
                        />

                        <Text
                          style={styles.errorText}
                        >
                          {nameError}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* ================================================= */}
                  {/* EMAIL */}
                  {/* ================================================= */}

                  <View style={styles.inputGroup}>
                    <Text
                      style={styles.inputLabel}
                    >
                      E-MAIL
                    </Text>

                    <View
                      style={[
                        styles.inputWrapper,
                        emailError &&
                          styles.inputWrapperError,
                      ]}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={19}
                        color={
                          emailError
                            ? COLORS.danger
                            : COLORS.muted
                        }
                        style={styles.inputIcon}
                      />

                      <TextInput
                        value={email}
                        onChangeText={text => {
                          setEmail(text);

                          if (emailError) {
                            setEmailError('');
                          }
                        }}
                        placeholder="seuemail@exemplo.com"
                        placeholderTextColor="#A7A7A7"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                      />

                      {validateEmail(
                        email,
                      ) &&
                      !emailError ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={19}
                          color={COLORS.success}
                          style={
                            styles.validIcon
                          }
                        />
                      ) : null}
                    </View>

                    {emailError ? (
                      <View
                        style={styles.errorRow}
                      >
                        <Ionicons
                          name="alert-circle-outline"
                          size={13}
                          color={
                            COLORS.danger
                          }
                        />

                        <Text
                          style={styles.errorText}
                        >
                          {emailError}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* ================================================= */}
                  {/* TELEFONE */}
                  {/* ================================================= */}

                  <View style={styles.inputGroup}>
                    <Text
                      style={styles.inputLabel}
                    >
                      TELEFONE
                    </Text>

                    <View
                      style={[
                        styles.inputWrapper,
                        phoneError &&
                          styles.inputWrapperError,
                      ]}
                    >
                      <Ionicons
                        name="call-outline"
                        size={19}
                        color={
                          phoneError
                            ? COLORS.danger
                            : COLORS.muted
                        }
                        style={styles.inputIcon}
                      />

                      <TextInput
                        value={phone}
                        onChangeText={text => {
                          setPhone(text);

                          if (phoneError) {
                            setPhoneError('');
                          }
                        }}
                        placeholder="+244 900 000 000"
                        placeholderTextColor="#A7A7A7"
                        style={styles.input}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                      />

                      {validatePhone(
                        phone,
                      ) &&
                      !phoneError ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={19}
                          color={COLORS.success}
                          style={
                            styles.validIcon
                          }
                        />
                      ) : null}
                    </View>

                    {phoneError ? (
                      <View
                        style={styles.errorRow}
                      >
                        <Ionicons
                          name="alert-circle-outline"
                          size={13}
                          color={
                            COLORS.danger
                          }
                        />

                        <Text
                          style={styles.errorText}
                        >
                          {phoneError}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* ================================================= */}
                  {/* PALAVRA-PASSE */}
                  {/* ================================================= */}

                  <View style={styles.inputGroup}>
                    <Text
                      style={styles.inputLabel}
                    >
                      PALAVRA-PASSE
                    </Text>

                    <View
                      style={[
                        styles.inputWrapper,
                        passwordError &&
                          styles.inputWrapperError,
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={19}
                        color={
                          passwordError
                            ? COLORS.danger
                            : COLORS.muted
                        }
                        style={styles.inputIcon}
                      />

                      <TextInput
                        value={password}
                        onChangeText={text => {
                          setPassword(text);

                          if (passwordError) {
                            setPasswordError('');
                          }
                        }}
                        placeholder="Mínimo de 6 caracteres"
                        placeholderTextColor="#A7A7A7"
                        style={styles.input}
                        secureTextEntry={
                          !showPassword
                        }
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                      />

                      <Pressable
                        onPress={() =>
                          setShowPassword(
                            previous =>
                              !previous,
                          )
                        }
                        disabled={loading}
                        hitSlop={10}
                        style={
                          styles.eyeButton
                        }
                      >
                        <Ionicons
                          name={
                            showPassword
                              ? 'eye-off-outline'
                              : 'eye-outline'
                          }
                          size={20}
                          color={COLORS.muted}
                        />
                      </Pressable>
                    </View>

                    {passwordError ? (
                      <View
                        style={styles.errorRow}
                      >
                        <Ionicons
                          name="alert-circle-outline"
                          size={13}
                          color={
                            COLORS.danger
                          }
                        />

                        <Text
                          style={styles.errorText}
                        >
                          {passwordError}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* ================================================= */}
                  {/* CONFIRMAR PALAVRA-PASSE */}
                  {/* ================================================= */}

                  <View style={styles.inputGroup}>
                    <Text
                      style={styles.inputLabel}
                    >
                      CONFIRMAR PALAVRA-PASSE
                    </Text>

                    <View
                      style={[
                        styles.inputWrapper,
                        confirmPasswordError &&
                          styles.inputWrapperError,
                      ]}
                    >
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={19}
                        color={
                          confirmPasswordError
                            ? COLORS.danger
                            : COLORS.muted
                        }
                        style={styles.inputIcon}
                      />

                      <TextInput
                        value={confirmPassword}
                        onChangeText={text => {
                          setConfirmPassword(
                            text,
                          );

                          if (
                            confirmPasswordError
                          ) {
                            setConfirmPasswordError(
                              '',
                            );
                          }
                        }}
                        placeholder="Digite novamente a palavra-passe"
                        placeholderTextColor="#A7A7A7"
                        style={styles.input}
                        secureTextEntry={
                          !showConfirmPassword
                        }
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                      />

                      <Pressable
                        onPress={() =>
                          setShowConfirmPassword(
                            previous =>
                              !previous,
                          )
                        }
                        disabled={loading}
                        hitSlop={10}
                        style={
                          styles.eyeButton
                        }
                      >
                        <Ionicons
                          name={
                            showConfirmPassword
                              ? 'eye-off-outline'
                              : 'eye-outline'
                          }
                          size={20}
                          color={COLORS.muted}
                        />
                      </Pressable>
                    </View>

                    {confirmPasswordError ? (
                      <View
                        style={styles.errorRow}
                      >
                        <Ionicons
                          name="alert-circle-outline"
                          size={13}
                          color={
                            COLORS.danger
                          }
                        />

                        <Text
                          style={styles.errorText}
                        >
                          {
                            confirmPasswordError
                          }
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* ================================================= */}
                  {/* BOTÃO CRIAR CONTA */}
                  {/* ================================================= */}

                  <Animated.View
                    style={{
                      transform: [
                        {
                          scale: buttonScale,
                        },
                      ],
                    }}
                  >
                    <Pressable
                      onPress={
                        handleCreateAccount
                      }
                      disabled={loading}
                      style={({ pressed }) => [
                        styles.createButton,

                        pressed &&
                          !loading &&
                          styles.buttonPressed,

                        loading &&
                          styles.buttonDisabled,
                      ]}
                    >
                      <LinearGradient
                        colors={[
                          COLORS.black,
                          '#252525',
                          COLORS.black,
                        ]}
                        start={{
                          x: 0,
                          y: 0,
                        }}
                        end={{
                          x: 1,
                          y: 0,
                        }}
                        style={
                          styles.createButtonGradient
                        }
                      >
                        {loading ? (
                          <ActivityIndicator
                            size="small"
                            color={
                              COLORS.white
                            }
                          />
                        ) : (
                          <>
                            <Text
                              style={
                                styles.createButtonText
                              }
                            >
                              CRIAR CONTA
                            </Text>

                            <Ionicons
                              name="arrow-forward"
                              size={18}
                              color={
                                COLORS.white
                              }
                            />
                          </>
                        )}
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>

                  {/* ================================================= */}
                  {/* DIVISOR */}
                  {/* ================================================= */}

                  <View
                    style={styles.dividerArea}
                  >
                    <View
                      style={styles.divider}
                    />

                    <Text
                      style={
                        styles.dividerText
                      }
                    >
                      OU CONTINUE COM
                    </Text>

                    <View
                      style={styles.divider}
                    />
                  </View>

                  {/* ================================================= */}
                  {/* GOOGLE + APPLE */}
                  {/* ================================================= */}

                  <View style={styles.socialRow}>
                    <Pressable
                      onPress={handleGoogle}
                      disabled={loading}
                      style={({ pressed }) => [
                        styles.socialButton,
                        pressed &&
                          styles.socialButtonPressed,
                      ]}
                    >
                      <Text
                        style={styles.googleG}
                      >
                        G
                      </Text>

                      <Text
                        style={styles.socialText}
                      >
                        Google
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={handleApple}
                      disabled={loading}
                      style={({ pressed }) => [
                        styles.socialButton,
                        pressed &&
                          styles.socialButtonPressed,
                      ]}
                    >
                      <Ionicons
                        name="logo-apple"
                        size={19}
                        color={COLORS.black}
                      />

                      <Text
                        style={styles.socialText}
                      >
                        Apple
                      </Text>
                    </Pressable>
                  </View>

                  {/* ================================================= */}
                  {/* LOGIN */}
                  {/* ================================================= */}

                  <View style={styles.loginArea}>
                    <Text
                      style={styles.loginText}
                    >
                      Já tem uma conta?
                    </Text>

                    <Pressable
                      onPress={
                        handleGoToLogin
                      }
                      disabled={loading}
                      hitSlop={8}
                    >
                      <Text
                        style={styles.loginLink}
                      >
                        Entrar
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </BlurView>
            </Animated.View>

            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <Animated.View
              style={[
                styles.footer,
                {
                  opacity: footerOpacity,
                },
              ]}
            >
              <View style={styles.secureRow}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={15}
                  color={COLORS.gold}
                />

                <Text
                  style={styles.secureText}
                >
                  REGISTO SEGURO
                </Text>
              </View>

              <Text style={styles.footerText}>
                CRIE A SUA CONTA E COMECE A
                SUA EXPERIÊNCIA
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 34,
  },

  // --------------------------------------------------
  // DECORAÇÕES
  // --------------------------------------------------

  decorCircleOne: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor:
      'rgba(176,141,87,0.08)',
    top: -100,
    right: -90,
  },

  decorCircleTwo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor:
      'rgba(17,17,17,0.035)',
    bottom: 80,
    left: -110,
  },

  // --------------------------------------------------
  // LOGO
  // --------------------------------------------------

  logoArea: {
    alignItems: 'center',
    marginBottom: 25,
  },

  logoGlow: {
    padding: 8,
    borderRadius: 30,
    backgroundColor:
      'rgba(176,141,87,0.09)',
  },

  logo: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.16,
    shadowRadius: 15,

    elevation: 8,
  },

  logoLetter: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -2,
  },

  spaceName: {
    marginTop: 12,
    color: COLORS.black,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2.5,
  },

  goldLine: {
    width: 34,
    height: 2,
    backgroundColor: COLORS.gold,
    marginTop: 8,
    borderRadius: 2,
  },

  // --------------------------------------------------
  // CARD
  // --------------------------------------------------

  cardWrapper: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },

  card: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.75)',
    backgroundColor:
      'rgba(255,255,255,0.70)',
  },

  cardInner: {
    padding: 22,
    backgroundColor:
      'rgba(255,255,255,0.52)',
  },

  cardTitle: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.7,
    marginBottom: 6,
  },

  cardSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 23,
  },

  // --------------------------------------------------
  // INPUTS
  // --------------------------------------------------

  inputGroup: {
    marginBottom: 15,
  },

  inputLabel: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 7,
    marginLeft: 3,
  },

  inputWrapper: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.input,
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputWrapperError: {
    borderColor:
      'rgba(179,58,58,0.55)',
    backgroundColor:
      'rgba(179,58,58,0.035)',
  },

  inputIcon: {
    marginLeft: 15,
  },

  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },

  eyeButton: {
    width: 45,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  validIcon: {
    marginRight: 14,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 3,
  },

  errorText: {
    color: COLORS.danger,
    fontSize: 11,
    marginLeft: 5,
    flex: 1,
  },

  // --------------------------------------------------
  // BOTÃO
  // --------------------------------------------------

  createButton: {
    height: 56,
    borderRadius: 17,
    overflow: 'hidden',
    marginTop: 4,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.17,
    shadowRadius: 12,

    elevation: 7,
  },

  createButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  createButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginRight: 10,
  },

  buttonPressed: {
    opacity: 0.88,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  // --------------------------------------------------
  // DIVISOR
  // --------------------------------------------------

  dividerArea: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 21,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor:
      'rgba(17,17,17,0.08)',
  },

  dividerText: {
    marginHorizontal: 10,
    color: COLORS.soft,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // --------------------------------------------------
  // SOCIAL
  // --------------------------------------------------

  socialRow: {
    flexDirection: 'row',
    gap: 10,
  },

  socialButton: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor:
      'rgba(255,255,255,0.78)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  socialButtonPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  googleG: {
    color: '#4285F4',
    fontSize: 19,
    fontWeight: '800',
    marginRight: 8,
  },

  socialText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  loginArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 23,
  },

  loginText: {
    color: COLORS.muted,
    fontSize: 13,
  },

  loginLink: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 5,
    textDecorationLine: 'underline',
    textDecorationColor: COLORS.gold,
  },

  // --------------------------------------------------
  // FOOTER
  // --------------------------------------------------

  footer: {
    alignItems: 'center',
    marginTop: 24,
  },

  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  secureText: {
    color: COLORS.gold,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginLeft: 5,
  },

  footerText: {
    color: COLORS.soft,
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
});

