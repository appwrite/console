<script lang="ts" module>
    const langArr = ['js', 'html', 'dart', 'kotlin', 'json', 'sh', 'yml', 'swift'] as const;
    export type Language = (typeof langArr)[number];

    export function isLanguage(str: string): str is Language {
        return langArr.includes(str as Language);
    }
</script>

<script lang="ts">
    import { Copy } from '.';
    import { Badge, Icon, Code } from '@appwrite.io/pink-svelte';
    import { IconCode, IconAndroid, IconFlutter, IconApple } from '@appwrite.io/pink-icons-svelte';

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
        language: 'js' | 'html' | 'dart' | 'kotlin' | 'json' | 'sh' | 'yml' | 'swift';
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
</script>

<section
    class="box u-overflow-hidden {classes}"
    class:common-section={!noMargin}
    class:noBoxPadding
    class:with-scroll={allowScroll}>
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
    <Code {code} lang={language} lineNumbers={withLineNumbers} hideHeader />
</section>

<style lang="scss">
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
        overflow: auto !important;
    }
</style>
