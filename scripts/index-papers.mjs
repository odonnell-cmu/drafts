import {readdir,readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
const repo=process.env.GITHUB_REPOSITORY,run=process.env.GITHUB_RUN_ID,sha=process.env.GITHUB_SHA;
if(!repo||!run||!sha||!process.env.GITHUB_TOKEN)throw Error('Run indexing in GitHub Actions for an externally recorded workflow time.');
const response=await fetch(`https://api.github.com/repos/${repo}/actions/runs/${run}`,{headers:{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json'}});
if(!response.ok)throw Error('Cannot verify GitHub workflow time');const evidence=await response.json();
const recordedAt=evidence.created_at;if(!recordedAt)throw Error('Missing workflow creation time');
const catalog=JSON.parse(await readFile('site/catalog.json','utf8'));
for(const filename of (await readdir('papers')).filter(x=>x.endsWith('.pdf')).sort()){
 const bytes=await readFile(`papers/${filename}`);if(!bytes.subarray(0,1024).includes(Buffer.from('%PDF-')))throw Error(`Invalid PDF: ${filename}`);
 const hash=createHash('sha256').update(bytes).digest('hex'),id=filename.slice(0,-4);let meta={};
 try{meta=JSON.parse(await readFile(`papers/${id}.json`,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 const title=meta.title||id.replaceAll('-',' '),authors=meta.authors??"Ryan O’Donnell";
 if(typeof title!=='string'||typeof authors!=='string'||(meta.abstract&&typeof meta.abstract!=='string'))throw Error('Metadata fields must be text');
 let paper=catalog.find(p=>p.id===id);if(!paper){paper={id,title,authors,abstract:meta.abstract||'',versions:[]};catalog.push(paper);}
 const pdfUrl=`https://github.com/${repo}/blob/${sha}/papers/${encodeURIComponent(filename)}`;
 paper.title=title;paper.authors=authors;paper.abstract=meta.abstract||'';
 const existing=paper.versions.find(v=>v.sha256===hash);
 if(existing){
  if(!existing.recordedAt)Object.assign(existing,{recordedAt,pdfUrl,sourceCommit:sha,sourceUrl:`https://github.com/${repo}/commit/${sha}`,evidenceUrl:evidence.html_url});
  continue;
 }
 await mkdir(`archive/${hash}`,{recursive:true});await copyFile(`papers/${filename}`,`archive/${hash}/draft.pdf`);
 paper.title=title;paper.authors=authors;paper.abstract=meta.abstract||'';
 paper.versions.push({number:paper.versions.length+1,recordedAt,sha256:hash,bytes:bytes.length,path:`archive/${hash}/draft.pdf`,pdfUrl,sourceCommit:sha,sourceUrl:`https://github.com/${repo}/commit/${sha}`,evidenceUrl:evidence.html_url,title,authors,abstract:meta.abstract||''});
}
await writeFile('site/catalog.json',JSON.stringify(catalog,null,2)+'\n');
