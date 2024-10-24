<script lang="ts">
    import { Collapsible, CollapsibleItem } from '$lib/components';
    import {
        Button,
        InputEmail,
        InputNumber,
        InputPassword,
        InputPhone,
        InputSelect,
        InputText,
        InputURL
    } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { Fieldset, Layout, Tag, Popover, Icon } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import type { SvelteComponent } from 'svelte';

    const FRAMEWORKS_AVAILABLE = [
        {
            id: 'react',
            name: 'React',
            installCommand: 'npm install react react-dom',
            buildCommand: 'npm run build',
            outputDirectory: 'build'
        },
        {
            id: 'vue',
            name: 'Vue',
            installCommand: 'npm install vue',
            buildCommand: 'npm run build',
            outputDirectory: 'dist'
        },
        {
            id: 'svelte',
            name: 'Svelte',
            installCommand: 'npm install svelte',
            buildCommand: 'npm run build',
            outputDirectory: 'public'
        },
        {
            id: 'next',
            name: 'Next.js',
            installCommand: 'npm install next react react-dom',
            buildCommand: 'npm run build',
            outputDirectory: 'out'
        },
        {
            id: 'nuxt',
            name: 'Nuxt.js',
            installCommand: 'npm install nuxt',
            buildCommand: 'npm run build',
            outputDirectory: 'dist'
        }
    ];

    export let source: 'custom' | 'template' = 'custom';
    export let framework = FRAMEWORKS_AVAILABLE[0].id;
    export let variables = [];
    export let templateVariables: Models.TemplateVariable[];

    let { requiredVariables, optionalVariables } = templateVariables.reduce(
        (acc, variable) => {
            if (variable.required) {
                acc.requiredVariables.push(variable);
            } else {
                acc.optionalVariables.push(variable);
            }
            return acc;
        },
        { requiredVariables: [], optionalVariables: [] }
    );

    let installCommand = '';
    let buildCommand = '';
    let outputDirectory = '';

    function selectComponent(variableType: string): typeof SvelteComponent<unknown> {
        switch (variableType) {
            case 'password':
                return InputPassword;
            case 'text':
                return InputText;
            case 'url':
                return InputURL;
            case 'phone':
                return InputPhone;
            case 'email':
                return InputEmail;
            case 'number':
                return InputNumber;
            default:
                return InputPassword;
        }
    }
</script>

{#if source === 'custom' || templateVariables?.length}
    <Fieldset legend="Configuration">
        <Layout.Stack gap="l">
            {#if source === 'custom'}
                <InputSelect
                    id="framework"
                    label="Framework"
                    placeholder="Select framework"
                    bind:value={framework}
                    options={FRAMEWORKS_AVAILABLE.map((framework) => ({
                        value: framework.id,
                        label: framework.name
                    }))} />
            {/if}

            <Collapsible>
                {#if source === 'custom'}
                    {@const frameworkData = FRAMEWORKS_AVAILABLE.find((f) => f.id === framework)}
                    <CollapsibleItem>
                        <svelte:fragment slot="title">
                            Build settings <Tag size="small">Optional</Tag>
                        </svelte:fragment>
                        <Layout.Stack>
                            Set up how your project is built and where the output files are stored.
                            <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                                <InputText
                                    id="installCommand"
                                    label="Install command"
                                    bind:value={installCommand}
                                    placeholder={frameworkData.installCommand} />
                                <Button
                                    secondary
                                    size="small"
                                    on:click={() => (installCommand = '')}>
                                    Reset
                                </Button>
                            </Layout.Stack>
                            <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                                <InputText
                                    id="buildCommand"
                                    label="Build command"
                                    bind:value={buildCommand}
                                    placeholder={frameworkData.buildCommand} />
                                <Button secondary size="small" on:click={() => (buildCommand = '')}>
                                    Reset
                                </Button>
                            </Layout.Stack>
                            <Layout.Stack gap="s" direction="row" alignItems="flex-end">
                                <InputText
                                    id="outputDirectory"
                                    label="Output directory"
                                    bind:value={outputDirectory}
                                    placeholder={frameworkData.outputDirectory} />
                                <Button
                                    secondary
                                    size="small"
                                    on:click={() => (outputDirectory = '')}>
                                    Reset
                                </Button>
                            </Layout.Stack>
                        </Layout.Stack>
                    </CollapsibleItem>
                {/if}
                {#if requiredVariables?.length}
                    <CollapsibleItem>
                        <svelte:fragment slot="title">
                            Required environment variables
                        </svelte:fragment>
                        <Layout.Stack>
                            Provide the values for the required environment variables to run this
                            application.

                            {#each requiredVariables as variable}
                                <Layout.Stack gap="s" direction="row">
                                    <Layout.Stack gap="s" direction="row">
                                        <div style="flex-basis:1; width: 100%">
                                            <InputText
                                                id={variable.name}
                                                value={variable.name}
                                                readonly />
                                        </div>
                                        <div style="flex-basis:1;width: 100%">
                                            <svelte:component
                                                this={selectComponent(variable.type)}
                                                id={variable.name}
                                                placeholder={variable.placeholder ?? 'Enter value'}
                                                required={variable.required}
                                                autocomplete={false}
                                                minlength={variable.type === 'password' ? 0 : null}
                                                showPasswordButton={variable.type === 'password'}
                                                bind:value={variables[variable.name]} />
                                        </div>
                                    </Layout.Stack>
                                    <Popover placement="bottom-end" let:toggle>
                                        <Button
                                            secondary
                                            icon
                                            on:click={(e) => {
                                                e.preventDefault();
                                                toggle(e);
                                            }}>
                                            <Icon size="small" icon={IconInfo} /></Button>
                                        <p slot="tooltip">{variable.description}</p>
                                    </Popover>
                                </Layout.Stack>
                            {/each}
                        </Layout.Stack>
                    </CollapsibleItem>
                {/if}
                {#if optionalVariables?.length}
                    <CollapsibleItem>
                        <svelte:fragment slot="title">
                            Environment variables <Tag size="small">Optional</Tag>
                        </svelte:fragment>
                        <Layout.Stack>
                            Set up environment variables to securely manage keys and settings for
                            your project.

                            {#each optionalVariables as variable}
                                <Layout.Stack gap="s" direction="row">
                                    <Layout.Stack gap="s" direction="row">
                                        <div style="flex-basis:1; width: 100%">
                                            <InputText
                                                id={variable.name}
                                                value={variable.name}
                                                readonly />
                                        </div>
                                        <div style="flex-basis:1;width: 100%">
                                            <svelte:component
                                                this={selectComponent(variable.type)}
                                                id={variable.name}
                                                placeholder={variable.placeholder ?? 'Enter value'}
                                                required={variable.required}
                                                autocomplete={false}
                                                minlength={variable.type === 'password' ? 0 : null}
                                                showPasswordButton={variable.type === 'password'}
                                                bind:value={variables[variable.name]} />
                                        </div>
                                    </Layout.Stack>
                                    <Popover placement="bottom-end" let:toggle>
                                        <Button
                                            secondary
                                            icon
                                            on:click={(e) => {
                                                e.preventDefault();
                                                toggle(e);
                                            }}>
                                            <Icon size="small" icon={IconInfo} /></Button>
                                        <p slot="tooltip">{variable.description}</p>
                                    </Popover>
                                </Layout.Stack>
                            {/each}
                        </Layout.Stack>
                    </CollapsibleItem>
                {/if}
            </Collapsible>
        </Layout.Stack>
    </Fieldset>
{/if}
