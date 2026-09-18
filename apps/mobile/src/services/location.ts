import * as Location from "expo-location";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Requests foreground location permission and returns the current coordinates, or `null`
 * if permission is denied or the location can't be determined — callers should degrade
 * gracefully (e.g. fall back to "recommended" sorting) rather than block on this.
 * Coordinates are never persisted; they're only ever read fresh and sent on the one
 * request that needs them.
 */
export async function getCurrentCoordinates(): Promise<Coordinates | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  } catch {
    return null;
  }
}
