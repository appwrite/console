<script lang="ts">
    import { Button, Icon, Layout } from '@appwrite.io/pink-svelte';
    import { isStudio } from '$lib/system';
    import { page } from '$app/state';
    import { IconChevronLeft } from '@appwrite.io/pink-icons-svelte';

    let {
        size = null,
        blocksize = '152px'
    }: { size?: 'small' | 'medium' | 'large' | 'xl'; blocksize?: string } = $props();

    let style = $derived.by(() => {
        return size
            ? `--p-container-max-size: var(--container-max-size, var(--container-size-${size}))`
            : '';
    });

    let nestedLevel = $derived.by(() => {
        return page.url.pathname.split('/').length;
    });
    let paramCount = $derived.by(() => {
        return Object.keys(page.params).length;
    });
</script>

{#if isStudio}
    <Layout.Stack direction="row" alignItems="center">
        {#if nestedLevel > 4}
            {#if (nestedLevel === 6 && paramCount === 2) || nestedLevel === 7}
                <a href="../" style:display="flex" style:margin-inline-end="-8px"
                    ><Icon icon={IconChevronLeft} /></a>
            {:else if paramCount >= 2}
                <a href="./" style:display="flex" style:margin-inline-end="-8px"
                    ><Icon icon={IconChevronLeft} /></a>
            {/if}
        {/if}

        <slot name="header" />
    </Layout.Stack>
    <slot />
{:else}
    <div class="top-cover-console" style:block-size={blocksize}>
        <div class="cover-container" {style}>
            <Layout.Stack direction="row" alignItems="baseline">
                <slot name="header" />
            </Layout.Stack>
            <slot />
        </div>
    </div>
{/if}

<style lang="scss">
    .top-cover-console {
        container-type: inline-size;
        padding-block-start: var(--base-32);
        padding-block-end: var(--base-16);
        border-bottom: 1px solid var(--border-neutral, #2d2d31);
        background: var(--bgcolor-neutral-primary, #1d1d21);
        margin-left: -190px;
        padding-left: 190px;

        &.no-padding {
            margin-left: 0;
            padding-left: 0;
        }
    }
    .cover-container {
        position: relative;
        margin: 0 1rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        block-size: 100%;

        @media (min-width: 360px) {
            margin-inline: 1rem;
        }
        @media (min-width: 1024px) {
            margin-inline: auto;
            max-width: calc(944px - 11rem);
        }
        @media (min-width: 1280px) {
            margin-inline: auto;
            max-width: 1000px;
        }
        @media (min-width: 1440px) {
            margin-inline: auto;
            max-width: 1144px;
        }
        @media (min-width: 1728px) {
            margin-inline: auto;
            max-width: 1200px;
        }
    }
</style>
