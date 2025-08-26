<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { webhook } from './store';
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
            href: getProjectRoute('/settings/webhooks'),
            title: 'Settings'
        },
        {
            href: getProjectRoute(`/settings/webhooks/webhook/${$webhook?.$id}`),
            title: $webhook?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
