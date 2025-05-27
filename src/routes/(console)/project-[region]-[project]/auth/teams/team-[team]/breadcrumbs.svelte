<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
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
            href: `${base}/project-${page.params.region}-${page.params.project}`,
            title: $project?.name
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/auth`,
            title: 'Auth'
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${$team?.$id}`,
            title: $team?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
