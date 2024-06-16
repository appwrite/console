<script lang="ts">
    import { Container } from '$lib/layout';
    import UpdatePassword from './updatePassword.svelte';
    import UpdateName from './updateName.svelte';
    import UpdateEmail from './updateEmail.svelte';
    import DeleteAccount from './deleteAccount.svelte';
    import UpdateMfa from './updateMfa.svelte';
    import Identities from './identities.svelte';
</script>

<Container>
    <UpdateName />
    <UpdateEmail />
    <UpdatePassword />
    <Identities />
    <UpdateMfa />
    <DeleteAccount />
</Container>
