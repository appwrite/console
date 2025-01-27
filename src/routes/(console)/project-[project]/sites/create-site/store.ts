import {
    IconAngular,
    IconNuxt,
    IconReact,
    IconSvelte,
    IconVue
} from '@appwrite.io/pink-icons-svelte';

export function getFrameworkIcon(framework: string) {
    console.log(framework);
    switch (true) {
        case framework.toLocaleLowerCase().includes('sveltekit'):
            return IconSvelte;
        case framework.toLocaleLowerCase().includes('nuxt'):
            return IconNuxt;
        case framework.toLocaleLowerCase().includes('vue'):
            return IconVue;
        case framework.toLocaleLowerCase().includes('react'):
            return IconReact;
        case framework.toLocaleLowerCase().includes('angular'):
            return IconAngular;
        case framework.toLocaleLowerCase().includes('svelte'):
            return IconSvelte;
        case framework.toLocaleLowerCase().includes('next'):
            return IconReact; //TODO: add next icon

        default:
            return undefined;
    }
}
