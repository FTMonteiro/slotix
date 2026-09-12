import type { ClientDTO } from "@slotix/types";
import { NotFoundError } from "../../shared/errors";
import { assertBusinessOwner, getBusinessOrThrow } from "../businesses";
import { clientsRepository } from "./clients.repository";

// VIP/inactive thresholds aren't specified by the product yet; kept as simple, easy-to-tune
// placeholders rather than a config surface no one has asked for.
const VIP_VISIT_THRESHOLD = 5;
const INACTIVE_AFTER_DAYS = 90;

function deriveStatus(visits: number, lastVisit: Date | null): ClientDTO["status"] {
  if (!lastVisit) return "inactive";
  const daysSinceLastVisit = (Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceLastVisit > INACTIVE_AFTER_DAYS) return "inactive";
  if (visits >= VIP_VISIT_THRESHOLD) return "vip";
  return "active";
}

export const clientsService = {
  async listByBusiness(businessId: string, ownerId: string): Promise<ClientDTO[]> {
    const business = await getBusinessOrThrow(businessId);
    assertBusinessOwner(business, ownerId);

    const completedAppointments = await clientsRepository.findCompletedAppointmentsByBusiness(businessId);

    const byClient = new Map<string, { name: string; email: string; phone: string | null; visits: number; totalSpent: number; lastVisit: Date | null }>();

    for (const appointment of completedAppointments) {
      const entry = byClient.get(appointment.clientId) ?? {
        name: appointment.client.name,
        email: appointment.client.email,
        phone: appointment.client.phone,
        visits: 0,
        totalSpent: 0,
        lastVisit: null,
      };

      entry.visits += 1;
      entry.totalSpent += appointment.price.toNumber();
      if (!entry.lastVisit || appointment.scheduledAt > entry.lastVisit) {
        entry.lastVisit = appointment.scheduledAt;
      }

      byClient.set(appointment.clientId, entry);
    }

    return Array.from(byClient.entries()).map(([userId, entry]) => ({
      userId,
      name: entry.name,
      email: entry.email,
      phone: entry.phone,
      visits: entry.visits,
      totalSpent: entry.totalSpent,
      lastVisit: entry.lastVisit?.toISOString() ?? null,
      status: deriveStatus(entry.visits, entry.lastVisit),
    }));
  },

  async getByBusinessAndUser(businessId: string, ownerId: string, clientId: string): Promise<ClientDTO> {
    const business = await getBusinessOrThrow(businessId);
    assertBusinessOwner(business, ownerId);

    const appointments = await clientsRepository.findCompletedAppointmentsForClient(businessId, clientId);
    if (appointments.length === 0) {
      throw new NotFoundError("Este cliente ainda não tem histórico neste negócio.", "CLIENT_NOT_FOUND");
    }

    const visits = appointments.length;
    const totalSpent = appointments.reduce((sum, appointment) => sum + appointment.price.toNumber(), 0);
    const lastVisit = appointments[0].scheduledAt;
    const client = appointments[0].client;

    return {
      userId: clientId,
      name: client.name,
      email: client.email,
      phone: client.phone,
      visits,
      totalSpent,
      lastVisit: lastVisit.toISOString(),
      status: deriveStatus(visits, lastVisit),
    };
  },
};
