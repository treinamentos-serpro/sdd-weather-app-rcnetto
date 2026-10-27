import { type FormEvent, useId, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const inputId = useId();
  const errorId = useId();
  const [city, setCity] = useState('');
  const [showEmptyError, setShowEmptyError] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setShowEmptyError(true);
      return;
    }

    setShowEmptyError(false);
    onSearch(trimmedCity);
  }

  return (
    <form aria-label="Buscar cidade" className="w-full" onSubmit={handleSubmit} role="search">
      <label className="mb-2 block text-sm font-medium text-slate-100" htmlFor={inputId}>
        Cidade
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          aria-describedby={showEmptyError ? errorId : undefined}
          aria-invalid={showEmptyError}
          autoComplete="off"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white backdrop-blur-md placeholder:text-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id={inputId}
          onChange={(event) => {
            setCity(event.target.value);
            setShowEmptyError(false);
          }}
          placeholder="Ex.: São Paulo"
          type="search"
          value={city}
        />
        <button
          className="min-h-12 rounded-xl bg-accent-500 px-6 py-3 font-semibold text-night-900 transition-colors hover:bg-accent-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          type="submit"
        >
          Buscar
        </button>
      </div>
      {showEmptyError && (
        <p className="mt-2 text-sm text-rose-200" id={errorId} role="alert">
          Digite o nome de uma cidade antes de buscar.
        </p>
      )}
    </form>
  );
}

export default SearchBar;
