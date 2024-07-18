<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { SecondaryTabs, SecondaryTabsItem } from '$lib/components';
    import Copy from '$lib/components/copy.svelte';
    import Modal from '$lib/components/modal.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import type { Models } from '@appwrite.io/console';
    import { parse } from 'envfile';

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
    let copyParent: HTMLElement;

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

    $: isButtonDisabled =
        (tab === 'env' && baseEnvCode === envCode) || (tab === 'json' && baseJsonCode === jsonCode);
</script>

<Modal
    title="Editor"
    headerDivider={false}
    bind:show={showEditor}
    onSubmit={handleSubmit}
    bind:error
    size="big">
    <p>
        Edit {isGlobal ? 'global' : 'environment'} variables below or download as a
        <span class="inline-code">.{tab}</span> file.
    </p>

    <div class="editor-border">
        <SecondaryTabs large class="u-sep-block-end u-padding-8">
            <SecondaryTabsItem
                stretch
                fullWidth
                center
                on:click={() => (tab = 'env')}
                disabled={tab === 'env'}>
                ENV
            </SecondaryTabsItem>
            <SecondaryTabsItem
                stretch
                fullWidth
                center
                on:click={() => (tab = 'json')}
                disabled={tab === 'json'}>
                JSON
            </SecondaryTabsItem>
        </SecondaryTabs>

        <div class="input-text-wrapper">
            {#if tab === 'env'}
                <textarea
                    placeholder={`SECRET_KEY=dQw4w9WgXcQ...`}
                    class="input-text u-border-width-0"
                    bind:value={envCode}
                    style:--amount-of-buttons={0.25}
                    style:border-radius="var(--border-radius-small)" />
            {:else if tab === 'json'}
                <textarea
                    placeholder={`{\n  "SECRET_KEY": "dQw4w9WgXcQ..."\n}`}
                    class="input-text u-border-width-0"
                    bind:value={jsonCode}
                    style:--amount-of-buttons={0.25}
                    style:border-radius="var(--border-radius-small)" />
            {/if}
            <ul
                class="buttons-list u-gap-8 u-cross-center u-position-absolute d u-inset-block-end-1 u-inset-inline-end-1 u-padding-block-8 u-padding-inline-12"
                style="border-end-end-radius:0.0625rem;">
                <li class="buttons-list-item">
                    <div class="tooltip" aria-label={`Download .${tab} file`}>
                        <button
                            on:click={() => downloadVariables()}
                            type="button"
                            class="button is-small is-text is-only-icon"
                            aria-label={`Download .${tab} file`}>
                            <span class="icon-download" aria-hidden="true" />
                        </button>
                        <span class="tooltip-popup" role="tooltip">
                            Download .{tab} file.
                        </span>
                    </div>
                </li>
                <li class="buttons-list-item">
                    <div bind:this={copyParent}>
                        {#key copyParent}
                            <Copy appendTo={copyParent} value={tab == 'json' ? jsonCode : envCode}>
                                <button
                                    type="button"
                                    class="button is-small is-text is-only-icon"
                                    aria-label="Click to copy">
                                    <span class="icon-duplicate" aria-hidden="true" />
                                </button>
                            </Copy>
                        {/key}
                    </div>
                </li>
            </ul>
        </div>
    </div>

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
