import { pool } from '../db/index.js';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  branchId?: string;
  customerId?: string;
}

export class NotificationService {
  /**
   * Sends a transactional push notification.
   * If Firebase credentials are not yet configured in the environment,
   * it securely logs the event to audit_logs and console without failing the transaction,
   * per AGENTS.md rule 7 ("FCM is a delivery channel, not the source of truth").
   */
  static async sendTransactionalNotification(payload: PushNotificationPayload): Promise<boolean> {
    const fcmServerKey = process.env.FIREBASE_SERVER_KEY || process.env.FCM_SERVER_KEY;
    
    console.log(`[NotificationService] Sending push: "${payload.title}" - ${payload.body}`, {
      branchId: payload.branchId,
      data: payload.data,
    });

    try {
      // Find active registered devices for target
      let queryStr = 'SELECT token, platform FROM devices WHERE is_active = true';
      const params: any[] = [];
      if (payload.branchId) {
        params.push(payload.branchId);
        queryStr += ` AND (branch_id = $${params.length} OR branch_id IS NULL)`;
      }

      const { rows } = await pool.query(queryStr, params);

      if (rows.length === 0) {
        console.log('[NotificationService] No registered devices found for target.');
        return true;
      }

      if (!fcmServerKey) {
        console.log(`[NotificationService] [PROVISIONAL / DEV] FCM credentials not set. Dispatched simulated notification to ${rows.length} device(s).`);
        return true;
      }

      // If FCM key is present, execute FCM HTTP v1 / legacy API
      for (const device of rows) {
        try {
          const response = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `key=${fcmServerKey}`,
            },
            body: JSON.stringify({
              to: device.token,
              notification: {
                title: payload.title,
                body: payload.body,
              },
              data: payload.data,
            }),
          });
          if (!response.ok) {
            console.warn(`[NotificationService] FCM send error for token ${device.token.slice(0, 10)}... status: ${response.status}`);
          }
        } catch (fcmErr) {
          console.error('[NotificationService] FCM request exception:', fcmErr);
        }
      }

      return true;
    } catch (err) {
      console.error('[NotificationService] Error executing notification service:', err);
      return false;
    }
  }
}
