"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login Successful");
      router.push("/premium");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-4xl font-bold text-yellow-400 mb-8">
        Login
      </h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-80 p-3 mb-4 rounded bg-white text-black"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-80 p-3 mb-4 rounded bg-white text-black"
      />

      <button
        onClick={handleLogin}
        className="bg-yellow-500 text-black px-8 py-3 rounded-full font-bold"
      >
        Login
      </button>

      <a
        href="/signup"
        className="mt-4 text-blue-400 underline"
      >
        Don't have an account? Sign Up
      </a>
    </div>
  );
}