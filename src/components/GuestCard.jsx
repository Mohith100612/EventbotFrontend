export default function GuestCard({ guest, onClick, isMe }) {
  const displayName = guest.name || guest.full_name || 'Unnamed guest';
  const initials = displayName
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const subtitleParts = [];
  if (guest.role) subtitleParts.push(guest.role);
  if (guest.organization) subtitleParts.push(guest.organization);
  let subtitle = subtitleParts.join(' @ ');
  if (!subtitle && guest.years_of_experience != null && guest.years_of_experience !== '') {
    subtitle = `${guest.years_of_experience} yrs experience`;
  }
  if (!subtitle && (guest.about_you || guest.detailed_profile)) {
    const text = guest.about_you || guest.detailed_profile;
    subtitle = text.slice(0, 60) + (text.length > 60 ? '…' : '');
  }

  const scorePercent =
    typeof guest.score === 'number' ? Math.round(guest.score * 100) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200
                 bg-white hover:border-indigo-400 hover:shadow-sm transition text-left"
    >
      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center
                      justify-center font-semibold text-sm flex-shrink-0">
        {initials || '?'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-900 truncate">{displayName}</span>
          {isMe && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
              You
            </span>
          )}
          {guest.experience_level && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
              {guest.experience_level}
            </span>
          )}
        </div>
        {subtitle && (
          <div className="text-sm text-slate-500 truncate">{subtitle}</div>
        )}
      </div>
      {scorePercent != null && (
        <div className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded flex-shrink-0">
          {scorePercent}% match
        </div>
      )}
    </button>
  );
}
