<script lang="ts">
    import { Alert, Box, EyebrowHeading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { deepMap } from '$lib/helpers/object';
    import type { WritableValue } from '$lib/helpers/types';
    import { type getSdkForProject } from '$lib/stores/sdk';

    import { onMount } from 'svelte';

    import {
        createMigrationFormStore,
        createMigrationProviderStore,
        isVersionAtLeast,
        providerResources,
        resourcesToMigrationForm
    } from '$lib/stores/migration';
    import { wizard } from '$lib/stores/wizard';
    import type { Models } from '@appwrite.io/console';

    export let formData: ReturnType<typeof createMigrationFormStore>;
    export let provider: ReturnType<typeof createMigrationProviderStore>;
    export let projectSdk: ReturnType<typeof getSdkForProject>;

    type ValueOf<T> = T[keyof T];
    type FormData = WritableValue<typeof formData>;
    // TL;DR of this type: It gets a object with two levels (in this case FormData)
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

    $: resources = providerResources[$provider.provider];
    $: wizard.setNextDisabled(!report);
</script>

<Box radius="s">
    <div class="u-flex u-flex-vertical u-gap-16">
        <EyebrowHeading class="eyebrow" tag="h3" size={3}>Good to know</EyebrowHeading>
        <div class="u-flex u-gap-16">
            <div class="circled">
                <i class="icon-cog" />
            </div>
            <div>
                <p class="u-bold">Project settings are not imported</p>
                <p>You will need to set service and project settings manually</p>
            </div>
        </div>
        <div class="u-flex u-gap-16">
            <div class="circled">
                <i class="icon-trending-up" />
            </div>
            <div>
                <p class="u-bold">Keep your organization plan's limits in mind</p>
                <p>
                    Make sure to have enough storage in your organization plan when importing files.
                </p>
            </div>
        </div>
        {#if $provider.provider === 'firebase'}
            <div class="u-flex u-gap-16">
                <div class="circled">
                    <i class="icon-exclamation u-color-text-warning" />
                </div>
                <div>
                    <p class="u-bold">Possible charges by Firebase</p>
                    <p>
                        Appwrite does not impose charges for importing data, but please note that
                        Firebase may have its own pricing for this service
                    </p>
                </div>
            </div>
        {:else}
            <div class="u-flex u-gap-16">
                <div class="circled">
                    <i class="icon-currency-dollar" />
                </div>
                <div>
                    <p class="u-bold">Transfer is free of charge</p>
                    <p>You won't be charged for Appwrite bandwidth usage for importing data</p>
                </div>
            </div>
        {/if}
    </div>
</Box>

{#if report && !isVersionAtLeast(version, '1.4.0') && $provider.provider === 'appwrite'}
    <div class="u-margin-block-start-24">
        <Alert
            type="warning"
            isStandalone
            buttons={[
                {
                    slot: 'Learn more',
                    onClick() {
                        wizard.updateStep((p) => p - 1);
                    }
                }
            ]}>
            <svelte:fragment slot="title">Functions not available for import</svelte:fragment>
            To migrate your functions, update the version of the Appwrite instance you're importing from
            to a version newer than 1.4
        </Alert>
    </div>
{/if}

{#if error}
    <div class="u-margin-block-start-24">
        <Alert
            type="error"
            isStandalone
            buttons={[
                {
                    slot: 'Edit credentials',
                    onClick() {
                        wizard.updateStep((p) => p - 1);
                    }
                }
            ]}>
            <svelte:fragment slot="title">Request failed</svelte:fragment>
            Please check if your credentials are filled in correctly in the previous step
        </Alert>
    </div>
{/if}

<ul class="buttons-list u-margin-block-start-32 u-main-end">
    <li class="buttons-list-item">
        <Button text on:click={deselectAll}>Deselect all</Button>
    </li>

    <li class="buttons-list-item">
        <Button text on:click={selectAll}>Select all</Button>
    </li>
</ul>

<ul class="u-flex u-flex-vertical u-margin-block-start-16">
    {#if resources?.includes('user')}
        <li class="checkbox-field">
            <input
                type="checkbox"
                bind:checked={$formData.users.root}
                on:change={handleInputChange('users.root')} />
            <div class="u-flex u-gap-4 u-cross-center">
                <span class="u-bold">Users</span>

                {#if $provider.provider !== 'firebase'}
                    {#if report?.user !== undefined}
                        <span class="inline-tag">{report.user}</span>
                    {:else if !error}
                        <span class="loader is-small u-margin-inline-start-4" />
                    {/if}
                {/if}
            </div>
            <div />
            <span>Import all users</span>

            {#if resources?.includes('team')}
                <ul>
                    <li class="checkbox-field">
                        <input
                            type="checkbox"
                            bind:checked={$formData.users.teams}
                            on:change={handleInputChange('users.teams')} />
                        <div class="u-flex u-gap-4 u-cross-center">
                            <span class="u-bold">Include teams</span>
                            {#if $provider.provider === 'firebase'}
                                {#if report?.team !== undefined}
                                    <span class="inline-tag">{report.team}</span>
                                {:else if !error}
                                    <span class="loader is-small u-margin-inline-start-4" />
                                {/if}
                            {/if}
                        </div>
                        <div />
                        <span>Import all teams and the team memberships of your users</span>
                    </li>
                </ul>
            {/if}
        </li>
    {/if}

    {#if resources?.includes('database')}
        <li class="checkbox-field">
            <input
                type="checkbox"
                bind:checked={$formData.databases.root}
                on:change={handleInputChange('databases.root')} />
            <div class="u-flex u-gap-4 u-cross-center">
                <span class="u-bold">Databases</span>
                {#if $provider.provider !== 'firebase'}
                    {#if report?.database !== undefined}
                        <span class="inline-tag">{report.database}</span>
                    {:else if !error}
                        <span class="loader is-small u-margin-inline-start-4" />
                    {/if}
                {/if}
            </div>
            <div />
            <span>Import all databases, including collections, indexes and attributes</span>

            {#if resources?.includes('document')}
                <ul>
                    <li class="checkbox-field">
                        <input
                            type="checkbox"
                            bind:checked={$formData.databases.documents}
                            on:change={handleInputChange('databases.documents')} />
                        <div class="u-flex u-gap-4 u-cross-center">
                            <span class="u-bold">Include documents</span>
                            {#if $provider.provider !== 'firebase'}
                                {#if report?.document !== undefined}
                                    <span class="inline-tag">{report.document}</span>
                                {:else if !error}
                                    <span class="loader is-small u-margin-inline-start-4" />
                                {/if}
                            {/if}
                        </div>
                        <div />
                        <span>Import all of your documents</span>
                    </li>
                </ul>
            {/if}
        </li>
    {/if}

    {#if resources?.includes('function') && isVersionAtLeast(version, '1.4.0')}
        <li class="checkbox-field">
            <input
                type="checkbox"
                bind:checked={$formData.functions.root}
                on:change={handleInputChange('functions.root')} />
            <div class="u-flex u-gap-4 u-cross-center">
                <span class="u-bold">Functions</span>
                {#if $provider.provider !== 'firebase'}
                    {#if report?.function !== undefined}
                        <span class="inline-tag">{report.function}</span>
                    {:else if !error}
                        <span class="loader is-small u-margin-inline-start-4" />
                    {/if}
                {/if}
            </div>
            <div />
            <span>Import all functions and their active deployment</span>
            <ul>
                {#if resources?.includes('environment-variable')}
                    <li class="checkbox-field">
                        <input
                            type="checkbox"
                            bind:checked={$formData.functions.env}
                            on:change={handleInputChange('functions.env')} />
                        <div class="u-flex u-gap-4">
                            <span class="u-bold">Include environment variables</span>
                        </div>
                        <div />
                        <span>Import all environment variables</span>
                    </li>
                {/if}
                {#if resources?.includes('deployment')}
                    <li class="checkbox-field">
                        <input
                            type="checkbox"
                            bind:checked={$formData.functions.inactive}
                            on:change={handleInputChange('functions.inactive')} />
                        <div class="u-flex u-gap-4">
                            <span class="u-bold">Include inactive deployments</span>
                        </div>
                        <div />
                        <span>Import all deployments that are not currently active</span>
                    </li>
                {/if}
            </ul>
        </li>
    {/if}

    {#if resources?.includes('bucket') && resources?.includes('file')}
        <li class="checkbox-field">
            <input
                type="checkbox"
                bind:checked={$formData.storage.root}
                on:change={handleInputChange('storage.root')} />
            <div class="u-flex u-gap-4 u-cross-center">
                <span class="u-bold">Storage</span>
                {#if $provider.provider !== 'firebase'}
                    {#if report?.size !== undefined}
                        <span class="inline-tag">{`${report.size.toFixed(2)}MB`}</span>
                    {:else if !error}
                        <span class="loader is-small u-margin-inline-start-4" />
                    {/if}
                {/if}
            </div>
            <div />

            <p>
                Import all buckets
                {#if $provider.provider !== 'firebase' && report?.bucket}
                    <span class="inline-tag">{report.bucket}</span>
                {/if}
                and files
                {#if $provider.provider !== 'firebase' && report?.file}
                    <span class="inline-tag">{report.file}</span>
                {/if}
            </p>
        </li>
    {/if}
</ul>

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
