const entries = document.querySelector('#entries');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'github.com' ? esc(url.href) : '#';
  } catch { return '#'; }
};
const date = value => new Date(value).toISOString().replace('T', ' ').replace(/\.000Z$/, ' UTC').replace(/Z$/, ' UTC');
const pdf = version => version.pdfUrl ? safeUrl(version.pdfUrl) : /^archive\/[a-f0-9]{64}\/draft\.pdf$/.test(version.path) ? version.path : '#';
try {
  const response = await fetch('catalog.json', {cache: 'no-store'});
  if (!response.ok) throw Error('Could not load drafts');
  const catalog = await response.json();
  const papers = catalog.filter(paper => paper.versions.length).sort((a, b) => (b.versions.at(-1).recordedAt || '').localeCompare(a.versions.at(-1).recordedAt || ''));
  entries.innerHTML = papers.length ? '<ul>' + papers.map(paper => {
    const latest = paper.versions.at(-1);
    return `<li><a href="${pdf(latest)}">${esc(paper.title)}</a>
${paper.authors ? '<br>' + esc(paper.authors) : ''}
${paper.versions[0].recordedAt ? '<br>First recorded: ' + esc(date(paper.versions[0].recordedAt)) : ''}${paper.versions.length > 1 ? `<br>Latest revision: ${esc(date(latest.recordedAt))}` : ''}
${paper.abstract ? `<p>${esc(paper.abstract)}</p>` : ''}
<details><summary>Versions and timestamp records</summary>
<ul>${[...paper.versions].reverse().map(version => `<li><a href="${pdf(version)}">Version ${version.number}</a> — ${version.recordedAt ? esc(date(version.recordedAt)) : 'Private preview'}<br>
${version.recordedAt ? `<a href="${safeUrl(version.evidenceUrl)}">Timestamp record</a> | <a href="${safeUrl(version.sourceUrl)}">Source commit</a><br>` : ''}
SHA-256: <code style="overflow-wrap:anywhere">${esc(version.sha256)}</code></li>`).join('')}</ul>
</details></li>`;
  }).join('') + '</ul>' : '<p>No documents posted yet.</p>';
} catch {
  entries.innerHTML = '<p>Could not load the documents. Please reload, or view the <a href="catalog.json">archive index</a>.</p>';
}
