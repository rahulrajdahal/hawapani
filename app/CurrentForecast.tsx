'use client';

import { dropIcon, windIcon } from '@/assets/icons';
import { formatTime } from '@/lib/utils/dateTime';
import { AtmosphericTheme } from '@/lib/utils/weatherTheme';
import Image from 'next/image';

/**
 * Props for the CurrentForecast hero panel component.
 */
export interface CurrentForecastProps {
  /** Wind speed formatted in active unit */
  windSpeed: number;
  /** Wind speed unit (defaults to 'km/h') */
  windUnit?: string;
  /** ISO timestamp string representing the last update time */
  last_updated: string;
  /** Weather condition summary and WeatherAPI icon URL */
  condition: {
    text: string;
    icon: string;
  };
  /** Real-time current temperature in the active unit scale */
  temp: number;
  /** Relative humidity percentage */
  humidity: number;
  /** IANA timezone identifier (e.g., "Asia/Kathmandu", "Pacific/Auckland") */
  tz_id: string;
  /** Optional atmospheric dynamic theme styling object */
  theme?: AtmosphericTheme;
  /** Optional custom CSS class name */
  className?: string;
}

/** Backward compatibility alias */
export type ICurrentForecast = CurrentForecastProps;

/**
 * CurrentForecast renders the prominent hero panel showcasing current temperature,
 * condition badge & icon, humidity, wind speed, local timezone-formatted clock,
 * and contextual ambient atmospheric gradient background.
 */
export default function CurrentForecast({
  windSpeed,
  windUnit = 'km/h',
  last_updated,
  condition: { text, icon },
  humidity,
  temp,
  tz_id,
  theme,
  className = '',
}: CurrentForecastProps) {
  const heroGrad =
    theme?.heroGradient ??
    'linear-gradient(135deg, rgba(132, 250, 176, 0.8), rgba(143, 211, 244, 0.95))';

  return (
    <section
      aria-label="Current Weather Summary"
      className="relative w-full lg:w-[34%] xl:w-[30%] flex-shrink-0 lg:h-full min-h-0"
    >
      <div
        style={{
          background: heroGrad,
        }}
        className="relative z-10 flex h-full min-h-0 flex-col items-center justify-between rounded-t-3xl lg:rounded-t-none lg:rounded-l-3xl p-4 sm:p-5 lg:p-6 2xl:p-8 text-white shadow-lg transition-all duration-700 overflow-hidden"
      >
        {/* Subtle Ambient Glow */}
        <div
          className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-white/20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Top Bar: Condition Icon & Live Status Badge */}
        <div className="w-full flex items-center justify-between z-10 flex-shrink-0">
          <span className="text-[11px] uppercase tracking-widest font-bold text-white/80 drop-shadow-xs">
            Current Weather
          </span>

          <div className="flex items-center gap-1.5 rounded-full bg-black/20 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow-xs border border-white/20">
            {icon && (
              <Image
                src={`https:${icon}`}
                alt={text}
                width={24}
                height={24}
                priority
                className="h-5 w-5 object-contain drop-shadow-xs"
              />
            )}
            <span className="capitalize">{text}</span>
          </div>
        </div>

        {/* Center: Hero Temperature & Metrics */}
        <div className="flex flex-col items-center my-auto py-2 sm:py-4 z-10 w-full">
          <div
            className="flex items-start justify-center font-bold text-[#F8FBFF] drop-shadow-md select-none tracking-tighter leading-none"
            aria-label={`Current temperature: ${temp} degrees`}
          >
            <span className="text-6xl sm:text-7xl md:text-8xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-extrabold">
              {temp}
            </span>
            <span className="text-3xl sm:text-4xl 2xl:text-5xl font-light ml-1 text-white/90">
              °
            </span>
          </div>

          <p className="text-sm sm:text-base font-medium text-white/90 drop-shadow-xs mt-0.5 mb-3 sm:mb-4 text-center">
            {text}
          </p>

          {/* Quick Metrics Pills with Icons: 2 columns on mobile, 1 column in desktop sidebar */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 w-full max-w-xs sm:max-w-sm lg:max-w-[240px] items-stretch">
            <div
              className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl bg-white/90 backdrop-blur-md py-1.5 px-2.5 sm:px-3.5 text-center text-xs font-semibold text-slate-800 shadow-sm border border-white/60 transition-transform hover:scale-[1.02]"
              aria-label={`Humidity: ${humidity} percent`}
            >
              <Image
                src={dropIcon}
                alt=""
                aria-hidden="true"
                width={16}
                height={16}
                className="h-3.5 w-3.5 text-blue-500 shrink-0"
              />
              <span className="truncate">Humidity: {humidity}%</span>
            </div>

            <div
              className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl bg-white/90 backdrop-blur-md py-1.5 px-2.5 sm:px-3.5 text-center text-xs font-semibold text-slate-800 shadow-sm border border-white/60 transition-transform hover:scale-[1.02]"
              aria-label={`Wind Speed: ${windSpeed} ${windUnit === 'mph' ? 'miles per hour' : 'kilometers per hour'}`}
            >
              <Image
                src={windIcon}
                alt=""
                aria-hidden="true"
                width={16}
                height={16}
                className="h-3.5 w-3.5 text-teal-600 shrink-0"
              />
              <span className="truncate">Wind: {windSpeed} {windUnit}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Local Time & Timezone */}
        <div className="w-full flex items-center justify-center text-center text-xs font-medium text-white/85 z-10 drop-shadow-xs border-t border-white/15 pt-2 flex-shrink-0">
          <time dateTime={last_updated} className="tracking-wide text-[11px] sm:text-xs truncate max-w-full">
            {formatTime(last_updated)} • {tz_id.replaceAll('_', ' ')}
          </time>
        </div>
      </div>
    </section>
  );
}
