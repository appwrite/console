<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '$routes/(console)/project-[project]/store';
    import { provider } from './store';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization.$id}`,
            title: $organization.name
        },
        {
            href: `${base}/project-${$project.$id}`,
            title: $project.name
        },
        {
            href: `${base}/project-${$project.$id}/messaging`,
            title: 'Messaging'
        },
        {
            href: `${base}/project-${$project.$id}/messaging/providers/provider-${$provider?.$id}`,
            title: $provider?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
