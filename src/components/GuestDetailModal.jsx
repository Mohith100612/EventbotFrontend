import { DISPLAY_FIELDS } from '../api/guests.js';

function renderValue(field, value) {
  if (value == null || value === '') return null;
  if (field.isLink) {
    const href = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 hover:underline break-all"
      >
        {value}
      </a>
    );
  }
  const cls = field.capitalize
    ? 'text-slate-800 whitespace-pre-wrap capitalize'
    : 'text-slate-800 whitespace-pre-wrap';
  return <span className={cls}>{String(value)}</span>;
}

export default function GuestDetailModal({ guest, enriching, onClose }) {
  if (!guest) return null;

  const displayName = guest.name || guest.full_name || 'Guest';
  const scorePercent =
    typeof guest.score === 'number' ? Math.round(guest.score * 100) : null;

  return (
    <div
      className="fixed inset-0 z-30 bg-slate-900/40 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-slate-500">Full name</div>
            <h2 className="text-lg font-semibold text-slate-900 truncate">{displayName}</h2>
            {scorePercent != null && (
              <div className="text-xs text-indigo-700 mt-0.5">
                Relevance: {scorePercent}% match
              </div>
            )}
            {enriching && (
              <div className="text-xs text-slate-400 mt-0.5">Loading more details…</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none flex-shrink-0"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <dl className="px-6 py-4 space-y-3">
          {DISPLAY_FIELDS.map((field) => {
            const rendered = renderValue(field, guest[field.key]);
            if (!rendered) return null;
            return (
              <div key={field.key}>
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  {field.label}
                </dt>
                <dd className="mt-0.5 text-sm">{rendered}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}
