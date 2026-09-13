import { randomUUID } from "node:crypto";
import { GALLERY_BUCKET, getStorageClient } from "../../config/storage";

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function uploadGalleryImage(businessId: string, file: { buffer: Buffer; mimetype: string }): Promise<{ url: string; path: string }> {
  const client = getStorageClient();
  const extension = EXTENSION_BY_MIME_TYPE[file.mimetype] ?? "bin";
  const path = `businesses/${businessId}/${randomUUID()}.${extension}`;

  const { error } = await client.storage.from(GALLERY_BUCKET).upload(path, file.buffer, { contentType: file.mimetype });
  if (error) {
    throw new Error(`Falha ao enviar imagem para o storage: ${error.message}`);
  }

  const { data } = client.storage.from(GALLERY_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deleteGalleryImage(path: string): Promise<void> {
  const client = getStorageClient();
  const { error } = await client.storage.from(GALLERY_BUCKET).remove([path]);
  if (error) {
    throw new Error(`Falha ao apagar imagem do storage: ${error.message}`);
  }
}
