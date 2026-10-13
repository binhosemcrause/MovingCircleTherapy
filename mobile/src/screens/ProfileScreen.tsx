import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, tones, typography, spacing, borderRadius } from '../utils/theme';
import Button from '../components/Button';
import FormField from '../components/FormField';
import TeamSection from './profile/TeamSection';
import { RootTabParamList } from '../navigation/types';
import { ApiError, ApiUser, loginUser, registerUser } from '../api/auth';
import { setAccessToken, clearSession } from '../api/session';
import { formatSessionDateTime } from './booking/format';
import {
  ApiAppointment,
  ApiAssignedAppointment,
  cancelAppointment,
  listAppointments,
  listAssignedAppointments,
} from '../api/appointments';
import { listNotifications, markNotificationsRead } from '../api/notifications';

type Props = BottomTabScreenProps<RootTabParamList, 'Profile'>;

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const emptyLoginData: LoginData = { email: '', password: '' };

const emptyRegisterData: RegisterData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

// The API models first/last name separately; the design collects one Full
// Name field, so this splits "Jane Doe" -> firstName "Jane", lastName "Doe"
// (everything after the first word) right before submitting.
function splitFullName(fullName: string): { firstName: string; lastName: string } | null {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) {
    return null;
  }
  return { firstName: parts[0]!, lastName: parts.slice(1).join(' ') };
}

function formatSessionDate(iso: string): { month: string; day: string } {
  const date = new Date(iso);
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: String(date.getDate()),
  };
}

