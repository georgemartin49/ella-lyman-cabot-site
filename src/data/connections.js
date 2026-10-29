// Full names and historical connection types for the figures in the web.
//
// The rings record the editor's judgment of how close each figure's position
// is to Cabot's. They say nothing about whether she knew or read the figure.
// That is recorded here, separately, as one of four connection types.
//
// DRAFT (October 2026): each classification below was made from what the
// figure's own entry says about the connection, and awaits the editor's review.

const CONNECTION_TYPES = {
  contact:    { label: "Documented contact",       desc: "Personal acquaintance, teaching, family, or correspondence recorded in the archives." },
  reading:    { label: "Documented reading",       desc: "Her papers show she read, studied, or wrote about this figure's work." },
  influence:  { label: "Probable influence",       desc: "Likely reached her indirectly, through teachers or the tradition she worked in, but not documented in her papers." },
  comparison: { label: "Philosophical comparison", desc: "An interpretive comparison drawn by the editor. No historical contact or influence is claimed." },
};

const COMPARISON = "A comparison drawn by the editor. No historical contact or influence is claimed.";

const CONNECTION = {
  Royce:          ["contact", "Her teacher at Radcliffe and Harvard; his study scheme and her draft letters to him survive in her papers."],
  Palmer:         ["contact", "Her first philosophy teacher; his letters to her (1890 to 1915) and her 1890 examination survive."],
  "R.C. Cabot":   ["contact", "Her husband from 1894; their correspondence survives in both Harvard collections."],
  "J.E. Cabot":   ["contact", "Her father-in-law from 1894."],
  Follett:        ["contact", "Friend and correspondent; letters 1927 to 1933."],
  Addams:         ["contact", "They met at Hull-House in May 1898."],
  Hocking:        ["contact", "A fellow student in Royce's seminars from 1899, named in her papers."],
  Emerson:        ["reading", "Read from about age 16, by her own account; engaged directly in her manuscripts."],
  James:          ["reading", "Read and argued with; no study with him or correspondence has been found."],
  Chesterton:     ["reading", "Read closely; she wrote two essays on him."],
  Nettleship:     ["reading", "Used repeatedly in her lectures and teaching notes."],
  Caird:          ["reading", "Read closely, as her 1893 letters show."],
  Kant:           ["reading", "Studied in Royce's course, by her own account."],
  Sidgwick:       ["reading", "The opponent in her thesis “The Place of Pleasure” for Royce's class."],
  Dewey:          ["reading", "Read from 1891; she visited his Laboratory School in 1898."],
  "T.H. Green":   ["influence", "Reached her through Palmer's teaching, in the editor's reading."],
  Hegel:          ["influence", "Reached her through Royce and the idealist tradition, not read directly as far as is known."],
  Peirce:         ["influence", "Inferred to have reached her through Royce; she does not mention him in her transcribed papers."],
  Bradley:        ["influence", "A background figure of the idealist tradition she worked in, in the editor's reading."],
  Weil:           ["comparison", "Independent parallel; neither knew the other's work."],
  "Du Bois":      ["comparison", "Contemporaries in Boston; neither knew the other's philosophical work."],
  "E.G. Balch":   ["comparison", "Named in her 1915 letters; no closer tie is documented."],
  "F. Kelley":    ["comparison", "Appears in her papers only in a speaker list."],
};

// Full names for the short labels used on the map.
const NAMES = {
  Emerson: "Ralph Waldo Emerson", James: "William James", Weil: "Simone Weil",
  "P-Pattison": "Andrew Seth Pringle-Pattison", Royce: "Josiah Royce", Palmer: "George Herbert Palmer",
  "R.C. Cabot": "Richard Clarke Cabot", Chesterton: "G. K. Chesterton", Nettleship: "Richard Lewis Nettleship",
  Caird: "Edward Caird", Bosanquet: "Bernard Bosanquet", Murdoch: "Iris Murdoch", "Du Bois": "W. E. B. Du Bois",
  "T.H. Green": "Thomas Hill Green", Calkins: "Mary Whiton Calkins", Follett: "Mary Parker Follett",
  Korsgaard: "Christine Korsgaard", Bergson: "Henri Bergson", Alain: "Alain (Émile-Auguste Chartier)",
  Buchler: "Justus Buchler", Bowne: "Borden Parker Bowne", Ritchie: "David George Ritchie", Aristotle: "Aristotle",
  Langer: "Susanne K. Langer", Hocking: "William Ernest Hocking", "J.E. Cabot": "James Elliot Cabot",
  "E.G. Balch": "Emily Greene Balch", "H. Bosanquet": "Helen Bosanquet", "M. Sinclair": "May Sinclair",
  Scudder: "Vida Dutton Scudder", Pratt: "James Bissett Pratt", "Hoernlé": "R. F. Alfred Hoernlé",
  Thompson: "Anna Boynton Thompson", Haldane: "Richard Burdon Haldane", Hegel: "G. W. F. Hegel", Dewey: "John Dewey",
  Kant: "Immanuel Kant", Peirce: "Charles Sanders Peirce", Sartre: "Jean-Paul Sartre", Bradley: "F. H. Bradley",
  "C.I. Lewis": "Clarence Irving Lewis", "T.S. Eliot": "T. S. Eliot", Sidgwick: "Henry Sidgwick",
  "Hume/Parfit": "David Hume and Derek Parfit", "Moore/Russell": "G. E. Moore and Bertrand Russell",
  Metzinger: "Thomas Metzinger", "Foucault(E)": "Michel Foucault", Mencius: "Mencius",
  "Epictetus/M.A.": "Epictetus and Marcus Aurelius", Ubuntu: "Ubuntu philosophy", Buber: "Martin Buber",
  "Maine de Biran": "Maine de Biran", Freire: "Paulo Freire", Bakhtin: "Mikhail Bakhtin", Addams: "Jane Addams",
  Parker: "DeWitt H. Parker", "De Laguna": "Grace de Laguna", Perry: "Ralph Barton Perry",
  Schiller: "F. C. S. Schiller", "F. Kelley": "Florence Kelley",
};

function fullName(key) { return NAMES[key] || key; }

// Sort key for the A to Z list: the surname, unless overridden here.
const SORT_AS = {
  "Du Bois": "Du Bois", "De Laguna": "de Laguna", "Maine de Biran": "Maine de Biran", Ubuntu: "Ubuntu",
  "Hume/Parfit": "Hume", "Moore/Russell": "Moore", "Epictetus/M.A.": "Epictetus", Alain: "Alain",
};
function sortName(key) {
  return SORT_AS[key] || fullName(key).split(" ").pop();
}

function connectionOf(key) {
  const c = CONNECTION[key];
  return c ? { type: c[0], basis: c[1] } : { type: "comparison", basis: COMPARISON };
}

export { CONNECTION_TYPES, connectionOf, fullName, sortName, NAMES };
