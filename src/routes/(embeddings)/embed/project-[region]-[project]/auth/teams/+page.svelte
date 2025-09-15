<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import View from '$routes/(console)/project-[region]-[project]/auth/teams/view.svelte';
    import Container from '$lib/layout/container.svelte';
    let { data } = $props();

    const createTeamUrl = (team: Models.Team<Record<string, unknown>>) =>
        `${base}/embed/project-${page.params.region}-${page.params.project}/auth/teams/team-${team.$id}`;
</script>

<Container>
    <View
        teams={data.teams}
        limit={data.limit}
        offset={data.offset}
        search={data.search}
        {createTeamUrl} />
</Container>
