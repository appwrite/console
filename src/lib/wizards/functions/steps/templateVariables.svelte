<script lang="ts">
    import InputText from '$lib/elements/forms/inputText.svelte';
    import { WizardStep } from '$lib/layout';
    import { template, templateConfig } from '../store';
    import { FormList, Helper, InputChoice } from '$lib/elements/forms';

    async function beforeSubmit() {
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
        {#if $template?.variables?.length}
            <div class="u-flex u-flex-vertical u-gap-16">
                <p class="text u-bold">Environment variables</p>

                {#each $template.variables as variable}
                    {#if variable.name === 'APPWRITE_API_KEY'}
                        <div
                            class="box"
                            style:--box-padding="1rem"
                            style:--box-border-radius="var(--border-radius-small)">
                            <FormList>
                                <div>
                                    <InputText
                                        id={variable.name}
                                        label={variable.name}
                                        placeholder={variable.placeholder ?? ''}
                                        required={variable.required}
                                        autocomplete={false}
                                        bind:value={$templateConfig.appwriteApiKey} />
                                    <Helper type="neutral">
                                        This API key will allow you to interact with the Appwrite
                                        server APIs. <a
                                            href="http://#"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="link">Learn more</a
                                        >.
                                    </Helper>
                                </div>
                                <InputChoice id="generate" label="Generate API key on completion">
                                    The <code class="inline-code">APPWRITE_API_KEY</code> will be automatically
                                    generated for your project and applied to this function once it's
                                    created.
                                </InputChoice>
                            </FormList>
                        </div>
                    {/if}

                    <Helper type="neutral">
                        {@html variable.description}
                    </Helper>
                {/each}
            </div>
        {/if}
    </div>
</WizardStep>
