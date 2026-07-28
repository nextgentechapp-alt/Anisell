/**
 * Cloudinary services for handling file/document uploads.
 * Variables are prefixed with 'CLOUNDNARY' as per .env.example typo to ensure compatibility.
 */

const CLOUD_NAME = import.meta.env.CLOUNDNARY_API_CLOUD_NAME;
const API_KEY = import.meta.env.CLOUNDNARY_API;
const API_SECRET = import.meta.env.CLOUNDNARY_API_SECRET;
const DEFAULT_PRESET = import.meta.env.CLOUDINARY_UPLOAD_PRESET;

/**
 * Generates a SHA-1 signature for Cloudinary signed uploads using Web Crypto API.
 */
async function generateSignature(params: Record<string, string>, secret: string): Promise<string> {
  // 1. Sort parameters alphabetically
  const sortedKeys = Object.keys(params).sort();
  
  // 2. Create the string to sign: key1=val1&key2=val2...<api_secret>
  const signatureString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&') + secret;

  // 3. Hash the string using SHA-1
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureString);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  
  // 4. Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Uploads a file to Cloudinary using a SIGNED request.
 * Required for presets where 'Mode' is set to 'Signed'.
 * 
 * @param file The File object to upload
 * @param uploadPreset The upload preset name
 * @returns The secure URL of the uploaded resource
 */
export const uploadToCloudinary = async (file: File, uploadPreset: string = DEFAULT_PRESET) => {
  if (!API_KEY || !API_SECRET) {
    throw new Error("Cloudinary API Key or Secret is missing in environment variables.");
  }

  const timestamp = Math.round(new Date().getTime() / 1000).toString();
  
  // Only parameters used for the upload need to be signed
  const paramsToSign = {
    timestamp,
    upload_preset: uploadPreset,
  };

  try {
    const signature = await generateSignature(paramsToSign, API_SECRET);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", API_KEY);
    formData.append("timestamp", timestamp);
    formData.append("upload_preset", uploadPreset);
    formData.append("signature", signature);
    formData.append("cloud_name", CLOUD_NAME);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary Error Response:", errorData);
      throw new Error(errorData.error?.message || "Cloudinary upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error details:", error);
    throw error;
  }
};
