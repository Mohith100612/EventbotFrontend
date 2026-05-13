import GuestCard from './GuestCard.jsx';

export default function GuestList({ guests, myShortcode, onSelect }) {
  if (guests.length === 0) {
    return (
      <div className="text-center text-slate-500 py-12">
        No guests match your search.
      </div>
    );
  }
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {guests.map((g) => (
        <GuestCard
          key={g.shortcode || g._id || g.email}
          guest={g}
          isMe={g.shortcode === myShortcode}
          onClick={() => onSelect(g)}
        />
      ))}
    </div>
  );
}
