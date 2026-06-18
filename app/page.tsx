"use client";

import { useState } from "react";
import { recipes } from "./data/recipes";

export default function Home() {
  const [search, setSearch] = useState("");
const [category, setCategory] = useState("All");
  const filteredRecipes = recipes.filter((recipe) => {
  const matchesSearch =
    recipe.name.toLowerCase().includes(search.toLowerCase()) ||
    recipe.cuisine.toLowerCase().includes(search.toLowerCase()) ||
    recipe.category.toLowerCase().includes(search.toLowerCase());

  const matchesCategory =
  category === "All" ||
  recipe.category.toLowerCase() === category.toLowerCase() ||
  recipe.type.toLowerCase() === category.toLowerCase();

  return matchesSearch && matchesCategory;
});

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-6xl font-bold tracking-wide text-yellow-400">
          Lord Aniketh Master Chef
        </h1>

        <p className="mt-6 max-w-3xl text-xl text-gray-300">
          Explore chef-crafted recipes from Lord Aniketh Master Chef.
          Click any recipe to open the complete PDF recipe with ingredients,
          quantities and cooking method.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#recipes"
            className="rounded-full bg-yellow-500 px-8 py-3 font-semibold text-black"
          >
            Explore Recipes
          </a>

          <a
            href="/login"
            className="rounded-full bg-blue-600 px-8 py-3 font-semibold text-white"
          >
            Login
          </a>

          <a
            href="/signup"
            className="rounded-full bg-green-600 px-8 py-3 font-semibold text-white"
          >
            Sign Up
          </a>
        </div>
      </section>

      {/* Recipe Collection */}
      <section id="recipes" className="px-8 py-20">
        <h2 className="mb-6 text-center text-5xl font-bold text-yellow-400">
          Recipe Collection
        </h2>

        <p className="text-center text-gray-400 mb-8">
          {filteredRecipes.length} Recipes Found
        </p>

        <div className="mb-10">
          <input
            type="text"
            placeholder="🔍 Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-700 bg-gray-900 p-4 text-white"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-10">
  <button
    onClick={() => setCategory("All")}
    className="bg-yellow-500 text-black px-4 py-2 rounded"
  >
    All
  </button>

  <button
    onClick={() => setCategory("Biryani")}
    className="bg-gray-800 px-4 py-2 rounded"
  >
    Biryani
  </button>

  <button
    onClick={() => setCategory("Main Course")}
    className="bg-gray-800 px-4 py-2 rounded"
  >
    Main Course
  </button>

  <button
    onClick={() => setCategory("Starter")}
    className="bg-gray-800 px-4 py-2 rounded"
  >
    Starter
  </button>

  <button
    onClick={() => setCategory("Veg")}
    className="bg-gray-800 px-4 py-2 rounded"
  >
    Veg
  </button>

  <button
    onClick={() => setCategory("Non-Veg")}
    className="bg-gray-800 px-4 py-2 rounded"
  >
    Non-Veg
  </button>
</div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <a
              key={recipe.id}
              href={recipe.pdf}
              target="_blank"
              className="rounded-2xl border border-gray-800 bg-gray-950 p-6 transition hover:scale-105 hover:border-yellow-500"
            >
              <h3 className="text-2xl font-bold">
                {recipe.name}
              </h3>

              <p className="mt-2 text-yellow-400">
                {recipe.category}
              </p>

              <p className="mt-4 text-gray-400">
                {recipe.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-yellow-500 px-3 py-1 text-sm text-black">
                  {recipe.cuisine}
                </span>

                <span className="rounded-full border border-yellow-500 px-3 py-1 text-sm">
                  {recipe.type}
                </span>
              </div>

              <div className="mt-6 font-semibold text-yellow-400">
                📄 Open Recipe PDF →
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* AI Chef Assistant */}
      <section className="bg-gray-950 px-8 py-20">
        <h2 className="text-center text-5xl font-bold text-yellow-400">
          AI Chef Assistant
        </h2>

        <div className="mx-auto mt-10 max-w-3xl">
          <textarea
            placeholder="Ask AI anything... Example: How do I make Hyderabadi Biryani for 10 people?"
            className="h-40 w-full rounded-xl border border-gray-700 bg-black p-4 text-white"
          />

          <button className="mt-4 rounded-full bg-yellow-500 px-8 py-3 font-bold text-black">
            Ask AI Chef
          </button>
        </div>
      </section>

      {/* AI Meal Planner */}
      <section className="px-8 py-20 text-center">
        <h2 className="text-5xl font-bold text-yellow-400">
          AI Meal Planner
        </h2>

        <p className="mt-6 text-gray-300">
          Generate smart weekly meal plans using AI.
        </p>

        <button className="mt-8 rounded-full bg-yellow-500 px-8 py-3 font-bold text-black">
          Generate Weekly Meal Plan
        </button>
      </section>

      {/* Premium Membership */}
      <section className="bg-gray-950 px-8 py-20 text-center">
        <h2 className="text-5xl font-bold text-yellow-400">
          Premium Membership
        </h2>

        <p className="mt-6 text-gray-300">
          Unlock exclusive recipes, AI meal plans, premium chef secrets,
          nutrition analysis and future AI tools.
        </p>

        <a
          href="/premium"
          className="mt-8 inline-block rounded-full bg-yellow-500 px-10 py-4 font-bold text-black"
        >
          Join Premium
        </a>
      </section>

      {/* Features */}
      <section className="px-8 py-20">
        <h2 className="mb-12 text-center text-5xl font-bold text-yellow-400">
          Upcoming AI Features
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
            🤖 AI Recipe Generator
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
            📸 Ingredient Photo Scanner
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
            🥗 Nutrition Calculator
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
            🛒 Grocery List Generator
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
            🎤 Voice Chef Assistant
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
            👑 Premium AI Dashboard
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800 py-10 text-center text-gray-400">
        © 2026 Lord Aniketh Master Chef. All Rights Reserved.
      </footer>

    </main>
  );
}