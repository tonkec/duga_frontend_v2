import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="min-h-screen bg-[#222831] px-5 py-10 text-white">
        <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-3xl border border-white/10 bg-white/10 p-6 text-center shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
            <span className="mb-4 inline-flex rounded-full bg-blue/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue">
              Greška
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Nešto se strgalo</h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/80 sm:text-base">
              Stranica se nije uspjela prikazati. Možeš ponovno učitati stranicu ili se vratiti na
              početnu.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                className="rounded-full bg-blue px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue/20 transition-colors hover:bg-blue-dark"
                onClick={() => window.location.reload()}
              >
                Učitaj ponovno
              </button>
              <button
                type="button"
                className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
                onClick={() => window.location.assign('/')}
              >
                Idi na početnu
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }
}

export default ErrorBoundary;
