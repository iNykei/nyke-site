type CommunityStatsProps = {
  players: number;
  gear: number;
  activities: number;
  regions: number;
};

export function CommunityStats({ players, gear, activities, regions }: CommunityStatsProps) {
  const stats = [
    ["Profiles", players],
    ["Gear records", gear],
    ["Recent updates", activities],
    ["Regions", regions],
  ];

  return (
    <div className="grid grid-cols-2 border border-white/10 bg-[#0d0e12] md:grid-cols-4">
      {stats.map(([label, value]) => (
        <div key={label} className="border-b border-r border-white/10 p-4 last:border-r-0 md:border-b-0">
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-600">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-50">{value}</p>
        </div>
      ))}
    </div>
  );
}
