import { parse, readEnvFile } from '$lib/helpers/envfile';
import { expect, test } from 'vitest';

function encodeUtf16(text: string, littleEndian: boolean, bom: boolean): Uint8Array {
    const codeUnits = bom
        ? [0xfeff, ...text.split('').map((c) => c.charCodeAt(0))]
        : text.split('').map((c) => c.charCodeAt(0));
    const bytes = new Uint8Array(codeUnits.length * 2);
    const view = new DataView(bytes.buffer);
    codeUnits.forEach((unit, i) => view.setUint16(i * 2, unit, littleEndian));
    return bytes;
}

const ENV = 'ACME_SERVICE_API_KEY=secret-value\nOTHER_KEY=other';
const EXPECTED = { ACME_SERVICE_API_KEY: 'secret-value', OTHER_KEY: 'other' };

test('reads UTF-8', async () => {
    const file = new Blob([new TextEncoder().encode(ENV)]);
    expect(parse(await readEnvFile(file))).toEqual(EXPECTED);
});

test('reads UTF-8 with BOM', async () => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode(ENV)]);
    expect(parse(await readEnvFile(new Blob([bytes])))).toEqual(EXPECTED);
});

test('reads UTF-16LE with BOM (PowerShell default)', async () => {
    const file = new Blob([encodeUtf16(ENV, true, true)]);
    expect(parse(await readEnvFile(file))).toEqual(EXPECTED);
});

test('reads UTF-16BE with BOM', async () => {
    const file = new Blob([encodeUtf16(ENV, false, true)]);
    expect(parse(await readEnvFile(file))).toEqual(EXPECTED);
});

test('reads BOM-less UTF-16LE by NUL heuristic', async () => {
    const file = new Blob([encodeUtf16(ENV, true, false)]);
    const parsed = parse(await readEnvFile(file));
    expect(parsed).toEqual(EXPECTED);
    // The regression this guards: keys must not carry interleaved NUL bytes.
    expect(Object.keys(parsed).some((key) => key.includes('\u0000'))).toBe(false);
});

test('reads BOM-less UTF-16BE by NUL heuristic', async () => {
    const file = new Blob([encodeUtf16(ENV, false, false)]);
    expect(parse(await readEnvFile(file))).toEqual(EXPECTED);
});

test('keeps UTF-8 text containing a stray NUL as UTF-8', async () => {
    const text = 'A=1\nB=has\u0000nul';
    const file = new Blob([new TextEncoder().encode(text)]);
    expect(await readEnvFile(file)).toBe(text);
});
