<script lang="ts">
    import UserMembershipsPage from '$routes/(console)/project-[region]-[project]/auth/user-[user]/memberships/+page.svelte';
    let { data } = $props();
</script>

<UserMembershipsPage data={data as any} />
