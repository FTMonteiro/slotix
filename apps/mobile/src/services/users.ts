import type { UpdateProfileRequest, UserDTO } from "@slotix/types";
import { apiFetch } from "./api-client";

export async function getMe(): Promise<UserDTO> {
  return apiFetch<UserDTO>("/users/me");
}

export async function updateMe(input: UpdateProfileRequest): Promise<UserDTO> {
  return apiFetch<UserDTO>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
