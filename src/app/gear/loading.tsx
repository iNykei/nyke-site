export default function GearLoading() {
  return (
    <main className="page-light min-h-[calc(100vh-57px)] bg-[#fafafa] px-4 py-10 text-zinc-950 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading gear">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-9 w-52 rounded bg-zinc-200" />
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="h-72 rounded-lg border border-zinc-200 bg-white" />)}
        </div>
      </div>
    </main>
  );
}
