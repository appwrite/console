<script lang="ts">
    import { Copy } from '.';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { Badge, Icon } from '@appwrite.io/pink-svelte';
    import { IconCode, IconAndroid, IconFlutter, IconApple } from '@appwrite.io/pink-icons-svelte';
    import { type Language, loadPrism, type PrismType } from '$lib/helpers/prism';

    let Prism: PrismType | null = null;

    let {
        label = null,
        labelIcon = null,
        code,
        language,
        withLineNumbers = false,
        withCopy = false,
        noMargin = false,
        noBoxPadding = false,
        allowScroll = false,
        class: classes = ''
    }: {
        label?: string;
        labelIcon?: 'code' | 'android' | 'flutter' | 'apple';
        code: string;
        language: Language;
        withLineNumbers?: boolean;
        withCopy?: boolean;
        noMargin?: boolean;
        noBoxPadding?: boolean;
        allowScroll?: boolean;
        class?: string;
    } = $props();

    function getIcon(iconName: string) {
        switch (iconName) {
            case 'code':
                return IconCode;
            case 'android':
                return IconAndroid;
            case 'flutter':
                return IconFlutter;
            case 'apple':
                return IconApple;
            default:
                return null;
        }
    }

    onMount(async () => {
        if (!browser) return;

        Prism = await loadPrism(language, withLineNumbers);
        Prism.plugins.customClass.prefix('prism-');
    });

    $effect(() => Prism.highlightAll());
</script>

<section
    class="box u-overflow-hidden {classes}"
    class:common-section={!noMargin}
    class:noBoxPadding>
    <div
        class="controls u-position-absolute u-inset-inline-end-8 u-inset-block-start-8 u-flex u-gap-8">
        {#if label}
            <Badge variant="secondary" content={label}>
                {#if labelIcon}
                    <Icon icon={getIcon(labelIcon)} size="s" slot="start" />
                {/if}
            </Badge>
        {/if}
        {#if withCopy}
            <Copy value={code}>
                <button class="button is-small is-text is-only-icon" aria-label="copy code">
                    <span class="icon-duplicate" aria-hidden="true"></span>
                </button>
            </Copy>
        {/if}
    </div>
    <pre
        class:with-scroll={allowScroll}
        class={`language-${language}`}
        class:line-numbers={withLineNumbers}><code>{code}</code></pre>
</section>

<!-- svelte-ignore css_unused_selector -->
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
