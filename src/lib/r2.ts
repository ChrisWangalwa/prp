export async function uploadToR2(
  file: File,
  fileName: string
): Promise<{ url: string }> {
  // Placeholder for R2 upload logic (to be implemented in submission flow)
  console.log(`Uploading ${fileName} to R2 bucket prp-evidence`);
  return { url: `https://r2.cloudflaredomain.com/${fileName}` };
}
