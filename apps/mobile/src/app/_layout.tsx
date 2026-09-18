
import React, { useEffect } from 'react';

import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';

import {
  Stack,
  useRouter,
  useSegments,
} from 'expo-router';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import FloatingNavigation from '@/components/FloatingNavigation';
import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <RootLayoutContent />
      </FavoritesProvider>
    </AuthProvider>
  );
}

function RootLayoutContent() {
  /*
   * Detecta automaticamente o tema definido
   * no telefone:
   *
   * light → tema claro
   * dark  → tema escuro
   */
  const colorScheme = useColorScheme();

  /*
   * Seleciona as cores correspondentes ao tema atual.
   *
   * Se o sistema devolver null, usamos light
   * como fallback.
   */
  const colors =
    colorScheme === 'dark'
      ? Colors.dark
      : Colors.light;

  /*
   * Detecta em que grupo de rotas estamos.
   *
   * As telas dentro de (auth), como:
   * /login
   * /cadastro
   *
   * não devem mostrar a navegação inferior.
   */
  const segments = useSegments();
  const router = useRouter();

  const isAuthRoute =
    segments[0] === '(auth)';

  /*
   * Nenhum ecrã pedia sessão antes (os dados eram todos mock).
   * Agora que appointments/favorites/perfil dependem de um
   * utilizador real, sem sessão válida volta sempre para o login.
   */
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isAuthRoute) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, isAuthRoute, router]);

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View
          style={[
            styles.container,
            styles.loadingContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        {/* =================================================
            STATUS BAR
            ================================================= */}

        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={
            colorScheme === 'dark'
              ? 'light-content'
              : 'dark-content'
          }
        />

        {/* =================================================
            STACK PRINCIPAL
            ================================================= */}

        <View style={styles.stackContainer}>
          <Stack
            screenOptions={{
              headerShown: false,

              animation: 'fade',

              contentStyle: {
                backgroundColor:
                  colors.background,
              },

              /*
               * Garante que as telas do Stack
               * não apresentem fundo diferente
               * do tema global.
               */
            }}
          />
        </View>

        {/* =================================================
            NAVEGAÇÃO INFERIOR
            =================================================

            Login e cadastro não mostram
            FloatingNavigation.
        */}

        {!isAuthRoute && (
          <View
            pointerEvents="box-none"
            style={styles.navigationLayer}
          >
            <FloatingNavigation />
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

/* =========================================================
   ESTILOS
   ========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  stackContainer: {
    flex: 1,
  },

  navigationLayer: {
    position: 'absolute',

    top: 0,
    right: 0,
    bottom: 0,
    left: 0,

    zIndex: 9999,
    elevation: 9999,
  },
});

