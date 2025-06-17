<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { team } from './store';
    import { getProjectRoute } from '$lib/helpers/project';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization?.$id}`,
            title: $organization?.name
        },
        {
            href: getProjectRoute(),
            title: $project?.name
        },
        {
            href: getProjectRoute('/auth'),
            title: 'Auth'
        },
        {
            href: getProjectRoute(`/auth/teams/team-${$team?.$id}`),
            title: $team?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
