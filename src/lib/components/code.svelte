<script lang="ts">
    import { Pill } from '$lib/elements';
    import Prism from 'prismjs';
    import 'prismjs/components/prism-dart';
    import 'prismjs/components/prism-kotlin';
    import 'prismjs/components/prism-json';
    import 'prismjs/components/prism-bash';
    import 'prismjs/components/prism-yaml';
    import 'prismjs/components/prism-swift';
    import 'prismjs/plugins/autoloader/prism-autoloader';
    import 'prismjs/plugins/custom-class/prism-custom-class';
    import 'prismjs/plugins/line-numbers/prism-line-numbers';
    import './code.scss';
    import { afterUpdate } from 'svelte';
    import { Copy } from '.';

    export let label: string = null;
    export let labelIcon: 'code' | 'android' | 'flutter' | 'apple' = null;
    export let code: string;
    export let language: 'js' | 'html' | 'dart' | 'kotlin' | 'json' | 'sh' | 'yml' | 'swift';
    export let withLineNumbers = false;
    export let withCopy = false;
    export let noMargin = false;

    Prism.plugins.customClass.prefix('prism-');

    afterUpdate(async () => {
        Prism.highlightAll();
    });
</script>

<section class="box u-overflow-hidden " class:common-section={!noMargin}>
    <div
        class="controls u-position-absolute u-inset-inline-end-8 u-inset-block-start-8 u-flex u-gap-8">
        {#if label}
            <Pill>
                {#if labelIcon}
                    <span class={`icon-${labelIcon}`} aria-hidden="true" />
                {/if}
                {label}
            </Pill>
        {/if}
        {#if withCopy}
            <Copy value={code}>
                <button class="button is-small is-text is-only-icon" aria-label="copy code">
                    <span class="icon-duplicate" aria-hidden="true" />
                </button>
            </Copy>
        {/if}
    </div>

    <pre class={`language-${language}`} class:line-numbers={withLineNumbers}><code
            >{code}</code></pre>
</section>

<style lang="scss">
    .box {
        --p-box-background-color: var(--color-neutral-400) !important;

        :global(body.theme-light) & {
            --p-box-background-color: var(--color-neutral-5) !important;
        }

        .controls {
            z-index: 2;
        }
    }
</style>
