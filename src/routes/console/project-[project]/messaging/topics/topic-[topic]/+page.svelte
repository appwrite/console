<script lang="ts">
    import { Container } from '$lib/layout';
    import DangerZone from './dangerZone.svelte';
    import Details from './details.svelte';
    import UpdateDescription from './updateDescription.svelte';
    import UpdateName from './updateName.svelte';
</script>

<Container>
    <Details />
    <UpdateName />
    <UpdateDescription />
    <DangerZone />
</Container>
