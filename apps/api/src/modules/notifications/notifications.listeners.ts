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

  domainEvents.onEvent("PaymentPaid", (payment) => {
    void notificationsService.notify(payment.userId, "PAYMENT_PAID", "Pagamento confirmado", "O seu pagamento foi confirmado.");
  });

  domainEvents.onEvent("PaymentRefunded", (payment) => {
    void notificationsService.notify(payment.userId, "PAYMENT_REFUNDED", "Pagamento reembolsado", "O seu pagamento foi reembolsado.");
  });
}
