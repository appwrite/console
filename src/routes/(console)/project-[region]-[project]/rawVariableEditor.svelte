<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import Copy from '$lib/components/copy.svelte';
    import Modal from '$lib/components/modal.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import type { Models } from '@appwrite.io/console';
    import { parse } from '$lib/helpers/envfile';
    import { Icon, InlineCode, Layout, Tabs } from '@appwrite.io/pink-svelte';
    import { InputTextarea } from '$lib/elements/forms';
    import { IconDownload, IconDuplicate } from '@appwrite.io/pink-icons-svelte';

    export let isGlobal: boolean;
    export let showEditor = false;
    export let variableList: Models.VariableList;

    const editableVariables = variableList.variables.filter((variable) => !variable.secret);
    const secretVariables = variableList.variables.filter((variable) => variable.secret);

    export let sdkCreateVariable: (
        key: string,
        value: string,
        secret?: boolean
    ) => Promise<unknown>;
    export let sdkUpdateVariable: (
        variableId: string,
        key: string,
        value: string,
        secret?: boolean
    ) => Promise<unknown>;
    export let sdkDeleteVariable: (variableId: string) => Promise<unknown>;

    let error = '';
    let envCode = editableVariables
        .map((variable) => `${variable.key}=${variable.value}`)
        .join('\n');
    let jsonCode = JSON.stringify(
        JSON.parse(
            `{${editableVariables
                .map((variable) => `"${variable.key}":"${variable.value.split('"').join('\\"')}"`)
                .join(',')}}`
        ),
        null,
        2
    );
    let baseEnvCode = envCode;
    let baseJsonCode = jsonCode;

    if (jsonCode === '{}') {
        jsonCode = '';
        baseJsonCode = '';
    }

    let tab: 'env' | 'json' = 'env';

    async function handleSubmit() {
        try {
            const vars = tab === 'env' ? parse(envCode) : JSON.parse(jsonCode ? jsonCode : '{}');

            const entries = Object.entries(vars);

            for (const [key, value] of entries) {
                if (('' + value).length > 8192) {
                    throw new Error(`Variable ${key} is longer than 8192 allowed characters`);
                }
            }

            await Promise.all(
                editableVariables.map(async (variable) => {
                    const newValue = vars[variable.key] ?? null;

                    if (newValue === null) {
                        await sdkDeleteVariable(variable.$id);
                    } else if (newValue !== variable.value) {
                        await sdkUpdateVariable(variable.$id, variable.key, newValue, false);
                    }
                    delete vars[variable.key];
                })
            );

            // Add new variables, skipping keys that exist in secret variables
            await Promise.all(
                Object.keys(vars).map(async (key) => {
                    if (!secretVariables.some((v) => v.key === key)) {
                        await sdkCreateVariable(key, vars[key], false);
                    }
                })
            );
            // Ensure secret variables are preserved
            variableList.variables = [
                ...secretVariables,
                ...variableList.variables.filter((v) => !v.secret)
            ];

            showEditor = false;

            addNotification({
                type: 'success',
                message: `Variables have been updated.`
            });

            trackEvent(Submit.VariableEditor);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.VariableEditor);
        }
    }

    function downloadVariables() {
        const content = tab === 'json' ? jsonCode : envCode;
        const fileName = tab === 'json' ? 'vars.json' : '.env';
        const type = tab === 'json' ? 'application/json' : 'application/x-envoy';

        const file = new File([content], fileName, {
            type
        });

        const link = document.createElement('a');
        const url = URL.createObjectURL(file);

        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    $: isButtonDisabled =
        (tab === 'env' && baseEnvCode === envCode) || (tab === 'json' && baseJsonCode === jsonCode);
</script>

<Modal title="Editor" bind:show={showEditor} onSubmit={handleSubmit} bind:error>
    <p slot="description">
        Edit {isGlobal ? 'global' : 'environment'} variables below or download as a
        <InlineCode size="s" code={`.${tab}`} /> file.
    </p>
    <Layout.Stack gap="s">
        <Tabs.Root stretch let:root>
            <Tabs.Item.Button {root} on:click={() => (tab = 'env')} active={tab === 'env'}>
                ENV
            </Tabs.Item.Button>
            <Tabs.Item.Button {root} on:click={() => (tab = 'json')} active={tab === 'json'}>
                JSON
            </Tabs.Item.Button>
        </Tabs.Root>

        <Layout.Stack gap="xs">
            {#if tab === 'env'}
                <InputTextarea
                    spellcheck={false}
                    id="variables"
                    bind:value={envCode}
                    rows={10}
                    placeholder={`SECRET_KEY=dQw4w9WgXcQ...`} />
            {:else if tab === 'json'}
                <InputTextarea
                    spellcheck={false}
                    id="variables"
                    bind:value={jsonCode}
                    rows={10}
                    placeholder={`{\n  "SECRET_KEY": "dQw4w9WgXcQ..."\n}`} />
            {/if}
            <Layout.Stack direction="row" gap="xs">
                <Button size="xs" on:click={() => downloadVariables()} secondary>
                    <Icon size="s" slot="start" icon={IconDownload} />
                    Download
                </Button>
                <Copy value={tab == 'json' ? jsonCode : envCode}>
                    <Button size="xs" secondary>
                        <Icon size="s" slot="start" icon={IconDuplicate} />
                        Copy
                    </Button>
                </Copy>
            </Layout.Stack>
        </Layout.Stack>
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showEditor = false)}>Cancel</Button>
        <Button submit disabled={isButtonDisabled}>Save</Button>
    </svelte:fragment>
</Modal>
