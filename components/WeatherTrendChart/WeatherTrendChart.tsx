'use client';

import { IHourlyForecast } from '@/lib/types/weather';
import { formatHour, formatTime } from '@/lib/utils/dateTime';
import Image from 'next/image';
import { useEffect, useId, useState } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface WeatherChartPoint {
  time: string;
  hourLabel: string;
  temp: number;
  feelsLike: number;
  rainChance: number;
  humidity: number;
  windSpeed: number;
  windUnit: string;
  conditionText: string;
  conditionIcon: string;
}

interface CustomWeatherTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: WeatherChartPoint;
  }>;
  isCelsius: boolean;
}

function CustomWeatherTooltip({
  active,
  payload,
  isCelsius,
}: CustomWeatherTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div
      role='tooltip'
      className='flex flex-col gap-1.5 rounded-2xl bg-slate-900/95 p-3.5 text-white shadow-2xl backdrop-blur-md border border-white/15 text-xs select-none pointer-events-none min-w-[170px]'
    >
      <div className='flex items-center justify-between border-b border-slate-700/80 pb-2'>
        <span className='font-semibold text-slate-300'>
          {formatTime(data.time)}
        </span>
        <span className='text-[11px] font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-800/60'>
          {data.temp}°{isCelsius ? 'C' : 'F'}
        </span>
      </div>

      <div className='flex items-center gap-2 py-1'>
        {data.conditionIcon && (
          <Image
            src={`https:${data.conditionIcon}`}
            alt=''
            aria-hidden='true'
            width={28}
            height={28}
            className='h-7 w-7 object-contain'
          />
        )}
        <span className='text-xs font-medium text-slate-200'>
          {data.conditionText}
        </span>
      </div>

      <div className='grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 border-t border-slate-800 text-[11px] text-slate-400'>
        <span>Feels: {data.feelsLike}°</span>
        <span className={data.rainChance > 0 ? 'text-sky-300 font-semibold' : ''}>
          Rain: {data.rainChance}%
        </span>
        <span>Humidity: {data.humidity}%</span>
        <span>Wind: {data.windSpeed} {data.windUnit}</span>
      </div>
    </div>
  );
}

/**
 * Props for the WeatherTrendChart component.
 */
export interface WeatherTrendChartProps {
  /** Continuous 24-hour hourly forecast projection points */
  hourlyForecasts: IHourlyForecast[];
  /** Whether temperatures are plotted in Celsius (°C) or Fahrenheit (°F) */
  isCelsius: boolean;
  /** Optional custom CSS class name */
  className?: string;
}

