export function getIconFromRuntime(runtime?: string) {
    switch (true) {
        case !runtime:
            return undefined;
        case runtime.includes('node'):
            return 'node';
        case runtime.includes('php'):
            return 'php';
        case runtime.includes('ruby'):
            return 'ruby';
        case runtime.includes('python'):
            return 'python';
        case runtime.includes('dart'):
            return 'dart';
        case runtime.includes('bun'):
            return 'bun';
        case runtime.includes('go'):
            return 'go';
        case runtime.includes('deno'):
            return 'deno';
        case runtime.includes('flutter'):
            return 'flutter';
        case runtime.includes('dotnet'):
            return 'dotnet';
        case runtime.includes('java'):
            return 'java';
        case runtime.includes('swift'):
            return 'swift';
        case runtime.includes('kotlin'):
            return 'kotlin';
        case runtime.includes('cpp'):
            return 'cpp';
        case runtime.includes('rust'):
            return 'rust';
        default:
            return undefined;
    }
}
