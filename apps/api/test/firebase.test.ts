import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyAuthToken, sendFcmPushNotification } from '../src/services/firebase.js';
import { RegisterDeviceSchema } from '@yalcin/shared';

test('Firebase Auth verification handles malformed tokens securely', async () => {
  const result = await verifyAuthToken('invalid-fake-token-12345');
  assert.equal(result, null, 'Invalid token must return null without throwing unhandled exceptions');
});

test('FCM push notifications handle invalid token gracefully', async () => {
  const sent = await sendFcmPushNotification({
    token: 'invalid_fcm_token_sample',
    title: 'Test Bildirim',
    body: 'Sipariş durumunuz güncellendi.',
  });
  assert.equal(sent, false, 'Invalid FCM token should return false gracefully without crashing server');
});

test('Device registration schema validates FCM token and platforms', () => {
  const validIos = RegisterDeviceSchema.safeParse({
    token: 'fcm_sample_token_ios_device_12345',
    platform: 'ios',
    customerId: 'cust-123',
  });
  assert.ok(validIos.success);

  const validAndroid = RegisterDeviceSchema.safeParse({
    token: 'fcm_sample_token_android_device_67890',
    platform: 'android',
  });
  assert.ok(validAndroid.success);

  const invalidPlatform = RegisterDeviceSchema.safeParse({
    token: 'fcm_token_12345',
    platform: 'windows_phone',
  });
  assert.equal(invalidPlatform.success, false);

  const shortToken = RegisterDeviceSchema.safeParse({
    token: 'short',
    platform: 'web',
  });
  assert.equal(shortToken.success, false);
});
