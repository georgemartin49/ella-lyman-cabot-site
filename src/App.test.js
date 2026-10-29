import { render, screen, within } from '@testing-library/react';
import App from './App';
import { DATA, DKEYS } from './data/figures';
import { RING_NAMES } from './data/rings';
import { connectionOf, CONNECTION_TYPES, fullName } from './data/connections';
import { searchFigures } from './data/search';

const visit = hash => {
  window.location.hash = hash;
  return render(<App />);
};

test('every page has the shared header with the current section marked', () => {
  visit('#/life');
  const nav = screen.getByRole('navigation', { name: 'Site' });
  ['Life', 'Writings', 'Edition', 'Figures A to Z', 'Map', 'Timeline'].forEach(l => expect(within(nav).getByRole('link', { name: l })).toBeInTheDocument());
  expect(within(nav).getByRole('link', { name: 'Life' })).toHaveAttribute('aria-current', 'page');
  expect(within(screen.getByRole('banner')).getByRole('link', { name: 'Ella Lyman Cabot' })).toHaveAttribute('href', '#/');
});

test('the homepage introduces Cabot, names the editor, and keeps "all" in the transcription claim', () => {
  visit('#/');
  expect(screen.getByRole('heading', { level: 1, name: 'Ella Lyman Cabot' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Jacob B. Castleberry' })[0]).toHaveAttribute('href', 'https://jacobcastleberry.org/');
  expect(screen.getByText(/transcribed all of the Ella Lyman Cabot Papers/)).toBeInTheDocument();
  expect(screen.getByText(/A-139, folder 320/)).toBeInTheDocument();
  expect(screen.queryByText(/to be added|coming soon/i)).toBeNull();
});

test('relocated material stays reachable: biography, writings, edition, Everyday Ethics', () => {
  [['#/life', 'Her life', /September 20, 1934/], ['#/writings', 'Writings', /Selected books/], ['#/edition', 'The edition', /transcribed all of the Ella Lyman Cabot Papers/], ['#/everyday-ethics', 'Everyday Ethics', /Henry Holt, 1906/]]
    .forEach(([hash, h1, text]) => {
      const { unmount } = visit(hash);
      expect(screen.getByRole('heading', { level: 1, name: h1 })).toBeInTheDocument();
      expect(screen.getAllByText(text).length).toBeGreaterThan(0);
      unmount();
    });
});

test('every figure has a full name, a ring, and a known relationship type; no self-influence', () => {
  DKEYS.forEach(key => {
    expect(fullName(key)).toBeTruthy();
    expect(RING_NAMES[DATA[key].ring - 1]).toBeTruthy();
    expect(CONNECTION_TYPES[connectionOf(key).type]).toBeDefined();
    (DATA[key].inf || []).forEach(item => expect([key, fullName(key)]).not.toContain(item[0]));
  });
});

test('an exact-name search ranks that figure first, ahead of incidental mentions', () => {
  expect(searchFigures('Royce')[0].key).toBe('Royce');
  expect(searchFigures('palmer')[0].key).toBe('Palmer');
  const bodyMatch = searchFigures('Royce').find(r => r.rank === 1);
  expect(bodyMatch.snippet.match.toLowerCase()).toBe('royce');
});

test('map figures are named links, and the List view shares the query', () => {
  visit('#/web?view=map&q=Royce');
  const map = screen.getByRole('group', { name: /Timeline|Map of figures/ });
  expect(within(map).getByRole('link', { name: /^Josiah Royce, Ring I/ })).toHaveAttribute('href', '#/figure/Royce');
});

test('List view ranks results with the exact name first', () => {
  visit('#/web?view=list&q=Royce');
  const list = screen.getByRole('list', { name: /Results/ });
  expect(within(list).getAllByRole('link')[0]).toHaveTextContent('Josiah Royce');
});

test('figure pages lead with the connection, list only sections that exist, and hide unwritten parts', () => {
  visit('#/figure/Weil');
  expect(screen.getByRole('heading', { level: 1, name: 'Simone Weil' })).toBeInTheDocument();
  const h2s = screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent);
  expect(h2s[0]).toBe('Connection to Cabot');
  expect(h2s).not.toContain('The comparison');
  expect(screen.queryByText(/to be added/i)).toBeNull();
  expect(screen.getByText(/passages on which it rests are being prepared/)).toBeInTheDocument();
  expect(screen.getAllByRole('navigation', { name: /On this page/ }).length).toBeGreaterThan(0);
});

test('model entries show documentary evidence with sources, apart from interpretation', () => {
  visit('#/figure/Palmer');
  expect(screen.getByRole('heading', { name: 'Documentary evidence' })).toBeInTheDocument();
  expect(screen.getByText(/HUG 4255\.80, Box 7/)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Interpretation' })).toBeInTheDocument();
});

test('cross-references are labelled as such, and Eliot is credited with a preface, not influence on Weil', () => {
  visit('#/figure/Weil');
  expect(screen.getByRole('heading', { name: 'Mentioned in other entries' })).toBeInTheDocument();
  expect(screen.getAllByText(/preface to the English translation/).length).toBeGreaterThan(0);
  expect(JSON.stringify(DATA['T.S. Eliot'])).not.toMatch(/never submitted|posthumous|Edited and introduced/);
});

test('old addresses of split or renamed entries still open them', () => {
  visit('#/figure/' + encodeURIComponent('Hume/Parfit'));
  expect(screen.getByRole('heading', { level: 1, name: 'David Hume' })).toBeInTheDocument();
});
