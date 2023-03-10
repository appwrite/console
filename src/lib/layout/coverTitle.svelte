<script lang="ts">
    import { Heading } from '$lib/components';

    export let href: string = null;
</script>

<Heading size="4" tag="h1" trimmed={false}>
    <div class="u-flex u-cross-center">
        {#if href}
            <a class="button is-text is-only-icon" {href} aria-label="page back">
                <span class="icon-cheveron-left" aria-hidden="true" />
            </a>
        {/if}
        <span class="text u-trim-1">
            <slot />
        </span>
    </div>
</Heading>
