import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import { env } from '../config/env';
import { AuditLogService } from '../models/audit-log.model';

/**
 * IPFS storage adapter for evidence persistence
 */
export class IPFSStorageAdapter {
  private ipfsApiUrl: string;
  private ipfsGatewayUrl: string;
  private timeout: number;

  constructor() {
    this.ipfsApiUrl = env.ipfsApiUrl;
    this.ipfsGatewayUrl = env.ipfsGatewayUrl;
    this.timeout = env.ipfsTimeout;
  }

  /**
   * Check if IPFS is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.ipfsApiUrl}/api/v0/version`, {
        timeout: this.timeout,
      });
      return response.status === 200;
    } catch (error) {
      console.warn('[IPFS] Service unavailable:', error);
      return false;
    }
  }

  /**
   * Upload file or data to IPFS
   * Returns IPFS hash (content hash) and gateway URL
   */
  async uploadFile(
    filename: string,
    content: Buffer | string,
    metadata?: Record<string, any>
  ): Promise<{ hash: string; url: string; metadata?: Record<string, any> }> {
    if (!env.ipfsUploadEnabled) {
      throw new Error('IPFS upload is disabled');
    }

    const startTime = Date.now();

    try {
      const formData = new FormData();
      const buffer = typeof content === 'string' ? Buffer.from(content, 'utf8') : content;
      formData.append('file', buffer, filename);

      // Add metadata as JSON if provided
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const response = await axios.post(`${this.ipfsApiUrl}/api/v0/add`, formData, {
        headers: formData.getHeaders(),
        timeout: this.timeout,
      });

      const ipfsHash = response.data.Hash;
      const url = `${this.ipfsGatewayUrl}/ipfs/${ipfsHash}`;

      console.log('[IPFS] File uploaded:', { filename, hash: ipfsHash });

      AuditLogService.log({
        action: 'EVIDENCE_UPLOADED_TO_IPFS',
        milestone_id: metadata?.milestone_id || 'unknown',
        escrow_address: metadata?.escrow_address || 'unknown',
        evaluator_pubkey: 'system',
        status: 'SUCCESS',
        details: { ipfs_hash: ipfsHash, filename, size: buffer.length },
        duration_ms: Date.now() - startTime,
        model_version: env.evaluatorModelVersion,
        evaluator_version: env.evaluatorVersion,
      });

      return { hash: ipfsHash, url, metadata };
    } catch (error: any) {
      console.error('[IPFS] Upload failed:', error.message);

      AuditLogService.log({
        action: 'EVIDENCE_UPLOAD_FAILED',
        milestone_id: metadata?.milestone_id || 'unknown',
        escrow_address: metadata?.escrow_address || 'unknown',
        evaluator_pubkey: 'system',
        status: 'ERROR',
        error_message: error.message,
        details: { filename },
        duration_ms: Date.now() - startTime,
        model_version: env.evaluatorModelVersion,
        evaluator_version: env.evaluatorVersion,
      });

      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Retrieve file from IPFS by hash
   */
  async downloadFile(ipfsHash: string): Promise<Buffer> {
    try {
      const url = `${this.ipfsGatewayUrl}/ipfs/${ipfsHash}`;
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: this.timeout,
      });
      return Buffer.from(response.data);
    } catch (error: any) {
      console.error('[IPFS] Download failed:', error.message);
      throw new Error(`IPFS download failed: ${error.message}`);
    }
  }

  /**
   * Pin content to IPFS node (ensure persistence)
   */
  async pinContent(ipfsHash: string, metadata?: Record<string, any>): Promise<{ success: boolean }> {
    try {
      await axios.post(`${this.ipfsApiUrl}/api/v0/pin/add?arg=${ipfsHash}`, null, {
        timeout: this.timeout,
      });

      console.log('[IPFS] Content pinned:', ipfsHash);

      AuditLogService.log({
        action: 'EVIDENCE_PINNED_ON_IPFS',
        milestone_id: metadata?.milestone_id || 'unknown',
        escrow_address: metadata?.escrow_address || 'unknown',
        evaluator_pubkey: 'system',
        status: 'SUCCESS',
        details: { ipfs_hash: ipfsHash },
        duration_ms: 0,
        model_version: env.evaluatorModelVersion,
        evaluator_version: env.evaluatorVersion,
      });

      return { success: true };
    } catch (error: any) {
      console.warn('[IPFS] Pinning failed (non-critical):', error.message);
      return { success: false };
    }
  }

  /**
   * Get IPFS gateway URL for a hash
   */
  getGatewayUrl(ipfsHash: string): string {
    return `${this.ipfsGatewayUrl}/ipfs/${ipfsHash}`;
  }
}

export const ipfsAdapter = new IPFSStorageAdapter();
