<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import Copy from '$lib/components/copy.svelte';
    import Modal from '$lib/components/modal.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import type { Models } from '@appwrite.io/console';
    import { parse } from 'dotenv';

    export let isGlobal: boolean;
    export let showEditor = false;
    export let variableList: Models.VariableList;

    export let sdkCreateVariable: (key: string, value: string) => Promise<any>;
    export let sdkUpdateVariable: (variableId: string, key: string, value: string) => Promise<any>;
    export let sdkDeleteVariable: (variableId: string) => Promise<any>;

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
        } catch (error) {
            showEditor = false;

            addNotification({
                type: 'error',
                message: error.message
            });

            trackError(error, Submit.VariableEditor);
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
</script>

<Modal headerDivider={false} bind:show={showEditor} onSubmit={handleSubmit} size="big">
    <svelte:fragment slot="header">Editor</svelte:fragment>
    <p>
        Edit {isGlobal ? 'global' : 'environment'} variables below or download as a
        <span class="inline-code">.{tab}</span> file.
    </p>

    <div class="editor-border">
        <ul class="secondary-tabs is-large u-sep-block-end u-padding-8">
            <li class="secondary-tabs-item u-stretch">
                <button
                    type="button"
                    on:click={() => (tab = 'env')}
                    class="secondary-tabs-button u-width-full-line u-text-center"
                    disabled={tab === 'env'}><span class="text">ENV</span></button>
            </li>
            <li class="secondary-tabs-item u-stretch">
                <button
                    type="button"
                    on:click={() => (tab = 'json')}
                    class="secondary-tabs-button u-width-full-line u-text-center"
                    disabled={tab === 'json'}><span class="text">JSON</span></button>
            </li>
        </ul>

        {#if tab === 'env'}
            <textarea
                placeholder={`SECRET_KEY=dQw4w9WgXcQ...`}
                class="input-text u-border-width-0"
                bind:value={envCode} />
        {:else if tab === 'json'}
            <textarea
                placeholder={`{\n  "SECRET_KEY": "dQw4w9WgXcQ..."\n}`}
                class="input-text u-border-width-0"
                bind:value={jsonCode} />
        {/if}

        <div class="u-flex u-width-full-line u-main-end u-padding-12">
            <ul class="buttons-list">
                <li class="buttons-list-item">
                    <div class="tooltip" aria-label={`Download .${tab} file`}>
                        <button
                            on:click={() => downloadVariables()}
                            type="button"
                            class="button is-small is-text is-only-icon"
                            aria-label={`Download .${tab} file`}>
                            <span class="icon-download" aria-hidden="true" />
                        </button>
                        <span class="tooltip-popup" role="tooltip"> Download .{tab} file. </span>
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
        <Button submit>Save</Button>
    </svelte:fragment>
</Modal>

<style lang="scss">
    .editor-border {
        border: solid 0.0625rem hsl(var(--color-border));
        border-radius: var(--border-radius-small);

        textarea {
            border-radius: var(--border-radius-small);
        }
    }
</style>
