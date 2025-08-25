<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../store';
    import { message } from './store';
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
            title:
                $message.data.title ?? $message.data.subject ?? $message.data.content ?? 'Message'
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
