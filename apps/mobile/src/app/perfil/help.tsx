import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
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

type HelpCategory = {
  id: string;
  icon: IconName;
  title: string;
  description: string;
};

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'bookings',
    icon: 'calendar-outline',
    title: 'Agendamentos',
    description: 'Reservas, horários e cancelamentos.',
  },
  {
    id: 'account',
    icon: 'person-outline',
    title: 'Conta e perfil',
    description: 'Dados pessoais e configurações da conta.',
  },
  {
    id: 'notifications',
    icon: 'notifications-outline',
    title: 'Notificações',
    description: 'Alertas, lembretes e preferências.',
  },
  {
    id: 'privacy',
    icon: 'shield-checkmark-outline',
    title: 'Privacidade e segurança',
    description: 'Dados, permissões e segurança.',
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Como faço um agendamento?',
    answer:
      'Abra a área Explorar, escolha o espaço ou serviço que pretende utilizar, selecione a data e o horário disponível e confirme a sua reserva.',
  },
  {
    id: 'faq-2',
    question: 'Posso cancelar um agendamento?',
    answer:
      'Sim. Abra os seus agendamentos, selecione a reserva e utilize a opção de cancelamento. As condições podem variar de acordo com o espaço.',
  },
  {
    id: 'faq-3',
    question: 'Como altero os meus dados pessoais?',
    answer:
      'Aceda ao seu Perfil, toque em Editar perfil e altere as informações que pretende atualizar.',
  },
  {
    id: 'faq-4',
    question: 'Como altero as notificações?',
    answer:
      'No Perfil, abra Notificações e escolha quais tipos de alertas deseja receber.',
  },
  {
    id: 'faq-5',
    question: 'Os meus dados estão protegidos?',
    answer:
      'O SLOTIX foi pensado para utilizar boas práticas de segurança e privacidade. As opções disponíveis podem ser consultadas na área Privacidade.',
  },
];

function CategoryRow({
  icon,
  title,
  description,
  onPress,
}: {
  icon: IconName;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryRow,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.categoryIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={COLORS.text}
        />
      </View>

      <View style={styles.categoryContent}>
        <Text style={styles.categoryTitle}>
          {title}
        </Text>

        <Text style={styles.categoryDescription}>
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={COLORS.muted}
      />
    </Pressable>
  );
}

