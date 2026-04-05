'use client';

interface PageLoaderProps {
  isLoading?: boolean;
}

export function PageLoader({ isLoading }: PageLoaderProps) {
  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#7A1E2D]"
    >
      <div className="flex flex-col items-center gap-4 select-none">
        {/* Spinner */}
        <div className="relative h-14 w-14">
          {/* Background ring */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border-4 border-[#F2D6DA] border-opacity-30"
          />

          {/* Spinner ring */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border-4 border-white border-t-transparent motion-safe:animate-spin"
          />
        </div>

        {/* Branding */}
        <div className="text-center">
          <h2 className="text-lg font-semibold tracking-wide text-white">
            Tani Africa
          </h2>
          <p className="mt-1 text-xs text-[#F2D6DA]">
            Loading your experience…
          </p>
        </div>
      </div>
    </div>
  );
}