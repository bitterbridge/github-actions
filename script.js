const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const yaml = require('js-yaml');

const base = process.cwd();
const actionsDir = fs.readdirSync(base).filter(f => {
  const p = path.join(base, f, 'action.yaml');
  return fs.existsSync(p);
});

for (const dir of actionsDir) {
  const actionPath = path.join(base, dir, 'action.yaml');
  const action = yaml.load(fs.readFileSync(actionPath, 'utf8'));

  if (!action.runs || !action.runs.using.startsWith('node')) continue;

  const entry = action.runs.main;
  if (!entry.startsWith('dist/')) continue;

  const source = path.join(base, dir, 'index.js');
  const outDir = path.join(base, dir, 'dist');

  if (!fs.existsSync(source)) {
    console.warn(`⚠️  No index.js found in ${dir}, skipping`);
    continue;
  }

  console.log(`🔧 Building ${dir}...`);
  cp.execSync(`npx --yes @vercel/ncc build ${source} -o ${outDir}`, { stdio: 'inherit' });
}
