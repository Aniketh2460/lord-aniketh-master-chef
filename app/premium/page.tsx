"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function PremiumPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true);
        setEmail(user.email || "");
      } else {
        router.push("/login");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center text-2xl">
        Checking Access...
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-yellow-400">
            Premium Recipes
          </h1>

          <p className="text-gray-400 mt-2">
            {email}
          </p>
        </div>

        <div className="flex gap-3">
          <a
            href="/"
            className="bg-blue-600 px-5 py-3 rounded font-bold"
          >
            Home
          </a>

          <button
            onClick={handleLogout}
            className="bg-red-600 px-5 py-3 rounded font-bold"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        <a
          href="/recipes/Hyderabadi Chicken Dum Biriyani.pdf"
          target="_blank"
          className="bg-yellow-600 p-4 rounded"
        >
          Hyderabadi Chicken Dum Biriyani
        </a>

        <a
          href="/recipes/Rogan Josh.pdf"
          target="_blank"
          className="bg-yellow-600 p-4 rounded"
        >
          Rogan Josh
        </a>

        <a
          href="/recipes/Chicken Chettinad.pdf"
          target="_blank"
          className="bg-yellow-600 p-4 rounded"
        >
          Chicken Chettinad
        </a>
      </div>

    </div>
  );
}