
import React from 'react';

import {
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';

import {
  Stack,
  useSegments,
} from 'expo-router';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import FloatingNavigation from '@/components/FloatingNavigation';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
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

  const isAuthRoute =
    segments[0] === '(auth)';

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

