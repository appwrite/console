<script lang="ts">
    import { breadcrumbs as breadcrumbsStore, level, type Breadcrumb } from '$lib/stores/layout';

    $: breadcrumbs = [...$breadcrumbsStore]
        .map(([level, value]) => ({ level, value }))
        .sort((a, b) => (a.level > b.level ? 1 : -1))
        .filter((n) => n.level <= $level);

    function truncate(
        breadcrumbs: {
            value: Breadcrumb;
        }[]
    ) {
        /**
         *  Maximum of 4 Breadcrumbs, truncated from the left.
         */
        if ($level > 4) {
            breadcrumbs = [
                {
                    value: {
                        href: null,
                        title: '...'
                    }
                },
                ...breadcrumbs.slice(-3)
            ];
        }

        return breadcrumbs;
    }

    function buildHref(index: number) {
        return breadcrumbs
            .slice(0, index + 1)
            .reduce((prev, next) => `${prev}/${next.value.href}`, '');
    }
</script>

<nav class="breadcrumbs is-only-desktop" aria-label="breadcrumb">
    <ol class="breadcrumbs-list">
        {#each truncate(breadcrumbs) as breadcrumb, i}
            <li class="breadcrumbs-item">
                {#if breadcrumb.value.href}
                    <a href={buildHref(breadcrumbs.length > 4 ? i + breadcrumbs.length - 4 : i)}
                        >{breadcrumb.value.title}</a>
                {:else}
                    <span>{breadcrumb.value.title}</span>
                {/if}
            </li>
        {/each}
    </ol>
</nav>
