export interface ICondition {
  text: string;
  icon: string;
  code?: number;
}

export interface IAirQuality {
  co?: number;
  no2?: number;
  o3?: number;
  so2?: number;
  pm2_5?: number;
  pm10?: number;
  'us-epa-index'?: number;
  'gb-defra-index'?: number;
}

export interface IAstronomy {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moon_phase: string;
  moon_illumination: number | string;
}

export interface IWeatherAlert {
  headline: string;
  msgtype?: string;
  severity?: string;
  urgency?: string;
  areas?: string;
  category?: string;
  certainty?: string;
  event: string;
  note?: string;
  effective: string;
  expires: string;
  desc: string;
  instruction?: string;
}

export interface ICurrentForecast {
  last_updated: string;
  last_updated_epoch: number;
  temp_c: number;
  temp_f: number;
  humidity: number;
  wind_kph: number;
  wind_mph?: number;
  wind_dir?: string;
  pressure_mb?: number;
  pressure_in?: number;
  precip_mm?: number;
  precip_in?: number;
  vis_km?: number;
  vis_miles?: number;
  uv?: number;
  feelslike_c?: number;
  feelslike_f?: number;
  condition: ICondition;
  air_quality?: IAirQuality;
}

export interface ICurrentLocation {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  tz_id: string;
  localtime: string;
  localtime_epoch: number;
}

export interface IHourlyForecast {
  time: string;
  time_epoch: number;
  temp_c: number;
  temp_f: number;
  humidity: number;
  wind_kph: number;
  wind_mph?: number;
  condition: ICondition;
  chance_of_rain?: number;
  uv?: number;
  feelslike_c?: number;
  feelslike_f?: number;
}

export interface IDailyForecast {
  date: string;
  date_epoch: number;
  maxtemp_c: number;
  maxtemp_f: number;
  mintemp_c: number;
  mintemp_f: number;
  avgtemp_c: number;
  avgtemp_f: number;
  maxwind_kph: number;
  avghumidity: number;
  daily_chance_of_rain: number;
  condition: ICondition;
  uv: number;
  astronomy?: IAstronomy;
  air_quality?: IAirQuality;
}

export interface IWeatherData {
  currentForecast: ICurrentForecast;
  currentLocation: ICurrentLocation;
  forecast: IHourlyForecast[];
  dailyForecast: IDailyForecast[];
  astronomy?: IAstronomy;
  alerts?: IWeatherAlert[];
}

export interface ISearchLocation {
  id: number;
  name: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
}

export interface IApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}
