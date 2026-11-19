// Embed the same student modules and stylesheet in one offline classroom file.
// A local import map keeps relative repository imports working from file://.
import { readFile, writeFile } from 'node:fs/promises';
import { posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = new URL('./', import.meta.url);
const imports = {};
async function include(file) {
  const key = 'signal-leak/' + file;
  if (imports[key]) return;
  const code = await readFile(new URL(file,base),'utf8');
  const dependencies = new Set();
  const rewritten = code.replace(/^(import\s+[^;\n]+?\s+from\s+)(['"])(\.[^'"]+)\2/gm, (match, prefix, quote, relative) => {
    const dep = posix.normalize(posix.join(posix.dirname(file),relative));
    dependencies.add(dep);
    return prefix+quote+'signal-leak/'+dep+quote;
  });
  imports[key] = 'data:text/javascript;base64,' + Buffer.from(rewritten).toString('base64');
  for (const dep of dependencies) await include(dep);
}

export async function buildPortable(output) {
  await include('app.mjs');
  const css = await readFile(new URL('style.css',base),'utf8');
  const html = (await readFile(new URL('index.html',base),'utf8'))
    .replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
    .replace('<script type="module" src="app.mjs"></script>',
      '<script type="importmap">'+JSON.stringify({imports})+'</script><script type="module">import "signal-leak/app.mjs";</script>');
  await writeFile(output,html);
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) throw Error('Provide an output path for Signal-Leak.html');
  await buildPortable(resolve(process.argv[2]));
}
