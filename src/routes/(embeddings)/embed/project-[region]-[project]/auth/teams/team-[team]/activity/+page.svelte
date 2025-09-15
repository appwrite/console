<script lang="ts">
    import TeamActivityPage from '$routes/(console)/project-[region]-[project]/auth/teams/team-[team]/activity/+page.svelte';
    let { data } = $props();
</script>

<TeamActivityPage data={data as any} />
