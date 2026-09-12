import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Item = {
  route: string;
  icon: IconName;
  activeIcon: IconName;
};

const ITEMS: Item[] = [
  {
    route: '/',
    icon: 'home-outline',
    activeIcon: 'home',
  },
  {
    route: '/explore',
    icon: 'compass-outline',
    activeIcon: 'compass',
  },
  {
    route: '/appointments',
    icon: 'calendar-outline',
    activeIcon: 'calendar',
  },
  {
    route: '/favorites',
    icon: 'heart-outline',
    activeIcon: 'heart',
  },
  {
    route: '/profile',
    icon: 'person-outline',
    activeIcon: 'person',
  },
];

type ButtonProps = {
  item: Item;
  active: boolean;
  onPress: () => void;
};

const NavButton = memo(function NavButton({
  item,
  active,
  onPress,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const activeAnimation = useRef(
    new Animated.Value(active ? 1 : 0),
  ).current;

  useEffect(() => {
    Animated.spring(activeAnimation, {
      toValue: active ? 1 : 0,
      damping: 16,
      stiffness: 220,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  }, [active, activeAnimation]);

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.86,
      damping: 15,
      stiffness: 300,
      mass: 0.5,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 15,
      stiffness: 280,
      mass: 0.5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.buttonWrapper,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.button}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activeCircle,
            {
              opacity: activeAnimation,
              transform: [
                {
                  scale: activeAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ],
            },
          ]}
        />

        <Ionicons
          name={active ? item.activeIcon : item.icon}
          size={21}
          color={active ? '#FFFFFF' : '#777777'}
        />

        {active ? (
          <View style={styles.activeDot} />
        ) : null}
      </Pressable>
    </Animated.View>
  );
});

export default function FloatingNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const entrance = useRef(new Animated.Value(0)).current;
  const floating = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      damping: 18,
      stiffness: 130,
      mass: 0.8,
      useNativeDriver: true,
    }).start();

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floating, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floating, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [entrance, floating]);

  const navigate = useCallback(
    (route: string) => {
      if (pathname === route) {
        return;
      }

      router.replace(route as any);
    },
    [pathname, router],
  );

  const bottom = Math.max(insets.bottom, 8) + 10;

  return (
    <View
      pointerEvents="box-none"
      style={styles.overlay}
    >
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.position,
          {
            bottom,
            opacity: entrance,
            transform: [
              {
                translateY: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [80, 0],
                }),
              },
              {
                translateY: floating.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -2],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.shadow} />

        <View style={styles.navigation}>
          <BlurView
            intensity={80}
            tint="light"
            style={styles.blur}
          />

          <View style={styles.glass} />

          <View style={styles.items}>
            {ITEMS.map((item) => {
              const active =
                pathname === item.route ||
                (
                  item.route === '/' &&
                  pathname === '/index'
                );

              return (
                <NavButton
                  key={item.route}
                  item={item}
                  active={active}
                  onPress={() => navigate(item.route)}
                />
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  position: {
    position: 'absolute',
    left: 18,
    right: 18,
    alignItems: 'center',
  },

  shadow: {
    position: 'absolute',
    top: 7,
    right: 5,
    bottom: -7,
    left: 5,
    borderRadius: 35,
    backgroundColor: '#000000',
    opacity: 0.15,
  },

  navigation: {
    width: '100%',
    height: 68,
    overflow: 'hidden',
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },

  blur: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },

  glass: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  items: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },

  buttonWrapper: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },

  button: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
  },

  activeCircle: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#111111',
  },

  activeDot: {
    position: 'absolute',
    bottom: 5,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
});