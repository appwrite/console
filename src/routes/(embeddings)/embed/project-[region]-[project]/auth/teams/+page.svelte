<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { Layout } from '@appwrite.io/pink-svelte';
    import View from '$routes/(console)/project-[region]-[project]/auth/teams/view.svelte';
    let { data } = $props();

    const createTeamUrl = (team: Models.Team<Record<string, unknown>>) =>
        `${base}/embed/project-${page.params.region}-${page.params.project}/auth/teams/team-${team.$id}`;
</script>

<Layout.Stack>
    <View
        teams={data.teams}
        limit={data.limit}
        offset={data.offset}
        search={data.search}
        {createTeamUrl} />
</Layout.Stack>
