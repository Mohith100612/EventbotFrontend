import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Page not found</h1>
        <p className="text-slate-600 mb-6">
          The link you opened is invalid or that shortcode no longer exists.
        </p>
        <Link
          to="/"
          className="inline-block px-4 py-2 rounded bg-slate-900 text-white text-sm hover:bg-slate-800"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
