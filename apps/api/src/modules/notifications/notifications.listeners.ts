import { domainEvents } from "../../shared/events/domainEvents";
import { notificationsService } from "./notifications.service";

export function registerNotificationListeners(): void {
  domainEvents.onEvent("AppointmentCreated", (appointment) => {
    void notificationsService.notify(
      appointment.clientId,
      "APPOINTMENT_CREATED",
      "Agendamento criado",
      "O seu agendamento foi criado e está pendente de confirmação.",
    );
  });

  domainEvents.onEvent("AppointmentCancelled", (appointment) => {
    void notificationsService.notify(
      appointment.clientId,
      "APPOINTMENT_CANCELLED",
      "Agendamento cancelado",
      "O seu agendamento foi cancelado.",
    );
  });
}
