<script lang="ts">
    import { Pill } from '$lib/elements';
    import Prism from 'prismjs';
    import 'prismjs/components/prism-dart';
    import 'prismjs/components/prism-kotlin';
    import 'prismjs/plugins/autoloader/prism-autoloader';
    import 'prismjs/plugins/line-numbers/prism-line-numbers';
    import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
    import { afterUpdate } from 'svelte';
    import { Copy } from '.';

    export let label: string = null;
    export let code = '';
    export let language: 'js' | 'html' | 'dart' | 'kotlin' | 'json';
    export let showLineNumbers = false;
    export let showCopy = false;

    afterUpdate(async () => {
        Prism.highlightAll();
    });
</script>

<div class="code">
    <div class="controls">
        {#if label}
            <Pill>{label}</Pill>
        {/if}
        {#if showCopy}
            <Copy value={code}>
                <span class="icon-duplicate" aria-hidden="true" style="cursor: pointer;" />
            </Copy>
        {/if}
    </div>
    <pre class={`language-${language}`} class:line-numbers={showLineNumbers}><code
            >{code}</code></pre>
</div>

<style lang="scss" global>
    @import 'prismjs/themes/prism.css';

    div.code {
        position: relative;

        div.controls {
            position: absolute;
            right: 0.5rem;
            top: 0.5rem;
            z-index: 1;
        }
    }

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
        background: #1b1b28;
        body.theme-light & {
            background: #fcfcff;
        }
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
