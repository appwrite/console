export function getFrameworkIcon(framework: string) {
    switch (true) {
        case framework.toLocaleLowerCase().includes('sveltekit'):
            return 'svelte';
        case framework.toLocaleLowerCase().includes('nuxt'):
            return 'nuxt';
        case framework.toLocaleLowerCase().includes('vue'):
            return 'vue';
        case framework.toLocaleLowerCase().includes('react'):
            return 'react';
        case framework.toLocaleLowerCase().includes('angular'):
            return 'angular';
        case framework.toLocaleLowerCase().includes('svelte'):
            return 'svelte';
        case framework.toLocaleLowerCase().includes('next'):
            return 'nextjs';
        case framework.toLocaleLowerCase().includes('astro'):
            return 'astro';
        case framework.toLocaleLowerCase().includes('remix'):
            return 'remix';
        case framework.toLocaleLowerCase().includes('flutter'):
            return 'flutter';
        case framework.toLocaleLowerCase().includes('analog'):
            return 'analog';
        case framework.toLocaleLowerCase().includes('vite'):
            return 'vite';
        case framework.toLocaleLowerCase().includes('lynx'):
            return 'lynx';
        case framework.toLocaleLowerCase().includes('other'):
            return 'empty';

        default:
            return 'empty';
    }
}
