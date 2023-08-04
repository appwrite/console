<script lang="ts">
    import Alert from '$lib/components/alert.svelte';
    import Collapsible from '$lib/components/collapsible.svelte';
    import CollapsibleItem from '$lib/components/collapsibleItem.svelte';
    import FormList from '$lib/elements/forms/formList.svelte';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import InputText from '$lib/elements/forms/inputText.svelte';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { template, templateConfig } from '../store';

    $: runtimeDetail =
        $templateConfig.runtime &&
        $template.runtimes.find((r) => r.name === $templateConfig.runtime);

    async function beforeSubmit() {
        if (!$templateConfig.runtime) {
            throw new Error('Please seelct a runtime.');
        }

        for (const variable of $template.variables) {
            if (!variable.required) {
                continue;
            }

            if (!$templateConfig.variables[variable.name]) {
                throw new Error(`Please set ${variable.name} variable.`);
            }
        }
    }

    async function loadRuntimes() {
        let runtimes = await sdk.forProject.functions.listRuntimes();
        const options = runtimes.runtimes
            .map((runtime) => ({
                label: `${runtime.name} - ${runtime.version}`,
                value: runtime.$id
            }))
            .filter((runtime) => {
                const allowedRuntimes = $template.runtimes.map((r) => r.name);
                return allowedRuntimes.includes(runtime.value);
            });

        return options;
    }
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">{$template.name}</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {$template.tagline}
    </svelte:fragment>
    <div class="u-flex u-flex-vertical u-gap-24">
        {#await loadRuntimes()}
            <div class="avatar is-size-x-small">
                <div class="loader u-margin-16" />
            </div>
        {:then options}
            <InputSelect
                label="Runtime"
                id="runtime"
                placeholder="Select runtime"
                bind:value={$templateConfig.runtime}
                {options}
                required />
        {/await}

        <div class="u-flex u-flex-vertical u-gap-16">
            <p class="text u-bold">Environment variables</p>
            {#if $template.variables.length <= 0}
                <p>No variables to configure.</p>
            {:else}
                <div class="u-flex u-flex-vertical u-gap-16">
                    {#each $template.variables as variable}
                        <div>
                            <InputText
                                id={variable.name}
                                label={variable.name}
                                placeholder={variable.placeholder ?? ''}
                                required={variable.required}
                                autocomplete={false}
                                bind:value={$templateConfig.variables[variable.name]} />
                            <div class="u-margin-block-start-4">
                                <Alert type="info" isInline={true}>
                                    {@html variable.description}
                                </Alert>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <Collapsible>
            <CollapsibleItem>
                <svelte:fragment slot="title">Additional settings</svelte:fragment>
                <FormList>
                    {#if $template.cron}
                        <InputText
                            disabled={true}
                            label="Cron schedule"
                            id="cron"
                            value={$template.cron} />
                    {/if}

                    {#if $template.permissions && $template.permissions.length > 0}
                        <InputText
                            disabled={true}
                            label="Execute access"
                            id="permissions"
                            value={$template.permissions.join(', ')} />
                    {/if}

                    {#if $template.events && $template.events.length > 0}
                        <InputText
                            disabled={true}
                            label="Events"
                            id="events"
                            value={$template.events.join(', ')} />
                    {/if}

                    {#if runtimeDetail && runtimeDetail.entrypoint}
                        <InputText
                            disabled={true}
                            label="Entrypoint"
                            id="entrypoint"
                            value={runtimeDetail.entrypoint} />
                    {/if}

                    {#if runtimeDetail && runtimeDetail.commands}
                        <InputText
                            disabled={true}
                            label="Commands"
                            id="commands"
                            value={runtimeDetail.commands} />
                    {/if}
                </FormList>
            </CollapsibleItem>
        </Collapsible>
    </div>
</WizardStep>
