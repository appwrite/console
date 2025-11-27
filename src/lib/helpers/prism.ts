export type PrismType = typeof import('prismjs');

export const LANGUAGES = ['js', 'html', 'dart', 'kotlin', 'json', 'sh', 'yml', 'swift'] as const;

export type Language = (typeof LANGUAGES)[number];

const PRISM_COMPONENTS: Record<Language, string> = {
    js: 'javascript',
    html: 'markup',
    sh: 'bash',
    yml: 'yaml',
    dart: 'dart',
    kotlin: 'kotlin',
    json: 'json',
    swift: 'swift'
};

// only for prism *plugins*, not components
function unsafeImport(path: string): Promise<unknown> {
    return import(`prismjs/plugins/${path}`);
}

export function isLanguage(str: string): str is Language {
    return LANGUAGES.includes(str as Language);
}

export async function loadPrism(language: Language, withLineNumbers = false) {
    const Prism: PrismType = await import('prismjs');
    const langComponent = PRISM_COMPONENTS[language];

    const imports: Promise<unknown>[] = [
        import(`prismjs/components/prism-${langComponent}`),
        unsafeImport('custom-class/prism-custom-class')
    ];

    if (withLineNumbers) {
        imports.push(unsafeImport('line-numbers/prism-line-numbers'));
    }

    await Promise.all(imports);

    return Prism;
}
