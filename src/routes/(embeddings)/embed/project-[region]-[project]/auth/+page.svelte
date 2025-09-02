<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { Layout } from '@appwrite.io/pink-svelte';
    import View from '$routes/(console)/project-[region]-[project]/auth/view.svelte';
    let { data } = $props();

    const createUserUrl = (user: Models.User<{}>) => `${base}/embed/project-${page.params.region}-${page.params.project}/auth/user-${user.$id}`;
</script>

<Layout.Stack>
    <View
        users={data.users}
        limit={data.limit}
        offset={data.offset}
        search={data.search}
        {createUserUrl}
    />
</Layout.Stack>
