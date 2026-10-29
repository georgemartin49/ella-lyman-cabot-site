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
