'use client';

import { IAstronomy, ICurrentForecast } from '@/lib/types/weather';
import { getAqiCategory, getUvCategory } from '@/lib/utils/weatherMetrics';

/**
 * Props for the MetricsGrid component.
 */
export interface MetricsGridProps {
  /** Real-time current forecast object from WeatherAPI */
  currentForecast: ICurrentForecast;
  /** Optional astronomical solar and lunar timings */
  astronomy?: IAstronomy;
  /** Whether temperatures and distance metrics should be displayed in metric or imperial */
  isCelsius: boolean;
  /** Optional custom CSS class name */
  className?: string;
}

export default function MetricsGrid({
  currentForecast,
  astronomy,
  isCelsius,
  className = '',
}: MetricsGridProps) {
  const uvInfo = getUvCategory(currentForecast.uv);
  const aqiIndex = currentForecast.air_quality?.['us-epa-index'];
  const aqiInfo = getAqiCategory(aqiIndex);

  const feelsLike = isCelsius
    ? currentForecast.feelslike_c
    : currentForecast.feelslike_f;

  return (
    <section
      aria-label="Weather Details and Air Quality"
      className="mt-6 sm:mt-8 flex flex-col gap-3 sm:gap-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-[#111625] flex items-center gap-2">
          <span>📊</span> Weather Details & Atmospheric Metrics
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {/* Air Quality Index (AQI) */}
        <article
          aria-label="Air Quality Index"
          className="flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md p-4 sm:p-5 shadow-xs border border-white/80 transition-all duration-200 hover:shadow-md hover:bg-white"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>🍃</span> Air Quality
            </h3>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs"
              style={{ color: aqiInfo.color, backgroundColor: aqiInfo.bgColor }}
            >
              {aqiInfo.label}
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {currentForecast.air_quality?.pm2_5
                ? Math.round(currentForecast.air_quality.pm2_5)
                : '—'}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              μg/m³ (PM2.5)
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
            {aqiInfo.description}
          </p>

          <div className="mt-3 flex items-center justify-between flex-wrap gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-500 font-medium">
            <span>
              PM10:{' '}
              {currentForecast.air_quality?.pm10
                ? Math.round(currentForecast.air_quality.pm10)
                : '—'}
            </span>
            <span>
              O3:{' '}
              {currentForecast.air_quality?.o3
                ? Math.round(currentForecast.air_quality.o3)
                : '—'}
            </span>
            <span>
              NO2:{' '}
              {currentForecast.air_quality?.no2
                ? Math.round(currentForecast.air_quality.no2)
                : '—'}
            </span>
          </div>
        </article>

        {/* UV Index */}
        <article
          aria-label="UV Index and Sun Protection"
          className="flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md p-4 sm:p-5 shadow-xs border border-white/80 transition-all duration-200 hover:shadow-md hover:bg-white"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>☀️</span> UV Index
            </h3>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs"
              style={{ backgroundColor: uvInfo.color, color: uvInfo.textColor }}
            >
              {uvInfo.label}
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {currentForecast.uv ?? 0}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              / 11+ scale
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
            {uvInfo.advice}
          </p>

          <div
            className="mt-3 w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(((currentForecast.uv ?? 0) / 11) * 100, 100)}%`,
                backgroundColor: uvInfo.color,
              }}
            />
          </div>
        </article>

        {/* Feels Like & Comfort */}
        <article
          aria-label="Apparent Temperature"
          className="flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md p-4 sm:p-5 shadow-xs border border-white/80 transition-all duration-200 hover:shadow-md hover:bg-white"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>🌡️</span> Feels Like
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              {isCelsius ? 'Celsius' : 'Fahrenheit'}
            </span>
          </div>

          <div className="my-3 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {feelsLike ?? '—'}°
            </span>
            <span className="text-xs font-semibold text-slate-400">
              apparent
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
            Humidity and wind make it feel{' '}
            {feelsLike !== undefined &&
            (isCelsius ? currentForecast.temp_c : currentForecast.temp_f) !== undefined
              ? feelsLike >
                (isCelsius ? currentForecast.temp_c : currentForecast.temp_f)
                ? 'warmer than actual air temperature.'
                : feelsLike <
                  (isCelsius ? currentForecast.temp_c : currentForecast.temp_f)
                ? 'cooler than actual air temperature.'
                : 'consistent with the ambient reading.'
              : 'consistent with the ambient reading.'}
          </p>

          <div className="mt-3 flex items-center justify-between flex-wrap gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-500 font-medium">
            <span>Humidity: {currentForecast.humidity}%</span>
            <span>
              Wind:{" "}
              {isCelsius
                ? `${currentForecast.wind_kph} km/h`
                : `${currentForecast.wind_mph ?? Math.round(currentForecast.wind_kph * 0.621371 * 10) / 10} mph`}
            </span>
          </div>
        </article>

        {/* Sunrise & Sunset / Astronomy */}
        {astronomy && (
          <article
            aria-label="Sun and Moon timings"
            className="flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md p-4 sm:p-5 shadow-xs border border-white/80 transition-all duration-200 hover:shadow-md hover:bg-white"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>🌓</span> Sun & Moon
            </h3>

            <div className="my-3 grid grid-cols-2 gap-3">
              <div className="flex flex-col rounded-2xl bg-amber-50/60 p-2.5 border border-amber-100/80">
                <span className="text-xs text-amber-700 font-bold flex items-center gap-1">
                  <span>🌅</span> Sunrise
                </span>
                <span className="text-base sm:text-lg font-extrabold text-slate-800 mt-0.5">
                  {astronomy.sunrise}
                </span>
              </div>
              <div className="flex flex-col rounded-2xl bg-indigo-50/60 p-2.5 border border-indigo-100/80">
                <span className="text-xs text-indigo-700 font-bold flex items-center gap-1">
                  <span>🌇</span> Sunset
                </span>
                <span className="text-base sm:text-lg font-extrabold text-slate-800 mt-0.5">
                  {astronomy.sunset}
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500 font-medium">
              <span>Phase: {astronomy.moon_phase}</span>
              <span>Illum: {astronomy.moon_illumination}%</span>
            </div>
          </article>
        )}

        {/* Atmospheric Pressure */}
        <article
          aria-label="Atmospheric Barometric Pressure"
          className="flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md p-4 sm:p-5 shadow-xs border border-white/80 transition-all duration-200 hover:shadow-md hover:bg-white"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span>⏱️</span> Barometric Pressure
          </h3>

          <div className="my-3 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {currentForecast.pressure_mb ?? '—'}
            </span>
            <span className="text-xs font-semibold text-slate-400">hPa / mb</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
            {currentForecast.pressure_mb && currentForecast.pressure_mb > 1013
              ? 'High pressure system indicates settled atmospheric conditions.'
              : 'Low pressure system may bring unstable cloud cover or rain.'}
          </p>

          <div className="mt-3 flex items-center justify-between flex-wrap gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-500 font-medium">
            <span>Inches: {currentForecast.pressure_in ?? '—'} inHg</span>
            <span className="text-emerald-600 font-semibold">Normal: ~1013 hPa</span>
          </div>
        </article>

        {/* Visibility */}
        <article
          aria-label="Atmospheric Visibility"
          className="flex flex-col justify-between rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md p-4 sm:p-5 shadow-xs border border-white/80 transition-all duration-200 hover:shadow-md hover:bg-white"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span>👁️</span> Visibility
          </h3>

          <div className="my-3 flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {currentForecast.vis_km ?? '—'}
            </span>
            <span className="text-xs font-semibold text-slate-400">km</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
            {currentForecast.vis_km && currentForecast.vis_km >= 10
              ? 'Clear horizon with optimal atmospheric visibility.'
              : 'Reduced visibility: exercise caution when traveling.'}
          </p>

          <div className="mt-3 flex items-center justify-between flex-wrap gap-2 border-t border-slate-100 pt-2.5 text-xs text-slate-500 font-medium">
            <span>Miles: {currentForecast.vis_miles ?? '—'} mi</span>
            <span className="text-slate-500 font-semibold">
              {currentForecast.vis_km && currentForecast.vis_km >= 10
                ? 'Excellent'
                : 'Moderate'}
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}
