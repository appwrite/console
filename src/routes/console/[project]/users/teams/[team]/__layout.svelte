<script lang="ts">
    import { base } from '$app/paths';

    import { page } from '$app/stores';

    import { Back } from '$lib/components';
    import { Cover } from '$lib/layout';

    const project = $page.params.project;
</script>

<svelte:head>
    <title>Appwrite - Team</title>
</svelte:head>
<Cover>
    <svelte:fragment slot="breadcrumbs">
        <Back href={`${base}/console/${project}/users`}>Users</Back>
    </svelte:fragment>
    <svelte:fragment slot="title" />
</Cover>

<slot />
