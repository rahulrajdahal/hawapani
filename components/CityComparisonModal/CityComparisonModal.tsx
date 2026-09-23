'use client';

import Input from '../Input/Input';
import { IWeatherData } from '@/lib/types/weather';
import { getAqiCategory, getUvCategory } from '@/lib/utils/weatherMetrics';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/**
 * Props for the CityComparisonModal component.
 */
export interface CityComparisonModalProps {
  /** Whether the comparison modal is currently visible */
  isOpen: boolean;
  /** Callback fired when the user closes the modal (via backdrop, close button, or Escape) */
  onClose: () => void;
  /** Current active primary city */
  initialCity: string;
  /** Whether temperatures are formatted in Celsius or Fahrenheit */
  isCelsius: boolean;
  /** List of bookmarked cities available for quick multi-city selection */
  favorites: string[];
}

export default function CityComparisonModal({
  isOpen,
  onClose,
  initialCity,
  isCelsius,
  favorites,
}: CityComparisonModalProps) {
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [weatherMap, setWeatherMap] = useState<Record<string, IWeatherData>>({});
  const [loading, setLoading] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Focus trap and Escape key handler
  useEffect(() => {
    if (!isOpen) {
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
        previousActiveElementRef.current = null;
      }
      return;
    }

    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Focus the first focusable element inside the modal
    const timer = setTimeout(() => {
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled])'
      );
      firstFocusable?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const weatherCacheRef = useRef<Record<string, IWeatherData>>({});

  // Synchronize initial cities when modal opens
  useEffect(() => {
    if (isOpen) {
      const initial = [initialCity];
      const other = favorites.find(
        (f) => f.toLowerCase() !== initialCity.toLowerCase()
      );
      if (other) {
        initial.push(other);
      }
      setSelectedCities(initial);
    }
  }, [isOpen, initialCity, favorites]);

  // Fetch forecast data for all selected cities
  useEffect(() => {
    if (!isOpen || selectedCities.length === 0) return;

    let isCancelled = false;
    const fetchAllCities = async () => {
      setLoading(true);
      try {
        const promises = selectedCities.map(async (city) => {
          if (weatherCacheRef.current[city]) {
            return { city, data: weatherCacheRef.current[city] };
          }
          const response = await fetch(
            `/api/weather/forecast?q=${encodeURIComponent(city)}`
          );
          const json = await response.json();
          return { city, data: json?.data as IWeatherData | undefined };
        });

        const results = await Promise.all(promises);
        if (!isCancelled) {
          results.forEach(({ city, data }) => {
            if (data) {
              weatherCacheRef.current[city] = data;
            }
          });
          setWeatherMap({ ...weatherCacheRef.current });
        }
      } catch {
        // Handle fetch errors gracefully
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchAllCities();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, selectedCities]);

  if (!isOpen) return null;

  const handleAddCity = (city: string) => {
    const trimmed = city.trim();
    if (
      trimmed &&
      selectedCities.length < 3 &&
      !selectedCities.some((c) => c.toLowerCase() === trimmed.toLowerCase())
    ) {
      setSelectedCities([...selectedCities, trimmed]);
      setCustomCityInput('');
    }
  };

  const handleRemoveCity = (city: string) => {
    if (selectedCities.length > 1) {
      setSelectedCities(selectedCities.filter((c) => c !== city));
    }
  };

  const primaryCityWeather = weatherMap[selectedCities[0]];
  const primaryTemp = primaryCityWeather
    ? isCelsius
      ? primaryCityWeather.currentForecast.temp_c
      : primaryCityWeather.currentForecast.temp_f
    : null;

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-labelledby='comparison-modal-title'
      className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className='relative w-full max-w-5xl rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-100 p-3.5 sm:p-6 md:p-8 flex flex-col max-h-[92vh] overflow-y-auto'
      >
        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-200 pb-4'>
          <div>
            <h2
              id='comparison-modal-title'
              className='text-lg sm:text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2'
            >
              <span>⚖️</span> Side-by-Side City Comparison
            </h2>
            <p className='text-xs md:text-sm text-slate-500 mt-0.5'>
              Compare real-time temperatures, condition deltas, and atmospheric metrics.
            </p>
          </div>

          <button
            onClick={onClose}
            className='rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-hidden'
            aria-label='Close comparison modal'
          >
            ✕
          </button>
        </div>

        {/* Quick Add City Toolbar */}
        <div className='my-4 flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100'>
          <span className='text-xs font-semibold text-slate-600'>
            Add to compare (max 3):
          </span>

          {favorites
            .filter(
              (f) =>
                !selectedCities.some((c) => c.toLowerCase() === f.toLowerCase())
            )
            .map((fav) => (
              <button
                key={fav}
                onClick={() => handleAddCity(fav)}
                disabled={selectedCities.length >= 3}
                aria-label={`Add ${fav} to comparison`}
                className='text-xs font-medium bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-hidden'
              >
                + {fav}
              </button>
            ))}

          {selectedCities.length < 3 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCity(customCityInput);
              }}
              className='flex items-center gap-1.5 w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0'
            >
              <Input
                type='text'
                placeholder='Search city...'
                value={customCityInput}
                onChange={(e) => setCustomCityInput(e.target.value)}
                aria-label='Search city to compare'
                className='w-full sm:w-36 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'
              />
              <button
                type='submit'
                className='rounded-xl bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-hidden flex-shrink-0'
              >
                Add
              </button>
            </form>
          )}
        </div>

        {/* Comparison Columns */}
        {loading && Object.keys(weatherMap).length === 0 ? (
          <div
            className='py-20 flex flex-col items-center justify-center gap-3 text-slate-500'
            aria-live='polite'
          >
            <div className='h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent' />
            <span className='text-sm'>
              Loading comparative meteorological data...
            </span>
          </div>
        ) : (
          <div
            className={`grid gap-4 mt-2 ${
              selectedCities.length === 1
                ? 'grid-cols-1'
                : selectedCities.length === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-3'
            }`}
          >
            {selectedCities.map((cityName, index) => {
              const data = weatherMap[cityName];
              if (!data) {
                return (
                  <div
                    key={cityName}
                    className='rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center gap-2 text-slate-400'
                  >
                    <div className='h-6 w-6 animate-spin rounded-full border-2 border-slate-400 border-t-transparent' />
                    <span className='text-xs'>Fetching {cityName}...</span>
                  </div>
                );
              }

              const current = data.currentForecast;
              const location = data.currentLocation;
              const temp = Math.round(
                isCelsius ? current.temp_c : current.temp_f
              );
              const feelsLike = Math.round(
                isCelsius ? current.feelslike_c ?? 0 : current.feelslike_f ?? 0
              );

              // Calculate temperature delta relative to first city
              let tempDelta: number | null = null;
              if (index > 0 && primaryTemp !== null) {
                tempDelta = Math.round(temp - primaryTemp);
              }

              const aqiInfo = getAqiCategory(
                current.air_quality?.['us-epa-index']
              );
              const uvInfo = getUvCategory(current.uv);

              return (
                <article
                  key={cityName}
                  aria-label={`Weather in ${location.name}, ${location.country}`}
                  className={`flex flex-col rounded-2xl p-5 border transition-all ${
                    index === 0
                      ? 'bg-blue-50/40 border-blue-200 shadow-sm'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  {/* Column Header */}
                  <div className='flex items-start justify-between'>
                    <div>
                      {index === 0 && (
                        <span className='text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full'>
                          Active City
                        </span>
                      )}
                      <h3 className='text-lg font-bold text-slate-800 mt-1'>
                        {location.name}
                      </h3>
                      <p className='text-xs text-slate-500'>
                        {location.country}
                      </p>
                    </div>

                    {selectedCities.length > 1 && (
                      <button
                        onClick={() => handleRemoveCity(cityName)}
                        className='text-xs text-slate-400 hover:text-red-500 cursor-pointer p-1 rounded-md focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-hidden'
                        aria-label={`Remove ${location.name} from comparison`}
                        title={`Remove ${location.name} from comparison`}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Temperature & Delta */}
                  <div className='my-4 flex items-center justify-between'>
                    <div>
                      <span className='text-4xl md:text-5xl font-extrabold text-slate-900'>
                        {temp}°
                      </span>
                      {tempDelta !== null && (
                        <div className='mt-1 flex items-center gap-1 text-xs font-semibold'>
                          {tempDelta > 0 ? (
                            <span className='text-amber-600'>
                              +{tempDelta}° warmer
                            </span>
                          ) : tempDelta < 0 ? (
                            <span className='text-blue-600'>
                              {tempDelta}° cooler
                            </span>
                          ) : (
                            <span className='text-slate-500'>Same temp</span>
                          )}
                          <span className='text-[10px] text-slate-400'>
                            vs {selectedCities[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className='flex flex-col items-center text-right'>
                      {current.condition.icon && (
                        <Image
                          src={`https:${current.condition.icon}`}
                          alt={current.condition.text}
                          width={48}
                          height={48}
                          className='h-12 w-12 object-contain'
                        />
                      )}
                      <span className='text-xs font-medium text-slate-600'>
                        {current.condition.text}
                      </span>
                    </div>
                  </div>

                  {/* Metrics List */}
                  <div className='flex flex-col gap-2 border-t border-slate-100 pt-3 text-xs'>
                    <div className='flex justify-between text-slate-600'>
                      <span className='text-slate-400'>Feels Like:</span>
                      <span className='font-semibold'>{feelsLike}°</span>
                    </div>

                    <div className='flex justify-between text-slate-600'>
                      <span className='text-slate-400'>Humidity:</span>
                      <span className='font-semibold'>
                        {current.humidity}%
                      </span>
                    </div>

                    <div className='flex justify-between text-slate-600'>
                      <span className='text-slate-400'>Wind Speed:</span>
                      <span className='font-semibold'>
                        {isCelsius
                          ? `${current.wind_kph} km/h`
                          : `${current.wind_mph ?? Math.round(current.wind_kph * 0.621371 * 10) / 10} mph`}
                      </span>
                    </div>

                    <div className='flex justify-between text-slate-600 items-center'>
                      <span className='text-slate-400'>UV Index:</span>
                      <span
                        className='px-2 py-0.5 rounded-full text-[10px] font-bold text-white'
                        style={{ backgroundColor: uvInfo.color }}
                      >
                        {current.uv ?? 0} ({uvInfo.label})
                      </span>
                    </div>

                    <div className='flex justify-between text-slate-600 items-center'>
                      <span className='text-slate-400'>Air Quality:</span>
                      <span
                        className='px-2 py-0.5 rounded-full text-[10px] font-bold'
                        style={{
                          color: aqiInfo.color,
                          backgroundColor: aqiInfo.bgColor,
                        }}
                      >
                        {aqiInfo.label}
                      </span>
                    </div>

                    <div className='flex justify-between text-slate-600'>
                      <span className='text-slate-400'>Pressure:</span>
                      <span className='font-semibold'>
                        {current.pressure_mb} hPa
                      </span>
                    </div>

                    <div className='flex justify-between text-slate-600'>
                      <span className='text-slate-400'>Visibility:</span>
                      <span className='font-semibold'>
                        {current.vis_km} km
                      </span>
                    </div>
                  </div>

                  {/* Mini Next 6 Hours Timeline */}
                  {data.forecast && data.forecast.length > 0 && (
                    <div className='mt-4 border-t border-slate-100 pt-3'>
                      <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
                        Next 6 Hours
                      </span>
                      <div className='mt-1.5 grid grid-cols-6 gap-1 text-center overflow-x-auto no-scrollbar py-0.5'>
                        {data.forecast.slice(0, 6).map((h, hIdx) => (
                          <div
                            key={h.time}
                            className='flex flex-col items-center'
                          >
                            <span className='text-[10px] text-slate-400'>
                              {hIdx === 0
                                ? 'Now'
                                : h.time.split(' ')[1]?.slice(0, 5)}
                            </span>
                            <span className='text-xs font-bold text-slate-700 mt-0.5'>
                              {Math.round(isCelsius ? h.temp_c : h.temp_f)}°
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
