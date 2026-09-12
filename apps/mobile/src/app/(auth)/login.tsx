
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
import { login } from '../../services/auth';

/* =========================================================
   CORES
========================================================= */

const COLORS = {
  background: '#F4F4F1',
  white: '#FFFFFF',

  black: '#111111',
  blackSoft: '#242424',

  gold: '#B08D57',
  goldLight: '#D0B27F',

  text: '#151515',
  muted: '#777777',
  soft: '#A1A1A1',

  border: 'rgba(17,17,17,0.08)',
  input: 'rgba(255,255,255,0.90)',

  danger: '#B33A3A',

  google: '#4285F4',
};

/* =========================================================
   LOGIN SCREEN
========================================================= */

export default function LoginScreen() {
  const router = useRouter();

  /* =======================================================
     STATES
  ======================================================= */

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  /* =======================================================
     ANIMAÇÕES
  ======================================================= */

  const screenOpacity = useRef(
    new Animated.Value(0),
  ).current;

  const logoAnimation = useRef(
    new Animated.Value(0),
  ).current;

  const cardAnimation = useRef(
    new Animated.Value(0),
  ).current;

  const footerAnimation = useRef(
    new Animated.Value(0),
  ).current;

  const logoScale = useRef(
    new Animated.Value(0.82),
  ).current;

  const buttonScale = useRef(
    new Animated.Value(1),
  ).current;

  /* =======================================================
     ENTRADA DA TELA
  ======================================================= */

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.spring(logoAnimation, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 60,
        useNativeDriver: true,
      }),

      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 650,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(footerAnimation, {
        toValue: 1,
        duration: 500,
        delay: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    screenOpacity,
    logoAnimation,
    logoScale,
    cardAnimation,
    footerAnimation,
  ]);

  /* =======================================================
     VALIDAÇÃO
  ======================================================= */

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value.trim(),
    );
  };

  const validateForm = () => {
    let valid = true;

    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Digite o seu e-mail.');
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Digite um e-mail válido.');
      valid = false;
    }

    if (!password) {
      setPasswordError(
        'Digite a sua palavra-passe.',
      );
      valid = false;
    } else if (password.length < 6) {
      setPasswordError(
        'A palavra-passe deve ter pelo menos 6 caracteres.',
      );
      valid = false;
    }

    return valid;
  };

  /* =======================================================
     LOGIN
  ======================================================= */

  const handleLogin = async () => {
    if (loading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      Animated.sequence([
        Animated.spring(buttonScale, {
          toValue: 0.97,
          friction: 6,
          useNativeDriver: true,
        }),

        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();

      await login({ email: email.trim(), password });

      /*
       * Vai para a tela inicial.
       *
       * replace impede o retorno direto para o login.
       */
      router.replace('/');
    } catch (error) {
      const message =
        error instanceof ApiRequestError
          ? error.message
          : 'Não foi possível iniciar sessão. Tente novamente.';

      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     GOOGLE
  ======================================================= */

  const handleGoogle = () => {
    Alert.alert(
      'Google',
      'O login com Google será configurado na próxima etapa.',
    );
  };

  /* =======================================================
     APPLE
  ======================================================= */

  const handleApple = () => {
    Alert.alert(
      'Apple',
      'O login com Apple será configurado na próxima etapa.',
    );
  };

  /* =======================================================
     RECUPERAR PASSWORD
  ======================================================= */

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar palavra-passe',
      'A recuperação da conta será configurada na próxima etapa.',
    );
  };

  /* =======================================================
     CRIAR CONTA
  ======================================================= */

  const handleCreateAccount = () => {
    router.push('/cadastro');
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <Animated.View
        style={[
          styles.container,
          {
            opacity: screenOpacity,
          },
        ]}
      >
        {/* =================================================
            DECORAÇÕES
        ================================================= */}

        <View
          pointerEvents="none"
          style={styles.decorOne}
        />

        <View
          pointerEvents="none"
          style={styles.decorTwo}
        />

        <View
          pointerEvents="none"
          style={styles.decorThree}
        />

        <KeyboardAvoidingView
          style={styles.keyboard}
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
            {/* =================================================
                LOGO + NOME DO ESPAÇO
            ================================================= */}

            <Animated.View
              style={[
                styles.logoSection,
                {
                  opacity: logoAnimation,
                  transform: [
                    {
                      translateY:
                        logoAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-25, 0],
                        }),
                    },
                    {
                      scale: logoScale,
                    },
                  ],
                },
              ]}
            >
              <View style={styles.logoGlow}>
                <LinearGradient
                  colors={[
                    COLORS.black,
                    '#292929',
                    COLORS.black,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logo}
                >
                  <Text style={styles.logoLetter}>
                    S
                  </Text>

                  <View style={styles.logoAccent} />
                </LinearGradient>
              </View>

              {/* NOME DO ESPAÇO */}
              <Text style={styles.spaceName}>
                SLOTIX
              </Text>
            </Animated.View>

            {/* =================================================
                CARD
            ================================================= */}

            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  opacity: cardAnimation,
                  transform: [
                    {
                      translateY:
                        cardAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [35, 0],
                        }),
                    },
                  ],
                },
              ]}
            >
              <BlurView
                intensity={50}
                tint="light"
                style={styles.card}
              >
                <View style={styles.cardContent}>
                  {/* =========================================
                      EMAIL
                  ========================================= */}

                  <View style={styles.field}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>
                        E-MAIL
                      </Text>

                      {email.length > 0 &&
                      !emailError &&
                      validateEmail(email) ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color="#4C9A6A"
                        />
                      ) : null}
                    </View>

                    <View
                      style={[
                        styles.inputContainer,
                        emailError &&
                          styles.inputContainerError,
                        email.length > 0 &&
                          !emailError &&
                          validateEmail(email) &&
                          styles.inputContainerValid,
                      ]}
                    >
                      <View
                        style={styles.inputIcon}
                      >
                        <Ionicons
                          name="mail-outline"
                          size={19}
                          color={COLORS.gold}
                        />
                      </View>

                      <TextInput
                        value={email}
                        onChangeText={value => {
                          setEmail(value);

                          if (emailError) {
                            setEmailError('');
                          }
                        }}
                        placeholder="seu@email.com"
                        placeholderTextColor="#A4A4A4"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                        style={styles.input}
                        returnKeyType="next"
                      />
                    </View>

                    {emailError ? (
                      <Text
                        style={styles.errorText}
                      >
                        {emailError}
                      </Text>
                    ) : null}
                  </View>

                  {/* =========================================
                      PASSWORD
                  ========================================= */}

                  <View style={styles.field}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>
                        PALAVRA-PASSE
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.inputContainer,
                        passwordError &&
                          styles.inputContainerError,
                      ]}
                    >
                      <View
                        style={styles.inputIcon}
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={19}
                          color={COLORS.gold}
                        />
                      </View>

                      <TextInput
                        value={password}
                        onChangeText={value => {
                          setPassword(value);

                          if (passwordError) {
                            setPasswordError('');
                          }
                        }}
                        placeholder="Digite a sua palavra-passe"
                        placeholderTextColor="#A4A4A4"
                        secureTextEntry={
                          !showPassword
                        }
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="password"
                        textContentType="password"
                        style={styles.input}
                        returnKeyType="done"
                        onSubmitEditing={
                          handleLogin
                        }
                      />

                      <Pressable
                        onPress={() =>
                          setShowPassword(
                            previous =>
                              !previous,
                          )
                        }
                        hitSlop={12}
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
                          size={21}
                          color={COLORS.muted}
                        />
                      </Pressable>
                    </View>

                    {passwordError ? (
                      <Text
                        style={styles.errorText}
                      >
                        {passwordError}
                      </Text>
                    ) : null}
                  </View>

                  {/* =========================================
                      ESQUECEU PASSWORD
                  ========================================= */}

                  <Pressable
                    onPress={handleForgotPassword}
                    style={styles.forgotButton}
                    hitSlop={8}
                  >
                    <Text
                      style={styles.forgotText}
                    >
                      Esqueceu a palavra-passe?
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={13}
                      color={COLORS.gold}
                    />
                  </Pressable>

                  {/* =========================================
                      ENTRAR
                  ========================================= */}

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
                      onPress={handleLogin}
                      disabled={loading}
                      style={({ pressed }) => [
                        styles.loginButton,
                        pressed &&
                          !loading &&
                          styles.loginButtonPressed,
                      ]}
                    >
                      <LinearGradient
                        colors={[
                          '#0D0D0D',
                          '#292929',
                          '#0D0D0D',
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
                          styles.loginGradient
                        }
                      >
                        {loading ? (
                          <View
                            style={
                              styles.loadingRow
                            }
                          >
                            <ActivityIndicator
                              size="small"
                              color={
                                COLORS.white
                              }
                            />

                            <Text
                              style={
                                styles.loadingText
                              }
                            >
                              A ENTRAR...
                            </Text>
                          </View>
                        ) : (
                          <>
                            <Text
                              style={
                                styles.loginText
                              }
                            >
                              ENTRAR
                            </Text>

                            <View
                              style={
                                styles.arrowCircle
                              }
                            >
                              <Ionicons
                                name="arrow-forward"
                                size={16}
                                color={
                                  COLORS.black
                                }
                              />
                            </View>
                          </>
                        )}
                      </LinearGradient>
                    </Pressable>
                  </Animated.View>

                  {/* =========================================
                      DIVISOR
                  ========================================= */}

                  <View
                    style={styles.dividerContainer}
                  >
                    <View
                      style={styles.divider}
                    />

                    <View
                      style={styles.dividerBadge}
                    >
                      <Text
                        style={
                          styles.dividerText
                        }
                      >
                        OU CONTINUE COM
                      </Text>
                    </View>

                    <View
                      style={styles.divider}
                    />
                  </View>

                  {/* =========================================
                      GOOGLE
                  ========================================= */}

                  <Pressable
                    onPress={handleGoogle}
                    style={({ pressed }) => [
                      styles.socialButton,
                      pressed &&
                        styles.socialPressed,
                    ]}
                  >
                    <View
                      style={styles.googleIconBox}
                    >
                      <Text
                        style={styles.googleIcon}
                      >
                        G
                      </Text>
                    </View>

                    <Text
                      style={styles.socialText}
                    >
                      Continuar com Google
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={COLORS.soft}
                      style={styles.socialArrow}
                    />
                  </Pressable>

                  {/* =========================================
                      APPLE
                  ========================================= */}

                  <Pressable
                    onPress={handleApple}
                    style={({ pressed }) => [
                      styles.socialButton,
                      styles.appleButton,
                      pressed &&
                        styles.socialPressed,
                    ]}
                  >
                    <View
                      style={styles.appleIconBox}
                    >
                      <Ionicons
                        name="logo-apple"
                        size={19}
                        color={COLORS.black}
                      />
                    </View>

                    <Text
                      style={styles.socialText}
                    >
                      Continuar com Apple
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={COLORS.soft}
                      style={styles.socialArrow}
                    />
                  </Pressable>
                </View>
              </BlurView>
            </Animated.View>

            {/* =================================================
                CRIAR CONTA
            ================================================= */}

            <Animated.View
              style={[
                styles.registerSection,
                {
                  opacity: footerAnimation,
                  transform: [
                    {
                      translateY:
                        footerAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [15, 0],
                        }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.registerText}>
                Ainda não tem uma conta?
              </Text>

              <Pressable
                onPress={handleCreateAccount}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.registerButton,
                  pressed &&
                    styles.registerButtonPressed,
                ]}
              >
                <Text
                  style={styles.registerLink}
                >
                  Criar conta
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={COLORS.gold}
                />
              </Pressable>
            </Animated.View>

            {/* =================================================
                FOOTER
            ================================================= */}

            <Animated.View
              style={[
                styles.footer,
                {
                  opacity: footerAnimation,
                },
              ]}
            >
              <View style={styles.footerLine} />

              <View style={styles.footerCenter}>
                <View
                  style={styles.footerDot}
                />

                <Text
                  style={styles.footerText}
                >
                  ACESSO SEGURO
                </Text>

                <View
                  style={styles.footerDot}
                />
              </View>

              <View style={styles.footerLine} />
            </Animated.View>

            <Text style={styles.footerTagline}>
              CONTINUE PARA A SUA CONTA
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}

/* =========================================================
   ESTILOS
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 40,
  },

  /* =======================================================
     DECORAÇÕES
  ======================================================= */

  decorOne: {
    position: 'absolute',
    width: 310,
    height: 310,
    borderRadius: 155,
    backgroundColor:
      'rgba(176,141,87,0.075)',
    top: -170,
    right: -130,
  },

  decorTwo: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor:
      'rgba(17,17,17,0.025)',
    bottom: -125,
    left: -125,
  },

  decorThree: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor:
      'rgba(176,141,87,0.10)',
    top: 150,
    right: -70,
  },

  /* =======================================================
     LOGO
  ======================================================= */

  logoSection: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 30,
  },

  logoGlow: {
    shadowColor: COLORS.gold,
    shadowOpacity: 0.18,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 9,
  },

  logo: {
    width: 64,
    height: 64,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  logoLetter: {
    color: COLORS.white,
    fontSize: 33,
    fontWeight: '900',
    letterSpacing: -1.5,
  },

  logoAccent: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.goldLight,
    right: 13,
    top: 13,
  },

  /* =======================================================
     NOME DO ESPAÇO
  ======================================================= */

  spaceName: {
    marginTop: 12,
    color: COLORS.black,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 5,
  },

  /* =======================================================
     CARD
  ======================================================= */

  cardWrapper: {
    borderRadius: 29,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 5,
  },

  card: {
    overflow: 'hidden',
    borderRadius: 29,
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.95)',
    backgroundColor:
      'rgba(255,255,255,0.62)',
  },

  cardContent: {
    padding: 21,
  },

  /* =======================================================
     CAMPOS
  ======================================================= */

  field: {
    marginBottom: 18,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  label: {
    color: '#555555',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  inputContainer: {
    minHeight: 57,
    borderRadius: 17,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  inputContainerError: {
    borderColor:
      'rgba(179,58,58,0.50)',
  },

  inputContainerValid: {
    borderColor:
      'rgba(76,154,106,0.28)',
  },

  inputIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor:
      'rgba(176,141,87,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  input: {
    flex: 1,
    height: 57,
    marginLeft: 10,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },

  eyeButton: {
    paddingLeft: 9,
    paddingVertical: 8,
  },

  errorText: {
    marginTop: 6,
    marginLeft: 2,
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '500',
  },

  /* =======================================================
     ESQUECEU PASSWORD
  ======================================================= */

  forgotButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -2,
    marginBottom: 20,
  },

  forgotText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
  },

  /* =======================================================
     LOGIN BUTTON
  ======================================================= */

  loginButton: {
    overflow: 'hidden',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.20,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 7,
  },

  loginButtonPressed: {
    opacity: 0.91,
  },

  loginGradient: {
    minHeight: 58,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  loginText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.8,
  },

  arrowCircle: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: COLORS.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  loadingText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  /* =======================================================
     DIVISOR
  ======================================================= */

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 23,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor:
      'rgba(17,17,17,0.09)',
  },

  dividerBadge: {
    paddingHorizontal: 10,
  },

  dividerText: {
    color: '#999999',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  /* =======================================================
     SOCIAL
  ======================================================= */

  socialButton: {
    minHeight: 53,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor:
      'rgba(255,255,255,0.78)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  appleButton: {
    marginTop: 11,
  },

  socialPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  googleIconBox: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#F4F7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  googleIcon: {
    color: COLORS.google,
    fontSize: 18,
    fontWeight: '900',
  },

  appleIconBox: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  socialText: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '700',
  },

  socialArrow: {
    marginLeft: 5,
  },

  /* =======================================================
     CRIAR CONTA
  ======================================================= */

  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 27,
    gap: 5,
  },

  registerText: {
    color: COLORS.muted,
    fontSize: 13,
  },

  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },

  registerButtonPressed: {
    opacity: 0.65,
  },

  registerLink: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '800',
  },

  /* =======================================================
     FOOTER
  ======================================================= */

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 30,
  },

  footerLine: {
    flex: 1,
    maxWidth: 48,
    height: 1,
    backgroundColor:
      'rgba(176,141,87,0.35)',
  },

  footerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.gold,
  },

  footerText: {
    color: '#A0A0A0',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
  },

  footerTagline: {
    marginTop: 7,
    color: '#B0B0B0',
    textAlign: 'center',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});

