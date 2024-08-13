// lib/api.ts

import { collection, query, where, getDocs } from "firebase/firestore";
import { firestore } from "../firebase/config";

// Define the Car type according to your Firestore schema
interface Car {
  id: string;
  plate: string;
  car: string;
  image: string;
  available: boolean;
}

export const getAvailableCars = async (): Promise<Car[]> => {
  try {
    const carsRef = collection(firestore, "cars"); // Collection name in Firestore
    const q = query(carsRef, where("available", "==", true));
    const querySnapshot = await getDocs(q);
    
    const cars: Car[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data() as Omit<Car, "id">,
    }));
    
    return cars;
  } catch (error) {
    console.error("Error fetching available cars:", error);
    throw new Error("Could not fetch available cars.");
  }
};
