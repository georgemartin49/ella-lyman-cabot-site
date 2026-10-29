import Page from "./Page";
import { hrefFor } from "../router";
import { EDITOR, BOOKS, ARCHIVES } from "../data/writings";
import { EVERYDAY_ETHICS_PASSAGE, EDITORIAL_METHOD, EDITED_SAMPLE } from "../data/pages";

// Shared styles for reading pages: prose set directly on the page at a
// comfortable measure, headings that clear the top of the window when linked.
export const proseCss = `
  .prose { max-width: 38em; }
  .prose h1 { color: var(--accent); font-size: clamp(34px, 6vw, 46px); font-weight: 600; line-height: 1.1; margin: 0 0 8px; }
  .prose h2 { color: var(--accent); font-size: 26px; font-weight: 600; margin: 36px 0 10px; scroll-margin-top: 16px; }
  .prose h3 { font-size: 20px; margin: 22px 0 6px; }
  .prose p, .prose li { font-size: 19px; line-height: 1.7; margin: 0 0 14px; }
  .prose .lede { font-size: 21px; color: var(--text-soft); font-style: italic; margin-bottom: 22px; }
  .prose .small { font-size: 16px; color: var(--text-soft); }
  .prose blockquote { margin: 18px 0 22px; padding-left: 18px; border-left: 3px solid var(--accent-border); }
  .prose blockquote p { font-size: 21px; font-style: italic; margin-bottom: 6px; }
  .prose blockquote footer { font-size: 15px; color: var(--text-soft); }
  .prose .cite { padding-left: 1.4em; text-indent: -1.4em; }
  .prose .cite span { display: block; text-indent: 0; font-size: 16px; color: var(--text-soft); }
  .next-links { display: flex; flex-wrap: wrap; gap: 8px 22px; margin: 6px 0 4px; padding: 0; list-style: none; }
  .next-links a { font-size: 18px; font-weight: 600; }
`;

function Cite({ book }) {
  return (
    <p className="cite">
      <em>{book.title}</em>. {book.authorship ? book.authorship + " " : ""}{book.published}
      {book.page && <span><a href={hrefFor({ name: book.page })}>About this book</a></span>}
      {book.links.map(function(l) { return <span key={l[1]}><a href={l[1]} target="_blank" rel="noopener noreferrer">{l[0]}</a></span>; })}
    </p>
  );
}

export function Life(props) {
  return (
    <Page current="life" {...props}>
      <style>{proseCss}</style>
      <article className="prose">
        <h1>Her life</h1>
        <p className="lede">Ella Lyman Cabot, 1866 to 1934</p>
        <p>
          Ella Lyman Cabot was born in Boston in 1866, the fourth of seven children of Arthur Theodore Lyman and Ella
          Lowell Lyman. She studied philosophy as a special student at Radcliffe from 1889 to 1891, beginning with George
          Herbert Palmer's course in ethics, and took graduate courses at Harvard from 1897 to 1903, where she studied with
          Josiah Royce. She was not able to receive a degree for this work.
        </p>
        <p>
          In 1894 she married Richard Clarke Cabot, the physician and later Harvard professor of social ethics; their
          correspondence is a lifelong philosophical exchange. From 1897 she taught ethics and applied psychology in Boston
          schools and at Pine Manor, and directed the Sunday school at King's Chapel. She served on the governing boards of
          Radcliffe College from 1902 and on the Massachusetts Board of Education from 1905 until her death. Between 1906
          and 1929 she published seven books on ethics and the moral education of children, along with many articles and
          pamphlets and a privately printed three-volume biography of her parents. She died in Boston on September 20, 1934.
        </p>
        <h2>Her philosophical interests</h2>
        <p>
          Cabot's writings examine love, individuality, moral growth, and education within the intellectual setting of
          American idealism and pragmatism. She studied first with Palmer and then with Royce, who wrote out for her a
          scheme of study on the concept of growth. That scheme framed the book on growth she worked on and left unfinished.
        </p>
        <p>
          Her published books bring this philosophy to teaching. <a href={hrefFor({ name: "everyday-ethics" })}><em>Everyday Ethics</em></a> (1906),
          her principal philosophical text, draws on Palmer and Royce; <em>Ethics for Children</em> (1910)
          and <em>Seven Ages of Childhood</em> (1921) address the moral education of children; <em>Temptations to
          Rightdoing</em> (1929), her last book, distinguishes loyalty, allegiance, and prejudice. Her unpublished
          manuscripts, letters, notebooks, and poems carry the same questions further.
        </p>
        <h2>Sources</h2>
        <p className="small">
          The biographical note in the <a href={ARCHIVES[0].link[1]} target="_blank" rel="noopener noreferrer">finding aid
          for her papers</a> at the Schlesinger Library, and the Cabot papers described on the <a href={hrefFor({ name: "edition" })}>Edition</a> page.
        </p>
      </article>
    </Page>
  );
}

