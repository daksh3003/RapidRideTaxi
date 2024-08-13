
import { collection, addDoc } from "firebase/firestore";
import { firestore } from "../firebase/config";

// Define the RideRequest type according to your Firestore schema
interface RideRequest {
  driverId: string;
  passengerName: string;
  destination: string;
  carId: string;
  createdAt: number;
  confirm: boolean;
}

export const addRideRequest = async (rideRequest: RideRequest): Promise<void> => {
  try {
    const ridesRef = collection(firestore, "rides"); 
    await addDoc(ridesRef, {
      ...rideRequest,
      createdAt: Date.now(),
      confirm: false,
    });
  } catch (error) {
    console.error("Error adding ride request:", error);
    throw new Error("Could not add ride request.");
  }
};