function formatSessionTimeRange(iso: string, durationMinutes: number): string {
  const start = new Date(iso);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const format = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${format(start)} - ${format(end)}`;
}

function describeApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.details?.length) {
      return error.details.map((detail) => detail.issue).join('\n');
    }
    return error.message;
  }
  return 'Could not reach the server. Please check your connection and try again.';
}

const SESSIONS_POLL_MS = 20000;

const ProfileScreen = ({ navigation }: Props) => {
  // Neither state of this tab has a native header (headerShown: false in
  // App.tsx), so content has to clear the status bar / notch itself.
  const insets = useSafeAreaInsets();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // No separate "welcome" choice screen: landing on this tab while logged
  // out goes straight to the login form, matching the design. Registering
  // is reached via the "Sign up" link below it.
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loginData, setLoginData] = useState<LoginData>(emptyLoginData);
  const [registerData, setRegisterData] = useState<RegisterData>(emptyRegisterData);
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Shown inline above the submit button, so the message stays visible
  // next to the fields it refers to instead of in a dismissed alert.
  const [formError, setFormError] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setIsLoadingAppointments(true);
    setAppointmentsError(null);
    try {
      const data = await listAppointments();
      setAppointments(data);
    } catch (err) {
      setAppointmentsError(describeApiError(err));
    } finally {
      setIsLoadingAppointments(false);
    }
  }, []);

  // Therapists see the sessions clients booked with them instead of their
  // own bookings.
  const isTherapist = !!apiUser?.therapistId;
  const [assigned, setAssigned] = useState<ApiAssignedAppointment[]>([]);
  const [assignedError, setAssignedError] = useState<string | null>(null);
  // Sessions the therapist hasn't seen yet, from their unread notifications.
  const [newAppointmentIds, setNewAppointmentIds] = useState<string[]>([]);

  const fetchTherapistSessions = useCallback(async () => {
    setAssignedError(null);
    try {
      const [sessions, notifications] = await Promise.all([listAssignedAppointments(), listNotifications()]);
      setAssigned(sessions);
      const unread = notifications.filter((notification) => !notification.read);
      setNewAppointmentIds(unread.flatMap((notification) => notification.appointment?.id ?? []));
      // What was just fetched keeps its "New" tag on screen; the next visit
      // shows it as seen.
      if (unread.length > 0) {
        markNotificationsRead().catch(() => undefined);
      }
    } catch (err) {
      setAssignedError(describeApiError(err));
    }
  }, []);

  useEffect(() => {
    if (!isTherapist) {
      return;
    }
    fetchTherapistSessions();
    // A client can book at any moment, so besides refetching when the tab
    // regains focus, keep the list fresh while the therapist is looking at it.
    const poll = setInterval(() => {
      if (navigation.isFocused()) {
        fetchTherapistSessions();
      }
    }, SESSIONS_POLL_MS);
    const unsubscribe = navigation.addListener('focus', fetchTherapistSessions);
    return () => {
      clearInterval(poll);
      unsubscribe();
    };
  }, [isTherapist, fetchTherapistSessions, navigation]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await (isTherapist ? fetchTherapistSessions() : fetchAppointments());
    setIsRefreshing(false);
  };

  // Refetch whenever the tab regains focus too, so a session booked from
  // the Services tab shows up without logging out and in again.
  useEffect(() => {
    if (!isLoggedIn || isTherapist) {
      return;
    }
    fetchAppointments();
    return navigation.addListener('focus', fetchAppointments);
  }, [isLoggedIn, isTherapist, fetchAppointments, navigation]);

  const updateLogin = (patch: Partial<LoginData>) => {
    setLoginData({ ...loginData, ...patch });
    setFormError(null);
  };

  const updateRegister = (patch: Partial<RegisterData>) => {
    setRegisterData({ ...registerData, ...patch });
    setFormError(null);
  };

  const switchForm = (toRegister: boolean) => {
    setShowRegisterForm(toRegister);
    setFormError(null);
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const result = await loginUser({ email: loginData.email.trim(), password: loginData.password });
      setAccessToken(result.accessToken);
      setApiUser(result.user);
      setIsLoggedIn(true);
      setShowRegisterForm(false);
      setLoginData(emptyLoginData);
    } catch (error) {
      setFormError(describeApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    const name = splitFullName(registerData.fullName);
    if (!name) {
      setFormError('Please enter your first and last name.');
      return;
    }
    if (!registerData.email || !registerData.password || !registerData.confirmPassword) {
      setFormError('Please enter your email and password.');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const result = await registerUser({
        firstName: name.firstName,
        lastName: name.lastName,
        email: registerData.email.trim(),
        password: registerData.password,
      });
      setAccessToken(result.accessToken);
      setApiUser(result.user);
      setIsLoggedIn(true);
      setShowRegisterForm(false);
      setRegisterData(emptyRegisterData);
    } catch (error) {
      setFormError(describeApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSession = (session: ApiAppointment) => {
    const confirmCancel = async () => {
      setCancellingId(session.id);
      setCancelError(null);
      try {
        await cancelAppointment(session.id);
        setAppointments((current) => current.filter((appointment) => appointment.id !== session.id));
      } catch (err) {
        setCancelError(describeApiError(err));
      } finally {
        setCancellingId(null);
      }
    };

    Alert.alert(
      'Cancel session',
      `Cancel ${session.service.name} on ${formatSessionDateTime(session.scheduledAt)}? Your time will be released for someone else.`,
      [
        { text: 'Keep session', style: 'cancel' },
        { text: 'Cancel session', style: 'destructive', onPress: confirmCancel },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => {
            clearSession();
            setIsLoggedIn(false);
            setApiUser(null);
            setAppointments([]);
            setAssigned([]);
            setNewAppointmentIds([]);
            setShowRegisterForm(false);
            setLoginData(emptyLoginData);
            setRegisterData(emptyRegisterData);
          }
        },
      ]
    );
  };

  const renderBrandTitle = () => (
    <View>
      <Text style={styles.brandTitleLine}>moving circle</Text>
      <Text style={styles.brandTitleLine}>THERAPY</Text>
    </View>
  );

  const renderFormError = () =>
    formError ? (
      <View style={styles.formError} accessibilityRole="alert" accessibilityLiveRegion="polite">
        <Ionicons name="alert-circle" size={20} color={colors.accentDark} />
        <Text style={styles.formErrorText}>{formError}</Text>
      </View>
    ) : null;

  const renderAuthScreen = (content: React.ReactNode) => (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        // Login and sign-up share this layout, so without a key React would
        // carry each field's state (e.g. a hidden password) over to whichever
        // field sits in the same position on the other form.
        key={showRegisterForm ? 'register' : 'login'}
        contentContainerStyle={[styles.authScreen, { paddingTop: insets.top + spacing.xl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderBrandTitle()}
        {content}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderLoginScreen = () =>
    renderAuthScreen(
      <>
        <Text style={styles.authTitle} accessibilityRole="header">
          Welcome back
        </Text>
        <Text style={styles.authSubtitle}>Log in to see your sessions and profile.</Text>

        <FormField
          label="Email"
          icon="mail-outline"
          value={loginData.email}
          onChangeText={(text) => updateLogin({ email: text })}
          placeholder="abc@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="username"
          returnKeyType="next"
        />
        <FormField
          label="Password"
          icon="lock-closed-outline"
          secure
          value={loginData.password}
          onChangeText={(text) => updateLogin({ password: text })}
          placeholder="Enter password"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />

        {renderFormError()}

        <Button label="Log in" onPress={handleLogin} loading={isSubmitting} style={styles.submitButton} />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Don't have an account?</Text>
          <Button label="Sign up" variant="link" onPress={() => switchForm(true)} />
        </View>
      </>,
    );

  const renderRegisterScreen = () =>
    renderAuthScreen(
      <>
        <Text style={styles.authTitle} accessibilityRole="header">
          Create account
        </Text>
        <Text style={styles.authSubtitle}>It takes less than a minute.</Text>

        <FormField
          label="Full name"
          icon="person-outline"
          value={registerData.fullName}
          onChangeText={(text) => updateRegister({ fullName: text })}
          placeholder="Jane Doe"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
        />
        <FormField
          label="Email"
          icon="mail-outline"
          value={registerData.email}
          onChangeText={(text) => updateRegister({ email: text })}
          placeholder="jane@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="username"
          returnKeyType="next"
        />
        <FormField
          label="Password"
          icon="lock-closed-outline"
          secure
          value={registerData.password}
          onChangeText={(text) => updateRegister({ password: text })}
          placeholder="Create a password"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
        />
        <FormField
          label="Confirm password"
          icon="lock-closed-outline"
          secure
          value={registerData.confirmPassword}
          onChangeText={(text) => updateRegister({ confirmPassword: text })}
          placeholder="Repeat your password"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleRegister}
        />

        {renderFormError()}

        <Button label="Sign up" onPress={handleRegister} loading={isSubmitting} style={styles.submitButton} />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Already have an account?</Text>
          <Button label="Log in" variant="link" onPress={() => switchForm(false)} />
        </View>
      </>,
    );

  const renderUpcomingSessions = () => {
    if (isLoadingAppointments) {
      return (
        <View style={styles.sessionStateContainer} accessibilityLabel="Loading sessions">
          <ActivityIndicator color={colors.primaryDark} />
        </View>
      );
    }

    if (appointmentsError) {
      return (
        <View style={styles.sessionStateContainer}>
          <Text style={styles.sessionStateText}>{appointmentsError}</Text>
          <Button label="Try again" variant="link" onPress={fetchAppointments} />
        </View>
      );
    }

    const now = Date.now();
    const upcoming = appointments
      .filter((a) => a.status !== 'cancelled' && new Date(a.scheduledAt).getTime() >= now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    if (upcoming.length === 0) {
      return (
        <View style={styles.sessionStateContainer}>
          <Text style={styles.sessionStateText}>No upcoming sessions.</Text>
          <Button label="Book a session" variant="link" onPress={() => navigation.navigate('Services')} />
        </View>
      );
    }

    return (
      <View style={styles.requestList}>
        {cancelError && (
          <View style={styles.formError} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Ionicons name="alert-circle" size={20} color={colors.accentDark} />
            <Text style={styles.formErrorText}>{cancelError}</Text>
          </View>
        )}
        {upcoming.map((session) => {
          const { month, day } = formatSessionDate(session.scheduledAt);
          return (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionDateBadge}>
                <Text style={styles.sessionDateMonth}>{month}</Text>
                <Text style={styles.sessionDateDay}>{day}</Text>
              </View>
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionTitle}>{session.service.name}</Text>
                {session.therapist && (
                  <Text style={styles.sessionTherapist}>
                    with {session.therapist.firstName} {session.therapist.lastName}
                  </Text>
                )}
                <View style={styles.sessionTimeRow}>
                  <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.sessionTime}>
                    {formatSessionTimeRange(session.scheduledAt, session.service.durationMinutes.max)}
                  </Text>
                </View>
                <Button
                  label="Cancel session"
                  variant="link"
                  loading={cancellingId === session.id}
                  disabled={cancellingId !== null}
                  onPress={() => handleCancelSession(session)}
                  style={styles.cancelButton}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderTherapistSessions = () => {
    if (assignedError) {
      return (
        <View style={styles.sessionStateContainer}>
          <Text style={styles.sessionStateText}>{assignedError}</Text>
          <Button label="Try again" variant="link" onPress={fetchTherapistSessions} />
        </View>
      );
    }

    const now = Date.now();
    const upcoming = assigned.filter((a) => a.status !== 'cancelled' && new Date(a.scheduledAt).getTime() >= now);
    if (upcoming.length === 0) {
      return (
        <View style={styles.sessionStateContainer}>
          <Text style={styles.sessionStateText}>No sessions booked with you yet.</Text>
        </View>
      );
    }

    return (
      <View style={styles.requestList}>
        {upcoming.map((session) => {
          const { month, day } = formatSessionDate(session.scheduledAt);
          return (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionDateBadge}>
                <Text style={styles.sessionDateMonth}>{month}</Text>
                <Text style={styles.sessionDateDay}>{day}</Text>
              </View>
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionTitle}>{session.clientName}</Text>
                <Text style={styles.sessionTherapist}>{session.service.name}</Text>
                <View style={styles.sessionTimeRow}>
                  <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.sessionTime}>
                    {formatSessionTimeRange(session.scheduledAt, session.service.durationMinutes.max)}
                  </Text>
                </View>
              </View>
              {newAppointmentIds.includes(session.id) && (
                <View style={styles.newTag}>
                  <Text style={styles.newTagText}>NEW</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderInfoRow = (label: string, value: string | null | undefined, isLast = false) => (
    <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, !value && styles.infoValueEmpty]}>{value ?? 'Not provided'}</Text>
    </View>
  );

  const renderUserProfile = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.xl, paddingBottom: spacing.xl }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primaryDark} />
      }
    >
      <View style={styles.brandTitleContainer}>{renderBrandTitle()}</View>

      <View style={styles.avatarWrapper}>
        <LinearGradient
          colors={[colors.primary1, colors.secondary1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarRing}
        >
          <View style={styles.avatarInner}>
            {apiUser?.avatarUrl ? (
              <Image source={{ uri: apiUser.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={48} color={colors.primary1} />
            )}
          </View>
        </LinearGradient>
        <TouchableOpacity
          style={styles.avatarEditBadge}
          hitSlop={8}
          onPress={() => Alert.alert('Coming soon', 'Photo upload is not available yet.')}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
        >
          <Ionicons name="pencil" size={16} color={colors.white} />
        </TouchableOpacity>
      </View>

      <Text style={styles.userName} accessibilityRole="header">
        {apiUser?.firstName} {apiUser?.lastName}
      </Text>
      {!!apiUser?.tagline && <Text style={styles.userTagline}>{apiUser.tagline}</Text>}

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Personal information
        </Text>

        <View style={styles.infoCard}>
          {renderInfoRow('EMAIL', apiUser?.email)}
          {renderInfoRow('PHONE', apiUser?.phone)}
          {renderInfoRow('LOCATION', apiUser?.location, true)}
        </View>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {isTherapist ? 'Your sessions' : 'Upcoming sessions'}
        </Text>
        {isTherapist ? renderTherapistSessions() : renderUpcomingSessions()}
      </View>

      {apiUser?.role === 'admin' && <TeamSection />}

      <Button label="Log out" variant="secondary" onPress={handleLogout} style={styles.logoutButton} />
    </ScrollView>
  );

  if (!isLoggedIn) {
    return showRegisterForm ? renderRegisterScreen() : renderLoginScreen();
  }

  return renderUserProfile();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dominant1,
  },
  authScreen: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  brandTitleLine: {
    ...typography.itemTitle,
    color: colors.accentDark,
  },
  authTitle: {
    ...typography.h1,
    color: colors.charcoal,
    marginTop: spacing.xl,
  },
  authSubtitle: {
    ...typography.paragraph,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  formError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.dominant2,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  formErrorText: {
    ...typography.label,
    flex: 1,
    color: colors.accentDark,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  switchText: {
    ...typography.paragraph,
    fontSize: 15,
    lineHeight: 20,
    color: colors.charcoal,
  },
  brandTitleContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  avatarRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: colors.dominant2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryDark,
    borderWidth: 2,
    borderColor: colors.dominant1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    ...typography.h2,
    color: colors.charcoal,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  userTagline: {
    ...typography.paragraph,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  profileSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.itemTitle,
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.dominant2,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  // Label above value, so long emails wrap instead of colliding with the
  // label on narrow screens.
  infoRow: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  infoRowLast: {
    marginBottom: 0,
  },
  infoLabel: {
    ...typography.label,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  infoValue: {
    ...typography.paragraph,
    color: colors.charcoal,
  },
  infoValueEmpty: {
    color: colors.textMuted,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dominant2,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  sessionDateBadge: {
    minWidth: 56,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  sessionDateMonth: {
    ...typography.label,
    fontSize: 12,
    lineHeight: 16,
    color: colors.accentDark,
    letterSpacing: 0.5,
  },
  sessionDateDay: {
    ...typography.itemTitle,
    color: colors.charcoal,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionTitle: {
    ...typography.itemTitle,
    fontSize: 18,
    lineHeight: 23,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  sessionTherapist: {
    ...typography.label,
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  sessionTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sessionTime: {
    ...typography.label,
    color: colors.textMuted,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
    marginTop: spacing.xs,
  },
  requestList: {
    gap: spacing.sm,
  },
  newTag: {
    alignSelf: 'flex-start',
    backgroundColor: tones.accent.background,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  newTagText: {
    ...typography.label,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    color: tones.accent.text,
  },
  sessionStateContainer: {
    backgroundColor: colors.dominant2,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  sessionStateText: {
    ...typography.paragraph,
    color: colors.textMuted,
    textAlign: 'center',
  },
  logoutButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
});

export default ProfileScreen;
