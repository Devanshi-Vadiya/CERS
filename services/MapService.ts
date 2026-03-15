import { LocationData } from "../types";

/**
 * 🆓 100% FREE Map Service (Leaflet + OSRM)
 * Removed Google Maps dependencies to eliminate billing/auth errors.
 */

/**
 * Calculates Ambulance ETA instantly (bypassing slow OSRM)
 * Enforces a strict 1 to 6 minutes cap for immediate assignment response.
 */
export const calculateAmbulanceETA = async (origin: LocationData, destination: LocationData): Promise<string> => {
    // 1. Instantly calculate distance locally
    const R = 6371; // Earth radius in km
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLon = (destination.lng - origin.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // 2. Base calculation (assuming 60km/h + 20% traffic)
    let minutes = Math.ceil(((distance / 60) * 60) * 1.20);

    // 3. Strictly cap between 1 and 6 minutes
    if (minutes < 1) {
        minutes = 1;
    } else if (minutes > 6) {
        minutes = Math.floor(Math.random() * 3) + 4; // Randomly 4, 5, or 6 mins for longer distances
    }

    // Returns instantly without network delay
    return `${minutes} mins`;
};
