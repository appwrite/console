<script lang="ts">
    import { Container } from '$lib/layout';
    import UpdatePassword from './updatePassword.svelte';
    import UpdateName from './updateName.svelte';
    import UpdateEmail from './updateEmail.svelte';
    import DeleteAccount from './deleteAccount.svelte';
</script>

<Container>
    <UpdateName />
    <UpdateEmail />
    <UpdatePassword />
    <DeleteAccount />
</Container>
