<script lang="ts">
    import UserActivityPage from '$routes/(console)/project-[region]-[project]/auth/user-[user]/activity/+page.svelte';
    let { data } = $props();
</script>

<UserActivityPage data={data as any} />
