<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { func } from '../store';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime } from '@appwrite.io/console';
    import Scopes from '$routes/(console)/project-[region]-[project]/overview/api-keys/scopes.svelte';
    import { symmetricDifference } from '$lib/helpers/array';
    import { Link } from '$lib/elements';

    const functionId = page.params.function;
    let functionScopes: string[] = null;

    onMount(async () => {
        functionScopes ??= $func.scopes;
    });

    async function updateScopes() {
        try {
            if (!isValueOfStringEnum(Runtime, $func.runtime)) {
                throw new Error(`Invalid runtime: ${$func.runtime}`);
            }
            await sdk.forProject(page.params.region, page.params.project).functions.update({
                functionId,
                name: $func.name,
                runtime: $func.runtime,
                execute: $func.execute || undefined,
                events: $func.events || undefined,
                schedule: $func.schedule || undefined,
                timeout: $func.timeout || undefined,
                enabled: $func.enabled || undefined,
                logging: $func.logging || undefined,
                entrypoint: $func.entrypoint || undefined,
                commands: $func.commands || undefined,
                scopes: functionScopes,
                installationId: $func.installationId || undefined,
                providerRepositoryId: $func.providerRepositoryId || undefined,
                providerBranch: $func.providerBranch || undefined,
                providerSilentMode: $func.providerSilentMode || undefined,
                providerRootDirectory: $func.providerRootDirectory || undefined,
                specification: undefined
            });
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message: 'Function scopes have been updated'
            });
            trackEvent(Submit.FunctionUpdateScopes, {
                scopes: functionScopes
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionUpdateScopes);
        }
    }
</script>

<Form onSubmit={updateScopes}>
    <CardGrid>
        <svelte:fragment slot="title">Scopes</svelte:fragment>
        Select scopes to grant the dynamic key generated temporarily for your function. It is best practice
        to allow only necessary permissions.
        <Link href="https://appwrite.io/docs/advanced/platform/api-keys#scopes" external
            >Learn more</Link
        >.
        <svelte:fragment slot="aside">
            {#if functionScopes !== null}
                <Scopes bind:scopes={functionScopes} />
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                submit
                disabled={functionScopes &&
                    $func?.scopes &&
                    !symmetricDifference(functionScopes, $func?.scopes).length}>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
