import React, {useState} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {colors, typography, spacing} from '../theme';
import {
  Card,
  Chip,
  Button,
  RSVPBar,
  SectionHeader,
  Avatar,
  ListRow,
  ScoreBoard,
  MatchEventRow,
  ReporterActions,
  ReporterModal,
  SimulatedPush,
} from '../components';
import {
  events,
  eventAttendees,
  users,
  currentUser,
  canReport,
  liveMatchEvents,
  team,
} from '../shared/mockData';
import type {
  HomeStackParamList,
  RSVPStatus,
  User,
  MatchEventType,
} from '../shared/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'EventDetail'>;

const dayNamesLong = [
  'Søndag',
  'Mandag',
  'Tirsdag',
  'Onsdag',
  'Torsdag',
  'Fredag',
  'Lørdag',
];
const monthNamesLong = [
  'januar',
  'februar',
  'mars',
  'april',
  'mai',
  'juni',
  'juli',
  'august',
  'september',
  'oktober',
  'november',
  'desember',
];

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatDateLong(date: Date): string {
  const day = dayNamesLong[date.getDay()];
  const dateNum = date.getDate();
  const month = monthNamesLong[date.getMonth()];
  return `${day} ${dateNum}. ${month}`;
}

export function EventDetailScreen({route}: Props) {
  const insets = useSafeAreaInsets();
  const {eventId} = route.params;
  const event = events.find(e => e.id === eventId) ?? events[0];
  const [myStatus, setMyStatus] = useState<RSVPStatus>(event.rsvp.myStatus);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reporterModalVisible, setReporterModalVisible] = useState(false);
  const [selectedEventType, setSelectedEventType] =
    useState<MatchEventType>('mål');
  const [pushNotification, setPushNotification] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const isLiveMatch =
    event.type === 'kamp' &&
    (event.matchStatus === 'live' || event.matchStatus === 'halfTime');
  const isReporter = canReport(currentUser.id);

  // Oppmøteliste
  const attendees = eventAttendees[eventId as keyof typeof eventAttendees] ?? {
    coming: users.slice(0, event.rsvp.coming),
    notComing: users.slice(
      event.rsvp.coming,
      event.rsvp.coming + event.rsvp.notComing,
    ),
    pending: users.slice(
      event.rsvp.coming + event.rsvp.notComing,
      event.rsvp.coming + event.rsvp.notComing + event.rsvp.pending,
    ),
  };

  // Beregn oppdatert RSVP
  const rsvp = {
    ...event.rsvp,
    myStatus,
    coming:
      myStatus === 'kommer' ? event.rsvp.coming + 1 : event.rsvp.coming,
    pending:
      myStatus !== 'venter'
        ? Math.max(0, event.rsvp.pending - 1)
        : event.rsvp.pending,
    notComing:
      myStatus === 'kan_ikke'
        ? event.rsvp.notComing + 1
        : event.rsvp.notComing,
  };

  const handleReporterAction = (type: MatchEventType) => {
    setSelectedEventType(type);
    setReporterModalVisible(true);
  };

  const handleReportSubmit = (player: string, description: string) => {
    setReporterModalVisible(false);

    const eventLabels: Record<MatchEventType, string> = {
      avspark: 'Avspark',
      mål: 'MÅL!',
      pause: 'Pause',
      andre_omgang: 'Andre omgang',
      slutt: 'Kampen er ferdig',
      bytte: 'Bytte',
      kort: 'Kort',
      melding: 'Melding fra kampen',
    };

    setPushNotification({
      visible: true,
      title: `${team.name} · ${eventLabels[selectedEventType]}`,
      message: description || `${player} — ${event.title}`,
    });
  };

  // -----------------------------------------------------------------------
  // LIVE KAMP-MODUS
  // -----------------------------------------------------------------------
  if (isLiveMatch && event.score && event.opponent) {
    const matchEvents = event.matchEvents ?? liveMatchEvents;

    return (
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={{
            paddingBottom: insets.bottom + spacing['3xl'],
          }}>
          {/* Scoreboard */}
          <View style={styles.section}>
            <ScoreBoard
              homeTeam={team.name}
              awayTeam={event.opponent}
              homeScore={event.score.home}
              awayScore={event.score.away}
              matchStatus={event.matchStatus!}
              minute={55}
            />
          </View>

          {/* Kampvarsler for tilskuere */}
          {!isReporter && (
            <View style={styles.section}>
              <Card>
                <View style={styles.notificationRow}>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationTitle}>Kampvarsler</Text>
                    <Text style={styles.notificationDesc}>
                      Få varsel ved mål, pause og slutt
                    </Text>
                  </View>
                  <Button
                    title={notificationsEnabled ? 'På' : 'Slå på'}
                    variant={notificationsEnabled ? 'primary' : 'secondary'}
                    size="md"
                    onPress={() => {
                      setNotificationsEnabled(!notificationsEnabled);
                      if (!notificationsEnabled) {
                        setPushNotification({
                          visible: true,
                          title: 'Kampvarsler aktivert',
                          message:
                            'Du får varsler ved mål, pause og slutt i denne kampen.',
                        });
                      }
                    }}
                  />
                </View>
              </Card>
            </View>
          )}

          {/* Reporter-verktøy for trener */}
          {isReporter && (
            <View style={styles.section}>
              <ReporterActions onAction={handleReporterAction} />
            </View>
          )}

          {/* Kampforløp */}
          <SectionHeader title="Kampforløp" />
          <View style={styles.timeline}>
            {matchEvents
              .slice()
              .reverse()
              .map((me, index) => (
                <MatchEventRow
                  key={me.id}
                  event={me}
                  isLatest={index === 0}
                />
              ))}
          </View>
        </ScrollView>

        {/* Simulert push-varsling */}
        <SimulatedPush
          title={pushNotification.title}
          message={pushNotification.message}
          visible={pushNotification.visible}
          onHide={() =>
            setPushNotification({visible: false, title: '', message: ''})
          }
        />

        {/* Reporter-modal */}
        <ReporterModal
          visible={reporterModalVisible}
          eventType={selectedEventType}
          onSubmit={handleReportSubmit}
          onCancel={() => setReporterModalVisible(false)}
        />
      </View>
    );
  }

  // -----------------------------------------------------------------------
  // VANLIG EVENT-MODUS (trening, sosialt, kommende kamp)
  // -----------------------------------------------------------------------
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{paddingBottom: insets.bottom + spacing['3xl']}}>
      {/* Event-info */}
      <Card style={styles.infoCard}>
        <Chip type={event.type} />
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.metaList}>
          <MetaRow label="Dato" value={formatDateLong(event.startTime)} />
          <MetaRow
            label="Tid"
            value={`${formatTime(event.startTime)} – ${formatTime(event.endTime)}`}
          />
          <MetaRow label="Sted" value={event.location} />
        </View>
        {event.description && (
          <Text style={styles.description}>{event.description}</Text>
        )}
      </Card>

      {/* RSVP */}
      <View style={styles.rsvpSection}>
        <RSVPBar rsvp={rsvp} />
        <View style={styles.rsvpButtons}>
          <Button
            title={myStatus === 'kommer' ? 'Du kommer!' : 'Kommer'}
            variant={myStatus === 'kommer' ? 'primary' : 'secondary'}
            onPress={() => setMyStatus('kommer')}
            size="lg"
            style={styles.rsvpBtn}
          />
          <Button
            title="Kan ikke"
            variant={myStatus === 'kan_ikke' ? 'secondary' : 'ghost'}
            onPress={() => setMyStatus('kan_ikke')}
            size="lg"
            style={styles.rsvpBtn}
          />
        </View>
      </View>

      {/* Oppmøteliste */}
      <AttendanceSection
        title={`Kommer (${attendees.coming.length})`}
        users={attendees.coming}
        emptyText="Ingen har svart ennå"
      />
      {attendees.notComing.length > 0 && (
        <AttendanceSection
          title={`Kan ikke (${attendees.notComing.length})`}
          users={attendees.notComing}
        />
      )}
      {attendees.pending.length > 0 && (
        <AttendanceSection
          title={`Ikke svart (${attendees.pending.length})`}
          users={attendees.pending}
        />
      )}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Hjelpkomponenter
// ---------------------------------------------------------------------------
function MetaRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function AttendanceSection({
  title,
  users: attendeeList,
  emptyText,
}: {
  title: string;
  users: User[];
  emptyText?: string;
}) {
  return (
    <>
      <SectionHeader title={title} />
      {attendeeList.length === 0 && emptyText ? (
        <Text style={styles.emptyText}>{emptyText}</Text>
      ) : (
        attendeeList.map((user, index) => (
          <ListRow
            key={user.id}
            icon={<Avatar name={user.name} size="sm" />}
            title={user.name}
            subtitle={user.role === 'trener' ? 'Trener' : undefined}
            showBorder={index < attendeeList.length - 1}
          />
        ))
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Stiler
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  timeline: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  notificationInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  notificationTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  notificationDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  infoCard: {
    margin: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.heading2,
    marginTop: spacing.sm,
  },
  metaList: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaLabel: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    width: 48,
  },
  metaValue: {
    ...typography.body,
    flex: 1,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  rsvpSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  rsvpButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rsvpBtn: {
    flex: 1,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
