<script lang="ts">
    import { deepMap } from '$lib/helpers/object';
    import type { WritableValue } from '$lib/helpers/types';
    import { type getSdkForProject } from '$lib/stores/sdk';
    import { Alert, Divider, Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import {
        createMigrationFormStore,
        createMigrationProviderStore,
        isVersionAtLeast,
        providerResources,
        resourcesToMigrationForm
    } from '$lib/stores/migration';
    import { Button } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';
    import type { Models } from '@appwrite.io/console';
    import ImportReport from '$routes/(console)/project-[project]/settings/migrations/(import)/importReport.svelte';

    export let errorInResources: boolean;
    export let formData: ReturnType<typeof createMigrationFormStore>;
    export let provider: ReturnType<typeof createMigrationProviderStore>;
    export let projectSdk: ReturnType<typeof getSdkForProject>;

    type ValueOf<T> = T[keyof T];
    type FormData = WritableValue<typeof formData>;
    // TL;DR of this type: It gets an object with two levels (in this case FormData)
    // And returns a join of the keys with a dot between them.
    // e.g. If FormData was { users: { root: boolean, teams: boolean } }
    // The type would be 'users.root' | 'users.teams'
    type FormKeys = ValueOf<{
        [K in keyof FormData]: ValueOf<{
            [L in keyof FormData[K]]: L extends string ? `${K}.${L}` : never;
        }>;
    }>;

    /**
     *
     * @param field {string} The field to update.
     * Represents the path to the field in the formData object e.g. 'users.root'
     */
    function handleInputChange(field: FormKeys) {
        return (event: Event) => {
            const checked = (event.target as HTMLInputElement).checked;
            // For each entry in formData, if the root is changed, change all children to the same value
            // otherwise, if a child is changed to true, change the root to true

            const [parent, child] = field.split('.');
            if (child === 'root') {
                formData.update((data) => {
                    data[parent].root = checked;
                    for (const key in data[parent]) {
                        if (key !== 'root') {
                            data[parent][key] = checked;
                        }
                    }
                    return data;
                });
            } else if (checked) {
                formData.update((data) => {
                    data[parent].root = checked;
                    return data;
                });
            }
        };
    }

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

    let report: Models.MigrationReport;
    $: version = report?.version || '0.0.0';

    let isOpen = false;

    let error = false;
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
        <Alert.Inline status="error" title="Request failed">
            Please check if your credentials are filled in correctly in the previous step
        </Alert.Inline>
    {/if}

    <!--TODO: FIX UI -->
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

    {#if resources?.includes('user')}
        <Layout.Stack>
            <ImportReport
                label="Users"
                checked={$formData.users.root}
                handleChange={handleInputChange('users.root')}
                description="Import all users"
                reportValue={report?.user}
                isLoading={!error} />

            <!-- TODO: no padding, change a component instead -->
            <div style:padding-left="2rem">
                <ImportReport
                    label="Include teams"
                    checked={$formData.users.teams}
                    handleChange={handleInputChange('users.teams')}
                    description="Import all teams and the team memberships of your users" />
            </div>
        </Layout.Stack>
    {/if}

    {#if resources?.includes('database')}
        <Layout.Stack>
            <ImportReport
                label="Databases"
                checked={$formData.databases.root}
                handleChange={handleInputChange('databases.root')}
                description="Import all databases, including collections, indexes and attributes"
                reportValue={report?.database}
                isLoading={!error} />

            <div style:padding-left="2rem">
                <ImportReport
                    label="Include documents"
                    checked={$formData.databases.documents}
                    handleChange={handleInputChange('databases.documents')}
                    description="Import all functions and their active deployment"
                    reportValue={report?.document}
                    isLoading={!error} />
            </div>
        </Layout.Stack>
    {/if}

    {#if resources?.includes('function') && isVersionAtLeast(version, '1.4.0')}
        <Layout.Stack>
            <ImportReport
                label="Functions"
                checked={$formData.functions.root}
                handleChange={handleInputChange('functions.root')}
                description="Import all functions and their active deployment"
                reportValue={report?.function}
                isLoading={!error} />

            {#if resources?.includes('environment-variable') || resources?.includes('deployment')}
                <div style:padding-left="2rem">
                    <Layout.Stack gap="s">
                        {#if resources?.includes('environment-variable')}
                            <ImportReport
                                label="Include environment variables"
                                checked={$formData.functions.env}
                                description="Import all environment variables"
                                handleChange={handleInputChange('functions.env')} />
                        {/if}

                        {#if resources?.includes('deployment')}
                            <ImportReport
                                label="Include inactive deployments"
                                checked={$formData.functions.inactive}
                                handleChange={handleInputChange('functions.inactive')}
                                description="Import all deployments that are not currently active" />
                        {/if}
                    </Layout.Stack>
                </div>
            {/if}
        </Layout.Stack>
    {/if}

    {#if resources?.includes('bucket') && resources?.includes('file')}
        {@const storageSize = report?.size >= 0 ? `${report?.size.toFixed(2)}MB` : undefined}
        <Layout.Stack gap="none">
            <ImportReport
                label="Storage"
                checked={$formData.storage.root}
                handleChange={handleInputChange('storage.root')}
                reportValue={storageSize}
                isLoading={!error} />

            <div style:padding-left="2rem">
                <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                    Import all buckets
                    {#if $provider.provider !== 'firebase' && report?.bucket}
                        <Tag size="xs" selected>{report.bucket}</Tag>
                    {/if}
                    and files
                    {#if $provider.provider !== 'firebase' && report?.file}
                        <Tag size="xs" selected>{report.file}</Tag>
                    {/if}
                </Typography.Text>
            </div>
        </Layout.Stack>
    {/if}
</Layout.Stack>

<!-- svelte-ignore css-unused-selector -->
<style lang="scss">
    .box :global(.eyebrow) {
        font-weight: 500;
        color: hsl(var(--color-neutral-70));
    }

    .circled {
        width: 1.5rem;
        height: 1.5rem;
        flex-shrink: 0;
        border-radius: 100%;
        border: 1px solid hsl(var(--border));
        position: relative;

        i {
            position: absolute;
            left: 50%;
            top: 50%;
            translate: -50% -50%;
            font-size: 1rem;
        }
    }

    .buttons-list {
        border-block-end: 1px solid hsl(var(--border));
        padding-block-end: 0.625rem;
    }

    .checkbox-field {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.25rem 1rem;
        align-items: center;
        padding-block-end: 1rem;

        ul {
            grid-column-start: 2;

            li {
                margin-block-start: 1rem;
            }
        }
    }
</style>
