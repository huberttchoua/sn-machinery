const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, '..', 'src');

function walk(dir){
  for(const name of fs.readdirSync(dir)){
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if(stat.isDirectory()) walk(p);
    else if(p.endsWith('.orig')){
      const dest = p.replace(/\.orig$/, '');
      fs.copyFileSync(p, dest);
      fs.unlinkSync(p);
      console.log('Restored', path.relative(SRC, dest));
    }
  }
}

try{walk(SRC); console.log('Restore complete');}catch(e){console.error('Restore failed', e); process.exit(1);}