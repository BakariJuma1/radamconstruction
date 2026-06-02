const Shimmer = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const ServiceCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
    <Shimmer className="h-56 sm:h-64 rounded-none" />
    <div className="p-5 space-y-3">
      <Shimmer className="h-5 w-3/4" />
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-5/6" />
      <Shimmer className="h-4 w-4/6" />
      <Shimmer className="h-10 w-full mt-2 rounded-lg" />
    </div>
  </div>
);

export const PortfolioCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
    <Shimmer className="h-56 sm:h-64 rounded-none" />
    <div className="p-4 space-y-3">
      <Shimmer className="h-5 w-2/3" />
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-4/5" />
      <Shimmer className="h-5 w-20 rounded-full" />
    </div>
  </div>
);

export const HomeServiceCardSkeleton = () => (
  <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
    <Shimmer className="h-60 rounded-none" />
    <div className="p-6 space-y-3">
      <Shimmer className="h-5 w-3/4" />
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-5/6" />
      <div className="flex items-center justify-between mt-2">
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  </div>
);

export const HomePortfolioCardSkeleton = () => (
  <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
    <Shimmer className="h-64 rounded-none" />
    <div className="p-6 space-y-3">
      <Shimmer className="h-5 w-2/3" />
      <Shimmer className="h-4 w-full" />
      <div className="grid grid-cols-3 gap-2 mt-2">
        <Shimmer className="h-20 rounded-xl" />
        <Shimmer className="h-20 rounded-xl" />
        <Shimmer className="h-20 rounded-xl" />
      </div>
    </div>
  </div>
);

export const HardwareCategorySkeleton = () => (
  <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
    <div className="p-5 border-b border-gray-100 space-y-2">
      <Shimmer className="h-5 w-1/3" />
      <Shimmer className="h-4 w-2/3" />
    </div>
    <div className="p-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Shimmer className="h-24 rounded-xl" />
          <Shimmer className="h-3 w-3/4" />
          <Shimmer className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);
