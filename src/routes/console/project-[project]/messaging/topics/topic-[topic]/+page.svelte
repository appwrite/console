<script lang="ts">
    import { Container } from '$lib/layout';
    import DangerZone from './dangerZone.svelte';
    import Details from './details.svelte';
    import UpdateName from './updateName.svelte';
</script>

<Container>
    <Details />
    <UpdateName />
    <DangerZone />
</Container>