export default function WeatherTrendChart({
  hourlyForecasts,
  isCelsius,
  className = '',
}: WeatherTrendChartProps) {
  const gradientId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!hourlyForecasts || hourlyForecasts.length < 2) return null;

  // Take next 24 hours of projection
  const points = hourlyForecasts.slice(0, 24);

  const chartData: WeatherChartPoint[] = points.map((h, i) => {
    const temp = Math.round(isCelsius ? h.temp_c : h.temp_f);
    const feelsLike = Math.round(
      isCelsius ? (h.feelslike_c ?? h.temp_c) : (h.feelslike_f ?? h.temp_f)
    );
    const rainChance = h.chance_of_rain ?? 0;
    const hourLabel = i === 0 ? 'Now' : formatHour(h.time);

    return {
      time: h.time,
      hourLabel,
      temp,
      feelsLike,
      rainChance,
      humidity: h.humidity,
      windSpeed: isCelsius
        ? h.wind_kph
        : (h.wind_mph ?? Math.round(h.wind_kph * 0.621371 * 10) / 10),
      windUnit: isCelsius ? 'km/h' : 'mph',
      conditionText: h.condition.text,
      conditionIcon: h.condition.icon,
    };
  });

  const temps = chartData.map((d) => d.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const maxRain = Math.max(...chartData.map((d) => d.rainChance));

  return (
    <section
      role='region'
      aria-label='24-Hour Temperature and Precipitation Trendline'
      className='mt-4 sm:mt-6 rounded-2xl bg-white/85 p-3 sm:p-5 shadow-xs border border-slate-100 backdrop-blur-xs flex flex-col gap-2.5 sm:gap-3'
    >
      {/* Visual Chart Header */}
      <div className='flex items-center justify-between flex-wrap gap-1.5 sm:gap-2'>
        <div className='flex items-center gap-2'>
          <h2 className='text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600'>
            24-Hour Temperature & Rain Trendline
          </h2>
        </div>

        {/* Legend & Stats */}
        <div className='flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-500 flex-wrap'>
          <div className='flex items-center gap-1.5'>
            <span className='h-2.5 w-2.5 rounded-full bg-blue-600' aria-hidden='true' />
            <span className='font-medium'>Temperature</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='h-2.5 w-2.5 rounded-sm bg-sky-400' aria-hidden='true' />
            <span className='font-medium'>Rain Chance (%)</span>
          </div>
          <div className='hidden sm:flex items-center gap-1 text-slate-400 text-[11px] ml-1 pl-2 border-l border-slate-200'>
            <span>Range:</span>
            <span className='font-semibold text-slate-700'>
              {minTemp}° to {maxTemp}°{isCelsius ? 'C' : 'F'}
            </span>
          </div>
        </div>
      </div>

      {/* Screen reader accessible data summary */}
      <div className='sr-only'>
        <p>
          24-hour weather forecast trends. Lowest temperature is {minTemp} degrees,
          highest temperature is {maxTemp} degrees. Peak precipitation probability
          is {maxRain} percent.
        </p>
        <table>
          <caption>Hourly Forecast Data</caption>
          <thead>
            <tr>
              <th scope='col'>Hour</th>
              <th scope='col'>Temp ({isCelsius ? '°C' : '°F'})</th>
              <th scope='col'>Rain Chance (%)</th>
              <th scope='col'>Condition</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((d) => (
              <tr key={d.time}>
                <td>{d.hourLabel}</td>
                <td>{d.temp}°</td>
                <td>{d.rainChance}%</td>
                <td>{d.conditionText}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart Canvas Area */}
      <div className='w-full h-44 sm:h-52 min-h-[176px]'>
        {!mounted ? (
          <div className='w-full h-full rounded-xl bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-400'>
            Loading trendline visualization...
          </div>
        ) : (
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 8, left: -22, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#2563eb' stopOpacity={0.32} />
                  <stop offset='95%' stopColor='#3b82f6' stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                stroke='#f1f5f9'
              />

              <XAxis
                dataKey='hourLabel'
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fontSize: 10, fill: '#64748b' }}
                interval='preserveStartEnd'
              />

              {/* Primary YAxis for Temperature */}
              <YAxis
                yAxisId='temp'
                domain={[minTemp - 2, maxTemp + 2]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                unit='°'
                width={32}
              />

              {/* Secondary YAxis for Rain Probability */}
              <YAxis
                yAxisId='rain'
                domain={[0, 100]}
                orientation='right'
                hide={true}
              />

              <Tooltip
                content={<CustomWeatherTooltip isCelsius={isCelsius} />}
                cursor={{
                  stroke: '#3b82f6',
                  strokeWidth: 1.5,
                  strokeDasharray: '3 3',
                }}
              />

              {/* Rain probability bar */}
              <Bar
                yAxisId='rain'
                dataKey='rainChance'
                fill='#38bdf8'
                opacity={0.4}
                radius={[4, 4, 0, 0]}
                maxBarSize={14}
              />

              {/* Temperature curve spline */}
              <Area
                yAxisId='temp'
                type='monotone'
                dataKey='temp'
                stroke='#2563eb'
                strokeWidth={3}
                fill={`url(#${gradientId})`}
                dot={{
                  r: 3,
                  fill: '#ffffff',
                  stroke: '#2563eb',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: '#1d4ed8',
                  stroke: '#ffffff',
                  strokeWidth: 2.5,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
