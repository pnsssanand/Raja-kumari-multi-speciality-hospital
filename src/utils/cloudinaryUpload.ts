
interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'Raja Kumari Multi Speciality Hospital');
  formData.append('cloud_name', 'dlvjvskje');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dlvjvskje/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data: CloudinaryResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeInMB = 5;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPG, PNG, or WebP)',
    };
  }

  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `Image size should be less than ${maxSizeInMB}MB`,
    };
  }

  return { isValid: true };
};
