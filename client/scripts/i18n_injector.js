const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src');
const I18N_PATH = path.join(SRC, 'i18n.tsx');

function walk(dir){
  const files = [];
  for(const name of fs.readdirSync(dir)){
    const p = path.join(dir,name);
    const stat = fs.statSync(p);
    if(stat.isDirectory()) files.push(...walk(p));
    else if(/\.(tsx|jsx|ts|js)$/.test(p)) files.push(p);
  }
  return files;
}

function sanitizeKey(text){
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g,'')
    .trim()
    .replace(/\s+/g,'_')
    .slice(0,60);
}

const files = walk(SRC).filter(f=>!f.includes('i18n.tsx') && !f.includes('LanguageSelector') && !f.includes('node_modules'));

const newKeys = {};

for(const file of files){
  let src = fs.readFileSync(file,'utf8');
  // find simple JSX text between >TEXT< where TEXT isn't just whitespace and not inside braces
  const re = />([^<>{}][^<>]*?)</gms;
  let m;
  let changed = false;
  const seen = new Set();
  src = src.replace(re, (match, p1)=>{
    const text = p1.replace(/\s+/g,' ').trim();
    if(!text) return match;
    // skip code-like lines or long paragraphs >120 chars
    if(text.length>120) return match;
    // skip numbers or currency or emoji-only
    if(/^[-+0-9.,%\s]+$/.test(text)) return match;
    // create key
    let key = sanitizeKey(text);
    if(!key) return match;
    // ensure unique
    let base = key;
    let i=1;
    while(seen.has(key) || newKeys[key]){
      key = base + '_' + i++;
    }
    seen.add(key);
    newKeys[key] = text;
    changed = true;
    return `>{t('${key}')}<`;
  });
  if(changed){
    fs.copyFileSync(file, file + '.orig');
    fs.writeFileSync(file, src, 'utf8');
    console.log('Updated', path.relative(SRC,file));
  }
}

// update i18n.tsx: insert keys into translations
let i18n = fs.readFileSync(I18N_PATH,'utf8');
// find insertion point inside translations.en object
const insertPoint = i18n.indexOf('en: {');
if(insertPoint===-1){
  console.error('Cannot find translations.en in', I18N_PATH);
  process.exit(1);
}
// find end of en object (first closing brace matching)
const enStart = i18n.indexOf('{', insertPoint);
let depth=1;
let idx = enStart+1;
while(idx<i18n.length && depth>0){
  const ch = i18n[idx];
  if(ch==='{') depth++;
  else if(ch==='}') depth--;
  idx++;
}
const enEnd = idx-1;
// prepare lines
let insertLines = '';
for(const k of Object.keys(newKeys)){
  insertLines += `    ${k}: '${newKeys[k].replace(/'/g,"\\'")}',\n`;
}
// insert before enEnd (but after existing entries)
const newI18n = i18n.slice(0,enEnd) + insertLines + i18n.slice(enEnd);
fs.copyFileSync(I18N_PATH, I18N_PATH + '.orig');
fs.writeFileSync(I18N_PATH, newI18n, 'utf8');

// also add placeholders for rw and fr
let i18n2 = fs.readFileSync(I18N_PATH,'utf8');
function addPlaceholders(lang){
  const marker = `${lang}: {`;
  const p = i18n2.indexOf(marker);
  if(p===-1) return;
  const start = i18n2.indexOf('{', p);
  let d=1; let j=start+1;
  while(j<i18n2.length && d>0){
    const ch=i18n2[j]; if(ch==='{') d++; else if(ch==='}') d--; j++; }
  const end=j-1;
  let lines='';
  for(const k of Object.keys(newKeys)){
    lines += `    ${k}: '${newKeys[k].replace(/'/g,"\\'")}',\n`;
  }
  i18n2 = i18n2.slice(0,end) + lines + i18n2.slice(end);
}
addPlaceholders('rw');
addPlaceholders('fr');
fs.writeFileSync(I18N_PATH, i18n2, 'utf8');

console.log('Inserted', Object.keys(newKeys).length, 'keys into i18n.tsx');
console.log('Done');
