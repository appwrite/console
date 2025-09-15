<script lang="ts">
    import UserIdentitiesPage from '$routes/(console)/project-[region]-[project]/auth/user-[user]/identities/+page.svelte';
    let { data } = $props();
</script>

<UserIdentitiesPage data={data as any} />
