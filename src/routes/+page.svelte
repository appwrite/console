<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';

    export let data;

    const { url } = $page;
    const { organizations, account } = data;
    if (organizations.total) {
        const teamId = account.prefs.organization ?? organizations.teams[0].$id;
        if (!teamId) {
            goto(`${base}/account/organizations${url.search}`);
        } else {
            goto(`${base}/organization-${teamId}${url.search}`);
        }
    } else {
        goto(`${base}/onboarding${url.search}`);
    }
</script>
