import { fileURLToPath } from 'url';
import { build, loadEnv } from 'vite';
import kleur from 'kleur';

const { bold, yellow } = kleur;
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const env = loadEnv('production', __dirname);

function log(text = '', prefix = '') {
    console.log(`${bold().green(`# ${prefix}`)}${text}`);
}

function logEnv(key, value, fallback = 'not set') {
    log(value || yellow(fallback), `${key}: `);
}

function logDelimiter() {
    console.log(bold().green('#'.repeat(80)));
}

async function main() {
    logDelimiter();
    log();
    log(bold().magenta('APPWRITE CONSOLE'));
    log();
    logEnv('CONSOLE MODE', env?.VITE_CONSOLE_MODE);
    logEnv('APPWRITE ENDPOINT', env?.VITE_APPWRITE_ENDPOINT, 'relative');
    logEnv('GROWTH ENDPOINT', env?.VITE_APPWRITE_GROWTH_ENDPOINT);
    log();
    logDelimiter();
    await build();
}

main();
