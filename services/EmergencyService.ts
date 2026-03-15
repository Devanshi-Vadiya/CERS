import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { SmsManager } from '@byteowls/capacitor-sms';

import { Capacitor } from '@capacitor/core';

export class EmergencyService {
    private static permissionLock = false;

    /**
     * Explicitly requests all hardware permissions required for SOS
     */
    static async requestAllPermissions() {
        if (this.permissionLock) return true;
        this.permissionLock = true;
        try {
            console.log('Requesting SOS permissions...');

            // 🌐 Skip native native permission requests on web to avoid "Not implemented" crash
            if (Capacitor.getPlatform() === 'web') {
                console.log('Running on Web: Skipping native hardware permission requests.');
                return true;
            }

            // Request Camera
            await Camera.requestPermissions();

            // Request Location
            await Geolocation.requestPermissions();

            console.log('Native permissions initialized successfully.');
            return true;
        } catch (error: any) {
            console.error('Permission Error:', error);
            return false;
        }
    }

    /**
     * Core SOS Logic: Checks network and executes either Online or Offline path
     */
    static async triggerSOS(guardianNumber: string, onOnlineSubmit: (coords: { lat: number, lng: number }) => Promise<void>) {
        try {
            const status = await Network.getStatus();
            console.log('Network Status:', status);

            // 1. Get current location
            const coordinates = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000
            });

            const { latitude: lat, longitude: lng } = coordinates.coords;
            const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

            if (status.connected) {
                console.log('Device is ONLINE. Submitting to API...');
                await onOnlineSubmit({ lat, lng });
            } else {
                console.log('Device is OFFLINE. Triggering SMS Fallback (Intent style)...');

                const message = `EMERGENCY! I need help. My location: ${googleMapsLink}`;

                // 🟢 Use @byteowls/capacitor-sms which opens the SMS app with pre-filled content
                // This is the "Satellite-style" fallback that works on all Android versions.
                await SmsManager.send({
                    numbers: [guardianNumber],
                    text: message
                });

                console.log('SMS Intent triggered');
            }
        } catch (error: any) {
            console.error('SOS Logic Failed:', error);
            const errorMsg = error.message || 'Unknown SOS Error';

            // Final fallback if GPS or Network check fails
            if (guardianNumber) {
                alert('Primary SOS failed. Opening SMS fallback manually. Error: ' + errorMsg);
                window.location.href = `sms:${guardianNumber}?body=EMERGENCY! I need help. My network/GPS failed.`;
            }
        }
    }
}
