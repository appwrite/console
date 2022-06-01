<script>
    import { Card } from '$lib/components';
    import { Container } from '$lib/layout';
    import SetUserLimit from './_setUserLimit.svelte';
    import { project } from '../store';

    $: authLimit = $project.authLimit;
    let showUserLimitModal = false;
</script>

<Container>
    <p>
        {authLimit ? `${authLimit} Users allowed` : 'Unlimited Users'}
        <button on:click={() => (showUserLimitModal = true)} class=" is-text link">
            <span class="text">{authLimit ? 'Change Limit' : 'Set Limit'}</span>
        </button>
    </p>

    <SetUserLimit {authLimit} bind:showUserLimitModal />

    <h7 class="heading-level-7">Users</h7>
    <Card />
    <h7 class="heading-level-7">Session length</h7>
    <Card />
</Container>
