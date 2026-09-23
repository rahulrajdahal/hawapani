"use client";

import DailyForecast from "@/app/DailyForecast";
import {
  AlertBanner,
  FavoritesBar,
  LocationHeadline,
  MetricsGrid,
  Navbar,
  OfflineBadge,
  OfflineGame,
  SegmentedControl,
  UnitToggle,
  WeatherDashboardSkeleton,
} from "@/components";
import { useFavorites } from "@/hooks/useFavorites";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { analytics } from "@/lib/analytics/posthog";
import { DEFAULT_CITY } from "@/lib/constants";
import {
  IAstronomy,
  ICurrentForecast,
  ICurrentLocation,
  IDailyForecast,
  IHourlyForecast,
  IWeatherAlert,
} from "@/lib/types/weather";
import { getAtmosphericTheme } from "@/lib/utils/weatherTheme";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import CurrentForecast from "./CurrentForecast";
import HourlyForecast from "./HourlyForecast";

// Dynamically code-split heavy comparison modal (performance rule)
const CityComparisonModal = dynamic(
  () => import("@/components/CityComparisonModal/CityComparisonModal"),
  { ssr: false },
);

export type {
  ICurrentForecast as ICurrentForecastResp,
  ICurrentLocation as ICurrentLocationResp,
  IHourlyForecast as IHourlyForeCastResp,
};

function WeatherDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tempScale, setTempScale] = useState(false); // false = Celsius, true = Fahrenheit
  const [forecastTab, setForecastTab] = useState<"hourly" | "daily">("hourly");
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const { favorites, toggleFavorite, removeFavorite, isFavorite } =
    useFavorites();

  const [currentForecast, setCurrentForecast] = useState<ICurrentForecast>();
  const [currentLocation, setCurrentLocation] = useState<ICurrentLocation>();
  const [hourlyForecasts, setHourlyForecasts] = useState<IHourlyForecast[]>([]);
  const [dailyForecasts, setDailyForecasts] = useState<IDailyForecast[]>([]);
  const [astronomy, setAstronomy] = useState<IAstronomy>();
  const [alerts, setAlerts] = useState<IWeatherAlert[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOnline = useOnlineStatus();
  const [isOfflineCached, setIsOfflineCached] = useState(false);

  const activeQuery = searchParams.get("q") || DEFAULT_CITY;

  // Restore persistent unit scale preference from localStorage
  useEffect(() => {
    try {
      const savedScale = localStorage.getItem("hawapani_temp_scale");
      if (savedScale !== null) {
        setTempScale(savedScale === "fahrenheit");
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleTempScaleChange = (isFahrenheit: boolean) => {
    setTempScale(isFahrenheit);
    analytics.toggleUnit(isFahrenheit ? "fahrenheit" : "celsius");
    try {
      localStorage.setItem(
        "hawapani_temp_scale",
        isFahrenheit ? "fahrenheit" : "celsius",
      );
    } catch {
      // Ignore storage errors
    }
  };

  // On first load without a query parameter, prompt for geolocation
  useEffect(() => {
    if (!searchParams.get("q") && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          router.replace(`/?q=${coords.latitude},${coords.longitude}`);
        },
        () => {
          // If denied or timed out, default city is active
        },
        { timeout: 8000, maximumAge: 60000 },
      );
    }
  }, [searchParams, router]);

  const loadCachedForecast = useCallback((query: string) => {
    try {
      const normalized = query.toLowerCase().trim();
      const cached =
        localStorage.getItem(`hawapani_forecast_${normalized}`) ||
        localStorage.getItem("hawapani_forecast_last");

      if (cached) {
        const data = JSON.parse(cached);
        if (data?.currentForecast && data?.currentLocation) {
          setCurrentForecast(data.currentForecast);
          setCurrentLocation(data.currentLocation);
          setHourlyForecasts(data.forecast ?? []);
          setDailyForecasts(data.dailyForecast ?? []);
          setAstronomy(data.astronomy);
          setAlerts(data.alerts ?? []);
          setIsOfflineCached(true);
          setError(null);
          return true;
        }
      }
    } catch {
      // Ignore cache parse errors
    }
    return false;
  }, []);

  const getForecast = useCallback(async () => {
    setLoading(true);
    setError(null);

    // When offline, immediately attempt to retrieve cached forecast without pointless network retries
    if (!isOnline) {
      const restored = loadCachedForecast(activeQuery);
      setLoading(false);
      if (!restored) {
        setIsOfflineCached(false);
        setCurrentForecast(undefined);
      }
      return;
    }

    try {
      const response = await fetch(
        `/api/weather/forecast?q=${encodeURIComponent(activeQuery)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const responseJson = await response.json();

      if (!response.ok || responseJson?.error) {
        // Fallback to cache if network request failed
        const restored = loadCachedForecast(activeQuery);
        if (restored) {
          toast("Loaded cached forecast.", { icon: "📦" });
          return;
        }

        const errorMsg =
          responseJson?.error?.message ||
          responseJson?.error ||
          "Failed to fetch forecast";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      if (responseJson?.data) {
        setCurrentForecast(responseJson.data.currentForecast);
        setCurrentLocation(responseJson.data.currentLocation);
        setHourlyForecasts(responseJson.data.forecast ?? []);
        setDailyForecasts(responseJson.data.dailyForecast ?? []);
        setAstronomy(responseJson.data.astronomy);
        setAlerts(responseJson.data.alerts ?? []);
        setIsOfflineCached(false);

        // Cache the weather forecast in localStorage for offline review
        try {
          const payload = JSON.stringify(responseJson.data);
          localStorage.setItem(
            `hawapani_forecast_${activeQuery.toLowerCase().trim()}`,
            payload,
          );
          if (responseJson.data.currentLocation?.name) {
            localStorage.setItem(
              `hawapani_forecast_${responseJson.data.currentLocation.name.toLowerCase().trim()}`,
              payload,
            );
          }
          localStorage.setItem("hawapani_forecast_last", payload);
        } catch {
          // Ignore storage quota errors
        }
      }
    } catch {
      // Network drop or offline error fallback
      const restored = loadCachedForecast(activeQuery);
      if (restored) {
        toast("Network unavailable. Showing cached forecast.", { icon: "📡" });
        return;
      }

      const errorMsg = "Unable to connect to weather service.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [activeQuery, isOnline, loadCachedForecast]);

  useEffect(() => {
    getForecast();
  }, [getForecast]);

  const handleSelectFavoriteCity = (city: string) => {
    router.push(`/?q=${encodeURIComponent(city)}`);
  };

  // Compute dynamic atmospheric theme
  const isDayTime = (() => {
    if (!currentLocation?.localtime) return true;
    const hour = parseInt(
      currentLocation.localtime.split(" ")[1]?.split(":")[0] || "12",
      10,
    );
    return hour >= 6 && hour < 19;
  })();

  const atmosphericTheme = getAtmosphericTheme(
    currentForecast?.condition?.text,
    isDayTime,
  );

  return (
    <div
      className="bg-image min-h-[100dvh] lg:h-[100dvh] lg:max-h-[100dvh] flex flex-col transition-all duration-700 overflow-x-hidden lg:overflow-hidden select-none"
      style={{
        background: `${atmosphericTheme.backgroundGradient}, url('/assets/main.png') center/cover`,
      }}
    >
      {/* Header Landmark */}
      <header role="banner" className="w-full flex-shrink-0">
        <Navbar />
      </header>

      {/* Main Content Landmark */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 min-h-0 px-3 sm:px-4 md:px-[5%] xl:px-[8%] 2xl:px-[12.5%] pb-3 lg:pb-2 flex flex-col lg:overflow-hidden outline-hidden"
      >
        {/* Quick-Access Favorites / Bookmarks Bar */}
        <div className="mb-2 flex-shrink-0">
          <FavoritesBar
            favorites={favorites}
            activeCity={
              currentLocation
                ? `${currentLocation.name}, ${currentLocation.country}`
                : activeQuery
            }
            onSelectCity={handleSelectFavoriteCity}
            onRemoveFavorite={removeFavorite}
            onOpenCompare={() => setIsCompareOpen(true)}
          />
        </div>

        {/* Offline cached status notification */}
        {isOfflineCached && currentForecast && (
          <div className="flex-shrink-0 mb-2 flex justify-start">
            <OfflineBadge lastUpdated={currentForecast.last_updated} />
          </div>
        )}

        {alerts && alerts.length > 0 && (
          <div className="flex-shrink-0 mb-2">
            <AlertBanner alerts={alerts} />
          </div>
        )}

        {loading && !currentForecast ? (
          <WeatherDashboardSkeleton />
        ) : !currentForecast ? (
          <div className="flex flex-1 min-h-0 w-full flex-col items-center justify-center p-4 gap-4">
            {error && (
              <div
                className="w-full max-w-xl text-center bg-red-500/10 border border-red-500/20 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium backdrop-blur-md flex items-center justify-between gap-3 shadow-xs"
                role="alert"
              >
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => getForecast()}
                  className="rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500 transition cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  Retry 🔄
                </button>
              </div>
            )}
            <OfflineGame onRetryConnection={() => getForecast()} />
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row rounded-3xl lg:rounded-[32px] bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl lg:overflow-hidden transition-all">
            {currentForecast && currentLocation ? (
              <CurrentForecast
                condition={currentForecast.condition}
                humidity={currentForecast.humidity}
                temp={
                  tempScale ? currentForecast.temp_f : currentForecast.temp_c
                }
                last_updated={currentForecast.last_updated}
                tz_id={currentLocation.tz_id}
                windSpeed={
                  tempScale
                    ? (currentForecast.wind_mph ?? Math.round(currentForecast.wind_kph * 0.621371 * 10) / 10)
                    : currentForecast.wind_kph
                }
                windUnit={tempScale ? "mph" : "km/h"}
                theme={atmosphericTheme}
              />
            ) : null}

            {/* Right Pane: Pinned Controls + Scrollable Weather Information */}
            <div className="flex-1 lg:min-h-0 lg:h-full flex flex-col lg:overflow-hidden">
              {/* Pinned Top Controls Bar */}
              <div className="flex-shrink-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/70 px-3.5 py-2.5 sm:px-6 sm:py-3 lg:px-8">
                <div className="flex items-center justify-between flex-wrap gap-2.5 sm:gap-3">
                  <SegmentedControl
                    options={[
                      { value: "hourly", label: "Hourly (24h)", icon: "⏱️" },
                      { value: "daily", label: "7-Day Forecast", icon: "📅" },
                    ]}
                    value={forecastTab}
                    onChange={(val) =>
                      setForecastTab(val as "hourly" | "daily")
                    }
                    ariaLabel="Forecast projection view"
                    role="tablist"
                  />

                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCompareOpen(true)}
                      className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl bg-white px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs border border-slate-200/80 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-hidden"
                      aria-label="Compare cities"
                    >
                      <span>⚖️</span>
                      <span>Compare</span>
                    </button>

                    <UnitToggle
                      isCelsius={!tempScale}
                      onChange={(celsius) => handleTempScaleChange(!celsius)}
                    />
                  </div>
                </div>
              </div>

              {/* Scrollable Weather Content Area */}
              <div className="custom-scrollbar flex-1 lg:min-h-0 lg:overflow-y-auto px-3.5 py-3.5 sm:px-6 lg:py-6 lg:pr-8">
                {/* City Headline with 1-Tap Bookmark Action */}
                {currentForecast && currentLocation && (
                  <LocationHeadline
                    cityName={currentLocation.name}
                    country={currentLocation.country}
                    conditionText={currentForecast.condition.text}
                    isFavorite={isFavorite(
                      currentLocation.name,
                      currentLocation.country,
                    )}
                    onToggleFavorite={() =>
                      toggleFavorite(
                        currentLocation.country
                          ? `${currentLocation.name}, ${currentLocation.country}`
                          : currentLocation.name,
                        currentLocation.country,
                      )
                    }
                  />
                )}

                {/* Conditional Tab Panel Rendering: Hourly vs Daily */}
                <div className="mt-5">
                  {forecastTab === "hourly" ? (
                    hourlyForecasts.length > 0 &&
                    currentForecast && (
                      <div
                        id="panel-hourly"
                        role="tabpanel"
                        aria-labelledby="tab-hourly"
                      >
                        <HourlyForecast
                          hourlyForecasts={hourlyForecasts}
                          time={currentForecast.last_updated}
                          isCelsius={!tempScale}
                        />
                      </div>
                    )
                  ) : (
                    <div
                      id="panel-daily"
                      role="tabpanel"
                      aria-labelledby="tab-daily"
                    >
                      <DailyForecast
                        dailyForecasts={dailyForecasts}
                        isCelsius={!tempScale}
                      />
                    </div>
                  )}
                </div>

                {/* Extended Meteorological Suite */}
                {currentForecast && (
                  <MetricsGrid
                    currentForecast={currentForecast}
                    astronomy={astronomy}
                    isCelsius={!tempScale}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Multi-City Side-by-Side Comparison Modal */}
        <CityComparisonModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          initialCity={currentLocation?.name || activeQuery}
          isCelsius={!tempScale}
          favorites={favorites}
        />
      </main>

      {/* Compact Flex-Shrink-0 Footer */}
      <footer
        role="contentinfo"
        className="flex-shrink-0 border-t border-white/10 bg-slate-950/40 backdrop-blur-md px-4 py-1.5 text-center text-[11px] text-white/70"
      >
        <p>
          hawapani &bull; Powered by{" "}
          <Link
            href="https://www.weatherapi.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white transition font-medium focus-visible:ring-2 focus-visible:ring-white rounded-xs"
          >
            WeatherAPI.com
          </Link>
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh w-full items-center justify-center bg-[#F0F4FA] text-lg font-medium text-gray-500">
          Loading hawapani...
        </div>
      }
    >
      <WeatherDashboard />
    </Suspense>
  );
}
