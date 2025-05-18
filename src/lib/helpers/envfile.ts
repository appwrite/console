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
