<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import View from '$routes/(console)/project-[region]-[project]/auth/templates/view.svelte';
    let { data } = $props();
</script>

<Layout.Stack>
    <View project={data.project} />
</Layout.Stack>
