<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '$routes/(console)/project-[region]-[project]/store';
    import { provider } from './store';
    import { getProjectRoute } from '$lib/helpers/project';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization.$id}`,
            title: $organization.name
        },
        {
            href: getProjectRoute(),
            title: $project.name
        },
        {
            href: getProjectRoute('/messaging'),
            title: 'Messaging'
        },
        {
            href: getProjectRoute(`/messaging/providers/provider-${$provider?.$id}`),
            title: $provider?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
