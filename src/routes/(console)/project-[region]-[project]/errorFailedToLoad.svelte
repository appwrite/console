<script lang="ts">
    import { Card } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';
    export let resource: string;
</script>

<Container>
    <Card>
        <Typography.Title size="s">Failed to load {resource}</Typography.Title>
        <p class="text-red-500">
            An error occurred while trying to load the {resource.toLowerCase()}. Please try again later or contact support if the issue persists.
        </p>
    </Card>
</Container>
