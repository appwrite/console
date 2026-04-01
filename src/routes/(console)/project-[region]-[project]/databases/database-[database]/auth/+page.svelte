<script lang="ts">
    import { Container } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import UpdateConnections from '../settings/updateConnections.svelte';
    import RotateCredentials from '../settings/rotateCredentials.svelte';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();

    const dedicatedDatabase = $derived(data.dedicatedDatabase as Models.DedicatedDatabase | null);
</script>

{#if dedicatedDatabase}
    <Container>
        <UpdateConnections database={dedicatedDatabase} />
        <RotateCredentials database={dedicatedDatabase} />
    </Container>
{/if}
