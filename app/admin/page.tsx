"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  const ADMIN_EMAIL = "test123new@gmail.com";

  const togglePremium = async (
    userId: string,
    currentStatus: boolean
  ) => {
    await updateDoc(doc(db, "users", userId), {
      premium: !currentStatus,
    });

    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              premium: !currentStatus,
            }
          : user
      )
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      if (user.email !== ADMIN_EMAIL) {
        router.push("/");
        return;
      }

      const querySnapshot = await getDocs(
        collection(db, "users")
      );

      const userList: any[] = [];

      querySnapshot.forEach((docSnap) => {
        userList.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });

      setUsers(userList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading Dashboard...
      </div>
    );
  }

  const premiumUsers = users.filter(
    (user) => user.premium === true
  );

  return (
    <div className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-bold text-yellow-400 mb-10">
        Admin Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 mb-10">

        <div className="bg-gray-900 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-3">
            Total Users
          </h2>

          <p className="text-4xl text-yellow-400">
            {users.length}
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-3">
            Premium Members
          </h2>

          <p className="text-4xl text-yellow-400">
            {premiumUsers.length}
          </p>
        </div>

      </div>

      <div className="bg-gray-900 p-6 rounded-xl">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6">
          Registered Users
        </h2>

        <div className="space-y-4">

          {users.map((user) => (
            <div
              key={user.id}
              className="border border-gray-700 rounded-lg p-4"
            >
              <p>
                <strong>Email:</strong> {user.email}
              </p>

              <p>
                <strong>Role:</strong> {user.role}
              </p>

              <p>
                <strong>Premium:</strong>{" "}
                {user.premium ? "✅ Yes" : "❌ No"}
              </p>

              <button
                onClick={() =>
                  togglePremium(
                    user.id,
                    user.premium
                  )
                }
                className={`mt-3 px-4 py-2 rounded ${
                  user.premium
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
              >
                {user.premium
                  ? "Remove Premium"
                  : "Make Premium"}
              </button>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
}