export default function HelpScreen() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(
    null,
  );

  const [supportModalVisible, setSupportModalVisible] =
    useState(false);

  const [supportMessage, setSupportMessage] = useState('');

  const filteredFaqs = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return FAQ_ITEMS;
    }

    return FAQ_ITEMS.filter((item) => {
      return (
        item.question
          .toLowerCase()
          .includes(normalizedSearch) ||
        item.answer
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [search]);

  /*
   * CATEGORIAS
   *
   * Cada categoria abre a página real correspondente.
   */
  const handleCategory = (category: HelpCategory) => {
    switch (category.id) {
      case 'bookings':
        router.push('/appointments');
        break;

      case 'account':
        router.push('/perfil/personalinfo');
        break;

      case 'notifications':
        router.push('/perfil/notifications');
        break;

      case 'privacy':
        router.push('/perfil/privacy');
        break;

      default:
        break;
    }
  };

  const handleSupport = () => {
    setSupportModalVisible(true);
  };

  const handleSendSupport = () => {
    const message = supportMessage.trim();

    if (!message) {
      return;
    }

    setSupportMessage('');
    setSupportModalVisible(false);
  };

  const handleFeedback = () => {
    setSupportMessage('');
    setSupportModalVisible(true);
  };

  const handlePrivacy = () => {
    router.push('/perfil/privacy');
  };

  const handleTerms = () => {
    router.push('/perfil/terms');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
      >
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
            Ajuda
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          {/* HERO */}

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="help-circle-outline"
                size={27}
                color={COLORS.blue}
              />
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>
                Como podemos ajudar?
              </Text>

              <Text style={styles.heroDescription}>
                Encontre respostas rapidamente ou fale
                diretamente com a nossa equipa.
              </Text>
            </View>
          </View>

          {/* SEARCH */}

          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={19}
              color={COLORS.muted}
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Pesquisar ajuda..."
              placeholderTextColor={COLORS.muted}
              style={styles.searchInput}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>

          {/* CATEGORIES */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Categorias
            </Text>

            <Text style={styles.sectionSubtitle}>
              Encontre rapidamente o que procura.
            </Text>

            <View style={styles.card}>
              {HELP_CATEGORIES.map((category, index) => (
                <React.Fragment key={category.id}>
                  <CategoryRow
                    icon={category.icon}
                    title={category.title}
                    description={category.description}
                    onPress={() =>
                      handleCategory(category)
                    }
                  />

                  {index <
                  HELP_CATEGORIES.length - 1 ? (
                    <View style={styles.separator} />
                  ) : null}
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* FAQ */}

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle}>
                  Perguntas frequentes
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Respostas para as dúvidas mais comuns.
                </Text>
              </View>

              <View style={styles.faqBadge}>
                <Text style={styles.faqBadgeText}>
                  {filteredFaqs.length}
                </Text>
              </View>
            </View>

            <View style={styles.faqCard}>
              {filteredFaqs.length === 0 ? (
                <View style={styles.emptyFaq}>
                  <View style={styles.emptyFaqIcon}>
                    <Ionicons
                      name="search-outline"
                      size={22}
                      color={COLORS.muted}
                    />
                  </View>

                  <Text style={styles.emptyFaqTitle}>
                    Nenhum resultado
                  </Text>

                  <Text style={styles.emptyFaqDescription}>
                    Não encontrámos uma resposta para a
                    sua pesquisa.
                  </Text>
                </View>
              ) : (
                filteredFaqs.map((item, index) => {
                  const isExpanded =
                    expandedFaq === item.id;

                  return (
                    <React.Fragment key={item.id}>
                      <Pressable
                        onPress={() =>
                          setExpandedFaq(
                            isExpanded
                              ? null
                              : item.id,
                          )
                        }
                        style={({ pressed }) => [
                          styles.faqRow,
                          pressed &&
                            styles.pressed,
                        ]}
                      >
                        <View style={styles.faqQuestionIcon}>
                          <Ionicons
                            name="help-outline"
                            size={16}
                            color={COLORS.blue}
                          />
                        </View>

                        <View
                          style={
                            styles.faqQuestionContent
                          }
                        >
                          <Text
                            style={styles.faqQuestion}
                          >
                            {item.question}
                          </Text>

                          {isExpanded ? (
                            <Text
                              style={styles.faqAnswer}
                            >
                              {item.answer}
                            </Text>
                          ) : null}
                        </View>

                        <Ionicons
                          name={
                            isExpanded
                              ? 'chevron-up'
                              : 'chevron-down'
                          }
                          size={17}
                          color={COLORS.muted}
                        />
                      </Pressable>

                      {index <
                      filteredFaqs.length - 1 ? (
                        <View
                          style={styles.separator}
                        />
                      ) : null}
                    </React.Fragment>
                  );
                })
              )}
            </View>
          </View>

          {/* SUPPORT */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Precisa de mais ajuda?
            </Text>

            <Text style={styles.sectionSubtitle}>
              A nossa equipa está pronta para ajudar.
            </Text>

            <View style={styles.supportCard}>
              <View style={styles.supportIcon}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={23}
                  color={COLORS.green}
                />
              </View>

              <View style={styles.supportContent}>
                <Text style={styles.supportTitle}>
                  Falar com o suporte
                </Text>

                <Text style={styles.supportDescription}>
                  Envie-nos uma mensagem sobre o que
                  precisa.
                </Text>

                <Pressable
                  onPress={handleSupport}
                  style={({ pressed }) => [
                    styles.supportButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.supportButtonText}>
                    Contactar suporte
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={COLORS.white}
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {/* OTHER OPTIONS */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Mais opções
            </Text>

            <View style={styles.card}>
              <CategoryRow
                icon="chatbox-outline"
                title="Enviar feedback"
                description="Ajude-nos a melhorar a experiência SLOTIX."
                onPress={handleFeedback}
              />

              <View style={styles.separator} />

              <CategoryRow
                icon="shield-checkmark-outline"
                title="Privacidade"
                description="Consulte e gerencie as suas preferências."
                onPress={handlePrivacy}
              />

              <View style={styles.separator} />

              <CategoryRow
                icon="document-text-outline"
                title="Termos e condições"
                description="Consulte os termos de utilização do SLOTIX."
                onPress={handleTerms}
              />
            </View>
          </View>

          {/* SECURITY */}

          <View style={styles.securityCard}>
            <View style={styles.securityIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color={COLORS.green}
              />
            </View>

            <View style={styles.securityContent}>
              <Text style={styles.securityTitle}>
                A sua segurança importa
              </Text>

              <Text style={styles.securityDescription}>
                Nunca partilhe a sua palavra-passe, códigos
                de verificação ou informações confidenciais.
              </Text>
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
              Centro de ajuda · v1.0.0
            </Text>
          </View>
        </ScrollView>

        {/* SUPPORT MODAL */}

        <Modal
          visible={supportModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setSupportModalVisible(false)
          }
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() =>
                setSupportModalVisible(false)
              }
            />

            <View style={styles.modalCard}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <Text style={styles.modalTitle}>
                    Contactar suporte
                  </Text>

                  <Text
                    style={styles.modalDescription}
                  >
                    Descreva como podemos ajudar.
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    setSupportModalVisible(false)
                  }
                  style={styles.modalClose}
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={COLORS.text}
                  />
                </Pressable>
              </View>

              <TextInput
                value={supportMessage}
                onChangeText={setSupportMessage}
                placeholder="Escreva a sua mensagem..."
                placeholderTextColor={COLORS.muted}
                multiline
                textAlignVertical="top"
                style={styles.messageInput}
                maxLength={1000}
              />

              <Text style={styles.characterCount}>
                {supportMessage.length}/1000
              </Text>

              <Pressable
                onPress={handleSendSupport}
                style={({ pressed }) => [
                  styles.sendButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="send-outline"
                  size={17}
                  color={COLORS.white}
                />

                <Text style={styles.sendButtonText}>
                  Enviar mensagem
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
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

  heroCard: {
    padding: 17,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    backgroundColor: COLORS.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroContent: {
    flex: 1,
    marginLeft: 13,
  },

  heroTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.2,
  },

  heroDescription: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.secondary,
  },

  searchContainer: {
    height: 51,
    marginTop: 14,
    paddingHorizontal: 15,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 0,
    fontSize: 12,
    color: COLORS.text,
  },

  section: {
    marginTop: 27,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionHeaderContent: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.secondary,
  },

  faqBadge: {
    minWidth: 27,
    height: 27,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: COLORS.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  faqBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.blue,
  },

  card: {
    marginTop: 13,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  categoryRow: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F3F3F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryContent: {
    flex: 1,
    marginHorizontal: 11,
  },

  categoryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },

  categoryDescription: {
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

  faqCard: {
    marginTop: 13,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  faqRow: {
    paddingHorizontal: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  faqQuestionIcon: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: COLORS.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  faqQuestionContent: {
    flex: 1,
    marginHorizontal: 10,
  },

  faqQuestion: {
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  faqAnswer: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.secondary,
  },

  emptyFaq: {
    paddingHorizontal: 25,
    paddingVertical: 30,
    alignItems: 'center',
  },

  emptyFaqIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#F3F3F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyFaqTitle: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },

  emptyFaqDescription: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    color: COLORS.secondary,
  },

  supportCard: {
    marginTop: 13,
    padding: 15,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
  },

  supportIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  supportContent: {
    flex: 1,
    marginLeft: 12,
  },

  supportTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },

  supportDescription: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.secondary,
  },

  supportButton: {
    height: 38,
    marginTop: 12,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: COLORS.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },

  supportButtonText: {
    marginRight: 7,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },

  securityCard: {
    marginTop: 27,
    padding: 15,
    borderRadius: 20,
    backgroundColor: COLORS.greenSoft,
    borderWidth: 1,
    borderColor: '#D6F0E3',
    flexDirection: 'row',
    alignItems: 'center',
  },

  securityIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  securityContent: {
    flex: 1,
    marginLeft: 11,
  },

  securityTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
  },

  securityDescription: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 14,
    color: COLORS.secondary,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.background,
  },

  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    backgroundColor: '#D2D2CE',
    marginBottom: 18,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  modalHeaderContent: {
    flex: 1,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },

  modalDescription: {
    marginTop: 4,
    fontSize: 10,
    color: COLORS.secondary,
  },

  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  messageInput: {
    minHeight: 135,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.text,
  },

  characterCount: {
    marginTop: 5,
    marginRight: 3,
    textAlign: 'right',
    fontSize: 9,
    color: COLORS.muted,
  },

  sendButton: {
    height: 49,
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: COLORS.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});