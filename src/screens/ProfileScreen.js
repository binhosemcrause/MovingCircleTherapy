import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, borderRadius } from '../utils/theme';

const ProfileScreen = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [userProfile, setUserProfile] = useState({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-03-15',
    emergencyContact: 'John Johnson',
    emergencyPhone: '+1 (555) 987-6543',
    insuranceProvider: 'Blue Cross Blue Shield',
    insuranceNumber: 'BCBS123456789',
  });

  const handleLogin = () => {
    if (!loginData.email || !loginData.password) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }
    
    // Simulate login
    setIsLoggedIn(true);
    setShowLoginForm(false);
    setShowRegisterForm(false);
    Alert.alert('Success', 'Welcome back!');
  };

  const handleRegister = () => {
    if (!registerData.firstName || !registerData.lastName || !registerData.email || 
        !registerData.password || !registerData.confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    
    // Simulate registration
    setIsLoggedIn(true);
    setShowLoginForm(false);
    setShowRegisterForm(false);
    Alert.alert('Success', 'Account created successfully!');
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
            setIsLoggedIn(false);
            setLoginData({ email: '', password: '' });
            setRegisterData({
              firstName: '', lastName: '', email: '', password: '',
              confirmPassword: '', phone: ''
            });
          }
        },
      ]
    );
  };

  const renderLoginForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Sign In</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.textInput}
          value={loginData.email}
          onChangeText={(text) => setLoginData({...loginData, email: text})}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          style={styles.textInput}
          value={loginData.password}
          onChangeText={(text) => setLoginData({...loginData, password: text})}
          placeholder="Enter your password"
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
        <Text style={styles.submitButtonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.linkButton}
        onPress={() => {
          setShowLoginForm(false);
          setShowRegisterForm(true);
        }}
      >
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRegisterForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Create Account</Text>
      
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
          <Text style={styles.inputLabel}>First Name *</Text>
          <TextInput
            style={styles.textInput}
            value={registerData.firstName}
            onChangeText={(text) => setRegisterData({...registerData, firstName: text})}
            placeholder="First name"
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
          <Text style={styles.inputLabel}>Last Name *</Text>
          <TextInput
            style={styles.textInput}
            value={registerData.lastName}
            onChangeText={(text) => setRegisterData({...registerData, lastName: text})}
            placeholder="Last name"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address *</Text>
        <TextInput
          style={styles.textInput}
          value={registerData.email}
          onChangeText={(text) => setRegisterData({...registerData, email: text})}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.textInput}
          value={registerData.phone}
          onChangeText={(text) => setRegisterData({...registerData, phone: text})}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password *</Text>
        <TextInput
          style={styles.textInput}
          value={registerData.password}
          onChangeText={(text) => setRegisterData({...registerData, password: text})}
          placeholder="Create a password"
          secureTextEntry
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Confirm Password *</Text>
        <TextInput
          style={styles.textInput}
          value={registerData.confirmPassword}
          onChangeText={(text) => setRegisterData({...registerData, confirmPassword: text})}
          placeholder="Confirm your password"
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
        <Text style={styles.submitButtonText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.linkButton}
        onPress={() => {
          setShowRegisterForm(false);
          setShowLoginForm(true);
        }}
      >
        <Text style={styles.linkText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );

  const renderUserProfile = () => (
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

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>
            Sign in to access your account and manage your appointments
          </Text>
        </View>

        {!showLoginForm && !showRegisterForm ? (
          <View style={styles.welcomeContainer}>
            <Ionicons name="person-circle-outline" size={80} color={colors.secondary} />
            <Text style={styles.welcomeTitle}>Welcome to Moving Circle Therapy</Text>
            <Text style={styles.welcomeSubtitle}>
              Create an account or sign in to access your profile, book appointments, and manage your therapy journey.
            </Text>
            
            <View style={styles.authButtons}>
              <TouchableOpacity 
                style={styles.authButton}
                onPress={() => setShowLoginForm(true)}
              >
                <Text style={styles.authButtonText}>Sign In</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.authButton, styles.registerButton]}
                onPress={() => setShowRegisterForm(true)}
              >
                <Text style={[styles.authButtonText, { color: colors.accent }]}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : showLoginForm ? (
          renderLoginForm()
        ) : (
          renderRegisterForm()
        )}
      </View>
    );
  }

  return renderUserProfile();
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
  headerTitle: {
    fontSize: 28,
    fontFamily: fonts.josefinSans.bold,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 22,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: fonts.josefinSans.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  authButtons: {
    width: '100%',
    gap: spacing.md,
  },
  authButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  authButtonText: {
    fontSize: 18,
    fontFamily: fonts.garet.bold,
    color: colors.white,
  },
  formContainer: {
    padding: spacing.lg,
  },
  formTitle: {
    fontSize: 22,
    fontFamily: fonts.josefinSans.bold,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
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
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: fonts.garet.bold,
    color: colors.white,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  linkText: {
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    color: colors.accent,
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