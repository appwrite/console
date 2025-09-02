<script lang="ts" context="module">
    export let showCreateUser = writable(false);
</script>

<script lang="ts">
    import { writable } from 'svelte/store';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { Container } from '$lib/layout';
    import View from './view.svelte';

    export let data;
    
    const createUserUrl = (user: Models.User<{}>) => `${base}/project-${page.params.region}-${page.params.project}/auth/user-${user.$id}`;
</script>

<Container>
    <View
        users={{ total: data.users.total, users: data.users.users }}
        limit={data.limit}
        offset={data.offset}
        search={data.search}
        {createUserUrl}
    />
</Container>
