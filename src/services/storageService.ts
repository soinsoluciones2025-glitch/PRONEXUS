import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads an image file to Firebase Storage.
 * @param file The image file to upload.
 * @param path The path in storage where the file will be saved (e.g., 'user-avatars').
 * @returns A promise that resolves with the public download URL of the uploaded image.
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
    try {
        const fileRef = ref(storage, `${path}/${Date.now()}-${file.name}`);
        
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        console.log('File successfully uploaded. URL:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading image to Firebase Storage:", error);
        throw new Error("Failed to upload image.");
    }
};