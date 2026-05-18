import sharp from 'sharp'

export async function compressImage(
  buffer: Buffer,
  maxSizeKB: number = 500
): Promise<Buffer> {
  let quality = 80
  let compressed = await sharp(buffer)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer()

  while (compressed.length > maxSizeKB * 1024 && quality > 10) {
    quality -= 10
    compressed = await sharp(buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer()
  }

  return compressed
}
