/**
 * Props for the WeatherDashboardSkeleton component.
 */
export interface WeatherDashboardSkeletonProps {
  /** Optional custom CSS class name */
  className?: string;
}

/**
 * WeatherDashboardSkeleton renders a zero-CLS shimmer layout mirroring the hero panel,
 * navigation bar, hourly projection cards, and metrics grid during data loading transitions.
 */
export default function WeatherDashboardSkeleton({
  className = "",
}: WeatherDashboardSkeletonProps = {}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex-1 min-h-0 flex flex-col lg:flex-row rounded-3xl lg:rounded-4xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl lg:overflow-hidden animate-pulse ${className}`}
    >
      <span className="sr-only">Loading weather forecast data...</span>
      {/* Hero Panel Skeleton */}
      <aside className="w-full lg:w-[34%] xl:w-[30%] lg:h-full min-h-0 bg-slate-300 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden rounded-t-3xl lg:rounded-t-none lg:rounded-l-3xl shrink-0">
        <div className="shimmer absolute inset-0" />
        <div className="w-full flex justify-between items-center z-10">
          <div className="h-4 w-28 bg-slate-400/50 rounded-md" />
          <div className="h-7 w-24 bg-slate-400/50 rounded-full" />
        </div>

        <div className="flex flex-col items-center gap-4 sm:gap-6 z-10 w-full my-auto py-4 sm:py-6">
          <div className="h-24 sm:h-28 w-36 sm:w-44 bg-slate-400/60 rounded-3xl" />
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 w-full max-w-xs sm:max-w-sm lg:max-w-60">
            <div className="h-9 bg-slate-400/50 rounded-2xl w-full" />
            <div className="h-9 bg-slate-400/50 rounded-2xl w-full" />
          </div>
        </div>
        <div className="h-4 sm:h-5 w-44 sm:w-48 bg-slate-400/40 rounded-full z-10" />
      </aside>

      {/* Main Content Area Skeleton */}
      <div className="flex-1 lg:min-h-0 lg:h-full flex flex-col lg:overflow-hidden">
        {/* Pinned Top Controls Bar Skeleton */}
        <div className="shrink-0 border-b border-slate-200/70 px-3.5 py-2.5 sm:px-6 sm:py-3 lg:px-8 flex items-center justify-between">
          <div className="h-8 sm:h-9 w-40 sm:w-48 bg-slate-200 rounded-2xl" />
          <div className="h-8 sm:h-9 w-24 sm:w-32 bg-slate-200 rounded-2xl" />
        </div>

        {/* Content Area Skeleton */}
        <div className="custom-scrollbar flex-1 lg:min-h-0 lg:overflow-y-auto px-3.5 py-3.5 sm:px-6 lg:py-6 lg:pr-8 flex flex-col gap-4 sm:gap-6">
          {/* Headline Skeleton */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="h-7 sm:h-8 w-3/4 bg-slate-200 rounded-xl" />
            <div className="h-7 sm:h-8 w-1/2 bg-slate-200 rounded-xl" />
          </div>

          {/* 24-Hour Trendline Chart Skeleton (Zero-CLS Target) */}
          <div className="mt-2 sm:mt-4 rounded-2xl bg-white/85 p-3 sm:p-5 border border-slate-100 relative overflow-hidden flex flex-col justify-between">
            <div className="shimmer absolute inset-0" />
            <div className="flex items-center justify-between flex-wrap gap-2 z-10 mb-3">
              <div className="h-4 w-44 sm:w-56 bg-slate-200 rounded-md" />
              <div className="h-4 w-28 sm:w-36 bg-slate-200 rounded-md" />
            </div>
            <div className="w-full h-44 sm:h-52 min-h-44 rounded-xl bg-slate-100/70 z-10" />
          </div>

          {/* Hourly Cards Row Skeleton */}
          <div className="flex flex-col gap-3 mt-2 sm:mt-4">
            <div className="h-5 w-40 bg-slate-200 rounded-md" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-6 gap-2.5 sm:gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-40 sm:h-44 rounded-2xl sm:rounded-3xl bg-slate-100 p-3 sm:p-4 flex flex-col items-center justify-between border border-slate-200/60 relative overflow-hidden"
                >
                  <div className="shimmer absolute inset-0" />
                  <div className="h-4 w-12 bg-slate-200 rounded-full" />
                  <div className="h-7 sm:h-8 w-7 sm:w-8 bg-slate-200 rounded-full" />
                  <div className="h-7 sm:h-8 w-12 bg-slate-200 rounded-lg" />
                  <div className="h-3 w-14 bg-slate-200 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Metrics Grid Skeleton */}
          <div className="flex flex-col gap-3 mt-4 sm:mt-6">
            <div className="h-5 w-48 bg-slate-200 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-36 sm:h-40 rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-5 flex flex-col justify-between border border-white/80 shadow-xs relative overflow-hidden"
                >
                  <div className="shimmer absolute inset-0" />
                  <div className="h-4 w-28 bg-slate-200 rounded-md" />
                  <div className="h-7 sm:h-8 w-20 bg-slate-200 rounded-md" />
                  <div className="h-3 w-full bg-slate-100 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
