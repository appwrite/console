<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { team } from './store';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization?.$id}`,
            title: $organization?.name
        },
        {
            href: `${base}/project-${$project.$id}`,
            title: $project?.name
        },
        {
            href: `${base}/project-${$project?.$id}/auth`,
            title: 'Auth'
        },
        {
            href: `${base}/project-${$project?.$id}/auth/teams/team-${$team?.$id}`,
            title: $team?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
