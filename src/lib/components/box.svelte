<script lang="ts">
    import { Card } from '@appwrite.io/pink-svelte';
    import type { BaseCardProps } from './card.svelte';

    export let radius: BaseCardProps['radius'] = 'm';
    export let padding: BaseCardProps['padding'] = 's';
</script>

<Card.Base variant="secondary" {radius} {padding}>
    <slot />
</Card.Base>
