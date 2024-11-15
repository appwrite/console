<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { Link } from '@appwrite.io/pink-svelte';
    import type { ComponentProps } from 'svelte';

    type Props = ComponentProps<Link.Anchor> & ComponentProps<Link.Button>;

    export let event: string = null;
    export let eventData: Record<string, unknown> = {};
    export let href: string = null;
    export let disabled: Props['disabled'] = false;
    export let type: Props['type'] = 'button';
    export let variant: Props['variant'] = 'default';
    export let size: Props['size'] = 'medium';

    function track() {
        if (!event) {
            return;
        }

        trackEvent(`click_${event}`, {
            from: 'link',
            ...eventData
        });
    }
</script>

{#if href}
    <Link.Anchor on:click on:mousedown on:click={track} {href} {disabled} {variant} {size}>
        <slot />
    </Link.Anchor>
{:else}
    <Link.Button on:click on:mousedown on:click={track} {type} {disabled} {variant} {size}>
        <slot />
    </Link.Button>
{/if}
