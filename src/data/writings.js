// Homepage material: Cabot's published books, the archival collections, and
// links to the editor and the edition. Facts in the biography on the homepage
// follow the Schlesinger Library's biographical note for collection A-139.

const EDITOR = {
  name: "Jacob B. Castleberry",
  site: "https://jacobcastleberry.org/",
  edition: "https://jacobcastleberry.org/cabot-edition/",
  contact: "https://jacobcastleberry.org/contact/",
  email: "castleberryj@uindy.edu",
};

// Selected books. Cabot published seven books between 1906 and 1929; only
// verified titles are listed. `published` is the original publication;
// each link says which copy or edition it opens.
const BOOKS = [
  { title: "Everyday Ethics", authorship: null, published: "New York: Henry Holt, 1906.", page: "everyday-ethics",
    links: [["Digitized copy of the 1906 Henry Holt edition (Internet Archive)", "https://archive.org/details/cu31924031217874"]] },
  { title: "Ethics for Children", authorship: null, published: "Boston: Houghton Mifflin, 1910.",
    links: [["Online Books Page listing, with links to digitized copies", "https://onlinebooks.library.upenn.edu/webbin/book/lookupname?key=Cabot,+Ella+Lyman"]] },
  { title: "A Course in Citizenship", authorship: "With Fannie Fern Andrews, Fanny E. Coe, Mabel Hill, and Mary McSkimmon.", published: "Boston: Houghton Mifflin, 1914.",
    links: [["Digitized copy of a later edition, retitled A Course in Citizenship and Patriotism (Internet Archive)", "https://archive.org/details/courseincitizens00cabouoft"]] },
  { title: "Seven Ages of Childhood", authorship: null, published: "Boston: Houghton Mifflin, 1921.",
    links: [["Digitized copy of the 1921 edition (Internet Archive)", "https://archive.org/details/sevenageschildh00cabogoog"]] },
  { title: "Temptations to Rightdoing", authorship: null, published: "1929.", links: [] },
];

const ARCHIVES = [
  { title: "Papers of Ella Lyman Cabot, 1873-1934", cite: "Schlesinger Library, Harvard Radcliffe Institute, A-139.", link: ["Finding aid", "https://hollisarchives.lib.harvard.edu/repositories/8/resources/5278"] },
  { title: "Papers of Richard Clarke Cabot", cite: "Harvard University Archives, HUG 4255, including Ada Peirce McCormick's research materials on the Cabots (HUG 4255.80).", link: ["Finding aid", "https://id.lib.harvard.edu/ead/hua02998/catalog"] },
];

export { EDITOR, BOOKS, ARCHIVES };
