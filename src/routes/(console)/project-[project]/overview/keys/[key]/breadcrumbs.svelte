<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { key } from './store';

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
            href: `${base}/project-${$project?.$id}/overview/keys`,
            title: 'API keys'
        },
        {
            href: `${base}/project-${$project?.$id}/overview/keys/${$key?.$id}`,
            title: $key?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
