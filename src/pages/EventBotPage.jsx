import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAllGuests, fetchGuest } from '../api/guests.js';
import { searchAttendees, normalizeSearchHit, isSearchConfigured } from '../api/search.js';
import { findMongoMatch, mergeGuests } from '../lib/mergeGuest.js';
import SearchBar from '../components/SearchBar.jsx';
import GuestList from '../components/GuestList.jsx';
import GuestDetailModal from '../components/GuestDetailModal.jsx';
import ProfileEditModal from '../components/ProfileEditModal.jsx';
import Spinner from '../components/Spinner.jsx';
import NotFoundPage from './NotFoundPage.jsx';

const SEARCH_DEBOUNCE_MS = 400;

export default function EventBotPage() {
  const { shortcode } = useParams();

  const [loading, setLoading] = useState(true);
  const [slowLoad, setSlowLoad] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [me, setMe] = useState(null);
  const [browseGuests, setBrowseGuests] = useState([]);

  const [query, setQuery] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');

  const [searchResults, setSearchResults] = useState([]);
  const [expandedQuery, setExpandedQuery] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [selectedGuest, setSelectedGuest] = useState(null);
  const [enriching, setEnriching] = useState(false);
  const [editing, setEditing] = useState(false);

  const searchAbortRef = useRef(null);
  const enrichAbortRef = useRef(null);
  const selectionIdRef = useRef(0);

  async function handleSelectGuest(clicked) {
    const selectionId = ++selectionIdRef.current;
    const mongoMatch = findMongoMatch(clicked, browseGuests);
    const initialSearchHit = clicked.score != null ? clicked : null;
    const initial = mergeGuests(mongoMatch, initialSearchHit, clicked);
    setSelectedGuest(initial);

    const needsSearchEnrichment =
      !initialSearchHit &&
      (initial.role == null || initial.organization == null) &&
      isSearchConfigured();

    if (!needsSearchEnrichment) {
      setEnriching(false);
      return;
    }

    if (enrichAbortRef.current) enrichAbortRef.current.abort();
    const ctrl = new AbortController();
    enrichAbortRef.current = ctrl;
    setEnriching(true);

    try {
      const q = initial.name || initial.full_name || '';
      if (!q) {
        setEnriching(false);
        return;
      }
      const data = await searchAttendees({ q, limit: 5, signal: ctrl.signal });
      if (selectionId !== selectionIdRef.current) return;
      const hits = (data.results || []).map(normalizeSearchHit);
      const targetLinkedin = (initial.linkedin || '').toLowerCase().trim();
      const targetName = (initial.name || '').toLowerCase().trim();
      const match =
        (targetLinkedin &&
          hits.find((h) => (h.linkedin || '').toLowerCase().trim() === targetLinkedin)) ||
        (targetName &&
          hits.find((h) => (h.name || '').toLowerCase().trim() === targetName)) ||
        null;
      if (match) {
        setSelectedGuest((prev) => {
          if (!prev || selectionId !== selectionIdRef.current) return prev;
          return mergeGuests(mongoMatch, match, prev);
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        // silent — show what we have
      }
    } finally {
      if (selectionId === selectionIdRef.current) setEnriching(false);
    }
  }

  function handleCloseDetail() {
    selectionIdRef.current += 1;
    if (enrichAbortRef.current) enrichAbortRef.current.abort();
    setSelectedGuest(null);
    setEnriching(false);
  }

  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => {
      if (!cancelled) setSlowLoad(true);
    }, 3000);

    (async () => {
      try {
        const [meRes, allRes] = await Promise.all([
          fetchGuest(shortcode),
          fetchAllGuests(),
        ]);
        if (cancelled) return;
        const list = Array.isArray(allRes) ? allRes : allRes?.guests || [];
        const myFull = list.find((g) => g.shortcode === shortcode) || meRes;
        setMe(myFull);
        setBrowseGuests(list);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(err.message || 'Failed to load.');
        }
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, [shortcode]);

  const trimmedQuery = query.trim();
  const isSearchMode = trimmedQuery.length > 0 || experienceLevel.length > 0;

  useEffect(() => {
    if (!isSearchMode) {
      setSearchResults([]);
      setSearchError(null);
      setExpandedQuery(null);
      setSearching(false);
      return;
    }

    if (!isSearchConfigured()) {
      setSearchError(
        'Search service not configured. Set VITE_SEARCH_BASE_URL in .env to your EC2 search service URL.'
      );
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (searchAbortRef.current) searchAbortRef.current.abort();
      const ctrl = new AbortController();
      searchAbortRef.current = ctrl;

      setSearching(true);
      setSearchError(null);
      try {
        const data = await searchAttendees({
          q: trimmedQuery || ' ',
          limit: 20,
          experience_level: experienceLevel || undefined,
          signal: ctrl.signal,
        });
        if (ctrl.signal.aborted) return;
        const hits = (data.results || []).map(normalizeSearchHit);
        setSearchResults(hits);
        setExpandedQuery(data.expanded_query || null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setSearchError(err.message || 'Search failed.');
        setSearchResults([]);
      } finally {
        if (!ctrl.signal.aborted) setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [trimmedQuery, experienceLevel, isSearchMode]);

  const displayed = useMemo(() => {
    if (isSearchMode) return searchResults;
    return browseGuests;
  }, [isSearchMode, searchResults, browseGuests]);

  if (notFound) return <NotFoundPage />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner
          label={
            slowLoad
              ? 'Waking up the server, this can take ~30 seconds…'
              : 'Loading directory…'
          }
        />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Couldn't load the directory
          </h2>
          <p className="text-sm text-slate-600 mb-4">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded bg-slate-900 text-white text-sm hover:bg-slate-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-slate-500">EventBot</div>
            <div className="text-sm font-medium text-slate-900 truncate">
              Signed in as {me?.name || shortcode}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="px-3 py-2 rounded text-sm bg-indigo-600 text-white hover:bg-indigo-700 flex-shrink-0"
          >
            Edit my profile
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Event directory</h1>
          <p className="text-sm text-slate-600 mt-1">
            {isSearchMode
              ? 'Search runs against the AI search service — try natural-language queries.'
              : `${browseGuests.length} ${
                  browseGuests.length === 1 ? 'person' : 'people'
                } registered. Type a query to search.`}
          </p>
        </div>

        <SearchBar
          value={query}
          onChange={setQuery}
          experienceLevel={experienceLevel}
          onExperienceLevelChange={setExperienceLevel}
        />

        {isSearchMode && (
          <div className="text-xs text-slate-500 space-y-0.5">
            {searching && <div>Searching…</div>}
            {!searching && !searchError && (
              <div>
                {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}
                {expandedQuery && (
                  <span className="ml-1 text-slate-400">
                    (expanded to: <em>{expandedQuery}</em>)
                  </span>
                )}
              </div>
            )}
            {searchError && (
              <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm">
                {searchError}
              </div>
            )}
          </div>
        )}

        <GuestList
          guests={displayed}
          myShortcode={shortcode}
          onSelect={handleSelectGuest}
        />
      </main>

      {selectedGuest && (
        <GuestDetailModal
          guest={selectedGuest}
          enriching={enriching}
          onClose={handleCloseDetail}
        />
      )}

      {editing && me && (
        <ProfileEditModal
          guest={me}
          shortcode={shortcode}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            const merged = { ...me, ...updated };
            setMe(merged);
            setBrowseGuests((prev) =>
              prev.map((g) => (g.shortcode === shortcode ? { ...g, ...merged } : g))
            );
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}
