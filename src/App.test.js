import { render, screen, within } from '@testing-library/react';
import App from './App';
import { DATA, DKEYS } from './data/figures';
import { RING_NAMES } from './data/rings';
import { connectionOf, CONNECTION_TYPES, fullName } from './data/connections';

const visit = hash => {
  window.location.hash = hash;
  return render(<App />);
};

test('the homepage introduces Cabot first and names the editor', () => {
  visit('#/');
  expect(screen.getByRole('heading', { level: 1, name: 'Ella Lyman Cabot' })).toBeInTheDocument();
  const headings = screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent);
  expect(headings.indexOf('Her life')).toBeLessThan(headings.indexOf('Research tools'));
  expect(screen.getAllByRole('link', { name: 'Jacob B. Castleberry' })[0]).toHaveAttribute('href', 'https://jacobcastleberry.org/');
  expect(screen.getByRole('link', { name: 'About the Cabot edition' })).toHaveAttribute('href', 'https://jacobcastleberry.org/cabot-edition/');
  expect(screen.queryByText(/coming soon/i)).toBeNull();
});

test('every figure has a full name, a ring name, and a known connection type', () => {
  DKEYS.forEach(key => {
    expect(fullName(key)).toBeTruthy();
    expect(RING_NAMES[DATA[key].ring - 1]).toBeTruthy();
    expect(CONNECTION_TYPES[connectionOf(key).type]).toBeDefined();
  });
  expect(RING_NAMES.join(' ')).not.toMatch(/Allies|Objectors|Vocab/);
});

test('map figures are named links that assistive technology can reach', () => {
  visit('#/web');
  const map = screen.getByRole('group', { name: /Map of figures/ });
  const royce = within(map).getByRole('link', { name: /^Josiah Royce, Ring I/ });
  expect(royce).toHaveAttribute('href', '#/figure/Royce');
});

test('the A to Z index lists every figure with a link to its entry', () => {
  visit('#/figures');
  const list = screen.getByRole('list', { name: 'Figures' });
  expect(within(list).getAllByRole('link')).toHaveLength(DKEYS.length);
});

test('the Royce entry separates documented findings, with sources, from interpretation', () => {
  visit('#/figure/Royce');
  expect(screen.getByRole('heading', { level: 1, name: 'Josiah Royce' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Documentary findings' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: "The editor's interpretation" })).toBeInTheDocument();
  expect(screen.getAllByText(/^Source: Schlesinger Library/).length).toBeGreaterThan(0);
});

test('no entry lists itself among its own influences', () => {
  DKEYS.forEach(key => {
    (DATA[key].inf || []).forEach(item => {
      expect([key, fullName(key)]).not.toContain(item[0]);
    });
  });
});

test('Eliot submitted his dissertation and the 1964 publication is not called posthumous', () => {
  const text = JSON.stringify(DATA['T.S. Eliot']);
  expect(text).toMatch(/submitted his dissertation/);
  expect(text).not.toMatch(/never submitted|posthumous/);
});

test('a comparison entry sets out passages, interpretation, and a limit, and claims no influence', () => {
  visit('#/figure/Weil');
  expect(screen.getByText(/No historical contact or influence is claimed/)).toBeInTheDocument();
  ['From Cabot', 'From Simone Weil', "The editor's interpretation", 'A difference or limit']
    .forEach(h => expect(screen.getByRole('heading', { name: h })).toBeInTheDocument());
  expect(screen.queryByRole('heading', { name: /Transmissions/ })).toBeNull();
});

test('old addresses of split or renamed entries still open them', () => {
  visit('#/figure/' + encodeURIComponent('Hume/Parfit'));
  expect(screen.getByRole('heading', { level: 1, name: 'David Hume' })).toBeInTheDocument();
});
