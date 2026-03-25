import Link from 'next/link';

export default function Custom404Page() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.32em] text-teal-500">
          WhiLab
        </p>
        <h1 className="mb-4 text-4xl font-semibold text-[var(--text-primary)] md:text-5xl">
          Pagina nao encontrada
        </h1>
        <p className="mb-8 max-w-xl text-base text-[var(--text-muted)] md:text-lg">
          O endereco acessado nao existe ou foi movido. Volte para a home ou entre no painel para
          continuar.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-teal-500"
          >
            Ir para a home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/10 px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-teal-500/40 hover:bg-teal-500/10"
          >
            Abrir dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
