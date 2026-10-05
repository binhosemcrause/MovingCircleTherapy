import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import { circleColors, circleTextColors, colors, fonts, spacing, borderRadius } from '../utils/theme';
import { RootTabParamList } from '../navigation/types';
import { ApiError, ApiUser, loginUser, registerUser } from '../api/auth';
import { setAccessToken, clearSession } from '../api/session';
import { ApiAppointment, listAppointments } from '../api/appointments';

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

const ProfileScreen = ({ navigation }: Props) => {
  // Neither state of this tab has a native header (headerShown: false in
  // App.tsx), so content has to clear the status bar / notch itself.
  const insets = useSafeAreaInsets();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // No separate "welcome" choice screen: landing on this tab while logged
  // out goes straight to the login form, matching the design. Registering
  // is reached via the "Sign Up" link below it.
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loginData, setLoginData] = useState<LoginData>(emptyLoginData);
  const [registerData, setRegisterData] = useState<RegisterData>(emptyRegisterData);
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

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

  useEffect(() => {
    if (isLoggedIn) {
      fetchAppointments();
    }
  }, [isLoggedIn, fetchAppointments]);

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginUser({ email: loginData.email, password: loginData.password });
      setAccessToken(result.accessToken);
      setApiUser(result.user);
      setIsLoggedIn(true);
      setShowRegisterForm(false);
      setLoginData(emptyLoginData);
    } catch (error) {
      Alert.alert('Sign In Failed', describeApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    const name = splitFullName(registerData.fullName);
    if (!name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      Alert.alert('Missing Information', 'Please enter your full name (first and last), email, and password.');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerUser({
        firstName: name.firstName,
        lastName: name.lastName,
        email: registerData.email,
        password: registerData.password,
      });
      setAccessToken(result.accessToken);
      setApiUser(result.user);
      setIsLoggedIn(true);
      setShowRegisterForm(false);
      setRegisterData(emptyRegisterData);
    } catch (error) {
      Alert.alert('Registration Failed', describeApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            clearSession();
            setIsLoggedIn(false);
            setApiUser(null);
            setAppointments([]);
            setShowRegisterForm(false);
            setLoginData(emptyLoginData);
            setRegisterData(emptyRegisterData);
          }
        },
      ]
    );
  };

  const renderLoginScreen = () => (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.loginScreen}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.loginTitleContainer, { paddingTop: insets.top + spacing.xl }]}>
          <Text style={styles.loginTitleLine}>moving circle</Text>
          <Text style={styles.loginTitleLineBold}>THERAPY</Text>
        </View>

        <View style={styles.loginFields}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={loginData.email}
              onChangeText={(text) => setLoginData({ ...loginData, email: text })}
              placeholder="abc@email.com"
              placeholderTextColor={colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.textInput}
              value={loginData.password}
              onChangeText={(text) => setLoginData({ ...loginData, password: text })}
              placeholder="Enter password"
              placeholderTextColor={colors.textLight}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            <Text style={styles.loginButtonText}>{isSubmitting ? 'Logging in…' : 'Login'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginSpacer} />

        <View style={styles.signUpRow}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => setShowRegisterForm(true)}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderRegisterScreen = () => (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.loginScreen}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.loginTitleContainer, { paddingTop: insets.top + spacing.xl }]}>
          <Text style={styles.loginTitleLine}>moving circle</Text>
          <Text style={styles.loginTitleLineBold}>THERAPY</Text>
        </View>

        <View style={styles.registerCard}>
          <Text style={styles.registerCardTitle}>Create Account</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.iconInputContainer}>
              <Ionicons name="person-outline" size={18} color={colors.textLight} />
              <TextInput
                style={styles.iconTextInput}
                value={registerData.fullName}
                onChangeText={(text) => setRegisterData({ ...registerData, fullName: text })}
                placeholder="Jane Doe"
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.iconInputContainer}>
              <Ionicons name="mail-outline" size={18} color={colors.textLight} />
              <TextInput
                style={styles.iconTextInput}
                value={registerData.email}
                onChangeText={(text) => setRegisterData({ ...registerData, email: text })}
                placeholder="jane@example.com"
                placeholderTextColor={colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.iconInputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textLight} />
              <TextInput
                style={styles.iconTextInput}
                value={registerData.password}
                onChangeText={(text) => setRegisterData({ ...registerData, password: text })}
                placeholder="••••••••"
                placeholderTextColor={colors.textLight}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={styles.iconInputContainer}>
              <Ionicons name="refresh-outline" size={18} color={colors.textLight} />
              <TextInput
                style={styles.iconTextInput}
                value={registerData.confirmPassword}
                onChangeText={(text) => setRegisterData({ ...registerData, confirmPassword: text })}
                placeholder="••••••••"
                placeholderTextColor={colors.textLight}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.signUpButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            <Text style={styles.signUpButtonText}>{isSubmitting ? 'Signing Up…' : 'Sign Up'}</Text>
            {!isSubmitting && <Ionicons name="arrow-forward" size={18} color={colors.text} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLinkRow} onPress={() => setShowRegisterForm(false)}>
            <Text style={styles.loginLinkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderUpcomingSessions = () => {
    if (isLoadingAppointments) {
      return (
        <View style={styles.sessionStateContainer}>
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }

    if (appointmentsError) {
      return (
        <View style={styles.sessionStateContainer}>
          <Text style={styles.sessionStateText}>{appointmentsError}</Text>
          <TouchableOpacity onPress={fetchAppointments}>
            <Text style={styles.sessionRetryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const now = Date.now();
    const upcoming = appointments
      .filter((a) => a.status !== 'cancelled' && new Date(a.scheduledAt).getTime() >= now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    const next = upcoming[0];

    if (!next) {
      return (
        <View style={styles.sessionStateContainer}>
          <Text style={styles.sessionStateText}>No upcoming sessions.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Services')}>
            <Text style={styles.sessionRetryText}>Book a session</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const { month, day } = formatSessionDate(next.scheduledAt);
    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionDateBadge}>
          <Text style={styles.sessionDateMonth}>{month}</Text>
          <Text style={styles.sessionDateDay}>{day}</Text>
        </View>
        <View style={styles.sessionDetails}>
          <Text style={styles.sessionTitle}>{next.service.name}</Text>
          <View style={styles.sessionTimeRow}>
            <Ionicons name="time-outline" size={14} color={colors.textLight} />
            <Text style={styles.sessionTime}>
              {formatSessionTimeRange(next.scheduledAt, next.service.durationMinutes.max)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderUserProfile = () => (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top + spacing.xl, paddingBottom: spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.brandTitleContainer}>
        <Text style={styles.loginTitleLine}>moving circle</Text>
        <Text style={styles.loginTitleLineBold}>THERAPY</Text>
      </View>

      <View style={styles.avatarWrapper}>
        <LinearGradient
          colors={[colors.accent, circleColors.yellow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarRing}
        >
          <View style={styles.avatarInner}>
            {apiUser?.avatarUrl ? (
              <Image source={{ uri: apiUser.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={48} color={colors.secondary} />
            )}
          </View>
        </LinearGradient>
        <TouchableOpacity
          style={styles.avatarEditBadge}
          onPress={() => Alert.alert('Coming soon', 'Photo upload is not available yet.')}
        >
          <Ionicons name="pencil" size={14} color={colors.white} />
        </TouchableOpacity>
      </View>

      <Text style={styles.userName}>{apiUser?.firstName} {apiUser?.lastName}</Text>
      {!!apiUser?.tagline && <Text style={styles.userTagline}>{apiUser.tagline}</Text>}

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>EMAIL</Text>
            <Text style={styles.infoValue}>{apiUser?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PHONE</Text>
            <Text style={styles.infoValue}>{apiUser?.phone ?? 'Not provided'}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>LOCATION</Text>
            <Text style={styles.infoValue}>{apiUser?.location ?? 'Not provided'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
        {renderUpcomingSessions()}
      </View>

      <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color={circleTextColors.orange} />
        <Text style={styles.logoutRowText}>Logout</Text>
      </TouchableOpacity>
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
    backgroundColor: colors.primary,
  },
  loginScreen: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  loginTitleContainer: {
    marginBottom: spacing.xxl * 2,
  },
  loginTitleLine: {
    fontSize: 28,
    fontFamily: fonts.josefinSans.regular,
    color: colors.accent,
  },
  loginTitleLineBold: {
    fontSize: 28,
    fontFamily: fonts.josefinSans.bold,
    color: colors.accent,
  },
  loginFields: {
    width: '100%',
  },
  loginButton: {
    backgroundColor: colors.text,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  loginButtonText: {
    fontSize: 18,
    fontFamily: fonts.garet.bold,
    color: colors.white,
  },
  loginSpacer: {
    flex: 1,
    minHeight: spacing.xxl,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  signUpText: {
    fontSize: 15,
    fontFamily: fonts.arimo.regular,
    color: colors.text,
  },
  signUpLink: {
    fontSize: 15,
    fontFamily: fonts.garet.bold,
    color: circleTextColors.orange,
    textDecorationLine: 'underline',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: fonts.garet.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    backgroundColor: colors.white,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  registerCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xs,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  registerCardTitle: {
    fontSize: 22,
    fontFamily: fonts.josefinSans.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  iconInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.lightGray,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
  },
  iconTextInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    color: colors.text,
  },
  signUpButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.round,
    marginTop: spacing.md,
  },
  signUpButtonText: {
    fontSize: 18,
    fontFamily: fonts.garet.bold,
    color: colors.text,
  },
  loginLinkRow: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginLinkText: {
    fontSize: 14,
    fontFamily: fonts.arimo.regular,
    color: colors.text,
  },
  brandTitleContainer: {
    paddingHorizontal: spacing.xl,
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
    backgroundColor: colors.lightGray,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: circleTextColors.orange,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 30,
    fontFamily: fonts.josefinSans.bold,
    color: colors.text,
    textAlign: 'center',
  },
  userTagline: {
    fontSize: 15,
    fontFamily: fonts.arimo.regular,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  profileSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.josefinSans.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  infoRowLast: {
    marginBottom: 0,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: fonts.garet.medium,
    color: colors.textLight,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: fonts.arimo.regular,
    color: colors.text,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  sessionDateBadge: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  sessionDateMonth: {
    fontSize: 11,
    fontFamily: fonts.garet.bold,
    color: circleTextColors.orange,
    letterSpacing: 0.5,
  },
  sessionDateDay: {
    fontSize: 20,
    fontFamily: fonts.josefinSans.bold,
    color: colors.text,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontFamily: fonts.josefinSans.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sessionTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sessionTime: {
    fontSize: 13,
    fontFamily: fonts.arimo.regular,
    color: colors.textLight,
  },
  sessionStateContainer: {
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  sessionStateText: {
    fontSize: 14,
    fontFamily: fonts.arimo.regular,
    color: colors.textLight,
    textAlign: 'center',
  },
  sessionRetryText: {
    fontSize: 14,
    fontFamily: fonts.garet.bold,
    color: circleTextColors.orange,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xxl,
  },
  logoutRowText: {
    fontSize: 15,
    fontFamily: fonts.garet.bold,
    color: circleTextColors.orange,
  },
});

export default ProfileScreen;
