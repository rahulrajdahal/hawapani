'use client';

import { HourForecastCard } from '@/components';
import { IHourlyForecast } from '@/lib/types/weather';
import { isSameHour } from '@/lib/utils/dateTime';
import dynamic from 'next/dynamic';

const WeatherTrendChart = dynamic(
  () => import('@/components/WeatherTrendChart/WeatherTrendChart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-44 sm:h-52 w-full rounded-2xl bg-white/40 backdrop-blur-md animate-pulse border border-white/40" />
    ),
  }
);

/**
 * Props for the HourlyForecast 24h rolling carousel section.
 */
export interface HourlyForecastProps {
  /** Array of hourly forecast records (typically 24 hours rolling) */
  hourlyForecasts: IHourlyForecast[];
  /** Current active time string to match the current hour card */
  time: string;
  /** Whether temperatures should be displayed in Celsius or Fahrenheit */
  isCelsius: boolean;
  /** Optional custom CSS class name */
  className?: string;
}

/**
 * HourlyForecast renders the 24-hour continuous rolling forecast section,
 * combining the interactive WeatherTrendChart spline and individual HourForecastCards.
 */
export default function HourlyForecast({
  hourlyForecasts,
  time,
  isCelsius,
  className = '',
}: HourlyForecastProps) {
  return (
    <section
      aria-label="24-Hour Forecast Carousel"
      className={`flex flex-col gap-4 sm:gap-6 ${className}`}
    >
      <WeatherTrendChart
        hourlyForecasts={hourlyForecasts}
        isCelsius={isCelsius}
      />

      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#111625] flex items-center gap-2">
            <span>⏱️</span> Hourly Projection
          </h2>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 bg-white/70 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-slate-200/60">
            Continuous 24h rolling
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-2.5 sm:gap-4 place-items-center">
          {hourlyForecasts.map((hourlyForecast) => (
            <HourForecastCard
              key={hourlyForecast.time}
              isCurrentHour={isSameHour(hourlyForecast.time, time)}
              condition={hourlyForecast.condition}
              humidity={hourlyForecast.humidity}
              windSpeed={
                isCelsius
                  ? hourlyForecast.wind_kph
                  : (hourlyForecast.wind_mph ?? Math.round(hourlyForecast.wind_kph * 0.621371 * 10) / 10)
              }
              windUnit={isCelsius ? "km/h" : "mph"}
              temp={isCelsius ? hourlyForecast.temp_c : hourlyForecast.temp_f}
              time={hourlyForecast.time}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
