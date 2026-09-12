import { domainEvents } from "../../shared/events/domainEvents";

/**
 * There's no Notification model/persistence yet (that's future work for this module).
 * Wiring the listeners now proves the event bus works end-to-end for `appointments`
 * and gives a single place to plug in real delivery (push/email) later.
 */
export function registerNotificationListeners(): void {
  domainEvents.onEvent("AppointmentCreated", (appointment) => {
    console.log(`[notifications] agendamento ${appointment.id} criado para o cliente ${appointment.clientId}`);
  });

  domainEvents.onEvent("AppointmentCancelled", (appointment) => {
    console.log(`[notifications] agendamento ${appointment.id} cancelado`);
  });
}
