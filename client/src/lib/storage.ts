/**
 * Client-side storage helper for uploading files to S3
 * Uses tRPC procedure to get presigned URL and upload
 */

export async function storagePut(
  fileKey: string,
  data: Uint8Array | ArrayBuffer | File,
  contentType: string
): Promise<{ url: string; key: string }> {
  // For now, we'll use a simple approach: convert to base64 and send to server
  // In production, you'd want to use presigned URLs for direct S3 upload
  
  // Convert to base64
  let buffer: Uint8Array;
  if (data instanceof File) {
    const arrayBuffer = await data.arrayBuffer();
    buffer = new Uint8Array(arrayBuffer);
  } else if (data instanceof Uint8Array) {
    buffer = data;
  } else {
    buffer = new Uint8Array(data);
  }
  const base64 = btoa(String.fromCharCode(...buffer));
  
  // Call backend to upload
  const response = await fetch('/api/trpc/system.uploadFile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileKey,
      data: base64,
      contentType,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload file');
  }
  
  const result = await response.json();
  return result;
}
