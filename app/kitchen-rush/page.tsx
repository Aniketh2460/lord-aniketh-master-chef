"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MenuItem = {
  id: string;
  name: string;
  emoji: string;
  price: number;
  xp: number;
  accent: string;
  glow: string;
};

type Customer = {
  id: string;
  name: string;
  order: MenuItem;
  patience: number;
};

type Particle = {
  id: string;
  x: number;
  y: number;
  color: string;
  dx: number;
  dy: number;
};

type Achievement = {
  key: string;
  label: string;
  icon: string;
  unlocked: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: "butter-chicken",
    name: "Butter Chicken",
    emoji: "🍛",
    price: 26,
    xp: 12,
    accent: "from-amber-500 to-orange-500",
    glow: "shadow-orange-500/20",
  },
  {
    id: "paneer-tikka",
    name: "Paneer Tikka",
    emoji: "🥘",
    price: 18,
    xp: 9,
    accent: "from-rose-500 to-pink-500",
    glow: "shadow-rose-500/20",
  },
  {
    id: "biryani",
    name: "Hyderabadi Biryani",
    emoji: "🍚",
    price: 32,
    xp: 15,
    accent: "from-yellow-500 to-amber-400",
    glow: "shadow-yellow-500/20",
  },
  {
    id: "sushi-roll",
    name: "Sushi Roll",
    emoji: "🍣",
    price: 22,
    xp: 10,
    accent: "from-cyan-500 to-sky-500",
    glow: "shadow-cyan-500/20",
  },
  {
    id: "pasta",
    name: "Truffle Pasta",
    emoji: "🍝",
    price: 20,
    xp: 9,
    accent: "from-violet-500 to-fuchsia-500",
    glow: "shadow-violet-500/20",
  },
  {
    id: "pizza",
    name: "Chef Pizza",
    emoji: "🍕",
    price: 24,
    xp: 11,
    accent: "from-emerald-500 to-lime-500",
    glow: "shadow-emerald-500/20",
  },
];

const CUSTOMER_NAMES = [
  "Avery",
  "Noah",
  "Mila",
  "Leo",
  "Zoe",
  "Ethan",
  "Mia",
  "Harper",
  "Lucas",
  "Emma",
];

