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

// label: what the link opens. Never call a catalog listing a readable text.
const BOOKS = [
  { title: "Everyday Ethics", cite: "New York: Henry Holt, 1906.", link: ["Digitized text", "https://archive.org/details/cu31924031217874"] },
  { title: "Ethics for Children", cite: "Boston: Houghton Mifflin, 1910.", link: ["Online Books Page listing, with links to digitized copies", "https://onlinebooks.library.upenn.edu/webbin/book/lookupname?key=Cabot,+Ella+Lyman"] },
  { title: "A Course in Citizenship", cite: "With Fannie Fern Andrews, Fanny E. Coe, Mabel Hill, and Mary McSkimmon. Boston: Houghton Mifflin, 1914.", link: ["Digitized text (later edition, titled A Course in Citizenship and Patriotism)", "https://archive.org/details/courseincitizens00cabouoft"] },
  { title: "Seven Ages of Childhood", cite: "Boston: Houghton Mifflin, 1921.", link: ["Digitized text", "https://archive.org/details/sevenageschildh00cabogoog"] },
  { title: "Temptations to Rightdoing", cite: "1929.", link: null },
];

const ARCHIVES = [
  { title: "Papers of Ella Lyman Cabot, 1873-1934", cite: "Schlesinger Library, Harvard Radcliffe Institute, A-139.", link: ["Finding aid", "https://hollisarchives.lib.harvard.edu/repositories/8/resources/5278"] },
  { title: "Papers of Richard Clarke Cabot", cite: "Harvard University Archives, HUG 4255, including Ada Peirce McCormick's research materials on the Cabots (HUG 4255.80).", link: ["Finding aid", "https://id.lib.harvard.edu/ead/hua02998/catalog"] },
];

export { EDITOR, BOOKS, ARCHIVES };
