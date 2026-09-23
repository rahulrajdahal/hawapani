import { API_TIMEOUT_MS, DEFAULT_API_URL } from '@/lib/constants';
import {
  IAstronomy,
  ICurrentForecast,
  ICurrentLocation,
  IDailyForecast,
  IHourlyForecast,
  ISearchLocation,
  IWeatherAlert,
  IWeatherData,
} from '@/lib/types/weather';

function getApiKey(): string {
  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Weather API key is not configured. Please set WEATHER_API_KEY in your .env file.'
    );
  }
  return apiKey;
}

function getBaseUrl(): string {
  return process.env.API_URL || DEFAULT_API_URL;
}

/**
 * Executes a fetch request with up to 3 retries and exponential backoff
 * for transient network or 5xx server errors, skipping 4xx client errors.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  baseDelayMs = 300
): Promise<Response> {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      const response = await fetch(url, options);
      // Permanent 4xx failures should not be retried per AGENTS.md
      if ((response.status >= 400 && response.status < 500) || response.ok) {
        return response;
      }
      if (attempt === retries) {
        return response;
      }
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
    }

    attempt++;
    const backoff = baseDelayMs * Math.pow(2, attempt - 1);
    await new Promise((resolve) => setTimeout(resolve, backoff));
  }
  return fetch(url, options);
}

export const weatherService = {
  async getForecast(query: string): Promise<IWeatherData> {
    const apiKey = getApiKey();
    const baseUrl = getBaseUrl();

    // Query 7 days of forecast with AQI and Alerts enabled (~30 minutes revalidation)
    const response = await fetchWithRetry(
      `${baseUrl}/forecast.json?key=${apiKey}&q=${encodeURIComponent(query)}&days=7&aqi=yes&alerts=yes`,
      {
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
        next: { revalidate: 1800 },
      }
    );

    const responseJson = await response.json();

    if (!response.ok || responseJson.error) {
      const errorMessage =
        responseJson?.error?.message ||
        `Failed to fetch weather forecast (HTTP ${response.status})`;
      throw new Error(errorMessage);
    }

    const current = responseJson.current;
    const location = responseJson.location;
    const forecastDays = responseJson.forecast?.forecastday ?? [];

    // 1. Process 24-Hour Continuous Hourly Projection
    const allHours: IHourlyForecast[] = [];
    forecastDays.forEach((day: { hour?: Array<Record<string, unknown>> }) => {
      if (Array.isArray(day.hour)) {
        day.hour.forEach((h) => {
          const condition = (h.condition as { text?: string; icon?: string; code?: number }) || {};
          allHours.push({
            time: String(h.time ?? ''),
            time_epoch: Number(h.time_epoch ?? 0),
            temp_c: Number(h.temp_c ?? 0),
            temp_f: Number(h.temp_f ?? 0),
            humidity: Number(h.humidity ?? 0),
            wind_kph: Number(h.wind_kph ?? 0),
            wind_mph: Number(h.wind_mph ?? 0),
            condition: {
              text: condition.text ?? '',
              icon: condition.icon ?? '',
              code: condition.code,
            },
            chance_of_rain: Number(h.chance_of_rain ?? 0),
            uv: Number(h.uv ?? 0),
            feelslike_c: Number(h.feelslike_c ?? 0),
            feelslike_f: Number(h.feelslike_f ?? 0),
          });
        });
      }
    });

    const activeHourEpoch = (current.last_updated_epoch ?? 0) - 3599;
    let rolling24Hours = allHours
      .filter((h) => h.time_epoch >= activeHourEpoch)
      .sort((a, b) => a.time_epoch - b.time_epoch)
      .slice(0, 24);

    if (rolling24Hours.length === 0) {
      rolling24Hours = allHours.slice(0, 24);
    }

    // 2. Process 7-Day Daily Forecast
    const dailyForecast: IDailyForecast[] = forecastDays.map((day: {
      date: string;
      date_epoch: number;
      day: Record<string, unknown>;
      astro?: Record<string, unknown>;
      air_quality?: Record<string, unknown>;
    }) => {
      const d = day.day || {};
      const condition = (d.condition as { text?: string; icon?: string; code?: number }) || {};
      const astro = day.astro || {};

      return {
        date: day.date,
        date_epoch: day.date_epoch,
        maxtemp_c: Number(d.maxtemp_c ?? 0),
        maxtemp_f: Number(d.maxtemp_f ?? 0),
        mintemp_c: Number(d.mintemp_c ?? 0),
        mintemp_f: Number(d.mintemp_f ?? 0),
        avgtemp_c: Number(d.avgtemp_c ?? 0),
        avgtemp_f: Number(d.avgtemp_f ?? 0),
        maxwind_kph: Number(d.maxwind_kph ?? 0),
        avghumidity: Number(d.avghumidity ?? 0),
        daily_chance_of_rain: Number(d.daily_chance_of_rain ?? 0),
        condition: {
          text: condition.text ?? '',
          icon: condition.icon ?? '',
          code: condition.code,
        },
        uv: Number(d.uv ?? 0),
        astronomy: {
          sunrise: String(astro.sunrise ?? ''),
          sunset: String(astro.sunset ?? ''),
          moonrise: String(astro.moonrise ?? ''),
          moonset: String(astro.moonset ?? ''),
          moon_phase: String(astro.moon_phase ?? ''),
          moon_illumination: String(astro.moon_illumination ?? ''),
        },
        air_quality: (day.air_quality as Record<string, unknown>) || undefined,
      };
    });

    // 3. Current Forecast Details
    const currentForecast: ICurrentForecast = {
      last_updated: current.last_updated,
      last_updated_epoch: current.last_updated_epoch,
      temp_c: current.temp_c,
      temp_f: current.temp_f,
      humidity: current.humidity,
      wind_kph: current.wind_kph,
      wind_mph: current.wind_mph,
      wind_dir: current.wind_dir,
      pressure_mb: current.pressure_mb,
      pressure_in: current.pressure_in,
      precip_mm: current.precip_mm,
      precip_in: current.precip_in,
      vis_km: current.vis_km,
      vis_miles: current.vis_miles,
      uv: current.uv,
      feelslike_c: current.feelslike_c,
      feelslike_f: current.feelslike_f,
      condition: {
        text: current.condition?.text ?? '',
        icon: current.condition?.icon ?? '',
        code: current.condition?.code,
      },
      air_quality: current.air_quality,
    };

    // 4. Current Location Details
    const currentLocation: ICurrentLocation = {
      name: location.name,
      region: location.region,
      country: location.country,
      lat: location.lat,
      lon: location.lon,
      tz_id: location.tz_id,
      localtime: location.localtime,
      localtime_epoch: location.localtime_epoch,
    };

    // 5. Today's Astronomy & Weather Alerts
    const todayAstro = forecastDays[0]?.astro;
    const astronomy: IAstronomy | undefined = todayAstro
      ? {
          sunrise: String(todayAstro.sunrise ?? ''),
          sunset: String(todayAstro.sunset ?? ''),
          moonrise: String(todayAstro.moonrise ?? ''),
          moonset: String(todayAstro.moonset ?? ''),
          moon_phase: String(todayAstro.moon_phase ?? ''),
          moon_illumination: String(todayAstro.moon_illumination ?? ''),
        }
      : undefined;

    const rawAlerts = responseJson.alerts?.alert ?? [];
    const alerts: IWeatherAlert[] = Array.isArray(rawAlerts)
      ? rawAlerts.map((a: Record<string, unknown>) => ({
          headline: String(a.headline ?? ''),
          msgtype: String(a.msgtype ?? ''),
          severity: String(a.severity ?? ''),
          urgency: String(a.urgency ?? ''),
          areas: String(a.areas ?? ''),
          category: String(a.category ?? ''),
          certainty: String(a.certainty ?? ''),
          event: String(a.event ?? ''),
          note: String(a.note ?? ''),
          effective: String(a.effective ?? ''),
          expires: String(a.expires ?? ''),
          desc: String(a.desc ?? ''),
          instruction: String(a.instruction ?? ''),
        }))
      : [];

    return {
      currentForecast,
      currentLocation,
      forecast: rolling24Hours,
      dailyForecast,
      astronomy,
      alerts,
    };
  },

  async searchLocations(query: string): Promise<ISearchLocation[]> {
    const apiKey = getApiKey();
    const baseUrl = getBaseUrl();

    const response = await fetchWithRetry(
      `${baseUrl}/search.json?key=${apiKey}&q=${encodeURIComponent(query)}`,
      {
        signal: AbortSignal.timeout(API_TIMEOUT_MS),
        next: { revalidate: 3600 },
      }
    );

    const responseJson = await response.json();

    if (!response.ok || responseJson.error) {
      const errorMessage =
        responseJson?.error?.message ||
        `Failed to search location (HTTP ${response.status})`;
      throw new Error(errorMessage);
    }

    if (!Array.isArray(responseJson)) {
      return [];
    }

    return responseJson.map(
      (res: {
        id: number;
        name: string;
        region?: string;
        country?: string;
        lat?: number;
        lon?: number;
      }) => ({
        id: res.id,
        name: res.region
          ? `${res.name}, ${res.region}, ${res.country}`
          : `${res.name}, ${res.country}`,
        region: res.region,
        country: res.country,
        lat: res.lat,
        lon: res.lon,
      })
    );
  },
};
