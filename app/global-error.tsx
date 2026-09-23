'use client';

export default function GlobalError({
  reset,
}: Readonly<{ reset: () => void }>) {
  return (
    <html lang="en">
      <body className="m-0 p-0 flex min-h-[100dvh] w-full flex-col items-center justify-center bg-slate-900 text-white font-sans">
        <div
          role="alert"
          className="flex w-full max-w-md flex-col items-center justify-center rounded-3xl bg-white/10 border border-white/20 p-8 text-center shadow-2xl"
        >
          <div className="mb-3 text-4xl">⛈️</div>
          <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
          <p className="text-sm text-slate-300 mb-6">
            A critical application error occurred.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-hidden"
          >
            Try Again 🔄
          </button>
        </div>
      </body>
    </html>
  );
}
