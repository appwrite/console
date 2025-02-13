<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import Copy from '$lib/components/copy.svelte';
    import Modal from '$lib/components/modal.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import type { Models } from '@appwrite.io/console';
    import { parse } from 'envfile';
    import { Icon, InlineCode, Layout, Tabs } from '@appwrite.io/pink-svelte';
    import { InputTextarea } from '$lib/elements/forms';
    import { IconDownload, IconDuplicate } from '@appwrite.io/pink-icons-svelte';

    export let isGlobal: boolean;
    export let showEditor = false;
    export let variableList: Models.VariableList;

    export let sdkCreateVariable: (key: string, value: string) => Promise<unknown>;
    export let sdkUpdateVariable: (
        variableId: string,
        key: string,
        value: string
    ) => Promise<unknown>;
    export let sdkDeleteVariable: (variableId: string) => Promise<unknown>;

    let error = '';
    let envCode = variableList.variables
        .map((variable) => `${variable.key}=${variable.value}`)
        .join('\n');
    let jsonCode = JSON.stringify(
        JSON.parse(
            `{${variableList.variables
                .map((variable) => `"${variable.key}":"${variable.value.split('"').join('\\"')}"`)
                .join(',')}}`
        ),
        null,
        2
    );
    const baseEnvCode = envCode;
    const baseJsonCode = jsonCode;

    if (jsonCode === '{}') {
        jsonCode = '';
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
                variableList.variables.map(async (variable) => {
                    const newValue = vars[variable.key] ?? null;

                    if (newValue === null) {
                        await sdkDeleteVariable(variable.$id);
                    } else if (newValue !== variable.value) {
                        await sdkUpdateVariable(variable.$id, variable.key, newValue);
                    }

                    delete vars[variable.key];
                })
            );

            await Promise.all(
                Object.keys(vars).map(async (key) => {
                    await sdkCreateVariable(key, vars[key]);
                })
            );

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

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            if (tab === 'env') {
                envCode += '\n';
            } else {
                jsonCode += '\n';
            }
        }
    }

    $: isButtonDisabled =
        (tab === 'env' && baseEnvCode === envCode) || (tab === 'json' && baseJsonCode === jsonCode);
</script>

<svelte:window on:keydown={handleKeydown} />

<Modal
    title="Editor"
    bind:show={showEditor}
    onSubmit={handleSubmit}
    bind:error
    submitOnEnter={false}>
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

        <Layout.Stack gap="xxs">
            {#if tab === 'env'}
                <InputTextarea
                    id="variables"
                    bind:value={envCode}
                    rows={10}
                    placeholder={`SECRET_KEY=dQw4w9WgXcQ...`} />
            {:else if tab === 'json'}
                <InputTextarea
                    id="variables"
                    bind:value={jsonCode}
                    rows={10}
                    placeholder={`{\n  "SECRET_KEY": "dQw4w9WgXcQ..."\n}`} />
            {/if}
            <Layout.Stack direction="row">
                <Button size="xs" on:click={() => downloadVariables()} compact>
                    <Icon slot="start" icon={IconDownload} />
                    Download
                </Button>

                <Copy value={tab == 'json' ? jsonCode : envCode}>
                    <Button size="xs" compact>
                        <Icon slot="start" icon={IconDuplicate} />
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

<style lang="scss">
    .editor-border {
        border: solid 0.0625rem hsl(var(--color-border));
        border-radius: var(--border-radius-small);
    }
</style>
