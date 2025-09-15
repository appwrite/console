<script lang="ts">
    import UserSessionsPage from '$routes/(console)/project-[region]-[project]/auth/user-[user]/sessions/+page.svelte';
    let { data } = $props();
</script>

<UserSessionsPage data={data as any} />