export function Writings(props) {
  return (
    <Page current="writings" {...props}>
      <style>{proseCss}</style>
      <article className="prose">
        <h1>Writings</h1>
        <p className="lede">Selected published books, and the archives that hold her unpublished work</p>
        <p>
          Cabot published seven books between 1906 and 1929. The list below gives those whose details have been verified,
          with each book's original publication; where a link opens a later edition or a library listing, it says so.
        </p>
        <h2>Selected books</h2>
        {BOOKS.map(function(b) { return <Cite key={b.title} book={b} />; })}
        <h2>Archival collections</h2>
        {ARCHIVES.map(function(a) {
          return (
            <p key={a.title} className="cite"><em>{a.title}</em>. {a.cite}
              <span><a href={a.link[1]} target="_blank" rel="noopener noreferrer">{a.link[0]}</a></span>
            </p>
          );
        })}
      </article>
    </Page>
  );
}

export function Edition(props) {
  return (
    <Page current="edition" {...props}>
      <style>{proseCss}</style>
      <article className="prose">
        <h1>The edition</h1>
        <p className="lede">A comprehensive critical edition of Cabot's surviving writings, in development</p>
        <p>
          {EDITOR.name} is developing a coordinated, multivolume critical edition of Ella Lyman Cabot's surviving writings:
          her published books, unpublished philosophical manuscripts, correspondence, poetry, notebooks, and other surviving
          writings. It will provide edited texts, introductions, annotations, and an account of the decisions made in
          establishing each text. This site is a companion research resource.
        </p>
        <h2>Archival work</h2>
        <p>
          {EDITOR.name} has reviewed and transcribed all of the Ella Lyman Cabot Papers at the Schlesinger Library (A-139).
          The work in the Richard Clarke Cabot Papers at the Harvard University Archives (HUG 4255) includes approximately
          16,000 photographs, roughly 7,000 of which already have transcriptions; it continues, with attention to the
          Cabots' correspondence, shared reading, and Ada Peirce McCormick's unpublished biographical drafts.
        </p>
        <p className="small">Progress updated October 2026.</p>
        <h2>Editorial approach</h2>
        <p>
          The edition will document the source of each text, distinguish authorial revisions from editorial changes, and
          explain how uncertain readings have been handled. Decisions about spelling, punctuation, abbreviations, deletions,
          additions, and variant readings will be stated explicitly.
        </p>
        {EDITORIAL_METHOD && <>
          <h2>Editorial method</h2>
          {EDITORIAL_METHOD.paragraphs.map(function(t, i) { return <p key={i}>{t}</p>; })}
        </>}
        {EDITED_SAMPLE && <>
          <h2>A sample text</h2>
          <p>{EDITED_SAMPLE.title}</p>
        </>}
        <h2>More about the edition</h2>
        <ul className="next-links">
          <li><a href={EDITOR.edition}>The edition on {EDITOR.name}'s site</a></li>
          <li><a href={EDITOR.contact}>Contact the editor</a></li>
        </ul>
      </article>
    </Page>
  );
}

export function EverydayEthics(props) {
  const book = BOOKS.find(function(b) { return b.page === "everyday-ethics"; });
  return (
    <Page current="everyday-ethics" {...props}>
      <style>{proseCss}</style>
      <article className="prose">
        <h1><em>Everyday Ethics</em></h1>
        <p className="lede">Ella Lyman Cabot's first book, 1906</p>
        <p>
          <em>Everyday Ethics</em> was Cabot's first book and her principal philosophical text. It draws on the ethics of
          her teachers George Herbert Palmer and Josiah Royce.
        </p>
        <h2>Publication</h2>
        <p className="cite">{book.published}<span>A London edition was issued by G. Bell in 1907.</span></p>
        <h2>Read it</h2>
        <p className="cite">
          <a href="https://archive.org/details/cu31924031217874" target="_blank" rel="noopener noreferrer">1906 Henry Holt edition, Cornell University Library copy</a>
          <span>Internet Archive, page images and full text</span>
        </p>
        <p className="cite">
          <a href="https://archive.org/details/everydayethics01cabogoog" target="_blank" rel="noopener noreferrer">University of Michigan copy, digitized by Google</a>
          <span>Internet Archive</span>
        </p>
        <p className="cite">
          <a href="https://catalog.hathitrust.org/Record/100114923" target="_blank" rel="noopener noreferrer">HathiTrust catalog record</a>
          <span>Library record with links to a full-view copy</span>
        </p>
        {EVERYDAY_ETHICS_PASSAGE && <>
          <h2>A passage</h2>
          <blockquote>
            {EVERYDAY_ETHICS_PASSAGE.text.map(function(t, i) { return <p key={i}>{t}</p>; })}
            <footer>{EVERYDAY_ETHICS_PASSAGE.source}</footer>
          </blockquote>
          <p>{EVERYDAY_ETHICS_PASSAGE.context}</p>
        </>}
        <p className="small">The comprehensive critical edition in development will include <em>Everyday Ethics</em>. See <a href={hrefFor({ name: "edition" })}>Edition</a>.</p>
      </article>
    </Page>
  );
}
