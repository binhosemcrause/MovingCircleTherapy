// Tells the therapist about a booking through the channels outside the
// database (email). The in-app notification row is written with the booking.
export interface IBookingNotifier {
  appointmentBooked(appointmentId: string): Promise<void>;
}
