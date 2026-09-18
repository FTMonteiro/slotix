import type {
  BusinessDTO,
  BusinessHoursEntryDTO,
  BusinessListQuery,
  GalleryImageDTO,
  ProfessionalDTO,
  ReviewDTO,
  ServiceDTO,
} from "@slotix/types";
import { apiFetch, apiFetchList, buildQuery } from "./api-client";

export async function listBusinesses(query: BusinessListQuery = {}): Promise<{ data: BusinessDTO[]; meta: { page: number; limit: number; total: number } }> {
  return apiFetchList<BusinessDTO>(`/businesses${buildQuery(query)}`);
}

export async function getBusiness(id: string): Promise<BusinessDTO> {
  return apiFetch<BusinessDTO>(`/businesses/${id}`);
}

export async function getBusinessHours(id: string): Promise<BusinessHoursEntryDTO[]> {
  return apiFetch<BusinessHoursEntryDTO[]>(`/businesses/${id}/hours`);
}

export async function getBusinessServices(id: string): Promise<ServiceDTO[]> {
  return apiFetch<ServiceDTO[]>(`/businesses/${id}/services`);
}

export async function getBusinessProfessionals(id: string): Promise<ProfessionalDTO[]> {
  return apiFetch<ProfessionalDTO[]>(`/businesses/${id}/professionals`);
}

export async function getBusinessReviews(id: string): Promise<ReviewDTO[]> {
  return apiFetch<ReviewDTO[]>(`/businesses/${id}/reviews`);
}

export async function getBusinessGallery(id: string): Promise<GalleryImageDTO[]> {
  return apiFetch<GalleryImageDTO[]>(`/businesses/${id}/gallery`);
}
