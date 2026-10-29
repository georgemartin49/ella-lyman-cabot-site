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

export { EVIDENCE };
