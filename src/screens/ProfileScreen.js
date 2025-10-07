import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, borderRadius } from '../utils/theme';
import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';

const ProfileScreen = () => {
  const user = auth.currentUser;
  const [userProfile, setUserProfile] = useState({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: '',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-03-15',
    emergencyContact: 'John Johnson',
    emergencyPhone: '+1 (555) 987-6543',
    insuranceProvider: 'Blue Cross Blue Shield',
    insuranceNumber: 'BCBS123456789',
  });

  useEffect(() => {
    if (user) {
      setUserProfile(prevProfile => ({ ...prevProfile, email: user.email }));
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            signOut(auth).catch((error) => {
              Alert.alert('Logout Error', error.message);
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color={colors.white} />
        </View>
        <Text style={styles.userName}>{userProfile.firstName} {userProfile.lastName}</Text>
        <Text style={styles.userEmail}>{userProfile.email}</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={colors.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{userProfile.firstName} {userProfile.lastName}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={colors.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userProfile.email}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={colors.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{userProfile.phone}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>{userProfile.dateOfBirth}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Emergency Contact</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={colors.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Contact Name</Text>
              <Text style={styles.infoValue}>{userProfile.emergencyContact}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={colors.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Contact Phone</Text>
              <Text style={styles.infoValue}>{userProfile.emergencyPhone}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Insurance Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="medical-outline" size={20} color={colors.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Provider</Text>
              <Text style={styles.infoValue}>{userProfile.insuranceProvider}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={20} color={colors.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Policy Number</Text>
              <Text style={styles.infoValue}>{userProfile.insuranceNumber}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={20} color={colors.secondary} />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.gray, true: colors.accent }}
              thumbColor={colors.white}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="mail-outline" size={20} color={colors.secondary} />
              <Text style={styles.settingLabel}>Email Notifications</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.gray, true: colors.accent }}
              thumbColor={colors.white}
            />
          </View>
        </View>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.white} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    backgroundColor: colors.secondary,
    padding: spacing.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: 24,
    fontFamily: fonts.josefinSans.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    color: colors.white,
    opacity: 0.9,
  },
  profileSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.josefinSans.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: fonts.garet.medium,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    color: colors.text,
  },
  settingsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    color: colors.text,
  },
  logoutButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  logoutButtonText: {
    fontSize: 18,
    fontFamily: fonts.garet.bold,
    color: colors.white,
  },
});

export default ProfileScreen;