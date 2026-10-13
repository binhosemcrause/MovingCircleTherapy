import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import { ApiError } from '../../api/client';
import {
  ApiTherapist,
  ApiTherapistAccount,
  createTherapist,
  createTherapistAccount,
  listTherapists,
} from '../../api/therapists';

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.details?.length ? error.details.map((detail) => detail.issue).join('\n') : error.message;
  }
  return 'Could not reach the server. Please check your connection and try again.';
}

const emptyNewTherapist = { fullName: '', title: '', email: '' };

// Admin-only part of the profile: the therapists, who has a login, and the
// forms to add a therapist or give one a login.
const TeamSection = () => {
  const [therapists, setTherapists] = useState<ApiTherapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // The therapist whose "create login" form is open.
  const [loginFormId, setLoginFormId] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTherapist, setNewTherapist] = useState(emptyNewTherapist);
  // The temporary password is only returned once, so it stays on screen
  // until the admin leaves the profile.
  const [created, setCreated] = useState<{ name: string; account: ApiTherapistAccount } | null>(null);

  const fetchTherapists = useCallback(async () => {
    setError(null);
    try {
      setTherapists(await listTherapists());
    } catch (err) {
      setError(describeError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTherapists();
  }, [fetchTherapists]);

  const closeForms = () => {
    setLoginFormId(null);
    setLoginEmail('');
    setIsAdding(false);
    setNewTherapist(emptyNewTherapist);
    setError(null);
  };

  const submit = async (action: () => Promise<{ name: string; account: ApiTherapistAccount }>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      setCreated(await action());
      closeForms();
    } catch (err) {
      setError(describeError(err));
    } finally {
      setIsSubmitting(false);
      // Also after a failure: adding a therapist may have saved the
      // therapist before the login step failed.
      fetchTherapists();
    }
  };

  const handleCreateLogin = (therapist: ApiTherapist) => {
    if (!loginEmail.trim()) {
      setError('Please enter their email.');
      return;
    }
    submit(async () => ({
      name: therapist.firstName,
      account: await createTherapistAccount(therapist.id, loginEmail.trim()),
    }));
  };

  const handleAddTherapist = () => {
    const [firstName, ...rest] = newTherapist.fullName.trim().split(/\s+/);
    if (!firstName || rest.length === 0 || !newTherapist.title.trim() || !newTherapist.email.trim()) {
      setError('Please enter their first and last name, title and email.');
      return;
    }
    submit(async () => {
      const therapist = await createTherapist({
        firstName,
        lastName: rest.join(' '),
        title: newTherapist.title.trim(),
      });
      return { name: firstName, account: await createTherapistAccount(therapist.id, newTherapist.email.trim()) };
    });
  };

  const renderError = () => (error ? <Text style={styles.error}>{error}</Text> : null);

  const renderTherapist = (therapist: ApiTherapist) => (
    <View key={therapist.id} style={styles.card}>
      <Text style={styles.name}>
        {therapist.firstName} {therapist.lastName}
      </Text>
      <Text style={styles.detail}>{therapist.title}</Text>
      {therapist.hasAccount ? (
        <Text style={styles.detail}>Has a login</Text>
      ) : loginFormId === therapist.id ? (
        <View style={styles.form}>
          <FormField
            label="Email"
            icon="mail-outline"
            value={loginEmail}
            onChangeText={setLoginEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {renderError()}
          <Button label="Create login" onPress={() => handleCreateLogin(therapist)} loading={isSubmitting} />
          <Button label="Cancel" variant="link" onPress={closeForms} disabled={isSubmitting} />
        </View>
      ) : (
        <Button
          label="Create login"
          variant="link"
          onPress={() => {
            closeForms();
            setLoginFormId(therapist.id);
          }}
          style={styles.inlineLink}
        />
      )}
    </View>
  );

  const renderCreated = () => {
    if (!created) {
      return null;
    }
    const { name, account } = created;
    return (
      <View style={styles.notice} accessibilityRole="alert" accessibilityLiveRegion="polite">
        <Text style={styles.name}>Login ready for {name}</Text>
        <Text style={styles.detail}>{account.email}</Text>
        {account.temporaryPassword ? (
          <>
            <Text style={styles.detail}>Temporary password:</Text>
            <Text style={styles.password} selectable>
              {account.temporaryPassword}
            </Text>
            <Text style={styles.detail}>Share it with them now. It won't be shown again.</Text>
          </>
        ) : (
          <Text style={styles.detail}>This email already had an account, so they log in with their own password.</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Team
      </Text>

      {renderCreated()}

      {isLoading ? (
        <ActivityIndicator color={colors.primaryDark} accessibilityLabel="Loading team" />
      ) : (
        <View style={styles.list}>
          {therapists.map(renderTherapist)}
          {!loginFormId && !isAdding && renderError()}

          {isAdding ? (
            <View style={styles.card}>
              <Text style={styles.name}>New therapist</Text>
              <Text style={styles.detail}>
                They can be booked once their working hours have been set up.
              </Text>
              <View style={styles.form}>
                <FormField
                  label="Full name"
                  icon="person-outline"
                  value={newTherapist.fullName}
                  onChangeText={(fullName) => setNewTherapist({ ...newTherapist, fullName })}
                  placeholder="Jane Doe"
                  autoCapitalize="words"
                />
                <FormField
                  label="Title"
                  icon="briefcase-outline"
                  value={newTherapist.title}
                  onChangeText={(title) => setNewTherapist({ ...newTherapist, title })}
                  placeholder="Creative Arts Therapist"
                />
                <FormField
                  label="Email"
                  icon="mail-outline"
                  value={newTherapist.email}
                  onChangeText={(email) => setNewTherapist({ ...newTherapist, email })}
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {renderError()}
                <Button label="Add therapist" onPress={handleAddTherapist} loading={isSubmitting} />
                <Button label="Cancel" variant="link" onPress={closeForms} disabled={isSubmitting} />
              </View>
            </View>
          ) : (
            <Button
              label="Add a therapist"
              variant="secondary"
              onPress={() => {
                closeForms();
                setIsAdding(true);
              }}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.itemTitle,
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.dominant2,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.xs,
  },
  notice: {
    backgroundColor: colors.secondary1,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.itemTitle,
    fontSize: 18,
    lineHeight: 23,
    color: colors.charcoal,
  },
  detail: {
    ...typography.label,
    color: colors.charcoal,
  },
  password: {
    ...typography.itemTitle,
    color: colors.charcoal,
  },
  form: {
    marginTop: spacing.sm,
  },
  inlineLink: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
  },
  error: {
    ...typography.label,
    color: colors.accentDark,
    marginBottom: spacing.sm,
  },
});

export default TeamSection;
