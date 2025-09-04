<script lang="ts" context="module">
    import { writable } from 'svelte/store';
    export let showCreateTeam = writable(false);
</script>

<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { Container } from '$lib/layout';
    import View from './view.svelte';
    export let data;

    const createTeamUrl = (team: Models.Team<Record<string, unknown>>) =>
        `${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${team.$id}`;
</script>

<Container>
    <View
        teams={{ total: data.teams.total, teams: data.teams.teams }}
        limit={data.limit}
        offset={data.offset}
        search={data.search}
        {createTeamUrl} />
</Container>
