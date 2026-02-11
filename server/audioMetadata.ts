/**
 * Audio Metadata Extraction Utility
 * Extracts technical metadata from audio files (duration, bitrate, sample rate, etc.)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface AudioMetadata {
  duration: number; // Duration in seconds
  bitrate: number; // Bitrate in kbps
  sampleRate: number; // Sample rate in Hz
  channels: number; // Number of audio channels (1=mono, 2=stereo)
  format: string; // Audio format (mp3, wav, flac, etc.)
  fileSize: number; // File size in bytes
}

/**
 * Extract metadata from audio file buffer using ffprobe
 * Requires ffmpeg/ffprobe to be installed in the system
 */
export async function extractAudioMetadata(
  fileBuffer: Buffer,
  originalFilename: string
): Promise<AudioMetadata> {
  // Create temporary file
  const tempDir = '/tmp';
  const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${originalFilename}`);
  
  try {
    // Write buffer to temporary file
    await writeFile(tempFilePath, fileBuffer);
    
    // Use ffprobe to extract metadata
    const { stdout } = await execAsync(
      `ffprobe -v quiet -print_format json -show_format -show_streams "${tempFilePath}"`
    );
    
    const probeData = JSON.parse(stdout);
    const audioStream = probeData.streams.find((s: any) => s.codec_type === 'audio');
    
    if (!audioStream) {
      throw new Error('No audio stream found in file');
    }
    
    // Extract metadata
    const metadata: AudioMetadata = {
      duration: Math.round(parseFloat(probeData.format.duration || '0')),
      bitrate: Math.round(parseInt(probeData.format.bit_rate || '0') / 1000), // Convert to kbps
      sampleRate: parseInt(audioStream.sample_rate || '0'),
      channels: parseInt(audioStream.channels || '2'),
      format: probeData.format.format_name?.split(',')[0] || 'unknown',
      fileSize: fileBuffer.length,
    };
    
    return metadata;
  } catch (error) {
    console.error('[AudioMetadata] Extraction failed:', error);
    throw new Error(`Failed to extract audio metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    // Clean up temporary file
    try {
      await unlink(tempFilePath);
    } catch (cleanupError) {
      console.warn('[AudioMetadata] Failed to clean up temp file:', cleanupError);
    }
  }
}

/**
 * Validate audio file format and size
 */
export function validateAudioFile(
  fileBuffer: Buffer,
  filename: string,
  maxSizeMB: number = 500
): { isValid: boolean; error?: string; format?: string; mimeType?: string } {
  // Check file size
  const fileSizeMB = fileBuffer.length / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    return {
      isValid: false,
      error: `File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }
  
  // Check file extension
  const ext = path.extname(filename).toLowerCase();
  const allowedFormats = ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg', '.wma'];
  
  if (!allowedFormats.includes(ext)) {
    return {
      isValid: false,
      error: `File format '${ext}' is not supported. Allowed formats: ${allowedFormats.join(', ')}`,
    };
  }
  
  // Map extension to format and MIME type
  const formatMap: Record<string, { format: string; mimeType: string }> = {
    '.mp3': { format: 'mp3', mimeType: 'audio/mpeg' },
    '.wav': { format: 'wav', mimeType: 'audio/wav' },
    '.flac': { format: 'flac', mimeType: 'audio/flac' },
    '.m4a': { format: 'm4a', mimeType: 'audio/mp4' },
    '.aac': { format: 'aac', mimeType: 'audio/aac' },
    '.ogg': { format: 'ogg', mimeType: 'audio/ogg' },
    '.wma': { format: 'wma', mimeType: 'audio/x-ms-wma' },
  };
  
  const { format, mimeType } = formatMap[ext] || { format: ext.slice(1), mimeType: 'audio/mpeg' };
  
  return { isValid: true, format, mimeType };
}

/**
 * Generate a unique file key for S3 storage
 * Format: {artistId}/tracks/{timestamp}-{randomSuffix}-{filename}
 */
export function generateTrackFileKey(artistId: number, filename: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `${artistId}/tracks/${timestamp}-${randomSuffix}-${sanitizedFilename}`;
}

/**
 * Generate a unique file key for cover art
 * Format: {artistId}/artwork/{timestamp}-{randomSuffix}-{filename}
 */
export function generateArtworkFileKey(artistId: number, filename: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `${artistId}/artwork/${timestamp}-${randomSuffix}-${sanitizedFilename}`;
}

/**
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
