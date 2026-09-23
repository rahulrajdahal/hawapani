"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { analytics } from "@/lib/analytics/posthog";

export interface OfflineGameProps {
  /** Optional custom class name */
  className?: string;
  /** Callback fired when the user chooses to retry network connection */
  onRetryConnection?: () => void;
}

interface Obstacle {
  id: number;
  x: number; // percentage 0 to 100
  y: number; // percentage 0 to 100
  type: "cloud" | "lightning" | "sun";
  speed: number;
}

export default function OfflineGame({
  className = "",
  onRetryConnection,
}: OfflineGameProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerPosition, setPlayerPosition] = useState(50); // percentage

  const obstaclesRef = useRef<Obstacle[]>([]);
  const [renderObstacles, setRenderObstacles] = useState<Obstacle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const nextIdRef = useRef<number>(1);
  const playerXRef = useRef<number>(50);

  // Sync ref with player position for collision loop
  useEffect(() => {
    playerXRef.current = playerPosition;
  }, [playerPosition]);

  // Load high score from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hawapani_game_highscore");
      if (saved) setHighScore(parseInt(saved, 10) || 0);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const saveHighScore = (newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      try {
        localStorage.setItem("hawapani_game_highscore", String(newScore));
      } catch {
        // Ignore storage errors
      }
    }
  };

  const resetGame = () => {
    obstaclesRef.current = [];
    setRenderObstacles([]);
    setScore(0);
    setGameOver(false);
    setPlayerPosition(50);
    playerXRef.current = 50;
    setIsPlaying(true);
  };

  const movePlayer = useCallback((direction: "left" | "right") => {
    setPlayerPosition((prev) => {
      const step = 8;
      if (direction === "left") {
        return Math.max(8, prev - step);
      }
      return Math.min(92, prev + step);
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        movePlayer("left");
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        movePlayer("right");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, gameOver, movePlayer]);

  // Main animation loop
  useEffect(() => {
    if (!isPlaying || gameOver) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Spawn obstacles periodically
      if (currentTime - lastSpawnRef.current > 1100) {
        lastSpawnRef.current = currentTime;
        const isBonus = Math.random() < 0.25;
        const newObs: Obstacle = {
          id: nextIdRef.current++,
          x: Math.floor(Math.random() * 80) + 10,
          y: -5,
          type: isBonus ? "sun" : Math.random() < 0.3 ? "lightning" : "cloud",
          speed: 25 + Math.random() * 15,
        };
        obstaclesRef.current.push(newObs);
      }

      // Update obstacle positions
      const nextObstacles: Obstacle[] = [];
      let collision = false;
      let pointsAwarded = 0;

      for (const obs of obstaclesRef.current) {
        const nextY = obs.y + obs.speed * delta;

        // Collision detection with player at y ~ 85%
        const distanceX = Math.abs(obs.x - playerXRef.current);
        const distanceY = Math.abs(nextY - 85);

        if (distanceY < 7 && distanceX < 8) {
          if (obs.type === "sun") {
            pointsAwarded += 5;
            continue; // Sun collected!
          } else {
            collision = true;
            break;
          }
        }

        if (nextY < 105) {
          nextObstacles.push({ ...obs, y: nextY });
        } else {
          // Survived obstacle
          if (obs.type !== "sun") {
            pointsAwarded += 1;
          }
        }
      }

      if (collision) {
        setGameOver(true);
        setIsPlaying(false);
        saveHighScore(score);
        analytics.playOfflineGame(score);
        return;
      }

      if (pointsAwarded > 0) {
        setScore((prev) => {
          const updated = prev + pointsAwarded;
          saveHighScore(updated);
          return updated;
        });
      }

      obstaclesRef.current = nextObstacles;
      setRenderObstacles([...nextObstacles]);

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, gameOver, score]);

  return (
    <div
      role="region"
      aria-label="Offline Weather Mini-Game"
      className={`flex flex-col items-center justify-between w-full max-w-xl mx-auto rounded-3xl bg-white/85 backdrop-blur-xl border border-white/60 shadow-2xl p-4 sm:p-6 overflow-hidden ${className}`}
    >
      {/* Header status */}
      <div className="w-full flex items-center justify-between mb-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-800">
            You are currently offline
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <span>
            Score: <strong className="text-blue-600 font-bold">{score}</strong>
          </span>
          <span>
            Best:{" "}
            <strong className="text-amber-600 font-bold">{highScore}</strong>
          </span>
        </div>
      </div>

      {/* Game arena canvas/box */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl bg-gradient-to-b from-sky-100 to-blue-50 border border-blue-200/60 overflow-hidden shadow-inner select-none">
        {/* Falling elements */}
        {renderObstacles.map((obs) => (
          <div
            key={obs.id}
            style={{
              left: `${obs.x}%`,
              top: `${obs.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            className="absolute text-2xl sm:text-3xl transition-transform"
            aria-hidden="true"
          >
            {obs.type === "cloud" && "🌧️"}
            {obs.type === "lightning" && "⚡"}
            {obs.type === "sun" && "⭐"}
          </div>
        ))}

        {/* Player character */}
        <div
          style={{
            left: `${playerPosition}%`,
            top: "85%",
            transform: "translate(-50%, -50%)",
          }}
          className="absolute text-3xl sm:text-4xl transition-all duration-75"
          aria-label="Player umbrella"
        >
          ⛱️
        </div>

        {/* Start / Game Over Overlay */}
        {(!isPlaying || gameOver) && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center text-white z-20">
            {gameOver ? (
              <>
                <p className="text-2xl font-bold mb-1">Storm Caught You! ⛈️</p>
                <p className="text-sm text-white/80 mb-4">
                  Final Score:{" "}
                  <span className="font-bold text-amber-300">{score}</span>
                </p>
                <button
                  onClick={resetGame}
                  className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
                >
                  Play Again 🔄
                </button>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">⛅</div>
                <h3 className="text-lg sm:text-xl font-bold mb-1">
                  Weather Catcher Mini-Game
                </h3>
                <p className="text-xs sm:text-sm text-white/80 max-w-xs mb-4">
                  No cached weather available. Dodge rain clouds 🌧️ and collect
                  stars ⭐ while waiting for reconnection!
                </p>
                <button
                  onClick={resetGame}
                  className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
                >
                  Start Playing 🎮
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* On-screen control pads for mobile / touch */}
      <div className="w-full flex items-center justify-between mt-3 gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => movePlayer("left")}
            aria-label="Move left"
            className="flex h-10 w-12 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-lg font-bold text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition cursor-pointer"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => movePlayer("right")}
            aria-label="Move right"
            className="flex h-10 w-12 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-lg font-bold text-slate-700 hover:bg-slate-200 active:bg-slate-300 transition cursor-pointer"
          >
            →
          </button>
        </div>

        {onRetryConnection && (
          <button
            type="button"
            onClick={onRetryConnection}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 text-xs font-semibold hover:bg-blue-100 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Check Connection 📶
          </button>
        )}
      </div>
    </div>
  );
}
