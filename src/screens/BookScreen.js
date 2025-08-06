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

const BookScreen = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    notes: '',
  });

  const existingAppointments = [
    {
      id: 1,
      service: 'Individual Therapy',
      date: '2024-01-15',
      time: '10:00 AM',
      therapist: 'Dr. Sarah Johnson',
      status: 'confirmed',
    },
    {
      id: 2,
      service: 'Couples Therapy',
      date: '2024-01-22',
      time: '2:00 PM',
      therapist: 'Dr. Michael Chen',
      status: 'pending',
    },
  ];

  const services = [
    'Individual Therapy',
    'Couples Therapy',
    'Family Therapy',
    'Group Therapy',
    'Anxiety & Depression',
    'Trauma Therapy',
    'Child & Adolescent',
    'Substance Abuse',
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  ];

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.service || !formData.date || !formData.time) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    Alert.alert(
      'Appointment Requested',
      'Your appointment request has been submitted. We will contact you within 24 hours to confirm.',
      [{ text: 'OK', onPress: () => setFormData({
        name: '', email: '', phone: '', service: '', date: '', time: '', notes: ''
      })}]
    );
  };

  const renderAppointmentCard = (appointment) => (
    <View key={appointment.id} style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentService}>{appointment.service}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: appointment.status === 'confirmed' ? colors.accent : colors.secondary }
        ]}>
          <Text style={styles.statusText}>
            {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
          </Text>
        </View>
      </View>
      
      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.secondary} />
          <Text style={styles.detailText}>{appointment.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={colors.secondary} />
          <Text style={styles.detailText}>{appointment.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={16} color={colors.secondary} />
          <Text style={styles.detailText}>{appointment.therapist}</Text>
        </View>
      </View>
      
      <View style={styles.appointmentActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="call-outline" size={16} color={colors.accent} />
          <Text style={styles.actionButtonText}>Reschedule</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
          <Ionicons name="close-outline" size={16} color={colors.text} />
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBookingForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Book Your Appointment</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.name}
          onChangeText={(text) => setFormData({...formData, name: text})}
          placeholder="Enter your full name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
          placeholder="Enter your email"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.textInput}
          value={formData.phone}
          onChangeText={(text) => setFormData({...formData, phone: text})}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Service *</Text>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerText}>
            {formData.service || 'Select a service'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.secondary} />
        </View>
        <View style={styles.optionsContainer}>
          {services.map((service) => (
            <TouchableOpacity
              key={service}
              style={[
                styles.optionItem,
                formData.service === service && styles.selectedOption
              ]}
              onPress={() => setFormData({...formData, service})}
            >
              <Text style={[
                styles.optionText,
                formData.service === service && styles.selectedOptionText
              ]}>
                {service}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
          <Text style={styles.inputLabel}>Preferred Date *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.date}
            onChangeText={(text) => setFormData({...formData, date: text})}
            placeholder="MM/DD/YYYY"
          />
        </View>
        
        <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing.sm }]}>
          <Text style={styles.inputLabel}>Preferred Time *</Text>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerText}>
              {formData.time || 'Select time'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.secondary} />
          </View>
          <View style={styles.optionsContainer}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.optionItem,
                  formData.time === time && styles.selectedOption
                ]}
                onPress={() => setFormData({...formData, time})}
              >
                <Text style={[
                  styles.optionText,
                  formData.time === time && styles.selectedOptionText
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Additional Notes</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={formData.notes}
          onChangeText={(text) => setFormData({...formData, notes: text})}
          placeholder="Any specific concerns or preferences..."
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Request Appointment</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <Text style={styles.headerSubtitle}>
          Schedule your therapy session with our experienced professionals
        </Text>
      </View>

      {isLoggedIn && (
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Show existing appointments</Text>
          <Switch
            value={!showForm}
            onValueChange={(value) => setShowForm(!value)}
            trackColor={{ false: colors.gray, true: colors.accent }}
            thumbColor={colors.white}
          />
        </View>
      )}

      {!isLoggedIn ? (
        <View style={styles.loginPrompt}>
          <Ionicons name="person-circle-outline" size={64} color={colors.secondary} />
          <Text style={styles.loginTitle}>Sign in to book appointments</Text>
          <Text style={styles.loginSubtitle}>
            Create an account or sign in to schedule your therapy sessions and manage your appointments.
          </Text>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Sign In / Register</Text>
          </TouchableOpacity>
        </View>
      ) : showForm ? (
        renderBookingForm()
      ) : (
        <View style={styles.appointmentsContainer}>
          <Text style={styles.sectionTitle}>Your Appointments</Text>
          {existingAppointments.map(renderAppointmentCard)}
        </View>
      )}
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
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
  },
  toggleLabel: {
    fontSize: 16,
    fontFamily: fonts.garet.medium,
    color: colors.text,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loginTitle: {
    fontSize: 24,
    fontFamily: fonts.josefinSans.bold,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  loginButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  loginButtonText: {
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  pickerText: {
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    color: colors.text,
  },
  optionsContainer: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
  },
  optionItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  selectedOption: {
    backgroundColor: colors.accent,
  },
  optionText: {
    fontSize: 16,
    fontFamily: fonts.arimo.regular,
    color: colors.text,
  },
  selectedOptionText: {
    color: colors.white,
    fontFamily: fonts.garet.bold,
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
  appointmentsContainer: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: fonts.josefinSans.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appointmentService: {
    fontSize: 18,
    fontFamily: fonts.josefinSans.bold,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fonts.garet.bold,
    color: colors.white,
  },
  appointmentDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  detailText: {
    fontSize: 14,
    fontFamily: fonts.arimo.regular,
    color: colors.text,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    gap: spacing.xs,
  },
  cancelButton: {
    borderColor: colors.gray,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: fonts.garet.medium,
    color: colors.accent,
  },
});

export default BookScreen; 