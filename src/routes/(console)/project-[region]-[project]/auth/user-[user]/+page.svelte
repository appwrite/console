<script lang="ts">
    import { Container } from '$lib/layout';
    import DangerZone from './dangerZone.svelte';
    import UpdateEmail from './updateEmail.svelte';
    import UpdateLabels from './updateLabels.svelte';
    import UpdateMfa from './updateMfa.svelte';
    import UpdateName from './updateName.svelte';
    import UpdatePassword from './updatePassword.svelte';
    import UpdatePhone from './updatePhone.svelte';
    import UpdatePrefs from './updatePrefs.svelte';
    import UpdateStatus from './updateStatus.svelte';
    import type { PageData } from './$types';

    export let data: PageData
</script>

<Container>
    <UpdateStatus />
    <UpdateName />
    <UpdateEmail />
    <UpdatePhone />
    <UpdatePassword />
    <UpdateLabels />
    <UpdatePrefs />
    <UpdateMfa />
    <DangerZone project={data.project} />
</Container>
