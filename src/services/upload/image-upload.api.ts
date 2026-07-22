import { axiosClient } from '@/services/http/axios-client'

type ImageUploadContext = 'branch-qr' | 'courts'

type UploadResponse = {
  data?: { url: string }
  message: string
}

export async function uploadImage(file: File, context: ImageUploadContext) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axiosClient.post<UploadResponse>('/uploads/images', formData, {
    params: { context },
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  if (!response.data.data?.url) {
    throw new Error(response.data.message || 'Không nhận được đường dẫn ảnh sau khi tải lên.')
  }
  return response.data.data.url
}
