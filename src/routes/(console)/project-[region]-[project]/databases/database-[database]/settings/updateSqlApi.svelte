<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import {
        Button,
        Form,
        InputSwitch,
        InputNumber,
        InputCheckbox
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { DedicatedDatabase } from '$lib/sdk/dedicatedDatabases';

    let {
        database
    }: {
        database: DedicatedDatabase;
    } = $props();

    const allStatements = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'EXPLAIN'] as const;

    let sqlApiEnabled: boolean = $state(database.sqlApiEnabled);
    let maxBytes: number = $state(database.sqlApiMaxBytes);
    let maxRows: number = $state(database.sqlApiMaxRows);
    let timeout: number = $state(database.sqlApiTimeoutSeconds);
    let allowedStatements: string[] = $state([...(database.sqlApiAllowedStatements ?? [])]);

    let initialEnabled = $state(database.sqlApiEnabled);
    let initialMaxBytes = $state(database.sqlApiMaxBytes);
    let initialMaxRows = $state(database.sqlApiMaxRows);
    let initialTimeout = $state(database.sqlApiTimeoutSeconds);
    let initialAllowedStatements = $state([...(database.sqlApiAllowedStatements ?? [])]);

    function isStatementAllowed(statement: string): boolean {
        return allowedStatements.includes(statement);
    }

    function toggleStatement(statement: string) {
        if (allowedStatements.includes(statement)) {
            allowedStatements = allowedStatements.filter((s) => s !== statement);
        } else {
            allowedStatements = [...allowedStatements, statement];
        }
    }

    const hasChanges = $derived(
        sqlApiEnabled !== initialEnabled ||
            maxBytes !== initialMaxBytes ||
            maxRows !== initialMaxRows ||
            timeout !== initialTimeout ||
            JSON.stringify([...allowedStatements].sort()) !==
                JSON.stringify([...initialAllowedStatements].sort())
    );

    async function updateSqlApi() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.update(database.$id, {
                    sqlApiEnabled,
                    sqlApiMaxBytes: maxBytes,
                    sqlApiMaxRows: maxRows,
                    sqlApiTimeoutSeconds: timeout,
                    sqlApiAllowedStatements: allowedStatements
                });

            initialEnabled = sqlApiEnabled;
            initialMaxBytes = maxBytes;
            initialMaxRows = maxRows;
            initialTimeout = timeout;
            initialAllowedStatements = [...allowedStatements];

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'SQL API settings have been updated',
                type: 'success'
            });

            trackEvent(Submit.DatabaseUpdateSqlApi);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseUpdateSqlApi);
        }
    }
</script>

<Form onSubmit={updateSqlApi}>
    <CardGrid>
        <svelte:fragment slot="title">SQL API</svelte:fragment>
        The SQL API allows direct SQL query execution against your database through the Appwrite
        API. Configure which statements are permitted and set resource limits.
        <svelte:fragment slot="aside">
            <ul>
                <InputSwitch
                    id="sqlApiEnabled"
                    label="Enable SQL API"
                    bind:value={sqlApiEnabled} />
                {#if sqlApiEnabled}
                    <InputNumber
                        id="maxBytes"
                        label="Max response bytes"
                        min={1024}
                        max={104857600}
                        bind:value={maxBytes}
                        required />
                    <InputNumber
                        id="maxRows"
                        label="Max rows"
                        min={1}
                        max={100000}
                        bind:value={maxRows}
                        required />
                    <InputNumber
                        id="timeout"
                        label="Timeout (seconds)"
                        min={1}
                        max={300}
                        bind:value={timeout}
                        required />
                    <li class="u-margin-block-start-16">
                        <label class="label u-margin-block-end-8">Allowed statements</label>
                        {#each allStatements as statement}
                            <InputCheckbox
                                id="stmt_{statement}"
                                label={statement}
                                checked={isStatementAllowed(statement)}
                                on:change={() => toggleStatement(statement)} />
                        {/each}
                    </li>
                {/if}
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!hasChanges} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
