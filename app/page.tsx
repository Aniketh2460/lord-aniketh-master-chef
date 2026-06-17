import { recipes } from "./data/recipes";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-6xl font-bold tracking-wide text-yellow-400">
          Lord Aniketh Master Chef
        </h1>

        <p className="mt-6 max-w-3xl text-xl text-gray-300">
          Explore premium chef-crafted recipes from Lord Aniketh Master Chef.
          Click any recipe to open the complete PDF recipe with ingredients,
          quantities and cooking method.
        </p>

        <div className="mt-10 flex gap-4">
          <a
            href="#recipes"
            className="rounded-full bg-yellow-500 px-8 py-3 font-semibold text-black"
          >
            Explore Recipes
          </a>
        </div>
      </section>

      <section id="recipes" className="px-8 py-20">
        <h2 className="mb-12 text-center text-5xl font-bold text-yellow-400">
          Recipe Collection
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <a
              key={recipe.id}
              href={recipe.pdf}
              target="_blank"
              className="rounded-2xl border border-gray-800 bg-gray-950 p-6 transition hover:border-yellow-500 hover:scale-105"
            >
              <h3 className="text-2xl font-bold">{recipe.name}</h3>

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

              <div className="mt-6 text-yellow-400 font-semibold">
                📄 Open Recipe PDF →
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}