<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import View from '$routes/(console)/project-[region]-[project]/messaging/view.svelte';
    export let data;

    const clearSearchHref = `${base}/embed/project-${page.params.region}-${page.params.project}/messaging`;
    const getMessageUrl = (m: any) => `${base}/embed/project-${page.params.region}-${page.params.project}/messaging/message-${m.$id}`;
</script>

<View
    messages={data.messages}
    limit={data.limit}
    offset={data.offset}
    view={data.view}
    search={data.search}
    query={data.query}
    pageNum={data.page}
    {clearSearchHref}
    {getMessageUrl}
/>
