import {cp,mkdir,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});
await mkdir('archive',{recursive:true});
await cp('site','dist',{recursive:true});if (!process.env.GITHUB_REPOSITORY) await cp('archive','dist/archive',{recursive:true});
