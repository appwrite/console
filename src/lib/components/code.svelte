<script lang="ts" context="module">
    const langArr = ['js', 'html', 'dart', 'kotlin', 'json', 'sh', 'yml', 'swift'] as const;
    export type Language = (typeof langArr)[number];

    export function isLanguage(str: string): str is Language {
        return langArr.includes(str as Language);
    }
</script>

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
    import { afterUpdate } from 'svelte';
    import { Copy } from '.';

    export let label: string = null;
    export let labelIcon: 'code' | 'android' | 'flutter' | 'apple' = null;
    export let code: string;
    export let language: 'js' | 'html' | 'dart' | 'kotlin' | 'json' | 'sh' | 'yml' | 'swift';
    export let withLineNumbers = false;
    export let withCopy = false;
    export let noMargin = false;
    export let noBoxPadding = false;
    export let allowScroll = false;

    let classes = '';
    export { classes as class };

    Prism.plugins.customClass.prefix('prism-');

    afterUpdate(async () => {
        Prism.highlightAll();
    });
</script>

<section
    class="box u-overflow-hidden {classes}"
    class:common-section={!noMargin}
    class:noBoxPadding>
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
    <pre
        class:with-scroll={allowScroll}
        class={`language-${language}`}
        class:line-numbers={withLineNumbers}><code>{code}</code></pre>
</section>

<!-- svelte-ignore css-unused-selector -->
<style lang="scss" global>
    @import 'prismjs/themes/prism.css';
    @import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

    .box {
        --p-box-background-color: var(--color-neutral-400) !important;

        body.theme-light & {
            --p-box-background-color: var(--color-neutral-5) !important;
        }

        .controls {
            z-index: 2;
        }
    }

    .noBoxPadding {
        padding: 0 !important;
    }

    .with-scroll {
        height: 100%;
        overflow: auto;
    }

    code,
    pre {
        &[class*='language-'] {
            color: #fcfcff;
            text-shadow: none;
            font-family: 'Source Code Pro';

            &.line-numbers {
                padding-left: 2.5em;
            }
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

        margin: 0;
    }
    .prism-token {
        &.prism-comment,
        &.prism-prolog,
        &.prism-doctype,
        &.prism-cdata {
            color: #868ea3;
        }

        &.prism-punctuation {
            color: #fcfcff;

            body.theme-light & {
                color: #373b4d;
            }
        }
        &.prism-property,
        &.prism-tag,
        &.prism-boolean,
        &.prism-number,
        &.prism-constant,
        &.prism-symbol,
        &.prism-deleted,
        &.prism-selector,
        &.prism-attr-name,
        &.prism-string,
        &.prism-char,
        &.prism-builtin,
        &.prism-inserted {
            color: #fdc584;
            body.theme-light & {
                color: #e49545;
            }
        }
        &.prism-operator,
        &.prism-entity,
        &.prism-url,
        .language-css &.prism-string,
        .style &.prism-string {
            color: #fcfcff;
            background: none;
            body.theme-light & {
                color: #373b4d;
            }
        }

        &.prism-atrule,
        &.prism-attr-value,
        &.prism-keyword {
            color: #cbb1fc;
            body.theme-light & {
                color: #6a6af7;
            }
        }
        &.prism-function {
            color: #ffa1ce;
            body.theme-light & {
                color: #f02e7f;
            }
        }
        &.prism-class-name {
            color: #a1c4ff;
            body.theme-light & {
                color: #62aed2;
            }
        }
        &.prism-important,
        &.prism-variable {
            color: #a1c4ff;
            body.theme-light & {
                color: #62aed2;
            }
        }
        &.prism-regex {
            color: #a1c4ff;
            body.theme-light & {
                color: #62aed2;
            }
        }
    }
</style>
