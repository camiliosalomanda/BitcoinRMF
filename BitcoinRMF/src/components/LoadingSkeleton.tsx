'use client';

export function CardSkeleton() {
  return (
    <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        <div className="h-5 bg-gray-800 rounded w-16" />
      </div>
      <div className="h-3 bg-gray-800 rounded w-full mb-2" />
      <div className="h-3 bg-gray-800 rounded w-2/3 mb-3" />
      <div className="flex gap-2">
        <div className="h-5 bg-gray-800 rounded w-20" />
        <div className="h-5 bg-gray-800 rounded w-16" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-6">
        <div className="h-6 bg-gray-800 rounded w-1/2 mb-4" />
        <div className="h-4 bg-gray-800 rounded w-full mb-2" />
        <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-800 rounded w-1/2" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-4">
            <div className="h-16 bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#111118] border border-[#2a2a3a] rounded-xl p-5">
          <div className="h-3 bg-gray-800 rounded w-24 mb-3" />
          <div className="h-8 bg-gray-800 rounded w-16" />
        </div>
      ))}
    </div>
  );
}
