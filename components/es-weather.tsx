import {
  WeatherIcon,
  type WeatherIconName,
} from '@/components/ui/icons/weather';
import { BlurIn, EsFlag } from '@/components/es-time';
import { cn } from '@/lib/utils';

const WEATHER_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=37.39&longitude=-5.99&current=temperature_2m,apparent_temperature,weather_code,is_day&timezone=Europe/Madrid';
// Open-Meteo refreshes "current" every 15 minutes
const REVALIDATE_SECONDS = 900;

type CurrentWeather = {
  temperature_2m: number;
  apparent_temperature: number;
  weather_code: number;
  is_day: 0 | 1;
};

async function getWeather(): Promise<CurrentWeather | null> {
  try {
    const response = await fetch(WEATHER_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.current ?? null;
  } catch {
    // Weather is a nice-to-have: never break the page over it
    return null;
  }
}

// WMO weather interpretation codes, grouped into what's worth telling apart at a glance
function describe(code: number, isDay: boolean) {
  const conditions: [number[], string, WeatherIconName][] = [
    [[0], 'clear', isDay ? 'sun' : 'moon'],
    [[1, 2], 'partly cloudy', isDay ? 'cloud-sun' : 'cloud-moon'],
    [[3], 'cloudy', 'cloud'],
    [[45, 48], 'fog', 'cloud-fog'],
    [[51, 53, 55, 56, 57], 'drizzle', 'cloud-rain'],
    [[61, 63, 65, 66, 67, 80, 81, 82], 'rain', 'cloud-rain'],
    [[71, 73, 75, 77, 85, 86], 'snow', 'cloud-snow'],
    [[95, 96, 99], 'storms', 'lightning'],
  ];
  const match = conditions.find(([codes]) => codes.includes(code));
  return match ? { label: match[1], icon: match[2] } : null;
}

const CLASS_NAME =
  'text-muted-foreground flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 font-mono text-xs tabular-nums';

function City() {
  return (
    <span className="flex items-center gap-2">
      Sevilla
      <EsFlag />
    </span>
  );
}

// Shown while the weather streams in, and if it can't be fetched
export function EsWeatherFallback({ className }: { className?: string }) {
  return (
    <BlurIn className={cn(CLASS_NAME, className)}>
      <City />
    </BlurIn>
  );
}

export async function EsWeather({ className }: { className?: string }) {
  const weather = await getWeather();
  if (!weather) return <EsWeatherFallback className={className} />;

  const condition = describe(weather.weather_code, weather.is_day === 1);
  const temperature = Math.round(weather.temperature_2m);
  const feelsLike = Math.round(weather.apparent_temperature);

  return (
    <BlurIn className={cn(CLASS_NAME, className)}>
      <span>{temperature}°C now in</span>
      <City />
      <span className="ml-1">feels {feelsLike}°C</span>
      {condition && (
        <span className="ml-1 flex items-center gap-1.5">
          <WeatherIcon name={condition.icon} className="size-3.5 shrink-0" />
          {condition.label}
        </span>
      )}
    </BlurIn>
  );
}
