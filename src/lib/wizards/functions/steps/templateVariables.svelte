<script lang="ts">
    import { page } from '$app/stores';
    import Alert from '$lib/components/alert.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import InputText from '$lib/elements/forms/inputText.svelte';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { template, templateConfig } from '../store';
    import { scopes } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';

    let generatingApiKey = false;
    let showApiKeyCheck = false;

    async function generateApiKey() {
        if (generatingApiKey) {
            return;
        }

        generatingApiKey = true;

        try {
            const key = await await sdk.forConsole.projects.createKey(
                $page.params.project,
                'Generated for Template',
                scopes.map((scope) => scope.scope)
            );
            $templateConfig.variables['APPWRITE_API_KEY'] = key.secret;
            showApiKeyCheck = true;

            addNotification({
                type: 'success',
                message: 'Key generated successfully.'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            generatingApiKey = false;
        }
    }

    async function beforeSubmit() {
        if (!$templateConfig.runtime) {
            throw new Error('Please select a runtime.');
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
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Environment variables</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Edit the values of the environment variables that will be passed to your function at
        runtime.
    </svelte:fragment>
    <div class="u-flex u-flex-vertical u-gap-24">
        {#if $template.variables.length > 0}
            <div class="u-flex u-flex-vertical u-gap-16">
                <p class="text u-bold">Environment variables</p>

                <div class="u-flex u-flex-vertical u-gap-16">
                    {#each $template.variables as variable}
                        <div>
                            {#if variable.name === 'APPWRITE_API_KEY'}
                                <Alert type="info">
                                    <svelte:fragment slot="title">API key creation</svelte:fragment>
                                    <p class="text">
                                        By clicking generate button, an API key will be
                                        automatically generated in the background, and filled into
                                        input field. This API key will be granted all scopes and
                                        will never expire.
                                    </p>
                                </Alert>
                            {/if}
                            <div class="u-margin-block-start-12 u-flex u-gap-8 u-cross-end">
                                <div class="u-width-full-line">
                                    <InputText
                                        id={variable.name}
                                        label={variable.name}
                                        placeholder={variable.placeholder ?? ''}
                                        required={variable.required}
                                        autocomplete={false}
                                        bind:value={$templateConfig.variables[variable.name]} />
                                </div>

                                {#if variable.name === 'APPWRITE_API_KEY'}
                                    <Button
                                        disabled={$templateConfig.variables[variable.name]
                                            ? true
                                            : false}
                                        secondary
                                        on:click={generateApiKey}>
                                        {#if showApiKeyCheck && ($templateConfig.variables[variable.name] ? true : false)}
                                            <span class="icon-check" aria-hidden="true" />
                                        {/if}

                                        {#if generatingApiKey}
                                            <span class="loader is-small" />
                                        {:else if showApiKeyCheck && ($templateConfig.variables[variable.name] ? true : false)}
                                            <span class="text">Generated</span>
                                        {:else}
                                            <span class="text">Generate</span>
                                        {/if}
                                    </Button>
                                {/if}
                            </div>
                            <div class="u-margin-block-start-4">
                                <p class="helper">
                                    <span class="icon-info" aria-hidden="true" />
                                    <span class="text">{@html variable.description}</span>
                                </p>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</WizardStep>
