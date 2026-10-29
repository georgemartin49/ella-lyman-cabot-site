// Ring layout: which figures live on which ring, and their geometry.
//
// A figure's ring records the editor's judgment of how close that figure's
// account of selfhood is to Cabot's. It does not record whether she knew or
// read the figure; that is the connection type in connections.js.

const RINGS_CFG = [
  { rad:108, cr:102, label:"Ring I: Closest philosophical agreement",
    nodes:["Emerson","James","Weil","P-Pattison","Royce","Palmer","R.C. Cabot"] },
  { rad:196, cr:188, label:"Ring II: Substantial agreement",
    nodes:["Murdoch","T.H. Green","Du Bois","Caird","Bosanquet","Hocking","J.E. Cabot","E.G. Balch","H. Bosanquet","M. Sinclair","Scudder","Pratt","Parker","Hoernlé","Thompson","Haldane","Korsgaard","Follett","Bergson","Alain","Buchler","Calkins","Bowne","Ritchie","Aristotle","Langer","Chesterton","Nettleship"] },
  { rad:330, cr:322, label:"Ring III: Partial agreement",
    nodes:["Hegel","Sartre","Dewey","Kant","Peirce","Bradley","C.I. Lewis","T.S. Eliot","De Laguna"] },
  { rad:404, cr:396, label:"Ring IV: Opposing positions",
    nodes:["Hume/Parfit","Moore/Russell","Perry","Metzinger","Foucault(E)","Schiller","Sidgwick"] },
];

const OUTER_CFG = {
  rad:470, cr:462, label:"Ring V: Parallel positions in other traditions",
  nodes:["Mencius","Epictetus/M.A.","Ubuntu","Buber","Maine de Biran","Freire","Bakhtin","Addams","F. Kelley"]
};

const SZ = 960;
const CX = 480;
const CY = 480;

// Short names for each ring (index 0 to 4), used in labels across the site.
const RING_NAMES = RINGS_CFG.map(function(r) { return r.label; }).concat([OUTER_CFG.label]);

export { RINGS_CFG, OUTER_CFG, RING_NAMES, SZ, CX, CY };
