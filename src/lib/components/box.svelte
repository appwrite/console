<script lang="ts">
    import { Card } from '@appwrite.io/pink-svelte';
    import type Base from '@appwrite.io/pink-svelte/dist/card/Base.svelte';
    import type { ComponentProps } from 'svelte';

    export let radius: ComponentProps<Base>['radius'] = 'm';
    export let padding: ComponentProps<Base>['padding'] = 's';
</script>

<Card.Base variant="secondary" {radius} {padding}>
    <slot />
</Card.Base>
