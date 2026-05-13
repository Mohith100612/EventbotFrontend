import { EXPERIENCE_LEVELS } from '../api/search.js';

export default function SearchBar({
  value,
  onChange,
  experienceLevel,
  onExperienceLevelChange,
  placeholder,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search… e.g. "ML engineers in healthcare"'}
        className="flex-1 px-4 py-3 rounded-lg border border-slate-300 bg-white shadow-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                   text-slate-900 placeholder-slate-400"
      />
      <select
        value={experienceLevel}
        onChange={(e) => onExperienceLevelChange(e.target.value)}
        className="px-3 py-3 rounded-lg border border-slate-300 bg-white shadow-sm text-sm
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">All experience levels</option>
        {EXPERIENCE_LEVELS.map((level) => (
          <option key={level} value={level} className="capitalize">
            {level[0].toUpperCase() + level.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
