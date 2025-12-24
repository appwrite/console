<script lang="ts">
    import { CardGrid } from '$lib/components';
    import Link from '$lib/elements/link.svelte';
    import type { Models } from '@appwrite.io/console';
    import Table from '../../project-[region]-[project]/overview/(components)/table.svelte';

    export let keys: Models.KeyList;
</script>

<CardGrid>
    <svelte:fragment slot="title">Organization keys</svelte:fragment>
    API keys to perform actions on your organization using Platform API and SDK. <Link
        href="https://appwrite.io/docs/platform"
        external>
        Learn more.
    </Link>
    <svelte:fragment slot="aside">
        <Table keyType="organization" showCreateButton={true} {keys} />
    </svelte:fragment>
</CardGrid>
