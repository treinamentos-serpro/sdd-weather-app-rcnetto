import { useId } from 'react';
import type { City } from '../types/weather';

interface CityResultsProps {
  cities: City[];
  selectedCityId?: number;
  onSelect: (city: City) => void;
  disabled: boolean;
}

export default function CityResults({
  cities,
  selectedCityId,
  onSelect,
  disabled,
}: CityResultsProps) {
  const headingId = useId();
  if (cities.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="min-w-0 space-y-3">
      <h2 id={headingId} className="text-xl font-semibold">
        Cidades encontradas
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {cities.map((city) => (
          <li key={city.id} className="min-w-0">
            <button
              type="button"
              onClick={() => onSelect(city)}
              disabled={disabled}
              aria-current={city.id === selectedCityId ? 'true' : undefined}
              className="min-h-12 w-full break-words rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur-md hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {[city.name, city.region, city.country].filter(Boolean).join(', ')}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
