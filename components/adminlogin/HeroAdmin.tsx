'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignInWithEmailAndPassword, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { auth, firestore } from '../../app/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

interface SignInInputs {
    email: string;
    password: string;
    location?: string; // Optional location for drivers
}

const HeroAdmin: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
    const [signInWithGoogle, googleError] = useSignInWithGoogle(auth);
    const router = useRouter();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!email || !password) {
            console.log("Please enter all required fields.");
            setLoading(false);
            return;
        }

        try {
            const userCred = await signInWithEmailAndPassword(email, password);
            if (userCred) {
                const docRef = doc(firestore, "drivers", userCred.user.uid); // Updated to "drivers"
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    // Check if the user is an admin
                    if (userData.role === 'admin') {
                        localStorage.setItem("user-info", JSON.stringify(userData));
                        router.push('/');
                    } else {
                        console.log("User is not an admin.");
                        // Optionally, handle non-admin users here
                    }
                } else {
                    console.log("No user data found!");
                }
            }
        } catch (error: any) {
            console.log(error.message);
        } finally {
            setLoading(false);
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

                    <p className="text-3xl md:text-2xl text-black">
                        Your{" "}
                        <span className="bg-yellow-500 px-2 font-bold text-black">
                            Quickest
                        </span>{" "}
                        Route to{" "}
                        <span className="bg-black px-2 font-bold text-white">
                            Anywhere
                        </span>{" "}
                        ,
                    </p>
                    <p className="text-2xl md:text-2xl mb-32 leading-snug text-black">
                        Navigate the{" "}
                        <span className="bg-yellow-500 font-bold px-2 text-black">City</span>{" "}
                        your way.{" "}
                    </p>

                    <form onSubmit={handleSignIn} className="-mt-[70px]">
                        {/* Email Input */}
                        <div className="flex flex-col mt-5 mb-1">
                            <label htmlFor="email" className="text-black text-lg">
                                Enter Email
                            </label>
                            <input
                                type="email"
                                placeholder="daksh@gmail.com"
                                className="w-[70%] bg-transparent border-b-[1px] mt-1 rounded-sm px-2 font-light text-black"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <p className="text-md mt-5 text-gray-700 mx-3">
                            A Driver?
                            <Link
                                href="/login"
                                className="mx-2 text-yellow-500 font-bold hover:underline"
                            >
                                Driver Login
                            </Link>
                        </p>

                        {/* Submit Button */}
                        <div className="flex flex-row items-center mt-[50px]">
                            {!loading && (
                                <button type="submit" className="bg-yellow-500 w-[40%] text-white px-4 py-2 rounded-lg font-semibold mr-2">
                                    Login
                                </button>
                            )}
                            {loading && (
                                <button
                                    className="bg-yellow-500 w-[40%] text-white px-4 py-2 rounded-lg font-semibold mr-2"
                                    disabled
                                >
                                    Logging In...
                                </button>
                            )}
                        </div>
                    </form>

                </div>
            </div>

            {/* Right Part */}
            <div className="flex-1 relative overflow-hidden justify-center items-center hidden md:flex">
                <Image
                    src={"/admin.jpg"}
                    alt="Main"
                    fill
                    className="object-cover opacity-90 pointer-events-none select-none h-full"
                />
            </div>
        </div>
    );
};

export default HeroAdmin;
