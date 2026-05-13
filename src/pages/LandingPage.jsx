export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">EventBot</h1>
        <p className="text-slate-600 leading-relaxed">
          Welcome to the event directory. Open the personal link that was shared
          with you (it looks like{' '}
          <code className="px-1.5 py-0.5 bg-slate-200 rounded text-sm">
            /eventbot/&lt;your-code&gt;
          </code>
          ) to browse registered attendees and manage your own profile.
        </p>
      </div>
    </div>
  );
}
