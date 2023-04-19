<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Container } from '$lib/layout';
    import { onMount } from 'svelte';
    import { user } from '$lib/stores/user';

    let name: string = null,
        email: string = null;

    onMount(async () => {
        name ??= $user.name;
        email ??= $user.email;
    });
</script>

<Container>
    <div>
        <CardGrid>
            <Heading tag="h6" size="7">Update Name</Heading>
        </CardGrid>
    </div>
</Container>
