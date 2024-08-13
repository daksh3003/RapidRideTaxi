"use client";

import {
  useCreateUserWithEmailAndPassword,
  useSignInWithGoogle,
} from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { auth, firestore } from "../../../app/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  getDoc,
} from "@firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";

// Define types for form inputs
interface SignupInputs {
  name: string;
  email: string;
  isAvailable: boolean;
  password: string;
  location?: string;
  role:string // Optional field
}

const Signup: React.FC = () => {
  const router = useRouter();
  const [signInWithGoogle, googleError] = useSignInWithGoogle(auth);
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState<SignupInputs>({
    name: "",
    email: "",
    password: "",
    isAvailable:true,
    location: "",
    role:"driver" // Optional
  });

  const [createUserWithEmailAndPassword, , error] =
    useCreateUserWithEmailAndPassword(auth);

  // Handle form submission
  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const { email, password, name, location } = inputs;

    if (!email || !password || !name) {
      // Handle validation error
      console.error("Please enter all required fields.");
      return;
    }

    const usersRef = collection(firestore, "drivers");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Handle email already exists
      console.error("Email already exists.");
      return;
    }

    try {
      const newUser = await createUserWithEmailAndPassword(email, password);
      if (!newUser) {
        // Handle error creating user
        console.error("Error creating user.");
        return;
      }

      const driverDoc = {
        uid: newUser.user.uid,
        email: email,
        isAvailable: true,
        name: name,
        location: location || "", // Optional
        createdAt: Date.now(),
        role: "driver", 
      };

      await setDoc(doc(firestore, "drivers", newUser.user.uid), driverDoc);
      localStorage.setItem("user-info", JSON.stringify(driverDoc));

      router.push("/");
    } catch (err) {
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google authentication
  const handleGoogleAuth = async () => {
    try {
      const newUser = await signInWithGoogle();
      if (googleError) {
        // Handle Google auth error
        console.error("Google auth error:", googleError);
        return;
      }
      if (newUser) {
        const userRef = doc(firestore, "drivers", newUser.user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userDoc = userSnap.data();
          localStorage.setItem("user-info", JSON.stringify(userDoc));
          router.push("/");
        } else {
          const driverDoc = {
            uid: newUser.user.uid,
            email: newUser.user.email || "",
            name: newUser.user.displayName || "No Name",
            location: "", // Optional
            createdAt: Date.now(),
          };
          await setDoc(doc(firestore, "drivers", newUser.user.uid), driverDoc);
          localStorage.setItem("user-info", JSON.stringify(driverDoc));
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Google auth error:", error);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left Part */}
      <div className="flex-1 flex overflow-hidden bg-[white] relative justify-center items-center z-10 bg-noise">
        <div className="flex flex-col gap-2 px-4 xl:ml-30 text-center md:text-start font-semibold">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <p className="text-yellow-500 text-6xl font-semibold font-serif tracking-tighter">
              RapidRide Taxi
            </p>
          </div>

          <form onSubmit={handleSignUp} className="">
            {/* Name Input */}
            <div className="flex flex-col mt-5 mb-1">
              <label htmlFor="name" className="text-black text-lg">
                Enter Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-[70%] bg-transparent mt-1 rounded-sm px-2 font-light text-black"
                value={inputs.name}
                onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
              />
            </div>

            {/* Email Input */}
            <div className="flex flex-col mt-5 mb-1">
              <label htmlFor="email" className="text-black text-lg">
                Enter Email
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                className="w-[70%] bg-transparent mt-1 rounded-sm px-2 font-light text-black"
                value={inputs.email}
                onChange={(e) =>
                  setInputs({ ...inputs, email: e.target.value })
                }
              />
            </div>

            {/* Location Input */}
            <div className="flex flex-col mt-5 mb-1">
              <label htmlFor="location" className="text-black text-lg">
                Enter Location (Optional)
              </label>
              <input
                type="text"
                placeholder="City"
                className="w-[70%] bg-transparent mt-1 rounded-sm px-2 font-light text-black"
                value={inputs.location}
                onChange={(e) =>
                  setInputs({ ...inputs, location: e.target.value })
                }
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col mt-5">
              <label htmlFor="password" className="text-black text-lg">
                Enter Password
              </label>
              <input
                type="password"
                className="w-[70%] bg-transparent border-b-[1px] mt-1 rounded-sm px-2 font-light text-black"
                value={inputs.password}
                onChange={(e) =>
                  setInputs({ ...inputs, password: e.target.value })
                }
              />
            </div>

            <p className="text-md mt-5 text-gray-700 mx-3">
              Already have an Account?
              <Link
                href="/login"
                className="mx-2 text-[#adc511] font-bold hover:underline"
              >
                Login
              </Link>
            </p>

            {/* Submit Button */}
            <div className="flex flex-row items-center mt-[50px]">
              {!loading && (
                <button className="bg-yellow-500 w-[40%] text-white px-4 py-2 rounded-lg font-semibold mr-2">
                  Sign Up
                </button>
              )}
              {loading && (
                <button
                  className="bg-yellow-500 w-[40%] text-white px-4 py-2 rounded-lg font-semibold mr-2"
                  disabled={true}
                >
                  Signing Up...
                </button>
              )}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleGoogleAuth}
                  className="bg-black text-white px-4 py-2 rounded-lg font-semibold flex gap-2"
                >
                  Sign In with{" "}
                  <span className="flex items-center">
                    <FcGoogle className="ml-1" size={20} />
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right Part */}
      <div className="flex-1 relative overflow-hidden justify-center items-center hidden md:flex">
        <Image
          src={"/daksh.jpg"}
          alt="Main"
          fill
          className="object-cover opacity-90 pointer-events-none select-none h-full"
        />
      </div>
    </div>
  );
};

export default Signup;
