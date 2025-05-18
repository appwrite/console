export function getIconFromRuntime(runtime: string) {
    switch (true) {
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
        default:
            return undefined;
    }
}
