import { useState, useEffect } from "react";
import { firestore } from "@/app/firebase/config"; // Update the path as needed
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";

// TypeScript interface for ride requests
interface RideRequest {
  id: string; // Add the 'id' property
  carId: string;
  confirm: boolean;
  createdAt: number;
  destination: string;
  driverId: string;
  passengerName: string;
}

// Hook to manage ride requests for a driver
const useDriverRideRequests = (driverId: string) => {
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRideRequests = async () => {
      setLoading(true);
      setError(null);

      try {
        // Query to get all ride requests assigned to the driver
        const ridesQuery = query(collection(firestore, "rideRequests"), where("driverId", "==", driverId));
        const querySnapshot = await getDocs(ridesQuery);

        // Map documents to RideRequest and validate data
        const rides: RideRequest[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id as string, // Add the 'id' property
            carId: data.carId as string,
            confirm: data.confirm as boolean,
            createdAt: data.createdAt as number,
            destination: data.destination as string,
            driverId: data.driverId as string,
            passengerName: data.passengerName as string
          };
        });

        setRideRequests(rides);
      } catch (err) {
        setError("Error fetching ride requests.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRideRequests();
  }, [driverId]);

  // Function to approve a ride request
  const approveRideRequest = async (rideId: string) => {
    try {
      const rideRef = doc(firestore, "rideRequests", rideId);
      await updateDoc(rideRef, { confirm: true });
      setRideRequests(prev =>
        prev.map(ride => ride.id === rideId ? { ...ride, confirm: true } : ride)
      );
    } catch (err) {
      setError("Error approving ride request.");
      console.error(err);
    }
  };

  // Function to decline a ride request
  const declineRideRequest = async (rideId: string) => {
    try {
      const rideRef = doc(firestore, "rideRequests", rideId);
      await updateDoc(rideRef, { confirm: false });
      setRideRequests(prev =>
        prev.map(ride => ride.id === rideId ? { ...ride, confirm: false } : ride)
      );
    } catch (err) {
      setError("Error declining ride request.");
      console.error(err);
    }
  };

  return { rideRequests, loading, error, approveRideRequest, declineRideRequest };
};

export default useDriverRideRequests;
