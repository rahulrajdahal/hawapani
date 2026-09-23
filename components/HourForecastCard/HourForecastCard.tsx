'use client';

import { dropIcon, windIcon } from '@/assets/icons';
import { formatHour } from '@/lib/utils/dateTime';
import Image from 'next/image';

/**
 * Props for the HourForecastCard component.
 */
export interface HourForecastCardProps {
  /** Wind speed in km/h or mph */
  windSpeed: number;
  /** Wind speed unit (defaults to 'km/h') */
  windUnit?: string;
  /** ISO datetime or date string formatted as "YYYY-MM-DD HH:mm" */
  time: string;
  /** Condition summary and WeatherAPI icon URL */
  condition: {
    /** Textual weather condition description (e.g. 'Sunny', 'Patchy rain') */
    text: string;
    /** Weather condition icon url */
    icon?: string;
  };
  /** Temperature value in active unit scale */
  temp: number;
  /** Relative humidity percentage (0-100) */
  humidity: number;
  /** Whether this card represents the current active hour ("Now") */
  isCurrentHour: boolean;
  /** Optional custom CSS class name */
  className?: string;
}

export const initialProps: HourForecastCardProps = {
  windSpeed: 10,
  time: '2026-09-17 12:00',
  condition: {
    text: 'Sunny',
    icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
  },
  temp: 24,
  humidity: 45,
  isCurrentHour: false,
};

/**
 * HourForecastCard renders an individual hour's forecast projection card with
 * time badge, weather icon, temperature, relative humidity, and wind speed.
 */
export default function HourForecastCard({
  windSpeed,
  windUnit = 'km/h',
  time,
  condition: { text, icon },
  humidity,
  temp,
  isCurrentHour,
  className = '',
}: HourForecastCardProps) {
  const displayTime = isCurrentHour ? 'Now' : formatHour(time);
  const cardAriaLabel = `${displayTime}: ${temp} degrees, ${text}. Humidity: ${humidity}%, Wind Speed: ${windSpeed} ${windUnit}.`;

  return (
    <article
      aria-label={cardAriaLabel}
      tabIndex={0}
      className={`relative flex w-full max-w-[8.75rem] flex-col items-center rounded-2xl sm:rounded-3xl p-3 sm:p-4 transition-all duration-300 select-none cursor-default focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-hidden ${
        isCurrentHour
          ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-lg ring-2 ring-blue-400/50 scale-105 z-10'
          : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1'
      } ${className}`}
      title={text}
    >
      {/* Time Badge */}
      <span
        className={`text-xs font-bold tracking-tight rounded-full px-2.5 py-0.5 mb-1 ${
          isCurrentHour
            ? 'bg-white/20 text-white uppercase tracking-wider text-[10px]'
            : 'text-slate-500 bg-slate-100'
        }`}
      >
        {displayTime}
      </span>

      {/* Weather Condition Icon */}
      {icon ? (
        <div className="my-1 h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center">
          <Image
            src={icon.startsWith('http') ? icon : `https:${icon}`}
            alt={text}
            width={36}
            height={36}
            className="h-7 w-7 sm:h-8 sm:w-8 object-contain drop-shadow-xs"
          />
        </div>
      ) : (
        <div className="h-3" />
      )}

      {/* Temperature Display */}
      <div className="flex items-start justify-center font-bold tracking-tighter leading-none my-1">
        <span
          className={`text-2xl sm:text-3xl font-extrabold ${
            isCurrentHour ? 'text-white' : 'text-slate-900'
          }`}
        >
          {temp}
        </span>
        <span
          className={`text-sm sm:text-base font-light ml-0.5 ${
            isCurrentHour ? 'text-white/80' : 'text-slate-400'
          }`}
        >
          °
        </span>
      </div>

      {/* Condition Text */}
      <p
        className={`text-[10px] sm:text-[11px] font-medium truncate max-w-full mb-1.5 sm:mb-2 ${
          isCurrentHour ? 'text-blue-100' : 'text-slate-500'
        }`}
      >
        {text}
      </p>

      {/* Humidity and Wind Speed Pills */}
      <div
        className={`w-full flex flex-col items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-medium pt-1.5 sm:pt-2 border-t ${
          isCurrentHour
            ? 'border-white/20 text-white/90'
            : 'border-slate-100 text-slate-600'
        }`}
      >
        <span
          className="flex items-center gap-1"
          title={`Humidity: ${humidity}%`}
        >
          <Image
            src={dropIcon}
            alt=""
            aria-hidden="true"
            width={14}
            height={14}
            className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
              isCurrentHour ? 'brightness-200' : 'text-blue-500'
            }`}
          />
          {humidity}%
        </span>
        <span
          className="flex items-center gap-1"
          title={`Wind: ${windSpeed} ${windUnit}`}
        >
          <Image
            src={windIcon}
            alt=""
            aria-hidden="true"
            width={14}
            height={14}
            className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
              isCurrentHour ? 'brightness-200' : 'text-teal-600'
            }`}
          />
          {windSpeed}{windUnit === 'km/h' ? 'km/h' : ' mph'}
        </span>
      </div>
    </article>
  );
}