const DAILY_CHALLENGES = [
  { key: "serve", title: "Serve 5 dishes", target: 5, reward: 40 },
  { key: "combo", title: "Reach combo x4", target: 4, reward: 50 },
  { key: "coins", title: "Earn 120 coins", target: 120, reward: 60 },
  { key: "level", title: "Reach level 3", target: 3, reward: 70 },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export default function KitchenRushPage() {
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedDish, setSelectedDish] = useState<MenuItem>(MENU_ITEMS[0]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [achievementUnlocked, setAchievementUnlocked] = useState<Achievement[]>([
    { key: "first", label: "First Feast", icon: "🥇", unlocked: false },
    { key: "speed", label: "Speed Chef", icon: "⚡", unlocked: false },
    { key: "combo", label: "Combo King", icon: "🔥", unlocked: false },
    { key: "legend", label: "Legend Chef", icon: "👨‍🍳", unlocked: false },
  ]);
  const [shopLevel, setShopLevel] = useState(0);
  const [powerups, setPowerups] = useState({
    turbo: { active: false, timeLeft: 0 },
    fever: { active: false, timeLeft: 0 },
  });
  const [message, setMessage] = useState("Ready to serve the rush!");
  const [audioReady, setAudioReady] = useState(false);
  const [dailySeed, setDailySeed] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const particleTimerRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const totalServed = useRef(0);
  const challengeRewardClaimed = useRef(false);

  const challenge = DAILY_CHALLENGES[challengeIndex];
  const bonusMultiplier = 1 + Math.min(shopLevel, 3) * 0.1;
  const serverRate = 1 + Math.min(shopLevel, 4) * 0.15;
  const activeTurbo = powerups.turbo.active;
  const activeFever = powerups.fever.active;

  const progressPercent = Math.min(
    100,
    Math.round((challengeProgress / challenge.target) * 100)
  );

  const initAudio = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!audioContextRef.current) {
      audioContextRef.current = new window.AudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    setAudioReady(true);
  }, []);

  const playTone = useCallback(
    (type: "click" | "success" | "fail" | "powerup") => {
      if (typeof window === "undefined") return;
      if (!audioReady && !audioContextRef.current) {
        initAudio();
      }
      const ctx = audioContextRef.current;
      if (!ctx) return;
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.connect(ctx.destination);
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.03, now + 0.01);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      const osc = ctx.createOscillator();
      osc.connect(master);
      if (type === "success") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
      } else if (type === "fail") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
      } else if (type === "powerup") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.exponentialRampToValueAtTime(784, now + 0.18);
      } else {
        osc.type = "square";
        osc.frequency.setValueAtTime(440, now);
      }

      osc.start(now);
      osc.stop(now + 0.18);
    },
    [audioReady, initAudio]
  );

  const createCustomer = useCallback(() => {
    const order = randomItem(MENU_ITEMS);
    return {
      id: `${Date.now()}-${Math.random()}`,
      name: randomItem(CUSTOMER_NAMES),
      order,
      patience: 100 - Math.min(level * 7, 35),
    };
  }, [level]);

  const spawnParticles = useCallback((x: number, y: number, color: string) => {
    const nextParticles = Array.from({ length: 10 }, (_, index) => ({
      id: `${Date.now()}-${index}`,
      x,
      y,
      color,
      dx: (Math.random() - 0.5) * 8,
      dy: (Math.random() - 0.5) * 8,
    }));
    setParticles((prev) => [...prev, ...nextParticles]);
  }, []);

  const updateAchievements = useCallback((nextCoins: number, nextLevel: number, nextCombo: number, nextServed: number) => {
    setAchievementUnlocked((prev) =>
      prev.map((achievement) => {
        if (achievement.key === "first" && nextCoins >= 50 && !achievement.unlocked) {
          setMessage("Achievement unlocked: First Feast!");
          playTone("powerup");
          return { ...achievement, unlocked: true };
        }
        if (achievement.key === "speed" && nextServed >= 5 && !achievement.unlocked) {
          setMessage("Achievement unlocked: Speed Chef!");
          playTone("powerup");
          return { ...achievement, unlocked: true };
        }
        if (achievement.key === "combo" && nextCombo >= 5 && !achievement.unlocked) {
          setMessage("Achievement unlocked: Combo King!");
          playTone("powerup");
          return { ...achievement, unlocked: true };
        }
        if (achievement.key === "legend" && nextLevel >= 4 && !achievement.unlocked) {
          setMessage("Achievement unlocked: Legend Chef!");
          playTone("powerup");
          return { ...achievement, unlocked: true };
        }
        return achievement;
      })
    );
  }, [playTone]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = Number(window.localStorage.getItem("kitchenRushHighScore") || 0);
      setHighScore(Number.isFinite(saved) ? saved : 0);
      setDailySeed(Math.floor(Date.now() / 86400000));
    }
  }, []);

  useEffect(() => {
    setChallengeIndex(dailySeed % DAILY_CHALLENGES.length);
  }, [dailySeed]);

  useEffect(() => {
    if (challengeIndex !== undefined) {
      setChallengeProgress(0);
      setChallengeCompleted(false);
      challengeRewardClaimed.current = false;
    }
  }, [challengeIndex]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("kitchenRushHighScore", String(highScore));
    }
  }, [highScore]);

  useEffect(() => {
    if (gameOver) return;
    if (paused) return;

    intervalRef.current = window.setInterval(() => {
      setCustomers((prev) => {
        const next = prev
          .map((customer) => ({
            ...customer,
            patience: customer.patience - (activeTurbo ? 0.7 : 1.2) - serverRate * 0.1,
          }))
          .filter((customer) => customer.patience > 0);

        if (next.length < prev.length) {
          setLives((current) => {
            const updated = Math.max(0, current - (prev.length - next.length));
            if (updated <= 0) {
              setGameOver(true);
              setPaused(true);
              setMessage("The rush won today — restart and try again!");
            }
            return updated;
          });
          setMessage("A customer left unhappy.");
          playTone("fail");
        }
        return next;
      });
    }, 180);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [activeTurbo, gameOver, paused, playTone, serverRate]);

  useEffect(() => {
    if (gameOver || paused) return;

    const spawnId = window.setInterval(() => {
      setCustomers((prev) => {
        if (prev.length >= 5) return prev;
        return [...prev, createCustomer()];
      });
    }, 1800);

    return () => window.clearInterval(spawnId);
  }, [createCustomer, gameOver, paused]);

  useEffect(() => {
    if (!paused && !gameOver) {
      const powerId = window.setInterval(() => {
        setPowerups((prev) => ({
          turbo: prev.turbo.timeLeft > 0
            ? { ...prev.turbo, timeLeft: prev.turbo.timeLeft - 1 }
            : { active: false, timeLeft: 0 },
          fever: prev.fever.timeLeft > 0
            ? { ...prev.fever, timeLeft: prev.fever.timeLeft - 1 }
            : { active: false, timeLeft: 0 },
        }));
      }, 1000);
      return () => window.clearInterval(powerId);
    }
  }, [paused, gameOver]);

  useEffect(() => {
    const particleId = window.setInterval(() => {
      setParticles((prev) => prev.filter((particle) => particle.x < 1100 && particle.y < 700));
    }, 120);

    return () => window.clearInterval(particleId);
  }, []);

  useEffect(() => {
    if (particles.length > 0) {
      const animate = window.setInterval(() => {
        setParticles((prev) =>
          prev
            .map((particle) => ({
              ...particle,
              x: particle.x + particle.dx,
              y: particle.y + particle.dy,
              dx: particle.dx * 0.92,
              dy: particle.dy * 0.92,
            }))
            .filter(
              (particle) =>
                particle.x > 0 &&
                particle.x < 1100 &&
                particle.y > 0 &&
                particle.y < 700
            )
        );
      }, 30);
      return () => window.clearInterval(animate);
    }
  }, [particles.length]);

  useEffect(() => {
    setLevel(Math.floor(xp / 80) + 1);
  }, [xp]);

  useEffect(() => {
    setHighScore((prev) => Math.max(prev, coins));
  }, [coins]);

  useEffect(() => {
    updateAchievements(coins, level, combo, totalServed.current);
  }, [coins, combo, level, updateAchievements]);

  const serveDish = useCallback(() => {
    const matching = customers.find((customer) => customer.order.id === selectedDish.id);

    if (!matching) {
      setMessage(`No ${selectedDish.name} orders right now.`);
      playTone("click");
      return;
    }

    const reward = Math.round(
      (selectedDish.price + combo * 3) * (activeFever ? 1.5 : 1) * bonusMultiplier
    );
    const rewardXp = Math.round(
      (selectedDish.xp + Math.min(combo, 3) * 2) * (activeFever ? 1.2 : 1)
    );

    setCoins((prev) => prev + reward);
    setXp((prev) => prev + rewardXp);
    setCombo((prev) => prev + 1);
    setCustomers((prev) => prev.filter((customer) => customer.id !== matching.id));
    setMessage(`Served ${matching.name} a ${selectedDish.name}!`);
    spawnParticles(300 + Math.random() * 300, 220, selectedDish.accent.includes("amber") ? "#fbbf24" : selectedDish.accent.includes("rose") ? "#fda4af" : "#f8fafc");
    playTone("success");
    totalServed.current += 1;

    const nextProgress = challengeProgress + 1;
    setChallengeProgress(nextProgress);
    if (nextProgress >= challenge.target && !challengeCompleted) {
      setChallengeCompleted(true);
      setCoins((prev) => prev + challenge.reward);
      setMessage(`Daily challenge complete: ${challenge.title}`);
      playTone("powerup");
    }
    if (totalServed.current >= 5) {
      setAchievementUnlocked((prev) => prev.map((a) => (a.key === "speed" ? { ...a, unlocked: true } : a)));
    }
  }, [activeFever, bonusMultiplier, challenge, challengeCompleted, challengeProgress, combo, customers, playTone, selectedDish, spawnParticles]);

  const activatePowerup = useCallback((type: "turbo" | "fever") => {
    if (type === "turbo" && coins >= 30) {
      setCoins((prev) => prev - 30);
      setPowerups((prev) => ({
        ...prev,
        turbo: { active: true, timeLeft: 10 },
      }));
      setMessage("Turbo mode activated!");
      playTone("powerup");
    }

    if (type === "fever" && coins >= 40) {
      setCoins((prev) => prev - 40);
      setPowerups((prev) => ({
        ...prev,
        fever: { active: true, timeLeft: 8 },
      }));
      setMessage("Fever mode activated!");
      playTone("powerup");
    }
  }, [coins, playTone]);

  const upgradeShop = useCallback((type: "speed" | "boost") => {
    if (type === "speed" && coins >= 50) {
      setCoins((prev) => prev - 50);
      setShopLevel((prev) => prev + 1);
      setMessage("Kitchen speed upgraded.");
      playTone("click");
    }
    if (type === "boost" && coins >= 60) {
      setCoins((prev) => prev - 60);
      setShopLevel((prev) => prev + 1);
      setMessage("Chef mastery boosted.");
      playTone("click");
    }
  }, [coins, playTone]);

  const restartGame = useCallback(() => {
    setCoins(0);
    setXp(0);
    setLevel(1);
    setCombo(0);
    setLives(3);
    setCustomers([]);
    setParticles([]);
    setPaused(false);
    setGameOver(false);
    setChallengeProgress(0);
    setChallengeCompleted(false);
    challengeRewardClaimed.current = false;
    totalServed.current = 0;
    setMessage("Fresh kitchen, fresh rush!");
    setPowerups({ turbo: { active: false, timeLeft: 0 }, fever: { active: false, timeLeft: 0 } });
    setAchievementUnlocked([
      { key: "first", label: "First Feast", icon: "🥇", unlocked: false },
      { key: "speed", label: "Speed Chef", icon: "⚡", unlocked: false },
      { key: "combo", label: "Combo King", icon: "🔥", unlocked: false },
      { key: "legend", label: "Legend Chef", icon: "👨‍🍳", unlocked: false },
    ]);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const onMouseMove = (event: MouseEvent) => {
        mouseRef.current = { x: event.clientX, y: event.clientY };
      };
      window.addEventListener("mousemove", onMouseMove);
      return () => window.removeEventListener("mousemove", onMouseMove);
    }
  }, []);

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#0b0f14] text-slate-50"
      onClick={() => initAudio()}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.08),_transparent_18%),linear-gradient(180deg,#0b0f14_0%,#111827_45%,#09090b_100%)]" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-5%] top-[-10%] h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute right-[-4%] top-[15%] h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-[-10%] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            transform: "perspective(900px) rotateX(65deg) translateY(10%)",
          }}
        />
      </div>
      <div className="absolute inset-0">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            className="absolute h-1.5 w-1.5 rounded-full bg-amber-300/80"
            style={{
              left: `${(index * 7) % 100}%`,
              top: `${(index * 13) % 100}%`,
              animation: `pulse ${2 + (index % 4)}s infinite`,
              opacity: 0.2 + (index % 5) * 0.1,
            }}
          />
        ))}
      </div>
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute h-2 w-2 rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            backgroundColor: particle.color,
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 10px ${particle.color}`,
          }}
        />
      ))}
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-3 pb-8 pt-4 sm:px-5 lg:px-8">
        <header className="mb-4 flex flex-col gap-3 rounded-3xl border border-amber-400/10 bg-slate-900/70 p-4 shadow-2xl shadow-amber-500/5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-amber-300/80">Kitchen Rush</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Lord Aniketh Master Chef</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaused((prev) => !prev)}
              className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm font-medium text-slate-50 transition hover:border-amber-400/40"
            >
              {paused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={restartGame}
              className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Restart
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-200">Lv {level}</span>
                <span className="rounded-2xl bg-sky-500/10 px-3 py-1 text-sm font-semibold text-sky-200">XP {xp}</span>
                <span className="rounded-2xl bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-200">Combo x{combo}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-yellow-500/10 px-3 py-1 text-sm font-semibold text-yellow-200">💰 {coins}</span>
                <span className="rounded-2xl bg-rose-500/10 px-3 py-1 text-sm font-semibold text-rose-200">❤️ {lives}</span>
                <span className="rounded-2xl bg-violet-500/10 px-3 py-1 text-sm font-semibold text-violet-200">🏆 {highScore}</span>
              </div>
            </div>
            <div className="relative h-[420px] overflow-hidden rounded-3xl border border-slate-800 bg-[linear-gradient(180deg,#0f172a_0%,#111827_45%,#0b1120_100%)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(251,191,36,0.08),transparent_12%)]" />
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-amber-400/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-500/5 to-transparent" />
              <div className="absolute left-3 top-3 rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-200">Service Counter</div>
              <div className="absolute right-3 top-3 rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-200">Queue {customers.length}/5</div>

              <div className="absolute left-0 right-0 top-16 grid gap-3 px-3 sm:grid-cols-2">
                {customers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className="relative rounded-2xl border border-slate-700 bg-slate-900/90 p-3 shadow-lg shadow-slate-950/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{customer.name}</p>
                        <p className="text-xs text-slate-400">Ordered {customer.order.name}</p>
                      </div>
                      <span className="text-xl">{customer.order.emoji}</span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all"
                        style={{ width: `${customer.patience}%` }}
                      />
                    </div>
                    <div className="mt-1 text-right text-[10px] text-slate-400">Patience {Math.round(customer.patience)}%</div>
                    <div className="absolute -left-1 top-3 h-8 w-1 rounded-full bg-amber-400" />
                  </div>
                ))}
              </div>

              <div className="absolute bottom-5 left-1/2 flex w-[92%] -translate-x-1/2 items-center justify-between rounded-3xl border border-amber-400/15 bg-slate-900/80 p-3 backdrop-blur-xl">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">Selected dish</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-2xl">{selectedDish.emoji}</span>
                    <span className="font-semibold text-white">{selectedDish.name}</span>
                  </div>
                </div>
                <button
                  onClick={serveDish}
                  className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-3 text-sm font-semibold text-slate-950"
                >
                  Serve Order
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 backdrop-blur-xl">
              <h2 className="text-sm uppercase tracking-[0.35em] text-slate-400">Menu</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {MENU_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedDish(item)}
                    className={`rounded-2xl border p-3 text-left transition ${selectedDish.id === item.id ? "border-amber-400/70 bg-amber-500/10" : "border-slate-700 bg-slate-900/80 hover:border-slate-500"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-xs text-amber-200">+{item.xp} XP</span>
                    </div>
                    <p className="mt-2 font-medium text-white">{item.name}</p>
                    <p className="text-sm text-slate-400">💰 {item.price}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 backdrop-blur-xl">
              <h2 className="text-sm uppercase tracking-[0.35em] text-slate-400">Power-Ups</h2>
              <div className="mt-3 grid gap-2">
                <button
                  onClick={() => activatePowerup("turbo")}
                  className="flex items-center justify-between rounded-2xl bg-slate-900 px-3 py-2 text-sm text-slate-50"
                >
                  <span>⚡ Turbo</span>
                  <span>30 coins</span>
                </button>
                <button
                  onClick={() => activatePowerup("fever")}
                  className="flex items-center justify-between rounded-2xl bg-slate-900 px-3 py-2 text-sm text-slate-50"
                >
                  <span>🔥 Fever</span>
                  <span>40 coins</span>
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 backdrop-blur-xl">
              <h2 className="text-sm uppercase tracking-[0.35em] text-slate-400">Daily Challenge</h2>
              <div className="mt-3 rounded-2xl bg-slate-900 p-3">
                <p className="text-sm font-medium text-white">{challenge.title}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>{challengeProgress}/{challenge.target}</span>
                  <span>Reward {challenge.reward} coins</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 backdrop-blur-xl">
              <h2 className="text-sm uppercase tracking-[0.35em] text-slate-400">Shop</h2>
              <div className="mt-3 grid gap-2">
                <button onClick={() => upgradeShop("speed")} className="flex items-center justify-between rounded-2xl bg-slate-900 px-3 py-2 text-sm text-slate-50">
                  <span>⚙️ Speed Upgrade</span>
                  <span>50 coins</span>
                </button>
                <button onClick={() => upgradeShop("boost")} className="flex items-center justify-between rounded-2xl bg-slate-900 px-3 py-2 text-sm text-slate-50">
                  <span>🧠 Chef Boost</span>
                  <span>60 coins</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-sm uppercase tracking-[0.35em] text-slate-400">Achievements</h2>
              <span className="text-xs text-slate-400">{achievementUnlocked.filter((a) => a.unlocked).length}/{achievementUnlocked.length}</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {achievementUnlocked.map((achievement) => (
                <div key={achievement.key} className={`rounded-2xl p-3 ${achievement.unlocked ? "bg-amber-500/10" : "bg-slate-900"}`}>
                  <span className="text-xl">{achievement.icon}</span>
                  <p className={`mt-1 text-sm font-medium ${achievement.unlocked ? "text-amber-100" : "text-slate-500"}`}>{achievement.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Status</p>
            <p className="mt-2 text-sm text-slate-200">{message}</p>
            <div className="mt-3 flex gap-2">
              {activeTurbo && <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-100">Turbo {powerups.turbo.timeLeft}s</span>}
              {activeFever && <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-100">Fever {powerups.fever.timeLeft}s</span>}
            </div>
          </div>
        </section>
      </div>

      {paused && !gameOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="rounded-3xl border border-slate-700 bg-slate-900 px-8 py-6 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-amber-300">Paused</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Take a breath, chef</h2>
            <button
              onClick={() => setPaused(false)}
              className="mt-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 font-semibold text-slate-950"
            >
              Resume Game
            </button>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="w-[90%] max-w-md rounded-3xl border border-rose-500/20 bg-slate-900 p-6 text-center shadow-2xl shadow-rose-500/10">
            <p className="text-xs uppercase tracking-[0.4em] text-rose-300">Game Over</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Kitchen Rush Ended</h2>
            <p className="mt-2 text-sm text-slate-300">Final score: {coins} coins</p>
            <button
              onClick={restartGame}
              className="mt-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 font-semibold text-slate-950"
            >
              Restart Game
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
