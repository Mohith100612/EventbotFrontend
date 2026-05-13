import { useState } from 'react';
import { EDITABLE_FIELDS, updateGuest } from '../api/guests.js';

export default function ProfileEditModal({ guest, shortcode, onClose, onSaved }) {
  const initial = {};
  for (const field of EDITABLE_FIELDS) {
    initial[field.key] = guest[field.key] ?? '';
  }
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const patch = {};
    for (const field of EDITABLE_FIELDS) {
      const next = form[field.key];
      const prev = guest[field.key] ?? '';
      if (String(next) !== String(prev)) {
        if (field.type === 'number') {
          patch[field.key] = next === '' ? null : Number(next);
        } else {
          patch[field.key] = next;
        }
      }
    }

    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }

    try {
      const res = await updateGuest(shortcode, patch);
      onSaved(res?.guest || { ...guest, ...patch });
    } catch (err) {
      setError(err.body?.message || err.message || 'Could not save changes.');
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 bg-slate-900/40 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Edit your profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          {EDITABLE_FIELDS.map((field) => (
            <div key={field.key}>
              <label
                htmlFor={`field-${field.key}`}
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  id={`field-${field.key}`}
                  rows={3}
                  value={form[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300
                             focus:outline-none focus:ring-2 focus:ring-indigo-500
                             focus:border-indigo-500 text-sm"
                />
              ) : (
                <input
                  id={`field-${field.key}`}
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300
                             focus:outline-none focus:ring-2 focus:ring-indigo-500
                             focus:border-indigo-500 text-sm"
                />
              )}
            </div>
          ))}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded text-sm text-slate-700 hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded text-sm bg-indigo-600 text-white
                       hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
