const REGIONS = [
  { flag: "🇺🇸", name: "US" },
  { flag: "🇬🇧", name: "UK" },
  { flag: "🇮🇳", name: "India" },
  { flag: "🇦🇺", name: "Australia" },
  { flag: "🇨🇦", name: "Canada" },
  { flag: "🇦🇪", name: "UAE" },
  { flag: "🇸🇬", name: "Singapore" },
  { flag: "🇪🇺", name: "EU" },
];

const RegionStrip = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div
        className="flex items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground overflow-x-auto sm:flex-wrap whitespace-nowrap scrollbar-none"
        aria-label="Bank coverage by region"
      >
        {REGIONS.map((r, i) => (
          <span key={r.name} className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true">{r.flag}</span>
              <span>{r.name}</span>
            </span>
            <span aria-hidden="true" className="text-muted-foreground/40">
              ·
            </span>
          </span>
        ))}
        <span className="font-medium" style={{ color: "#0C8A5D" }}>
          100+ countries
        </span>
      </div>
    </div>
  );
};

export default RegionStrip;
