'use client';

export function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <div className="flex flex-col items-center gap-4 select-none">

        {/* Spinner */}
        <div className="relative h-14 w-14">
          {/* Background ring */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border-4 border-[#F2D6DA]"
          />

          {/* Spinner ring */}
          <span
            aria-hidden
            className="absolute inset-0 rounded-full border-4 border-[#7A1E2D] border-t-transparent motion-safe:animate-spin"
          />
        </div>

        {/* Branding */}
        <div className="text-center">
          <h2 className="text-lg font-semibold tracking-wide text-[#7A1E2D]">
            Tani Africa
          </h2>
          <p className="mt-1 text-xs text-[#9B2C3A]">
            Loading your experience…
          </p>
        </div>

      </div>
    </div>
  );
}