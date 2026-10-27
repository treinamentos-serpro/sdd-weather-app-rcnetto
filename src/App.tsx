import { useState } from 'react';
import SearchBar from './components/SearchBar';

function App() {
  const [status, setStatus] = useState('');

  return (
    <main className="min-h-screen bg-gradient-to-br from-night-900 via-night-800 to-night-900 px-4 py-12 text-white sm:px-6 sm:py-20">
      <section className="mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">
            Previsão do tempo
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Weather App</h1>
          <p className="mt-3 max-w-prose text-slate-200">
            Pesquise uma cidade para iniciar. Este modo de demonstração funciona offline e não
            consulta uma API meteorológica.
          </p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md sm:p-7">
          <SearchBar
            onSearch={(city) =>
              setStatus(
                `Busca recebida para “${city}”. Modo demonstração: nenhum resultado de API foi gerado.`,
              )
            }
          />
          {status && (
            <p aria-live="polite" className="mt-5 text-sm text-slate-200" role="status">
              {status}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
