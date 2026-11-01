import { JWT } from 'google-auth-library';
import { Readable } from 'node:stream';
import { config } from '../config/index.js';

export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  md5Checksum?: string;
}

export interface DriveFileStreamResult {
  stream: Readable;
  status: number;
  headers: Record<string, any>;
  metadata: DriveFileMetadata;
}

class GoogleDriveService {
  private authClient: JWT | null = null;

  public isConfigured(): boolean {
    return Boolean(
      config.googleDriveEnabled &&
      config.googleServiceAccountEmail &&
      config.googlePrivateKey
    );
  }

  /**
   * Extracts a Google Drive file ID from a full Drive URL or returns the string if it's already an ID.
   * Handles:
   *  - https://drive.google.com/file/d/<FILE_ID>/view...
   *  - https://drive.google.com/open?id=<FILE_ID>
   *  - https://drive.google.com/uc?id=<FILE_ID>
   *  - https://drive.google.com/drive/folders/<FOLDER_ID>
   *  - <FILE_ID> directly
   */
  public extractFileId(urlOrId?: string): string | null {
    if (!urlOrId || typeof urlOrId !== 'string') return null;
    const trimmed = urlOrId.trim();
    if (!trimmed) return null;

    // Direct match: /file/d/<FILE_ID>
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{15,})/);
    if (fileDMatch?.[1]) return fileDMatch[1];

    // /folders/<FOLDER_ID>
    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{15,})/);
    if (folderMatch?.[1]) return folderMatch[1];

    // ?id=<FILE_ID> or &id=<FILE_ID>
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
    if (idParamMatch?.[1]) return idParamMatch[1];

    // /d/<FILE_ID>
    const shortDMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
    if (shortDMatch?.[1]) return shortDMatch[1];

    // If it contains no slashes or colons and looks like an ID
    if (!trimmed.includes('/') && !trimmed.includes(':') && trimmed.length >= 15) {
      return trimmed;
    }

    return null;
  }

  private getAuthClient(): JWT {
    if (!this.isConfigured()) {
      throw new Error('Google Drive integration is not enabled or credentials are missing');
    }

    if (!this.authClient) {
      this.authClient = new JWT({
        email: config.googleServiceAccountEmail,
        key: config.googlePrivateKey,
        scopes: [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/drive.metadata.readonly',
        ],
      });
    }

    return this.authClient;
  }

  /**
   * Retrieves file metadata (name, mimeType, size) for a file ID.
   */
  public async getFileMetadata(fileId: string): Promise<DriveFileMetadata> {
    const auth = this.getAuthClient();
    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?fields=id,name,mimeType,size,md5Checksum&supportsAllDrives=true`;

    const res = await auth.request<DriveFileMetadata>({ url });
    return res.data;
  }

  /**
   * Retrieves a readable download stream for a Google Drive file.
   */
  public async getFileStream(fileId: string): Promise<DriveFileStreamResult> {
    const auth = this.getAuthClient();

    // 1. Fetch metadata first to know filename, size, and mimeType
    const metadata = await this.getFileMetadata(fileId);

    // 2. Fetch the actual binary media stream
    const mediaUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?alt=media&supportsAllDrives=true`;

    const res = await auth.request<Readable>({
      url: mediaUrl,
      responseType: 'stream',
    });

    return {
      stream: res.data,
      status: res.status,
      headers: res.headers as Record<string, any>,
      metadata,
    };
  }

  /**
   * Lists files in a specific folder (defaults to GOOGLE_DRIVE_FOLDER_ID).
   */
  public async listFilesInFolder(folderId?: string): Promise<DriveFileMetadata[]> {
    const auth = this.getAuthClient();
    const targetFolder = folderId || config.googleDriveFolderId;
    const q = targetFolder
      ? `'${targetFolder}' in parents and trashed = false`
      : 'trashed = false';

    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      q
    )}&fields=files(id,name,mimeType,size,modifiedTime)&pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true`;

    const res = await auth.request<{ files?: DriveFileMetadata[] }>({ url });
    return res.data.files || [];
  }
}

export const googleDriveService = new GoogleDriveService();
export default googleDriveService;

