<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Container } from '$lib/layout';
    import View from './view.svelte';
    export let data;
    
    import type { Models } from '@appwrite.io/console';
    
    const createMessageUrl = (message: Models.Message) => `${base}/project-${page.params.region}-${page.params.project}/messaging/message-${message.$id}`;
</script>

<Container>
    <View messages={data.messages} limit={data.limit} offset={data.offset} search={data.search} {createMessageUrl} />
</Container>
