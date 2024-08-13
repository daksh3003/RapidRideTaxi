// hooks/useDriverRequests.ts
import { useState, useEffect } from 'react';
import { firestore } from '../firebase/config'; // Adjust import path if needed
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

interface Driver {
  id: string;
  location: string;
  isAvailable: boolean;
  // Add other driver properties as needed
}

interface RequestPayload {
  driverId: string;
  destination: string;
}

const useDriverRequests = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch drivers from Firestore
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        const driverCollection = collection(firestore, 'drivers');
        const driverQuery = query(driverCollection);
        const querySnapshot = await getDocs(driverQuery);
        const driverList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver));
        setDrivers(driverList);
      } catch (error) {
        setError('Failed to fetch drivers');
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const sendDriverRequests = async (location: string, destination: string) => {
    setLoading(true);
    try {
      // Filter drivers based on location and availability
      const filteredDrivers = drivers.filter(driver => driver.location === location && driver.isAvailable);

      // Send requests to filtered drivers
      const requests: RequestPayload[] = filteredDrivers.map(driver => ({
        driverId: driver.id,
        destination,
      }));

      // Assuming you have a `requests` collection in Firestore to store these requests
      const requestsCollection = collection(firestore, 'requests');
      for (const request of requests) {
        await addDoc(requestsCollection, request);
      }

      console.log('Requests sent successfully:', requests);
    } catch (error) {
      setError('Failed to send requests');
    } finally {
      setLoading(false);
    }
  };

  return {
    drivers,
    loading,
    error,
    sendDriverRequests,
  };
};

export default useDriverRequests;
