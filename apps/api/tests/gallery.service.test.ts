import { beforeEach, describe, expect, it, vi } from "vitest";

const businessMock = { id: "biz-1", ownerId: "owner-1" };

const getBusinessOrThrow = vi.fn(async () => businessMock);
const assertBusinessOwner = vi.fn();

const create = vi.fn();
const findByBusiness = vi.fn(async () => []);
const findById = vi.fn();
const countByBusiness = vi.fn(async () => 0);
const deleteImage = vi.fn();

const uploadGalleryImage = vi.fn(async () => ({ url: "https://storage.example/img.jpg", path: "businesses/biz-1/img.jpg" }));
const deleteGalleryImage = vi.fn(async () => undefined);

vi.mock("../src/modules/businesses", () => ({
  getBusinessOrThrow: (...args: unknown[]) => getBusinessOrThrow(...args),
  assertBusinessOwner: (...args: unknown[]) => assertBusinessOwner(...args),
}));

vi.mock("../src/modules/gallery/gallery.repository", () => ({
  galleryRepository: {
    create: (...args: unknown[]) => create(...args),
    findByBusiness: (...args: unknown[]) => findByBusiness(...args),
    findById: (...args: unknown[]) => findById(...args),
    countByBusiness: (...args: unknown[]) => countByBusiness(...args),
    delete: (...args: unknown[]) => deleteImage(...args),
  },
}));

vi.mock("../src/modules/gallery/gallery.storage", () => ({
  uploadGalleryImage: (...args: unknown[]) => uploadGalleryImage(...args),
  deleteGalleryImage: (...args: unknown[]) => deleteGalleryImage(...args),
}));

const { galleryService } = await import("../src/modules/gallery/gallery.service");

function makeImageRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "img-1",
    businessId: "biz-1",
    url: "https://storage.example/img.jpg",
    path: "businesses/biz-1/img.jpg",
    position: 0,
    caption: null,
    createdAt: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  getBusinessOrThrow.mockResolvedValue(businessMock);
  assertBusinessOwner.mockImplementation(() => {});
  countByBusiness.mockResolvedValue(0);
});

describe("galleryService.upload", () => {
  it("faz upload de uma imagem válida do dono do negócio", async () => {
    create.mockResolvedValue(makeImageRecord());

    const result = await galleryService.upload("biz-1", "owner-1", { buffer: Buffer.from(""), mimetype: "image/jpeg" });

    expect(result.url).toBe("https://storage.example/img.jpg");
    expect(uploadGalleryImage).toHaveBeenCalledWith("biz-1", expect.objectContaining({ mimetype: "image/jpeg" }));
  });

  it("rejeita quem não é o dono do negócio", async () => {
    assertBusinessOwner.mockImplementation(() => {
      throw Object.assign(new Error("forbidden"), { code: "AUTHORIZATION_ERROR" });
    });

    await expect(
      galleryService.upload("biz-1", "someone-else", { buffer: Buffer.from(""), mimetype: "image/jpeg" }),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_ERROR" });
  });

  it("rejeita um tipo de ficheiro não suportado", async () => {
    await expect(
      galleryService.upload("biz-1", "owner-1", { buffer: Buffer.from(""), mimetype: "application/pdf" }),
    ).rejects.toMatchObject({ code: "GALLERY_INVALID_FILE_TYPE" });

    expect(uploadGalleryImage).not.toHaveBeenCalled();
  });

  it("rejeita quando o negócio já atingiu o limite de imagens", async () => {
    countByBusiness.mockResolvedValue(20);

    await expect(
      galleryService.upload("biz-1", "owner-1", { buffer: Buffer.from(""), mimetype: "image/jpeg" }),
    ).rejects.toMatchObject({ code: "GALLERY_LIMIT_REACHED" });
  });
});

describe("galleryService.remove", () => {
  it("apaga a linha da BD mesmo que o storage falhe (best-effort)", async () => {
    findById.mockResolvedValue(makeImageRecord());
    deleteGalleryImage.mockRejectedValue(new Error("network error"));

    await expect(galleryService.remove("img-1", "owner-1")).resolves.toBeUndefined();
    expect(deleteImage).toHaveBeenCalledWith("img-1");
  });

  it("rejeita remover a imagem de outro negócio", async () => {
    findById.mockResolvedValue(makeImageRecord());
    assertBusinessOwner.mockImplementation(() => {
      throw Object.assign(new Error("forbidden"), { code: "AUTHORIZATION_ERROR" });
    });

    await expect(galleryService.remove("img-1", "someone-else")).rejects.toMatchObject({ code: "AUTHORIZATION_ERROR" });
    expect(deleteImage).not.toHaveBeenCalled();
  });

  it("rejeita quando a imagem não existe", async () => {
    findById.mockResolvedValue(null);

    await expect(galleryService.remove("does-not-exist", "owner-1")).rejects.toMatchObject({ code: "GALLERY_IMAGE_NOT_FOUND" });
  });
});
