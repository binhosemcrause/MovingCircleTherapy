import React, { useState } from 'react';
import { ApiAppointment } from '../../api/appointments';
import { ApiService } from '../../api/services';
import SelectDateStep from './SelectDateStep';
import SelectTherapistStep from './SelectTherapistStep';
import BookingConfirmedStep from './BookingConfirmedStep';

interface Props {
  service: ApiService;
  // Leaves the flow without booking (back from the first step).
  onCancel: () => void;
  onReturnHome: () => void;
}

// Date & time -> therapist -> confirmation. Choosing the therapist is what
// places the booking, which also records the therapist's notification
// server-side.
const BookingFlow = ({ service, onCancel, onReturnHome }: Props) => {
  const [slotStart, setSlotStart] = useState<string | null>(null);
  // Therapists who work that day, take this service and are free at slotStart.
  const [therapistIds, setTherapistIds] = useState<string[]>([]);
  const [isChoosingTherapist, setIsChoosingTherapist] = useState(false);
  const [appointment, setAppointment] = useState<ApiAppointment | null>(null);

  if (appointment) {
    return <BookingConfirmedStep appointment={appointment} onReturnHome={onReturnHome} />;
  }

  if (isChoosingTherapist && slotStart) {
    return (
      <SelectTherapistStep
        service={service}
        slotStart={slotStart}
        therapistIds={therapistIds}
        onBack={() => setIsChoosingTherapist(false)}
        onBooked={setAppointment}
      />
    );
  }

  return (
    <SelectDateStep
      service={service}
      initialSlot={slotStart}
      onBack={onCancel}
      onContinue={(slot, availableTherapistIds) => {
        setSlotStart(slot);
        setTherapistIds(availableTherapistIds);
        setIsChoosingTherapist(true);
      }}
    />
  );
};

export default BookingFlow;
