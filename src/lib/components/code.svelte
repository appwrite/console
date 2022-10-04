<script lang="ts">
    import Prism from 'prismjs';
    import 'prismjs/components/prism-dart';
    import 'prismjs/plugins/autoloader/prism-autoloader';
    import 'prismjs/plugins/line-numbers/prism-line-numbers';
    import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
    import { afterUpdate } from 'svelte';

    export let code = '';
    export let language: 'js' | 'html' | 'dart' | 'json';

    afterUpdate(async () => {
        Prism.highlightAll();
    });
</script>

<pre class={`language-${language} line-numbers`}><code>{@html code}</code></pre>

<style lang="scss" global>
    @import 'prismjs/themes/prism.css';

    code,
    pre {
        &[class*='language-'] {
            color: #fcfcff;
            text-shadow: none;
            font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
            body.theme-light & {
                color: #373b4d;
            }
        }
        ::selection,
        &::selection {
            text-shadow: none;
            background: #b3d4fc;
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
            color: slategray;
        }

        &.punctuation {
            color: #999;
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
            color: #9a6e3a;
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
        &.function,
        &.class-name {
            color: #ffa1ce;
            body.theme-light & {
                color: #f02e7f;
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
