// Ring layout: which figures live on which ring, and their geometry.

const RINGS_CFG = [
  { rad:108, cr:102, label:"Ring I — Closest Allies",
    nodes:["Emerson","James","Weil","P-Pattison","Royce","Palmer"] },
  { rad:196, cr:188, label:"Ring II — Substantial Agreement",
    nodes:["Murdoch","T.H. Green","Du Bois","Caird","Bosanquet","Hocking","J.E. Cabot","E.G. Balch","H. Bosanquet","M. Sinclair","Scudder","Pratt","Parker","Hoernlé","Thompson","Haldane","Korsgaard","Follett","Bergson","Alain","Buchler","Calkins","Bowne","Ritchie","Aristotle","Langer"] },
  { rad:284, cr:276, label:"Ring III — Partial Agreement",
    nodes:["Hegel","Sartre","Dewey","Kant","Peirce","Bradley","C.I. Lewis","T.S. Eliot","De Laguna"] },
  { rad:368, cr:360, label:"Ring IV — Objectors",
    nodes:["Hume/Parfit","Moore/Russell","Perry","Metzinger","Foucault(E)","Schiller"] },
];

const OUTER_CFG = {
  rad:452, cr:444, label:"Same Outcome — Different Vocab",
  nodes:["Mencius","Epictetus/M.A.","Ubuntu","Buber","Maine de Biran","Freire","Bakhtin","Addams","F. Kelley"]
};

const SZ = 960;
const CX = 480;
const CY = 480;

export { RINGS_CFG, OUTER_CFG, SZ, CX, CY };
