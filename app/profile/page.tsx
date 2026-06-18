"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email || "");

      const userDoc = await getDoc(
        doc(db, "users", user.uid)
      );

      if (userDoc.exists()) {
        const data = userDoc.data();
        setPremium(data.premium || false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const logout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center p-6">
      <div className="bg-gray-900 p-10 rounded-xl w-full max-w-md">

        <h1 className="text-4xl font-bold text-yellow-400 mb-6">
          User Dashboard
        </h1>

        <div className="space-y-6">

          <div>
            <p className="text-gray-400">Account Information</p>
            <p>{email}</p>
          </div>

          <div>
            <p className="text-gray-400">Premium Status</p>

            <p
              className={`font-semibold ${
                premium
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {premium ? "Premium User" : "Free User"}
            </p>
          </div>

          <div>
            <p className="text-gray-400">Membership Badge</p>

            <div
              className={`inline-block px-4 py-2 rounded-full mt-2 font-bold ${
                premium
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-700 text-white"
              }`}
            >
              {premium
                ? "PREMIUM MEMBER"
                : "FREE MEMBER"}
            </div>
          </div>

          <div>
            <p className="text-gray-400">Admin Access Control</p>

            <a
              href="/admin"
              className="inline-block mt-2 bg-purple-600 px-4 py-2 rounded"
            >
              Open Admin Dashboard
            </a>
          </div>

        </div>

        <div className="mt-8 flex gap-3 flex-wrap">

          <a
            href="/"
            className="bg-blue-600 px-4 py-2 rounded"
          >
            Home
          </a>

          <a
            href="/premium"
            className="bg-yellow-600 px-4 py-2 rounded"
          >
            Premium
          </a>

          <button
            onClick={logout}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Logout
          </button>

        </div>
      </div>
    </div>
  );
}