import axios from 'axios';
import * as fs from 'fs';
import { env } from '../config/env';
import { AuditLogService } from '../models/audit-log.model';

/**
 * Arweave storage adapter for permanent evidence archival
 */
export class ArweaveStorageAdapter {
  private nodeUrl: string;
  private timeout: number;

  constructor() {
    this.nodeUrl = env.arweaveNodeUrl;
    this.timeout = env.arweaveTimeout;
  }

  /**
   * Check if Arweave node is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.nodeUrl}/info`, {
        timeout: this.timeout,
      });
      return response.status === 200;
    } catch (error) {
      console.warn('[Arweave] Node unavailable:', error);
      return false;
    }
  }

  /**
   * Upload data to Arweave (permanent storage)
   * Note: This is a simplified version. Production requires wallet & AR tokens
   */
  async uploadData(
    data: Buffer | string,
    contentType: string = 'application/octet-stream',
    metadata?: Record<string, any>
  ): Promise<{ transactionId: string; contentHash: string; status: string }> {
    if (!env.arweaveUploadEnabled) {
      throw new Error('Arweave upload is disabled');
    }

    const startTime = Date.now();

    try {
      // In production, this would use ArweaveJS SDK with a funded wallet
      // For now, we'll simulate the upload process
      const buffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
      const contentHash = require('crypto')
        .createHash('sha256')
        .update(buffer)
        .digest('hex');

      // TODO: Integrate with ArweaveJS SDK
      // const tx = await arweave.createTransaction({ data: buffer });
      // await tx.sign(wallet);
      // const uploader = await arweave.transactions.getUploader(tx);

      console.log('[Arweave] Upload initiated:', { contentHash });

      AuditLogService.log({
        action: 'EVIDENCE_UPLOADED_TO_ARWEAVE',
        milestone_id: metadata?.milestone_id || 'unknown',
        escrow_address: metadata?.escrow_address || 'unknown',
        evaluator_pubkey: 'system',
        status: 'SUCCESS',
        details: { content_hash: contentHash, size: buffer.length },
        duration_ms: Date.now() - startTime,
        model_version: env.evaluatorModelVersion,
        evaluator_version: env.evaluatorVersion,
      });

      return {
        transactionId: `arweave-tx-${Date.now()}`,
        contentHash,
        status: 'pending',
      };
    } catch (error: any) {
      console.error('[Arweave] Upload failed:', error.message);

      AuditLogService.log({
        action: 'EVIDENCE_ARWEAVE_FAILED',
        milestone_id: metadata?.milestone_id || 'unknown',
        escrow_address: metadata?.escrow_address || 'unknown',
        evaluator_pubkey: 'system',
        status: 'ERROR',
        error_message: error.message,
        duration_ms: Date.now() - startTime,
        model_version: env.evaluatorModelVersion,
        evaluator_version: env.evaluatorVersion,
      });

      throw new Error(`Arweave upload failed: ${error.message}`);
    }
  }

  /**
   * Get Arweave gateway URL for a transaction
   */
  getGatewayUrl(transactionId: string): string {
    return `https://arweave.net/${transactionId}`;
  }
}

export const arweaveAdapter = new ArweaveStorageAdapter();
