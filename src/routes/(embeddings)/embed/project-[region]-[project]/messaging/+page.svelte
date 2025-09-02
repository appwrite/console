<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { Layout } from '@appwrite.io/pink-svelte';
    import View from '$routes/(console)/project-[region]-[project]/messaging/view.svelte';
    let { data } = $props();

    const createMessageUrl = (message) => `${base}/embed/project-${page.params.region}-${page.params.project}/messaging/message-${message.$id}`;
</script>

<Layout.Stack>
    <View
        messages={data.messages}
        limit={data.limit}
        offset={data.offset}
        search={data.search}
        {createMessageUrl}
    />
</Layout.Stack>
