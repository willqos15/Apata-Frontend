import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'

const PETS_FOLDER = 'pets_apata'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  ...(process.env.CLOUDINARY_UPLOAD_PREFIX ? { upload_prefix: process.env.CLOUDINARY_UPLOAD_PREFIX } : {}),
})

export async function uploadPetPhoto(file: File): Promise<UploadApiResponse> {
  const buffer = Buffer.from(await file.arrayBuffer())

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({ folder: PETS_FOLDER }, (error, result) => {
      if (error) reject(error)
      else if (result) resolve(result)
      else reject(new Error('Upload sem resposta'))
    })
    uploadStream.end(buffer)
  })
}

export function destroyPhoto(publicId: string): Promise<unknown> {
  return cloudinary.uploader.destroy(publicId)
}
