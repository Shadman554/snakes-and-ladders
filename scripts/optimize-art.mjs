import sharp from 'sharp';
import {readdir,stat,readFile,writeFile} from 'node:fs/promises';
let before=0,after=0;
for(const file of await readdir('public/art')){
  if(!file.endsWith('.png'))continue;
  const source='public/art/'+file, target=source.replace(/\.png$/,'.webp');
  before+=(await stat(source)).size;
  await sharp(source).webp({quality:88,alphaQuality:100,effort:5}).toFile(target);
  after+=(await stat(target)).size;
}
for(const file of ['app/art.tsx','app/globals.css']){
  const source=await readFile(file,'utf8');
  await writeFile(file,source.replaceAll('.png','.webp'));
}
console.log(JSON.stringify({originalBytes:before,optimizedBytes:after,reduction:Math.round((1-after/before)*100)+'%'}));
