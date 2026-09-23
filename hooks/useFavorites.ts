"use client";

import { useEffect, useState } from "react";

export const FAVORITES_STORAGE_KEY = "hawapani_favorite_cities";
export const DEFAULT_FAVORITES = [
  "Bhaktapur",
  "Auckland",
  "Douglas, Isle of Man",
  "Canberra",
];

export function normalizeCity(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Migrates legacy entries (e.g. 'Douglas' -> 'Douglas, Isle of Man')
 */
export function migrateLegacyFavorites(items: string[]): string[] {
  return items.map((item) =>
    item.trim().toLowerCase() === "douglas" ? "Douglas, Isle of Man" : item,
  );
}

/**
 * Robust matching preventing false positives like 'Douglasville' matching 'Douglas'
 */
export function isFavoriteMatch(
  favorites: string[],
  city?: string | null,
  country?: string | null,
): boolean {
  if (!city) return false;
  const targetNorm = normalizeCity(city);
  const targetBase = targetNorm.split(",")[0].trim();
  const countryNorm = country ? normalizeCity(country) : "";

  return favorites.some((f) => {
    const fNorm = normalizeCity(f);
    // Exact match (e.g. "Douglas, Isle of Man" === "Douglas, Isle of Man")
    if (fNorm === targetNorm) return true;

    const fParts = fNorm.split(",").map((p) => p.trim());
    const fBase = fParts[0];
    const fCountry = fParts.length > 1 ? fParts[fParts.length - 1] : "";

    // Base city name must match exactly (prevent "Douglasville" matching "Douglas")
    if (fBase !== targetBase) return false;

    // If country is provided or in query, check country alignment
    if (countryNorm && fCountry) {
      return fCountry === countryNorm;
    }

    // If target string includes a country (e.g. "Douglas, Isle of Man")
    if (targetNorm.includes(",") && fCountry) {
      return targetNorm.includes(fCountry);
    }

    // If neither or only one specifies country, matching base city is considered a match
    return true;
  });
}

/**
 * Pure helper to add a city without duplicates
 */
export function addFavoriteEntry(
  favorites: string[],
  city: string,
  country?: string,
): string[] {
  const trimmed = city.trim();
  if (!trimmed) return favorites;
  const entry =
    country && !trimmed.includes(",") ? `${trimmed}, ${country}` : trimmed;
  if (isFavoriteMatch(favorites, entry, country)) {
    return favorites;
  }
  return [...favorites, entry];
}

/**
 * Pure helper to remove a city by exact or base matching
 */
export function removeFavoriteEntry(
  favorites: string[],
  city: string,
): string[] {
  const trimmedNorm = normalizeCity(city);
  return favorites.filter((f) => {
    const fNorm = normalizeCity(f);
    if (fNorm === trimmedNorm) return false;
    const fBase = fNorm.split(",")[0].trim();
    const targetBase = trimmedNorm.split(",")[0].trim();
    if (fBase === targetBase) {
      if (fNorm.includes(",") && trimmedNorm.includes(",")) {
        return fNorm !== trimmedNorm;
      }
      return false;
    }
    return true;
  });
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(DEFAULT_FAVORITES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = migrateLegacyFavorites(parsed);
          setFavorites(migrated);
          if (JSON.stringify(migrated) !== stored) {
            localStorage.setItem(
              FAVORITES_STORAGE_KEY,
              JSON.stringify(migrated),
            );
          }
        }
      } else {
        localStorage.setItem(
          FAVORITES_STORAGE_KEY,
          JSON.stringify(DEFAULT_FAVORITES),
        );
      }
    } catch {
      // Fallback to default favorites on storage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const persistFavorites = (updated: string[]) => {
    setFavorites(updated);
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage quota or disabled storage errors
    }
  };

  const addFavorite = (city: string, country?: string) => {
    const updated = addFavoriteEntry(favorites, city, country);
    if (updated !== favorites) {
      persistFavorites(updated);
    }
  };

  const removeFavorite = (city: string) => {
    const updated = removeFavoriteEntry(favorites, city);
    persistFavorites(updated);
  };

  const toggleFavorite = (city: string, country?: string) => {
    if (isFavoriteMatch(favorites, city, country)) {
      removeFavorite(
        country && !city.includes(",") ? `${city}, ${country}` : city,
      );
    } else {
      addFavorite(city, country);
    }
  };

  const isFavorite = (
    city?: string | null,
    country?: string | null,
  ): boolean => {
    return isFavoriteMatch(favorites, city, country);
  };

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
