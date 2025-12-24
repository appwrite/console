<script lang="ts">
    import { Box, CardGrid } from '$lib/components';
    import Link from '$lib/elements/link.svelte';
</script>

<CardGrid>
    <svelte:fragment slot="title">Installations</svelte:fragment>
    Manage applications installed for your organizations, their access and permissions. <Link
        href="https://appwrite.io/docs/apps"
        external>
        Learn more.
    </Link>
    <svelte:fragment slot="aside">
        <Box>
            <h6>
                <b>Coming soon</b>
            </h6>
            <p class="text u-margin-block-start-8">
                This feature is currently in testing phase and will be available for public soon.
            </p>
        </Box>
    </svelte:fragment>
</CardGrid>
