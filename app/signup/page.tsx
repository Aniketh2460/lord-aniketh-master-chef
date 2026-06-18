"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await setDoc(
        doc(db, "users", userCredential.user.uid),
        {
          email: email,
          role: "user",
          premium: false,
          joinedAt: new Date().toISOString(),
        }
      );

      alert("Account Created Successfully");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl mb-6">
        Sign Up
      </h1>

      <input
        type="email"
        placeholder="Email"
        className="p-3 mb-3 rounded bg-white text-black"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="p-3 mb-3 rounded bg-white text-black"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSignup}
        className="bg-yellow-500 px-6 py-3 rounded text-black"
      >
        Create Account
      </button>
    </div>
  );
}