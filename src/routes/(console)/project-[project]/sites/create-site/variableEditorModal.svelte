<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import Copy from '$lib/components/copy.svelte';
    import Modal from '$lib/components/modal.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { parse } from 'envfile';
    import { Icon, Layout, Tabs } from '@appwrite.io/pink-svelte';
    import { IconDownload, IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import { InputTextarea } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let showEditor = false;
    export let variables: Partial<Models.Variable>[];

    let error = '';
    let envCode = variables.map((variable) => `${variable.key}=${variable.value}`).join('\n');
    let jsonCode = JSON.stringify(
        JSON.parse(
            `{${variables
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

            variables.map((variable) => {
                const newValue = vars[variable.key] ?? null;

                if (newValue === null) {
                    variables = variables.filter((v) => v.key !== variable.key);
                } else if (newValue !== variable.value) {
                    variable.value = newValue;
                    variables = [...variables];
                }
                delete vars[variable.key];
            });

            Object.keys(vars).map(async (key) => {
                const value = vars[key];
                variables.push({ key, value });
            });

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
    <p slot="description">Add, edit, or delete environment variables using a raw editor.</p>
    <Layout.Stack gap="s">
        <Tabs.Root stretch let:root>
            <Tabs.Item.Button {root} on:click={() => (tab = 'env')} active={tab === 'env'}>
                ENV
            </Tabs.Item.Button>
            <Tabs.Item.Button {root} on:click={() => (tab = 'json')} active={tab === 'json'}>
                JSON
            </Tabs.Item.Button>
        </Tabs.Root>

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
        <Layout.Stack direction="row" gap="xs">
            <Button on:click={() => downloadVariables()} text>
                <Icon icon={IconDownload} />
                Download
            </Button>

            <Copy value={tab == 'json' ? jsonCode : envCode}>
                <Button text>
                    <Icon icon={IconDuplicate} />
                    Copy
                </Button>
            </Copy>
        </Layout.Stack>
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showEditor = false)}>Cancel</Button>
        <Button submit disabled={isButtonDisabled}>Save</Button>
    </svelte:fragment>
</Modal>
