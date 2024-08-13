"use client";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { firestore } from "../../app/firebase/config"; // Adjust the path as needed
import { doc, updateDoc, collection, getDocs, writeBatch, getDoc } from "firebase/firestore";
import { ModeToggle } from "../ModeToggle";
import Image from "next/image";
import useLogout from "@/app/hooks/useLogout";

// Define TypeScript interfaces for the ride
interface Ride {
  id: string;
  driverId: string;
  passengerName: string;
  destination: string;
  createdAt: number;
  confirm: boolean;
  acceptedAt?: string; // Optional timestamp when the ride is accepted
  carName?: string; // Optional field for car name
}

// Define TypeScript interfaces for the driver
interface Driver {
  name: string;
  email: string;
  avatarUrl?: string;
}

// Custom hook to manage all ride requests
const useAllRides = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRides = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching all rides"); // Log fetching action

        const rideCollection = collection(firestore, "rides");
        const rideSnapshot = await getDocs(rideCollection);
        const rideList: Ride[] = rideSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Ride, "id">),
        }));

        console.log("All rides fetched:", rideList); // Log fetched rides
        setRides(rideList);
      } catch (error) {
        setError("Error fetching rides.");
        console.error("Error fetching rides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  const approveRideRequest = async (rideId: string) => {
    try {
      const rideDoc = doc(firestore, "rides", rideId);

      // Fetch the ride to get current data
      const rideSnapshot = await getDoc(rideDoc);
      const rideData = rideSnapshot.data() as Ride;

      if (rideData) {
        // Update the current ride with accepted details
        await updateDoc(rideDoc, {
          confirm: true,
          acceptedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error approving ride request:", error);
    }
  };

const declineRideRequest = async (rideId: string) => {
  try {
    const rideDoc = doc(firestore, "rides", rideId);
    await updateDoc(rideDoc, { confirm: false });
  } catch (error) {
    console.error("Error declining ride request:", error);
    }
  };

  return { rides, loading, error, approveRideRequest, declineRideRequest };
};

export default function CreateDriver() {
  const [uid, setUid] = useState<string | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const { rides, loading, error, approveRideRequest, declineRideRequest } = useAllRides();
  const {handleLogout,isLoggingOut}=useLogout();
  const name = localStorage.getItem("user-info")
  
  const user = name ? JSON.parse(name).name : null;

useEffect(() => {
  const role=localStorage.getItem("user-info");
  if(!role){
    window.location.href="/login"
  }
  const roles=JSON.parse(role || "");
  if(roles.role==='admin'){
    window.location.href="/dashboard"
  }
  // if(roles.role!='admin'){
  //   window.location.href="/"
  // }
}
,[])

  useEffect(() => {
    const userInfo = localStorage.getItem("user-info");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setUid(user.uid);
      setDriver({
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      });
    }
    else{
      return
    }
  }, []);

  useEffect(() => {
    // Find the currently accepted ride
    if (uid) {
      const acceptedRide = rides.find(ride => ride.driverId === uid && ride.confirm === true);
      setCurrentRide(acceptedRide || null);
    }
  }, [rides, uid]);

  // Filter rides to include only those where driverId matches the uid
  const filteredRides =( uid
    ? rides.filter((ride) => ride.driverId === uid && !ride.confirm)
    : []);

  return (
    <>
      <nav className="w-full flex justify-between items-center p-6 bg-yellow-500">
        <div className="flex">
          <p className="text-black text-2xl font-semibold">RapidRide Taxi</p>
        </div>
        <div className="flex gap-2">
          <ModeToggle />
          <Button className="bg-white hover:bg-white text-[black]" onClick={handleLogout}>Logout</Button>
        </div>
      </nav>
      
        <div className="-mt-[44px]">
        <div className="flex flex-row min-h-screen pt-12 justify-between">
          <div className="w-1/3 p-4 bg-gray-100 border-r border-gray-300">
            <div className="p-4 bg-white shadow-md rounded-lg">
              {driver?.avatarUrl ? (
                <Avatar>
                  <AvatarImage src={driver.avatarUrl} alt={driver.name} />
                  <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt={driver?.name} />
                  <AvatarFallback>CN</AvatarFallback>

                </Avatar>
              )}
              <h2 className="text-lg text-black font-semibold mt-2">{user}</h2>
              <p className="text-gray-600">{driver?.email}</p>
            </div>
          </div>
          <div className="flex-grow p-4">
            <section className="w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Current Ride</h2>
              {loading && <p>Loading...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {currentRide ? (
                <div className="bg-white shadow-md rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold">Current Ride</h3>
                  <p><strong>Passenger:</strong> {currentRide.passengerName}</p>
                  <p><strong>Destination:</strong> {currentRide.destination}</p>
                  <p><strong>Time Started:</strong> {new Date(currentRide.createdAt).toLocaleString()}</p>
                </div>
              ) : (
                <p>No ride accepted.</p>
              )}
              {filteredRides.length === 0 && !currentRide && (
                <p>No rides available to accept.</p>
              )}
              {!currentRide && (
                <ul>
                  {filteredRides.map(ride => (
                    <li key={ride.id} className="bg-white shadow-md rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-semibold">Passenger: {ride.passengerName}</h3>
                      <p>Destination: {ride.destination}</p>
                      <button
                        className="mt-2 py-2 px-4 bg-green-500 text-white rounded-lg"
                        onClick={() => approveRideRequest(ride.id)}
                      >
                        Accept Ride
                      </button>
                      <button
                        className="mt-2 ml-2 py-2 px-4 bg-red-500 text-white rounded-lg"
                        onClick={() => declineRideRequest(ride.id)}
                      >
                        Decline Ride
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        </div>
    </>
  );
}
