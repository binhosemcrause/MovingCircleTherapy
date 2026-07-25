import type { Request, Response } from 'express';
import type { AppointmentStatus, SessionFormat } from '../../../shared/domain/enums';
import type { GetServiceUseCase } from '../../services/application/GetServiceUseCase';
import type { BookAppointmentUseCase } from '../application/BookAppointmentUseCase';
import type { CancelAppointmentUseCase } from '../application/CancelAppointmentUseCase';
import type { GetAppointmentUseCase } from '../application/GetAppointmentUseCase';
import type { ListAppointmentsUseCase } from '../application/ListAppointmentsUseCase';
import type { RescheduleAppointmentUseCase } from '../application/RescheduleAppointmentUseCase';
import { toAppointmentResponse, toAppointmentResponseList } from './appointmentMapper';

export class AppointmentsController {
  constructor(
    private readonly listAppointmentsUseCase: ListAppointmentsUseCase,
    private readonly getAppointmentUseCase: GetAppointmentUseCase,
    private readonly bookAppointmentUseCase: BookAppointmentUseCase,
    private readonly rescheduleAppointmentUseCase: RescheduleAppointmentUseCase,
    private readonly cancelAppointmentUseCase: CancelAppointmentUseCase,
    private readonly getServiceUseCase: GetServiceUseCase,
  ) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const { status } = req.query as { status?: AppointmentStatus };
    const appointments = await this.listAppointmentsUseCase.execute({ userId: req.userId!, status });
    res.status(200).json(await toAppointmentResponseList(appointments, this.getServiceUseCase));
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const { appointmentId } = req.params as { appointmentId: string };
    const appointment = await this.getAppointmentUseCase.execute({ id: appointmentId, userId: req.userId! });
    res.status(200).json(await toAppointmentResponse(appointment, this.getServiceUseCase));
  };

  book = async (req: Request, res: Response): Promise<void> => {
    const body = req.body as { serviceId: string; scheduledAt: string; format?: SessionFormat; notes?: string };
    const appointment = await this.bookAppointmentUseCase.execute({ ...body, userId: req.userId! });
    res.status(201).json(await toAppointmentResponse(appointment, this.getServiceUseCase));
  };

  reschedule = async (req: Request, res: Response): Promise<void> => {
    const { appointmentId } = req.params as { appointmentId: string };
    const body = req.body as { scheduledAt?: string; notes?: string };
    const appointment = await this.rescheduleAppointmentUseCase.execute({
      id: appointmentId,
      userId: req.userId!,
      ...body,
    });
    res.status(200).json(await toAppointmentResponse(appointment, this.getServiceUseCase));
  };

  cancel = async (req: Request, res: Response): Promise<void> => {
    const { appointmentId } = req.params as { appointmentId: string };
    await this.cancelAppointmentUseCase.execute({ id: appointmentId, userId: req.userId! });
    res.status(204).send();
  };
}
