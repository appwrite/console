<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../store';
    import { user } from './store';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization?.$id}`,
            title: $organization?.name
        },
        {
            href: `${base}/project-${$project?.$id}`,
            title: $project?.name
        },
        {
            href: `${base}/project-${$project?.$id}/auth`,
            title: 'Auth'
        },
        {
            href: `${base}/project-${$project?.$id}/auth/user-${$user?.$id}`,
            title: $user?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
