import { apiRequest } from './apiClient';
import { API_BASE_URL } from '../constants/auth';
import type { Order } from '../types/order';

interface DownloadTokenResponse {
  success: boolean;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  message?: string;
}

export const downloadService = {
  /**
   * Request a secure, short-lived download token for a purchased product.
   * Can accept either the Order object (which allows instant auto-sync if needed) or just orderId.
   */
  async prepareDownload(
    order: Order | string,
    productId: string,
    customerEmail?: string
  ): Promise<{ success: boolean; downloadUrl?: string; fileName?: string; error?: string }> {
    try {
      const orderId = typeof order === 'string' ? order : (order.orderId || order.id);
      const email = typeof order === 'string' ? customerEmail : (customerEmail || order.customerEmail);
      const orderData = typeof order === 'object' ? order : undefined;

      const { response, data } = await apiRequest<DownloadTokenResponse>('/downloads/generate-token', {
        method: 'POST',
        body: JSON.stringify({ orderId, productId, customerEmail: email, orderData }),
      });

      if (!response.ok || !data.success || !data.downloadUrl) {
        return {
          success: false,
          error: data.message || 'Unable to prepare download. Please check your order status.',
        };
      }

      return {
        success: true,
        downloadUrl: data.downloadUrl,
        fileName: data.fileName,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to connect to download server.',
      };
    }
  },

  /**
   * Triggers native browser download using the secure backend stream URL.
   * Google Drive URLs and credentials are never exposed to the client.
   */
  triggerBrowserDownload(downloadUrl: string, fileName?: string): void {
    const backendOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
    const absoluteUrl = downloadUrl.startsWith('http')
      ? downloadUrl
      : `${backendOrigin}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;

    const anchor = document.createElement('a');
    anchor.href = absoluteUrl;
    if (fileName) {
      anchor.setAttribute('download', fileName);
    }
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => {
      document.body.removeChild(anchor);
    }, 1000);
  },

  /**
   * One-step download helper for UI buttons.
   */
  async startDownload(
    order: Order | string,
    productId: string,
    customerEmail?: string
  ): Promise<{ success: boolean; fileName?: string; error?: string }> {
    const prep = await this.prepareDownload(order, productId, customerEmail);
    if (!prep.success || !prep.downloadUrl) {
      return { success: false, error: prep.error || 'Failed to initialize download' };
    }

    this.triggerBrowserDownload(prep.downloadUrl, prep.fileName);
    return { success: true, fileName: prep.fileName };
  },
};

export default downloadService;
