<script lang="ts">
    import { deepMap } from '$lib/helpers/object';
    import { Alert, Divider, Layout } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import {
        createMigrationFormStore,
        createMigrationProviderStore,
        isVersionAtLeast,
        type MigrationFormData,
        providerResources,
        resourcesToMigrationForm
    } from '$lib/stores/migration';
    import { Button } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';
    import type { Models } from '@appwrite.io/console';
    import type { sdk } from '$lib/stores/sdk';
    import ImportReport from '$routes/(console)/project-[region]-[project]/settings/migrations/(import)/importReport.svelte';

    export let errorInResources: boolean | undefined = undefined;
    export let formData: ReturnType<typeof createMigrationFormStore>;
    export let provider: ReturnType<typeof createMigrationProviderStore>;
    export let projectSdk: ReturnType<typeof sdk.forProject>;

    export let migrationType: 'cloud' | 'provider' = 'provider';

    function deselectAll() {
        $formData = deepMap($formData, (v) => {
            if (typeof v === 'boolean') {
                return false;
            }
            return v;
        });
    }

    function selectAll() {
        $formData = resourcesToMigrationForm(resources, version);
    }

    $: version = report?.version || '0.0.0';

    let error = false;
    let isOpen = false;
    let report: Models.MigrationReport;

    onMount(async () => {
        isOpen = true;
        deselectAll();
        try {
            switch ($provider.provider) {
                case 'appwrite':
                    report = await projectSdk.migrations.getAppwriteReport(
                        providerResources.appwrite,
                        $provider.endpoint,
                        $provider.projectID,
                        $provider.apiKey
                    );
                    break;
                case 'supabase':
                    report = await projectSdk.migrations.getSupabaseReport(
                        providerResources.supabase,
                        $provider.endpoint,
                        $provider.apiKey,
                        $provider.host,
                        $provider.username,
                        $provider.password,
                        $provider.port
                    );
                    break;
                case 'firebase':
                    report = await projectSdk.migrations.getFirebaseReport(
                        providerResources.firebase,
                        $provider.serviceAccount
                    );
                    break;
                case 'nhost':
                    report = await projectSdk.migrations.getNHostReport(
                        providerResources.nhost,
                        $provider.subdomain,
                        $provider.region,
                        $provider.adminSecret,
                        $provider.database || $provider.subdomain,
                        $provider.username || 'postgres',
                        $provider.password
                    );
            }
        } catch (e) {
            if (!isOpen) return;
            error = true;
        }

        isOpen = false;
    });

    $: errorInResources = error;
    $: wizard.setNextDisabled(!report);
    $: resources = providerResources[$provider.provider];

    const shouldRenderGroup = (groupKey: string): boolean => {
        if (groupKey === 'functions') {
            return resources.includes('function') && isVersionAtLeast(version, '1.4.0');
        }

        if (groupKey === 'storage') {
            return resources.includes('bucket') && resources.includes('file');
        }

        return resources.includes(groupKey.slice(0, -1));
    };

    // no typecasting in svelte context!
    function getAsType(groupKey: string) {
        return groupKey as keyof MigrationFormData;
    }

    const getReportKey = (groupKey: string) => {
        const map: Record<string, string> = {
            users: 'user',
            databases: 'database',
            functions: 'function',
            storage: 'bucket'
        };
        return map[groupKey] || groupKey;
    };
</script>

<Layout.Stack gap="l">
    {#if report && !isVersionAtLeast(version, '1.4.0') && $provider.provider === 'appwrite'}
        <Alert.Inline status="warning">
            <svelte:fragment slot="title">Functions not available for import</svelte:fragment>
            To migrate your functions, update the version of the Appwrite instance you're importing from
            to a version newer than 1.4
        </Alert.Inline>
    {/if}

    {#if error}
        <Alert.Inline status="error" title="Couldn’t load resources">
            {#if migrationType === 'provider'}
                Please double-check your credentials from the previous step and try again.
            {:else}
                The API key required for the migration may no longer be valid or has expired, please
                verify and start migration again.
            {/if}
        </Alert.Inline>
    {:else}
        <Layout.Stack gap="l">
            <Layout.Stack direction="row">
                <Button
                    compact
                    on:click={(event) => {
                        event.preventDefault();
                        deselectAll();
                    }}>Deselect all</Button>

                <Button
                    compact
                    on:click={(event) => {
                        event.preventDefault();
                        selectAll();
                    }}>Select all</Button>
            </Layout.Stack>
            <Divider />
        </Layout.Stack>

        {#each Object.entries($formData) as [groupKey, formGroup]}
            {#if shouldRenderGroup(groupKey)}
                <ImportReport
                    {error}
                    {formGroup}
                    groupKey={getAsType(groupKey)}
                    reportValue={report?.[getReportKey(groupKey)]} />
            {/if}
        {/each}
    {/if}
</Layout.Stack>
