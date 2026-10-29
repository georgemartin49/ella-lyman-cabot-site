// Claim-by-claim evidence for an entry's "Connection to ELC" section.
//
// documented: findings from the archives, each with its own source.
//   source: null means the source is known to the editor but not yet entered;
//   the page says so rather than leaving the claim unattributed.
// interpretation: the editor's reading, shown separately from the findings.
//
// Entries without a record here show their connection paragraph as before.

const EVIDENCE = {
  Royce: {
    documented: [
      { text: "Richard Cabot judged in 1935: “I think Royce was the strongest single influence in her life next to her father.”", source: null },
      { text: "She is recorded as having taken “five years of Mr. Royce” at Radcliffe and Harvard.", source: null },
      { text: "She recalled “the course on Kant with Royce” as her “next great experience,” and wrote to him, “You opened my eye to Kant & to Hegel.”", source: "Schlesinger Library, Papers of Ella Lyman Cabot, A-139, folder 319 (draft letters to Royce, including June 28, 1889)." },
      { text: "Royce wrote out for her a sixteen-page “Scheme of Study of Concept of Growth,” which she kept, with a typescript made in 1932, and which framed her unfinished book on growth.", source: "Schlesinger Library, Papers of Ella Lyman Cabot, A-139, folder 319." },
      { text: "Her notebook of 1892 records: “The art of living is to become other.”", source: "Schlesinger Library, Papers of Ella Lyman Cabot, A-139, folder 320." },
    ],
    interpretation: "The 1892 notebook entry comes some sixteen years before The Philosophy of Loyalty (1908). In the editor's reading, Royce gave her a systematic philosophical vocabulary that she then developed beyond his framework.",
  },
  Palmer: {
    documented: [
      { text: "Richard Cabot recalled that \u201cshe took her first course with Palmer.\u201d", source: null },
      { text: "Her examination for Palmer's ethics course survives, dated February 7, 1890.", source: "Harvard University Archives, HUG 4255.80, Box 7, \u201cPhilosophy - ELC.\u201d" },
      { text: "Letters from Palmer to Cabot survive from 1890, 1908, 1911, and 1915.", source: "Schlesinger Library, Papers of Ella Lyman Cabot, A-139, box 07." },
      { text: "Her will names him \u201cmy honored teacher, George H. Palmer.\u201d", source: null },
      { text: "In June 1892 she rebutted his counsel to \u201chave no interest in yourself as you are.\u201d", source: "Schlesinger Library, Papers of Ella Lyman Cabot, A-139, folder 320v." },
    ],
    interpretation: "In the editor's reading, Palmer gave her the vocabulary of self-realization ethics, while her starting point in interest as it is found in experience was her own.",
  },
  "R.C. Cabot": {
    documented: [
      { text: "They married on October 26, 1894.", source: null },
      { text: "Their courtship letters of 1892 and 1893 are a sustained exchange about ethics, religion, and whether to marry at all.", source: "Harvard University Archives, Papers of Richard Clarke Cabot, HUG 4255, Boxes 26 and 27 (copies of the correspondence)." },
      { text: "After their marriage the Cabots hosted Sunday evening meetings that Royce attended.", source: null },
      { text: "Richard recalled that he \u201csent her philosophy before we were married\u201d and that \u201cPalmer and I were neck and neck in bringing her out philosophically after we were married.\u201d", source: null },
      { text: "His papers preserve copies of their correspondence and Ada Peirce McCormick's research materials for an unfinished biography of them both.", source: "Harvard University Archives, HUG 4255 and HUG 4255.80." },
    ],
    interpretation: "The editor describes him as her lifelong partner in philosophical argument.",
  },
  Hocking: {
    documented: [
      { text: "Hocking and Cabot attended Royce's seminars in the same years, from 1899.", source: null },
      { text: "Hocking's correspondence at Houghton Library, some 6,000 items, includes material from the circle around Royce and the Cabots.", source: "Houghton Library, Harvard University, William Ernest Hocking papers, MS Am 2375." },
      { text: "Richard Cabot's papers hold an item titled \u201cW.E. Hocking on RCC's book. Aug 11. 1933.\u201d", source: "Harvard University Archives, HUG 4255, Box 16, Folder 01." },
    ],
    interpretation: "The editor reads Hocking as showing what a position like Cabot's looks like when a theological guarantee is kept in place.",
  },
};

// Philosophical comparisons, set out as: a passage from Cabot, a passage from
// the other author, the editor's interpretation, and a difference or limit.
//   cabot / other: { text, source }   interpretation: string   limit: string
// Missing parts are shown as "to be added". The interpretation defaults to the
// entry's connection paragraph.
const COMPARISONS = {
  Ubuntu: {
    interpretation: "No historical connection. The comparison is the editor's: Menkiti's thesis that personhood is achieved rather than given can be set beside Cabot's claim that the self is achieved.",
    limit: "For Menkiti, personhood is conferred and measured by the community; Cabot begins from the individual's own interests and treats social engagement as a condition of their growth.",
  },
  Korsgaard: {
    interpretation: "No historical connection. Korsgaard writes within Kantian ethics, Cabot within Boston idealism some seventy years earlier, and both treat the self as constituted through action rather than given before it.",
    limit: "Korsgaard's account concerns the unity of the agent in action; Cabot's concerns the growth of a self across a life.",
  },
};

export { EVIDENCE, COMPARISONS };
