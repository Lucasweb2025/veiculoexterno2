/**
 * Publica fontes de src/ em assets/ (CSS + JS modulares).
 * Uso: npm run sync:assets
 */
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');

function copyOne(origem, destino) {
    mkdirSync(dirname(destino), { recursive: true });
    copyFileSync(origem, destino);
    console.log('OK', destino.replace(root + '\\', '').replace(root + '/', ''));
}

function copyDirJs(subdir) {
    const dir = join(src, subdir);
    if (!existsSync(dir)) return;
    for (const nome of readdirSync(dir).filter(f => f.endsWith('.js'))) {
        copyOne(join(dir, nome), join(root, 'assets', 'js', nome));
    }
}

mkdirSync(join(root, 'assets', 'css'), { recursive: true });
mkdirSync(join(root, 'assets', 'js'), { recursive: true });

const styles = join(src, 'styles');
if (existsSync(styles)) {
    for (const nome of readdirSync(styles).filter(f => f.endsWith('.css'))) {
        copyOne(join(styles, nome), join(root, 'assets', 'css', nome));
    }
}

copyOne(join(src, 'shared', 'utils.js'), join(root, 'assets', 'js', 'utils.js'));
copyOne(join(src, 'shared', 'constants.js'), join(root, 'assets', 'js', 'constants.js'));
copyOne(join(src, 'shared', 'firebase', 'la-firebase.js'), join(root, 'assets', 'js', 'la-firebase.js'));
copyOne(join(src, 'shared', 'supabase', 'la-supabase.js'), join(root, 'assets', 'js', 'la-supabase.js'));
copyOne(join(src, 'shared', 'la-store.js'), join(root, 'assets', 'js', 'la-store.js'));
copyOne(join(src, 'shared', 'la-backend-loader.js'), join(root, 'assets', 'js', 'la-backend-loader.js'));

copyDirJs('motorista');
copyDirJs('gestor');

console.log('\nSync concluído: src/ → assets/');
