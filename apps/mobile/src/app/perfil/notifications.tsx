// slotix-mobile/src/app/perfil/notifications.tsx

import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import type { NotificationDTO } from '@slotix/types';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notifications';

type IconName = keyof typeof Ionicons.glyphMap;

function getIconForType(type: string): IconName {
  switch (type) {
    case 'booking':
      return 'calendar-outline';
    case 'success':
      return 'checkmark-circle';
    case 'cancel':
      return 'close-circle-outline';
    case 'message':
      return 'chatbubble-ellipses-outline';
    case 'favorite':
      return 'heart-outline';
    default:
      return 'notifications-outline';
  }
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMinutes < 1) return 'Agora';
  if (diffMinutes < 60) return `Há ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Há ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;

  return date.toLocaleDateString('pt-AO');
}

const COLORS = {
  background: '#F5F5F2',
  white: '#FFFFFF',
  black: '#0B0B0C',
  text: '#111214',
  secondary: '#707176',
  muted: '#A0A1A5',
  border: '#E8E8E4',
  blue: '#155EEF',
  blueSoft: '#EEF4FF',
  green: '#16A66A',
  greenSoft: '#EAF9F2',
  red: '#D92D20',
  redSoft: '#FFF0EE',
  purple: '#7A5AF8',
  purpleSoft: '#F1EEFF',
};

export default function NotificationsScreen() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [bookingNotifications, setBookingNotifications] = useState(true);
  const [messagesNotifications, setMessagesNotifications] = useState(true);
  const [favoriteNotifications, setFavoriteNotifications] = useState(true);

  useEffect(() => {
    let cancelled = false;

    listNotifications()
      .then((data) => {
        if (!cancelled) setNotifications(data);
      })
      .catch(() => {
        if (!cancelled) setNotifications([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const getIconBackground = (type: string) => {
    switch (type) {
      case 'success':
        return COLORS.greenSoft;
      case 'cancel':
        return COLORS.redSoft;
      case 'favorite':
        return COLORS.purpleSoft;
      case 'message':
        return COLORS.blueSoft;
      default:
        return '#F1F1EE';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return COLORS.green;
      case 'cancel':
        return COLORS.red;
      case 'favorite':
        return COLORS.purple;
      case 'message':
        return COLORS.blue;
      default:
        return COLORS.text;
    }
  };

  const markAsRead = async (id: string) => {
    const target = notifications.find((item) => item.id === id);
    if (!target || target.read) return;

    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
    );

    try {
      await markNotificationRead(id);
    } catch {
      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, read: false } : item,
        ),
      );
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    const previous = notifications;

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        read: true,
      })),
    );

    try {
      await markAllNotificationsRead();
    } catch {
      setNotifications(previous);
    }
  };

  const renderNotification = ({
    item,
  }: {
    item: NotificationDTO;
  }) => {
    return (
      <Pressable
        onPress={() => void markAsRead(item.id)}
        style={({ pressed }) => [
          styles.notificationCard,
          !item.read && styles.unreadCard,
          pressed && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.notificationIcon,
            {
              backgroundColor: getIconBackground(item.type),
            },
          ]}
        >
          <Ionicons
            name={getIconForType(item.type)}
            size={21}
            color={getIconColor(item.type)}
          />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationTop}>
            <Text
              style={[
                styles.notificationTitle,
                !item.read && styles.unreadTitle,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            {!item.read && <View style={styles.unreadDot} />}
          </View>

          <Text
            style={styles.notificationMessage}
            numberOfLines={2}
          >
            {item.message}
          </Text>

          <View style={styles.notificationBottom}>
            <Text style={styles.notificationTime}>
              {formatRelativeTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

        <View style={[styles.container, styles.loadingContainer]}>
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

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Notificações</Text>

            {unreadCount > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          <Pressable
            onPress={() => void markAllAsRead()}
            disabled={unreadCount === 0}
            style={({ pressed }) => [
              styles.headerAction,
              pressed && styles.pressed,
              unreadCount === 0 && styles.disabledAction,
            ]}
          >
            <Text
              style={[
                styles.headerActionText,
                unreadCount === 0 && styles.disabledText,
              ]}
            >
              Ler tudo
            </Text>
          </Pressable>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 && styles.emptyListContent,
          ]}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <View>
                <Text style={styles.sectionTitle}>Atividade</Text>
                <Text style={styles.sectionSubtitle}>
                  Fique por dentro das novidades do SLOTIX
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="notifications-off-outline"
                  size={34}
                  color={COLORS.secondary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                Tudo tranquilo por aqui
              </Text>

              <Text style={styles.emptyDescription}>
                Quando houver uma nova atividade, ela aparecerá
                aqui.
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.preferences}>
              <Text style={styles.sectionTitle}>
                Preferências
              </Text>

              <View style={styles.preferenceCard}>
                <View style={styles.preferenceRow}>
                  <View style={styles.preferenceIcon}>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={COLORS.text}
                    />
                  </View>

                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>
                      Agendamentos
                    </Text>

                    <Text style={styles.preferenceDescription}>
                      Lembretes e confirmações
                    </Text>
                  </View>

                  <Switch
                    value={bookingNotifications}
                    onValueChange={setBookingNotifications}
                    trackColor={{
                      false: '#D9D9D5',
                      true: '#AFC5FF',
                    }}
                    thumbColor={
                      bookingNotifications
                        ? COLORS.blue
                        : '#FFFFFF'
                    }
                  />
                </View>

                <View style={styles.separator} />

                <View style={styles.preferenceRow}>
                  <View style={styles.preferenceIcon}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color={COLORS.text}
                    />
                  </View>

                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>
                      Mensagens
                    </Text>

                    <Text style={styles.preferenceDescription}>
                      Novas mensagens dos espaços
                    </Text>
                  </View>

                  <Switch
                    value={messagesNotifications}
                    onValueChange={setMessagesNotifications}
                    trackColor={{
                      false: '#D9D9D5',
                      true: '#AFC5FF',
                    }}
                    thumbColor={
                      messagesNotifications
                        ? COLORS.blue
                        : '#FFFFFF'
                    }
                  />
                </View>

                <View style={styles.separator} />

                <View style={styles.preferenceRow}>
                  <View style={styles.preferenceIcon}>
                    <Ionicons
                      name="heart-outline"
                      size={20}
                      color={COLORS.text}
                    />
                  </View>

                  <View style={styles.preferenceText}>
                    <Text style={styles.preferenceTitle}>
                      Favoritos
                    </Text>

                    <Text style={styles.preferenceDescription}>
                      Novidades dos seus favoritos
                    </Text>
                  </View>

                  <Switch
                    value={favoriteNotifications}
                    onValueChange={setFavoriteNotifications}
                    trackColor={{
                      false: '#D9D9D5',
                      true: '#AFC5FF',
                    }}
                    thumbColor={
                      favoriteNotifications
                        ? COLORS.blue
                        : '#FFFFFF'
                    }
                  />
                </View>
              </View>
            </View>
          }
        />
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

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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

  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  countBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },

  headerAction: {
    minWidth: 60,
    alignItems: 'flex-end',
  },

  headerActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.blue,
  },

  disabledAction: {
    opacity: 0.4,
  },

  disabledText: {
    color: COLORS.secondary,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.2,
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.secondary,
  },

  clearText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },

  notificationCard: {
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  unreadCard: {
    borderColor: '#DDE7FF',
    backgroundColor: '#FCFDFF',
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },

  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  notificationContent: {
    flex: 1,
    minWidth: 0,
  },

  notificationTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  unreadTitle: {
    fontWeight: '800',
  },

  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.blue,
    marginLeft: 8,
  },

  notificationMessage: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.secondary,
  },

  notificationBottom: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  notificationTime: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.muted,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
    paddingBottom: 80,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },

  emptyDescription: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.secondary,
    textAlign: 'center',
  },

  preferences: {
    marginTop: 28,
  },

  preferenceCard: {
    marginTop: 14,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  preferenceRow: {
    minHeight: 76,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F4F4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  preferenceText: {
    flex: 1,
    marginHorizontal: 12,
  },

  preferenceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },

  preferenceDescription: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.secondary,
  },

  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 67,
  },
});