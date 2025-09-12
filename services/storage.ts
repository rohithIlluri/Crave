import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "@/lib/firebase"

export const uploadImage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path)
  const snapshot = await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(snapshot.ref)
  return downloadURL
}

export const uploadMultipleImages = async (files: File[], basePath: string): Promise<string[]> => {
  const uploadPromises = files.map((file, index) => {
    const fileName = `${Date.now()}_${index}_${file.name}`
    return uploadImage(file, `${basePath}/${fileName}`)
  })

  return Promise.all(uploadPromises)
}

export const deleteImage = async (imageUrl: string) => {
  const imageRef = ref(storage, imageUrl)
  await deleteObject(imageRef)
}
