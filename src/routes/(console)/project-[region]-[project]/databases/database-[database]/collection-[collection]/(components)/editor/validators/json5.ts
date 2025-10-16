import JSON5 from 'json5';

export interface Diagnostic {
    from: number;
    to: number;
    message: string;
}

export interface ValidatorResult<TParsed = unknown> {
    ok: boolean;
    diagnostics: Diagnostic[];
    parsed?: TParsed;
    meta?: Record<string, unknown>;
}

async function validate(text: string): Promise<ValidatorResult> {
    try {
        const parsed = JSON5.parse(text);
        return { ok: true, diagnostics: [], parsed };
    } catch (err) {
        const line: number | undefined = err?.lineNumber;

        if (!line) {
            return {
                ok: false,
                diagnostics: [
                    {
                        from: 0,
                        to: text.length,
                        message: err?.message || 'Syntax error'
                    }
                ]
            };
        }

        const lines = text.split('\n');

        /**
         * we highlight the previous line instead because sometimes,
         * the reported line is the NEXT line as that's where the validator encounters an error!
         */
        const targetLineIndex = Math.max(0, line - 2);

        // calculate line start position
        let lineStartPos = 0;
        for (let i = 0; i < targetLineIndex; i++) {
            lineStartPos += lines[i].length + 1;
        }

        // highlight the whole line (trimmed)
        const targetLine = lines[targetLineIndex] || '';
        const trimmedStart = targetLine.trimStart();
        const leadingWhitespace = targetLine.length - trimmedStart.length;
        const lineEndPos = lineStartPos + leadingWhitespace + trimmedStart.trimEnd().length;

        const diagnostic: Diagnostic = {
            from: lineStartPos + leadingWhitespace,
            to: lineEndPos,
            message: (err?.message || 'Syntax error').replace(/^JSON5:\s*/i, '')
        };

        return { ok: false, diagnostics: [diagnostic] };
    }
}

export async function parse<T = unknown>(text: string): Promise<T> {
    const res = await validate(text);
    if (!res.ok)
        throw Object.assign(new Error(res.diagnostics[0]?.message || 'Invalid JSON5'), {
            diagnostics: res.diagnostics
        });
    return res.parsed as T;
}
