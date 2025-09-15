<script lang="ts">
    import TeamMembersPage from '$routes/(console)/project-[region]-[project]/auth/teams/team-[team]/members/+page.svelte';
    let { data } = $props();
</script>

<TeamMembersPage data={data as any} />
