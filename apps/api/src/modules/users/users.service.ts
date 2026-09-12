import bcrypt from "bcryptjs";
import type { UserDTO } from "@slotix/types";
import { AuthenticationError, NotFoundError } from "../../shared/errors";
import { usersRepository } from "./users.repository";
import type { ChangePasswordInput, UpdateProfileInput } from "./users.schema";

function toUserDTO(user: { id: string; email: string; name: string; phone: string | null; role: UserDTO["role"]; createdAt: Date }): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

export const usersService = {
  async getProfile(userId: string): Promise<UserDTO> {
    const user = await usersRepository.findById(userId);
    if (!user) throw new NotFoundError("Utilizador não encontrado.");
    return toUserDTO(user);
  },

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserDTO> {
    const user = await usersRepository.update(userId, input);
    return toUserDTO(user);
  },

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await usersRepository.findById(userId);
    if (!user) throw new NotFoundError("Utilizador não encontrado.");

    const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!valid) throw new AuthenticationError("Password atual incorreta.");

    const passwordHash = await bcrypt.hash(input.newPassword, 10);
    await usersRepository.updatePasswordHash(userId, passwordHash);
  },
};
