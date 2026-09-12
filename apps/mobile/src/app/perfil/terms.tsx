import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
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

type SectionProps = {
  icon: IconName;
  number: string;
  title: string;
  children: React.ReactNode;
};

function TermsSection({
  icon,
  number,
  title,
  children,
}: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons
            name={icon}
            size={18}
            color={COLORS.text}
          />
        </View>

        <View style={styles.sectionHeaderContent}>
          <Text style={styles.sectionNumber}>
            {number}
          </Text>

          <Text style={styles.sectionTitle}>
            {title}
          </Text>
        </View>
      </View>

      <View style={styles.sectionBody}>
        {children}
      </View>
    </View>
  );
}

function Paragraph({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Text style={styles.paragraph}>
      {children}
    </Text>
  );
}

function Bullet({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bullet} />

      <Text style={styles.bulletText}>
        {children}
      </Text>
    </View>
  );
}

export default function TermsScreen() {
  const router = useRouter();

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
            Termos e condições
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* HERO */}

          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={25}
                  color={COLORS.blue}
                />
              </View>

              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />

                <Text style={styles.statusText}>
                  Em vigor
                </Text>
              </View>
            </View>

            <Text style={styles.heroTitle}>
              Termos e condições do SLOTIX
            </Text>

            <Text style={styles.heroDescription}>
              Estes termos estabelecem as regras para a
              utilização da plataforma SLOTIX e dos seus
              serviços.
            </Text>

            <View style={styles.updatedRow}>
              <Ionicons
                name="time-outline"
                size={14}
                color={COLORS.muted}
              />

              <Text style={styles.updatedText}>
                Última atualização: 7 de setembro de 2026
              </Text>
            </View>
          </View>

          {/* INTRODUCTION */}

          <View style={styles.introductionCard}>
            <View style={styles.introductionIcon}>
              <Ionicons
                name="information-circle-outline"
                size={21}
                color={COLORS.blue}
              />
            </View>

            <Text style={styles.introductionText}>
              Ao utilizar o SLOTIX, você declara que leu,
              compreendeu e concorda com estes termos e
              condições. Caso não concorde com alguma parte,
              recomendamos que não utilize os serviços da
              plataforma.
            </Text>
          </View>

          {/* 1 */}

          <TermsSection
            number="01"
            icon="checkmark-circle-outline"
            title="Aceitação dos termos"
          >
            <Paragraph>
              O acesso e utilização do SLOTIX estão sujeitos
              aos presentes Termos e Condições. Ao criar uma
              conta ou utilizar qualquer funcionalidade da
              plataforma, o utilizador aceita estes termos.
            </Paragraph>

            <Paragraph>
              Estes termos podem ser atualizados ao longo do
              tempo para acompanhar alterações no serviço,
              requisitos legais ou melhorias na plataforma.
            </Paragraph>
          </TermsSection>

          {/* 2 */}

          <TermsSection
            number="02"
            icon="apps-outline"
            title="Utilização do serviço"
          >
            <Paragraph>
              O SLOTIX é uma plataforma destinada a facilitar
              a descoberta, organização e gestão de
              agendamentos entre utilizadores e espaços
              disponíveis na plataforma.
            </Paragraph>

            <Text style={styles.subheading}>
              O utilizador compromete-se a:
            </Text>

            <Bullet>
              Fornecer informações verdadeiras e atualizadas.
            </Bullet>

            <Bullet>
              Utilizar a plataforma de forma legal e
              responsável.
            </Bullet>

            <Bullet>
              Não utilizar o serviço para atividades
              fraudulentas ou abusivas.
            </Bullet>

            <Bullet>
              Manter os dados de acesso à conta protegidos.
            </Bullet>
          </TermsSection>

          {/* 3 */}

          <TermsSection
            number="03"
            icon="person-outline"
            title="Conta do utilizador"
          >
            <Paragraph>
              Algumas funcionalidades do SLOTIX podem exigir
              a criação de uma conta. O utilizador é
              responsável pelas informações fornecidas e pela
              atividade realizada através da sua conta.
            </Paragraph>

            <Paragraph>
              Caso suspeite que outra pessoa obteve acesso à
              sua conta, deverá tomar as medidas necessárias
              para proteger o acesso e contactar o suporte do
              SLOTIX.
            </Paragraph>
          </TermsSection>

          {/* 4 */}

          <TermsSection
            number="04"
            icon="calendar-outline"
            title="Agendamentos"
          >
            <Paragraph>
              O SLOTIX pode permitir que o utilizador consulte
              disponibilidade e realize agendamentos junto
              dos espaços apresentados na plataforma.
            </Paragraph>

            <Paragraph>
              A confirmação, alteração ou cancelamento de um
              agendamento pode estar sujeito às regras
              específicas do respetivo espaço.
            </Paragraph>

            <View style={styles.infoBox}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={COLORS.orange}
              />

              <Text style={styles.infoBoxText}>
                Verifique sempre os detalhes da reserva antes
                de confirmar o agendamento.
              </Text>
            </View>
          </TermsSection>

          {/* 5 */}

          <TermsSection
            number="05"
            icon="business-outline"
            title="Espaços e prestadores"
          >
            <Paragraph>
              Os espaços e prestadores apresentados no SLOTIX
              são responsáveis pelas informações relativas aos
              seus serviços, horários, disponibilidade, preços
              e políticas próprias.
            </Paragraph>

            <Paragraph>
              O SLOTIX poderá disponibilizar ferramentas para
              facilitar a interação, mas determinadas
              condições da prestação do serviço são definidas
              diretamente pelo espaço.
            </Paragraph>
          </TermsSection>

          {/* 6 */}

          <TermsSection
            number="06"
            icon="shield-checkmark-outline"
            title="Privacidade e segurança"
          >
            <Paragraph>
              A proteção dos dados dos utilizadores é uma
              prioridade. As informações pessoais são tratadas
              de acordo com as políticas de privacidade
              aplicáveis ao serviço.
            </Paragraph>

            <Pressable
              onPress={() =>
                router.push('/perfil/privacy')
              }
              style={({ pressed }) => [
                styles.linkButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={17}
                color={COLORS.blue}
              />

              <Text style={styles.linkButtonText}>
                Ver definições de privacidade
              </Text>

              <Ionicons
                name="chevron-forward"
                size={17}
                color={COLORS.blue}
              />
            </Pressable>
          </TermsSection>

          {/* 7 */}

          <TermsSection
            number="07"
            icon="warning-outline"
            title="Utilização proibida"
          >
            <Paragraph>
              Não é permitido utilizar o SLOTIX de forma que
              possa prejudicar outros utilizadores, espaços ou
              o funcionamento da plataforma.
            </Paragraph>

            <Text style={styles.subheading}>
              Entre outras práticas, não é permitido:
            </Text>

            <Bullet>
              Tentar obter acesso não autorizado a contas ou
              sistemas.
            </Bullet>

            <Bullet>
              Utilizar informações falsas de forma
              fraudulenta.
            </Bullet>

            <Bullet>
              Interferir no funcionamento normal da plataforma.
            </Bullet>

            <Bullet>
              Utilizar o serviço para atividades ilegais.
            </Bullet>
          </TermsSection>

          {/* 8 */}

          <TermsSection
            number="08"
            icon="close-circle-outline"
            title="Cancelamentos e alterações"
          >
            <Paragraph>
              As condições de cancelamento ou alteração de um
              agendamento podem variar conforme o espaço e o
              serviço escolhido.
            </Paragraph>

            <Paragraph>
              O utilizador deve consultar as condições
              apresentadas no momento da reserva.
            </Paragraph>
          </TermsSection>

          {/* 9 */}

          <TermsSection
            number="09"
            icon="server-outline"
            title="Disponibilidade da plataforma"
          >
            <Paragraph>
              Procuramos manter o SLOTIX disponível e
              funcional, mas podem ocorrer interrupções
              temporárias devido a manutenção, atualizações,
              problemas técnicos ou circunstâncias fora do
              nosso controlo.
            </Paragraph>
          </TermsSection>

          {/* 10 */}

          <TermsSection
            number="10"
            icon="document-attach-outline"
            title="Propriedade intelectual"
          >
            <Paragraph>
              A identidade visual, marca, interface, conteúdo,
              software e outros elementos próprios do SLOTIX
              estão protegidos pelas normas aplicáveis de
              propriedade intelectual.
            </Paragraph>

            <Paragraph>
              Não é permitido copiar, modificar, distribuir ou
              explorar esses elementos sem autorização adequada.
            </Paragraph>
          </TermsSection>

          {/* 11 */}

          <TermsSection
            number="11"
            icon="people-outline"
            title="Responsabilidades"
          >
            <Paragraph>
              O utilizador é responsável pela utilização que
              faz da plataforma e pelas informações que
              disponibiliza.
            </Paragraph>

            <Paragraph>
              O SLOTIX procura fornecer uma experiência segura
              e confiável, mas determinados serviços e
              interações dependem de terceiros e das condições
              específicas apresentadas na plataforma.
            </Paragraph>
          </TermsSection>

          {/* 12 */}

          <TermsSection
            number="12"
            icon="create-outline"
            title="Alterações aos termos"
          >
            <Paragraph>
              Podemos atualizar estes Termos e Condições
              periodicamente. Quando forem realizadas alterações
              relevantes, procuraremos disponibilizar
              informação adequada aos utilizadores.
            </Paragraph>

            <Paragraph>
              A continuação da utilização do SLOTIX após a
              entrada em vigor das alterações significa que o
              utilizador aceita os termos atualizados.
            </Paragraph>
          </TermsSection>

          {/* CONTACT */}

          <View style={styles.contactCard}>
            <View style={styles.contactIcon}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={22}
                color={COLORS.green}
              />
            </View>

            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>
                Tem alguma dúvida?
              </Text>

              <Text style={styles.contactDescription}>
                Se precisar de esclarecimentos sobre estes
                termos, entre em contacto com a equipa do
                SLOTIX.
              </Text>

              <Pressable
                onPress={() =>
                  router.push('/perfil/help')
                }
                style={({ pressed }) => [
                  styles.contactButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.contactButtonText}>
                  Centro de ajuda
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={COLORS.white}
                />
              </Pressable>
            </View>
          </View>

          {/* LEGAL NOTICE */}

          <View style={styles.legalNotice}>
            <Ionicons
              name="information-circle-outline"
              size={17}
              color={COLORS.muted}
            />

            <Text style={styles.legalNoticeText}>
              Este conteúdo é uma versão informativa da
              estrutura de Termos e Condições do SLOTIX. A
              versão jurídica definitiva deverá ser revista e
              aprovada antes do lançamento público da
              plataforma.
            </Text>
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
              Termos e condições · v1.0.0
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
    fontSize: 18,
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
    paddingBottom: 50,
  },

  heroCard: {
    padding: 18,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusBadge: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: COLORS.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
    marginRight: 6,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.green,
  },

  heroTitle: {
    marginTop: 17,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.4,
  },

  heroDescription: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 18,
    color: COLORS.secondary,
  },

  updatedRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  updatedText: {
    marginLeft: 6,
    fontSize: 9,
    color: COLORS.muted,
  },

  introductionCard: {
    marginTop: 15,
    padding: 15,
    borderRadius: 20,
    backgroundColor: COLORS.blueSoft,
    borderWidth: 1,
    borderColor: '#DCE7FF',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  introductionIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  introductionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.secondary,
  },

  section: {
    marginTop: 27,
    padding: 16,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#F3F3F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeaderContent: {
    flex: 1,
    marginLeft: 11,
  },

  sectionNumber: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.blue,
    letterSpacing: 1,
  },

  sectionTitle: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
  },

  sectionBody: {
    marginTop: 13,
  },

  paragraph: {
    marginBottom: 10,
    fontSize: 10,
    lineHeight: 17,
    color: COLORS.secondary,
  },

  subheading: {
    marginTop: 2,
    marginBottom: 9,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.text,
  },

  bulletRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  bullet: {
    width: 5,
    height: 5,
    marginTop: 6,
    borderRadius: 3,
    backgroundColor: COLORS.blue,
  },

  bulletText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.secondary,
  },

  infoBox: {
    marginTop: 3,
    padding: 11,
    borderRadius: 14,
    backgroundColor: COLORS.orangeSoft,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  infoBoxText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 9,
    lineHeight: 15,
    color: COLORS.orange,
  },

  linkButton: {
    minHeight: 43,
    marginTop: 3,
    paddingHorizontal: 12,
    borderRadius: 13,
    backgroundColor: COLORS.blueSoft,
    flexDirection: 'row',
    alignItems: 'center',
  },

  linkButtonText: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.blue,
  },

  contactCard: {
    marginTop: 27,
    padding: 16,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
  },

  contactIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contactContent: {
    flex: 1,
    marginLeft: 12,
  },

  contactTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.text,
  },

  contactDescription: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.secondary,
  },

  contactButton: {
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

  contactButtonText: {
    marginRight: 7,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },

  legalNotice: {
    marginTop: 20,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  legalNoticeText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 8,
    lineHeight: 13,
    color: COLORS.muted,
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

  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});