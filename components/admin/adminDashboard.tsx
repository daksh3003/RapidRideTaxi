'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogPanel } from "@headlessui/react";
import { MenuIcon, XIcon, PlusIcon } from "@heroicons/react/outline";
import CardCar from "@/components/CardCar";
import { ModeToggle } from '../ModeToggle';
import { Button } from '../ui/button';
import { getAvailableCars } from "@/app/hooks/getAvailablecars";
import { addRideRequest } from "@/app/hooks/addRideRequest";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { firestore, storage } from "@/app/firebase/config";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [rideModalOpen, setRideModalOpen] = useState(false);
  const [carName, setCarName] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [carImage, setCarImage] = useState<File | null>(null);
  const [driverId, setDriverId] = useState("");
  const [passengerName, setPassengerName] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [availableCars, setAvailableCars] = useState<any[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);

  useEffect(() => {
    const fetchAvailableCars = async () => {
      try {
        const cars = await getAvailableCars();
        setAvailableCars(cars);
      } catch (error) {
        console.error("Error fetching available cars:", error);
      }
    };

    

    const fetchAvailableDrivers = async () => {
      try {
        // Assuming there's a collection named 'drivers' in Firestore
        const driversQuery = query(collection(firestore, "drivers"), where("isAvailable", "==", true));
        const querySnapshot = await getDocs(driversQuery);
        const drivers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAvailableDrivers(drivers);
      } catch (error) {
        console.error("Error fetching available drivers:", error);
      }
    };

    fetchAvailableCars();
    fetchAvailableDrivers();
  }, []);

  useEffect(() => {
    const role=localStorage.getItem("user-info");
    const roles=JSON.parse(role || "");
    if(roles.role==='driver'){
      window.location.href="/"
    }
    // if(roles.role!='admin'){
    //   window.location.href="/"
    // }
  }
  ,[])

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!carName || !licensePlate || !carImage) {
      console.log("Please fill all fields and select an image.");
      return;
    }

    try {
      const imageRef = ref(storage, `car-images/${carImage.name}`);
      await uploadBytes(imageRef, carImage);
      const imageUrl = await getDownloadURL(imageRef);

      const carDoc = {
        carName,
        licensePlate,
        imageUrl,
        available:true,
        createdAt: Date.now(),
      };
      await setDoc(doc(firestore, "cars", licensePlate), carDoc);

      setCarName('');
      setLicensePlate('');
      setCarImage(null);
      setModalOpen(false);
      setAvailableCars(prev => [...prev, { ...carDoc, id: licensePlate }]); // Update state to include new car
    } catch (error: any) {
      console.error("Error adding car:", error.message);
    }
  };

  const handleAddRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCar || !driverId || !passengerName || !destination) {
      alert("Please fill in all fields and select a car.");
      return;
    }

    try {
      await addRideRequest({
        driverId,
        passengerName,
        destination,
        carId: selectedCar,
        createdAt: Date.now(),
        confirm: false,
      });
      alert("Ride request added successfully.");
      setRideModalOpen(false);
    } catch (error) {
      console.error("Error adding ride request:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? "block" : "hidden"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="relative flex-1 flex flex-col max-w-xs w-full">
          <div className="absolute top-0 right-0 -mr-14 p-1">
            <button
              type="button"
              className="ml-1 flex h-12 w-12 items-center justify-center rounded-full  "
              onClick={() => setSidebarOpen(false)}
            >
              <XIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 px-4">
              <h2 className="text-lg font-semibold text-yellow-500">Admin Dashboard</h2>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              <ul>
                <li>
                  <a href="#" className="block px-4 py-2 text-gray-300 hover:bg-gray-600">
                    <div className="flex items-center">
                      <PlusIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                      <p className="ml-3 text-gray-300">Add Car</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="#" className="block px-4 py-2 text-gray-300 hover:bg-gray-700">
                    <div className="flex items-center">
                      <PlusIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                      <p className="ml-3 text-gray-300">Assign Ride</p>
                    </div>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className=" text-black">
          <div className="relative flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button className="text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <ModeToggle />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Manage Cars and Rides</h2>
              <Button onClick={() => setModalOpen(true)} className="bg-yellow-500 text-white">Add Car</Button>
              <Button onClick={() => setRideModalOpen(true)} className="bg-green-500 text-white">Assign Ride</Button>
            </div>
            <div className="mt-6">
              <div className="flex flex-wrap gap-4">
                {availableCars.length > 0 ? (
                  availableCars.map((car) => (
                    <CardCar
                      key={car.id}
                      plate={car.licensePlate}
                      car={car.carName}
                      image={car.imageUrl} // Adjust image prop to use imageUrl
                    />
                  ))
                ) : (
                  <p>No cars available now.</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </main>

      {/* Add Car Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed inset-0 z-10 overflow-y-auto">
        <DialogTitle>Add New Car</DialogTitle>
        <DialogPanel>
          <form onSubmit={handleAddCar} className="p-4 bg-white rounded-lg shadow-lg">
            <div className="mb-4">
              <label htmlFor="car-name" className="block text-sm font-medium  text-gray-700">Car Name</label>
              <input
                type="text"
                id="car-name"
                value={carName}
                onChange={(e) => setCarName(e.target.value)}
                className="mt-1 block w-full border bg-white border-gray-300 rounded-md shadow-sm text-black"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="license-plate" className="block text-sm font-medium text-gray-700">License Plate</label>
              <input
                type="text"
                id="license-plate"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="mt-1 block w-full border bg-white border-gray-300 rounded-md shadow-sm text-black"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="car-image" className="block text-sm font-medium text-gray-700">Car Image</label>
              <input
                type="file"
                id="car-image"
                accept="image/*"
                onChange={(e) => setCarImage(e.target.files?.[0] || null)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm text-black"
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="bg-blue-500 text-white">Add Car</Button>
            </div>
          </form>
        </DialogPanel>
      </Dialog>

      {/* Assign Ride Modal */}
      <Dialog open={rideModalOpen} onClose={() => setRideModalOpen(false)} className="fixed inset-0 z-10 overflow-y-auto">
        <DialogTitle>Assign Ride</DialogTitle>
        <DialogPanel>
          <form onSubmit={handleAddRide} className="p-4 bg-white rounded-lg shadow-lg">
            <div className="mb-4">
              <label htmlFor="select-car" className="block text-sm font-medium text-gray-700">Select Car</label>
              <select
                id="select-car"
                value={selectedCar || ""}
                onChange={(e) => setSelectedCar(e.target.value)}
                className="mt-1 block w-full border bg-white border-gray-300 rounded-md shadow-sm text-black"
                required
              >
                <option value="" disabled>Select a car</option>
                {availableCars.map((car) => (
                  <option key={car.id} value={car.id}>{car.carName} - {car.licensePlate}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="driver-id" className="block text-sm font-medium text-gray-700">Driver</label>
              <select
                id="driver-id"
                value={driverId || ""}
                onChange={(e) => setDriverId(e.target.value)}
                className="mt-1 block w-full border bg-white border-gray-300 rounded-md shadow-sm text-black"
                required
              >
                <option value="" disabled>Select a driver</option>
                {availableDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>{driver.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="passenger-name" className="block text-sm font-medium text-gray-700">Passenger Name</label>
              <input
                type="text"
                id="passenger-name"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="mt-1 block w-full border bg-white border-gray-300 rounded-md shadow-sm text-black"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destination</label>
              <input
                type="text"
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1 block w-full border bg-white border-gray-300 rounded-md shadow-sm text-black"
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="bg-blue-500 text-white">Assign Ride</Button>
            </div>
          </form>
        </DialogPanel>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
