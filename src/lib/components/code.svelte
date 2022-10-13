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
    import 'prismjs/plugins/line-numbers/prism-line-numbers';
    import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
    import { afterUpdate } from 'svelte';
    import { Copy } from '.';

    export let label: string = null;
    export let code: string;
    export let language: 'js' | 'html' | 'dart' | 'kotlin' | 'json' | 'sh' | 'yml' | 'swift';
    export let showLineNumbers = false;
    export let showCopy = false;

    afterUpdate(async () => {
        Prism.highlightAll();
    });
</script>

<section class="box u-overflow-hidden u-min-height-100">
    <div class="u-position-absolute u-inset-inline-end-8 u-inset-block-start-8 u-flex u-gap-8">
        {#if label}
            <Pill>{label}</Pill>
        {/if}
        {#if showCopy}
            <Copy value={code}>
                <button class="button is-small is-text is-only-icon" aria-label="copy code">
                    <span class="icon-duplicate" aria-hidden="true" />
                </button>
            </Copy>
        {/if}
    </div>

    <pre class={`language-${language}`} class:line-numbers={showLineNumbers}><code
            >{code}</code></pre>
</section>

<style lang="scss" global>
    @import 'prismjs/themes/prism.css';

    code,
    pre {
        &[class*='language-'] {
            color: #fcfcff;
            text-shadow: none;
            font-family: 'Source Code Pro';
            body.theme-light & {
                color: #373b4d;
            }
        }
        ::selection,
        &::selection {
            text-shadow: none;
            background: #b3d4fc;
        }

        &.line-numbers .line-numbers-rows {
            border: none;

            > span::before {
                color: #868ea3;
            }
        }
    }

    :not(pre) > code[class*='language-'],
    pre[class*='language-'] {
        background: hsl(var(--p-box-background-color));
    }
    .token {
        &.comment,
        &.prolog,
        &.doctype,
        &.cdata {
            color: #868ea3;
        }

        &.punctuation {
            color: #fcfcff;

            body.theme-light & {
                color: #373b4d;
            }
        }
        &.property,
        &.tag,
        &.boolean,
        &.number,
        &.constant,
        &.symbol,
        &.deleted,
        &.selector,
        &.attr-name,
        &.string,
        &.char,
        &.builtin,
        &.inserted {
            color: #fdc584;
            body.theme-light & {
                color: #e49545;
            }
        }
        &.operator,
        &.entity,
        &.url,
        .language-css &.string,
        .style &.string {
            color: #fcfcff;
            background: none;
            body.theme-light & {
                color: #373b4d;
            }
        }

        &.atrule,
        &.attr-value,
        &.keyword {
            color: #cbb1fc;
            body.theme-light & {
                color: #6a6af7;
            }
        }
        &.function {
            color: #ffa1ce;
            body.theme-light & {
                color: #f02e7f;
            }
        }
        &.class-name {
            color: #a1c4ff;
            body.theme-light & {
                color: #62aed2;
            }
        }
        &.regex,
        &.important,
        &.variable {
            color: #a1c4ff;
            body.theme-light & {
                color: #62aed2;
            }
        }
    }
</style>
