<script lang="ts">
    import { page } from '$app/state';
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization?.$id}`,
            title: $organization?.name
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}`,
            title: page.data?.project?.name
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/auth`,
            title: 'Auth'
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
