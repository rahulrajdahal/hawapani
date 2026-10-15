"use client";

import { pinIcon, searchIcon } from "@/assets/icons";
import { useDebounce } from "@/hooks/useDebounce";
import { ISearchLocation } from "@/lib/types/weather";
import Popover from "../Popover/Popover";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Input } from "..";

export interface SearchInputProps extends React.ComponentProps<'div'> {}

export default function SearchInput({ className = '', ...props }: SearchInputProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");
  const debouncedQuery = useDebounce(inputValue, 300);

  const [suggestions, setSuggestions] = useState<ISearchLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep input synchronized with URL params
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setInputValue(q);
      setSelectedCity(q);
      setIsOpen(false);
      setSuggestions([]);
      setActiveIndex(-1);
    }
  }, [searchParams]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  // Trigger search on debounced query change
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (
      !trimmed ||
      trimmed === searchParams.get("q") ||
      trimmed === selectedCity
    ) {
      setSuggestions([]);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    let isCancelled = false;
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/weather/search?q=${encodeURIComponent(trimmed)}`
        );
        const responseJson = await response.json();

        if (isCancelled) return;

        if (responseJson?.error) {
          toast.error(responseJson.error);
        } else if (Array.isArray(responseJson?.data)) {
          setSuggestions(responseJson.data);
          setActiveIndex(-1);
          if (responseJson.data.length > 0 && trimmed !== selectedCity) {
            setIsOpen(true);
          }
        }
      } catch {
        if (!isCancelled) {
          toast.error("Failed to load location suggestions.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery, searchParams, selectedCity]);

  const handleInputChange = (val: string | number) => {
    const strVal = String(val);
    setInputValue(strVal);
    setSelectedCity(null);
    setActiveIndex(-1);
    if (!isOpen && strVal.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const handleLocate = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    toast.loading("Detecting your location...", { id: "locate-status" });

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        toast.dismiss("locate-status");
        const { latitude, longitude } = coords;
        const coordsStr = `${latitude},${longitude}`;
        setSelectedCity(coordsStr);
        setIsOpen(false);
        setSuggestions([]);
        router.push(pathname + "?" + createQueryString("q", coordsStr));
      },
      (error) => {
        toast.dismiss("locate-status");
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please search manually.");
        } else {
          toast.error("Unable to detect location. Please try again.");
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSuggestionOnClick = (name: string) => {
    setSelectedCity(name);
    setInputValue(name);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    router.push(pathname + "?" + createQueryString("q", name));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isArrowDown =
      e.key === "ArrowDown" ||
      e.key === "Down" ||
      e.code === "ArrowDown" ||
      e.keyCode === 40;

    const isArrowUp =
      e.key === "ArrowUp" ||
      e.key === "Up" ||
      e.code === "ArrowUp" ||
      e.keyCode === 38;

    const isEnter =
      e.key === "Enter" ||
      e.code === "Enter" ||
      e.keyCode === 13;

    const isEscape =
      e.key === "Escape" ||
      e.code === "Escape" ||
      e.keyCode === 27;

    if (isArrowDown) {
      if (suggestions.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      }
      return;
    }

    if (isArrowUp) {
      if (suggestions.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      }
      return;
    }

    if (isEnter) {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSuggestionOnClick(suggestions[activeIndex].name);
      } else if (inputValue.trim()) {
        router.push(
          pathname + "?" + createQueryString("q", inputValue.trim())
        );
        setIsOpen(false);
      }
      return;
    }

    if (isEscape) {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleClear = () => {
    setInputValue("");
    setSelectedCity(null);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const isPopoverVisible = isOpen && (suggestions.length > 0 || loading);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-between w-full rounded-2xl border border-[#C3D0DD] bg-white p-2 sm:p-2.5 shadow-xs transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30 ${className}`}
    >
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <Image
          src={searchIcon}
          alt=""
          aria-hidden="true"
          width={20}
          height={20}
          className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0 ml-1"
        />

        <Popover.Root
          open={isPopoverVisible}
          onOpenChange={setIsOpen}
          modal={false}
        >
          <Popover.Anchor asChild>
            <div className="w-full flex-1 min-w-0">
              <Input
                ref={inputRef}
                type="search"
                debounce={0}
                value={inputValue}
                onChangeValue={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0 && !selectedCity) {
                    setIsOpen(true);
                  }
                }}
                role="combobox"
                aria-expanded={isPopoverVisible}
                aria-haspopup="listbox"
                aria-controls="location-suggestions-listbox"
                aria-autocomplete="list"
                aria-activedescendant={
                  activeIndex >= 0 && suggestions[activeIndex]
                    ? `suggestion-${suggestions[activeIndex].id}`
                    : undefined
                }
                aria-label="Search for a location by city name or coordinates"
                className="w-full border-none bg-transparent text-xs sm:text-sm text-[#111625] outline-none placeholder:text-slate-400 py-1"
                placeholder="Search city, region, or coordinates..."
                maxLength={100}
              />
            </div>
          </Popover.Anchor>

          {inputValue.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search input"
              className="mr-1 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer flex-shrink-0"
            >
              <span className="text-xs">✕</span>
            </button>
          )}

          <Popover.Portal>
            <Popover.Content
              autoFocus={false}
              onOpenAutoFocus={(e) => {
                e.preventDefault();
                inputRef.current?.focus();
              }}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
              }}
              onInteractOutside={(e) => {
                if (containerRef.current?.contains(e.target as Node)) {
                  e.preventDefault();
                }
              }}
              onPointerDownOutside={(e) => {
                if (containerRef.current?.contains(e.target as Node)) {
                  e.preventDefault();
                }
              }}
              align="start"
              side="bottom"
              sideOffset={8}
              id="location-suggestions-listbox"
              role="listbox"
              aria-label="Location suggestions"
              className="w-[var(--radix-popover-trigger-width)] min-w-[280px] max-w-[calc(100vw-2rem)] flex flex-col items-start rounded-2xl bg-white/95 backdrop-blur-md py-1.5 shadow-2xl border border-slate-200 z-50 max-h-64 overflow-y-auto"
            >
              {loading ? (
                <div
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-slate-500"
                  aria-live="polite"
                >
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  <span>Searching locations...</span>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => {
                  const isHighlighted = index === activeIndex;
                  return (
                    <button
                      key={suggestion.id}
                      id={`suggestion-${suggestion.id}`}
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      onClick={() => handleSuggestionOnClick(suggestion.name)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`whitespace-nowrap border-none text-left w-full px-4 py-2 text-xs sm:text-sm transition-colors cursor-pointer outline-none ${
                        isHighlighted
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-[#111625] hover:bg-slate-50"
                      }`}
                    >
                      <span className="font-semibold">{suggestion.name}</span>
                      {suggestion.country && (
                        <span className="ml-1 text-xs text-slate-400">
                          ({suggestion.country})
                        </span>
                      )}
                    </button>
                  );
                })
              ) : null}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      <button
        onClick={handleLocate}
        className="ml-2 flex items-center gap-1 text-xs sm:text-sm font-bold text-[#4169E1] hover:text-blue-700 transition-colors cursor-pointer rounded-xl px-2.5 py-1 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none flex-shrink-0"
        type="button"
        aria-label="Detect and use my current geolocation"
      >
        <span className="hidden sm:inline">Locate</span>
        <Image
          src={pinIcon}
          alt=""
          aria-hidden="true"
          width={18}
          height={18}
          className="h-4 w-4 sm:h-4.5 sm:w-4.5"
        />
      </button>
    </div>
  );
}
