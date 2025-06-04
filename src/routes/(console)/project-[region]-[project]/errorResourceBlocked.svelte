<script lang="ts">
    import { Card } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';
    export let resource: string;
</script>

<Container>
    <Card>
        <Typography.Title size="s">Your {resource} is paused</Typography.Title>
        <p class="text-red-500">
            We've detected unusual activity and temporarily paused your {resource}. If you believe
            this is a mistake or need urgent access, please contact support@appwrite.io.
        </p>
    </Card>
</Container>
