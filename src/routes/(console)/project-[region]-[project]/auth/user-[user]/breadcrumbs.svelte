<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../store';
    import { user } from './store';
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
            href: getProjectRoute(`/auth/user-${$user?.$id}`),
            title: $user?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
