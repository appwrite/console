// Original code from: https://github.com/bevry/envfile

export type Data = Record<string, string>;

export function parse(src: string): Data {
    const result: Data = {};
    const lines = src.toString().split('\n');
    for (const line of lines) {
        const match = line.match(/^([^=:#]+?)[=:](.*)/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/['"]+/g, '');
            result[key] = value;
        }
    }
    return result;
}

/**
 * Reads an uploaded .env file as text, honoring its encoding.
 *
 * `File.text()` always decodes UTF-8, but .env files written on Windows are
 * often UTF-16 (PowerShell's `>` redirect defaults to it). Decoded as UTF-8,
 * every character in such a file gains an interleaved NUL byte, so a key
 * like SOME_API_KEY is stored with a NUL after every letter - an
 * invalid env var name that the API now refuses. Detect UTF-16 by BOM, or by
 * interleaved NUL bytes when the BOM is missing, and decode accordingly.
 */
export async function readEnvFile(file: Blob): Promise<string> {
    const buffer = new Uint8Array(await file.arrayBuffer());

    let encoding = 'utf-8';
    if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
        encoding = 'utf-16le';
    } else if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
        encoding = 'utf-16be';
    } else if (buffer.length >= 2) {
        // No BOM: ASCII-range text stored as UTF-16 has a NUL in every code
        // unit's high byte. Its position tells the byte order apart.
        let evenNuls = 0;
        let oddNuls = 0;
        for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] === 0) {
                if (i % 2 === 0) {
                    evenNuls++;
                } else {
                    oddNuls++;
                }
            }
        }
        const units = buffer.length / 2;
        if (oddNuls > units * 0.7) {
            encoding = 'utf-16le';
        } else if (evenNuls > units * 0.7) {
            encoding = 'utf-16be';
        }
    }

    // TextDecoder strips the BOM for both UTF-8 and UTF-16.
    return new TextDecoder(encoding).decode(buffer);
}
