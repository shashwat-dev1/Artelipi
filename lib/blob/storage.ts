import { put, del } from '@vercel/blob';

/**
 * Upload image to Vercel Blob Storage
 * @param file - The image file to upload
 * @param postId - The post ID for organizing files
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToBlob(file: File, postId: string): Promise<string> {
    try {
        // Create a unique filename
        const timestamp = Date.now();
        const filename = `posts/${postId}/${timestamp}-${file.name}`;

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
            addRandomSuffix: false,
        });

        return blob.url;
    } catch (error: any) {
        console.error('Error uploading to Vercel Blob:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
}

/**
 * Delete image from Vercel Blob Storage
 * @param url - The URL of the image to delete
 */
export async function deleteImageFromBlob(url: string): Promise<void> {
    try {
        await del(url);
    } catch (error: any) {
        console.error('Error deleting from Vercel Blob:', error);
        // Don't throw - deletion failures shouldn't block other operations
    }
}
