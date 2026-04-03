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
    import {
        IconChevronLeft,
        IconChevronRight,
        IconDownload,
        IconDuplicate
    } from '@appwrite.io/pink-icons-svelte';

    export let isGlobal: boolean;
    export let showEditor = false;
    export let variableList: Models.VariableList;

    type DraftVariable = { key: string; value: string };

    const EDITOR_PAGE_LIMIT = 10;
    const editableVariables = variableList.variables.filter((variable) => !variable.secret);
    const initialDraftEntries = editableVariables.map((variable) => ({
        key: variable.key,
        value: variable.value
    }));

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
    let tab: 'env' | 'json' = 'env';
    let isSubmitting = false;
    let pageOffset = 0;
    let draftEntries = initialDraftEntries.map((variable) => ({ ...variable }));
    let editorCode = serializeEntries(tab, getPageEntries(draftEntries, pageOffset));

    function getPageEntries(entries: DraftVariable[], offset: number) {
        return entries.slice(offset, offset + EDITOR_PAGE_LIMIT);
    }

    function serializeEntries(view: 'env' | 'json', entries: DraftVariable[]) {
        if (view === 'env') {
            return entries.map((variable) => `${variable.key}=${variable.value}`).join('\n');
        }

        const jsonObject = Object.fromEntries(
            entries.map((variable) => [variable.key, variable.value])
        );

        return Object.keys(jsonObject).length ? JSON.stringify(jsonObject, null, 2) : '';
    }

    function parseEntries(code: string, view: 'env' | 'json') {
        const variables = view === 'env' ? parse(code) : JSON.parse(code || '{}');

        return Object.entries(variables).map(([key, value]) => ({
            key,
            value: `${value}`
        }));
    }

    function validateEntries(entries: DraftVariable[]) {
        for (const { key, value } of entries) {
            if (value.length > 8192) {
                throw new Error(`Variable ${key} is longer than 8192 allowed characters`);
            }
        }
    }

    function replacePageEntries(
        entries: DraftVariable[],
        offset: number,
        pageEntries: DraftVariable[]
    ) {
        return [
            ...entries.slice(0, offset),
            ...pageEntries,
            ...entries.slice(offset + EDITOR_PAGE_LIMIT)
        ];
    }

    function buildDraftEntries() {
        const pageEntries = parseEntries(editorCode, tab);

        validateEntries(pageEntries);

        return replacePageEntries(draftEntries, pageOffset, pageEntries);
    }

    function syncEditorCode() {
        editorCode = serializeEntries(tab, getPageEntries(draftEntries, pageOffset));
    }

    function trySyncDraft() {
        try {
            draftEntries = buildDraftEntries();
            error = '';
        } catch {
            // Keep draft state intact while the user is mid-edit.
        }
    }

    function changeTab(nextTab: 'env' | 'json') {
        try {
            draftEntries = buildDraftEntries();
            tab = nextTab;
            error = '';
            syncEditorCode();
        } catch (e) {
            error = e.message;
        }
    }

    function changePage(nextOffset: number) {
        try {
            draftEntries = buildDraftEntries();
            pageOffset = nextOffset;
            error = '';
            syncEditorCode();
        } catch (e) {
            error = e.message;
        }
    }

    async function handleSubmit() {
        try {
            isSubmitting = true;

            const vars = Object.fromEntries(
                buildDraftEntries().map((variable) => [variable.key, variable.value])
            );
            const editableVariables = variableList.variables.filter((variable) => !variable.secret);
            const secretVariables = variableList.variables.filter((variable) => variable.secret);

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
                    const existingVariable = variableList.variables.find(
                        (variable) => variable.key === key
                    );

                    if (existingVariable?.secret) {
                        return;
                    }

                    if (existingVariable) {
                        await sdkUpdateVariable(existingVariable.$id, key, vars[key], false);
                        return;
                    }

                    await sdkCreateVariable(key, vars[key], false);
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
        } finally {
            isSubmitting = false;
        }
    }

    function downloadVariables() {
        let content = '';

        try {
            const nextDraftEntries = buildDraftEntries();

            content = serializeEntries(tab, nextDraftEntries);
            draftEntries = nextDraftEntries;
            error = '';
        } catch (e) {
            error = e.message;
            return;
        }

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

    $: totalEntries = draftEntries.length;
    $: currentPageEntries = getPageEntries(draftEntries, pageOffset);
    $: renderedPageCode = serializeEntries(tab, currentPageEntries);
    $: hasUnsyncedChanges = editorCode !== renderedPageCode;
    $: copyValue = (() => {
        try {
            return serializeEntries(tab, buildDraftEntries());
        } catch {
            return editorCode;
        }
    })();
    $: isButtonDisabled =
        !hasUnsyncedChanges && JSON.stringify(draftEntries) === JSON.stringify(initialDraftEntries);
</script>

<Modal title="Editor" bind:show={showEditor} onSubmit={handleSubmit} bind:error>
    <p slot="description">
        Edit {isGlobal ? 'global' : 'environment'} variables below or download as a
        <InlineCode size="s" code={`.${tab}`} /> file.
    </p>
    <Layout.Stack gap="s">
        <Tabs.Root stretch let:root>
            <Tabs.Item.Button {root} on:click={() => changeTab('env')} active={tab === 'env'}>
                ENV
            </Tabs.Item.Button>
            <Tabs.Item.Button {root} on:click={() => changeTab('json')} active={tab === 'json'}>
                JSON
            </Tabs.Item.Button>
        </Tabs.Root>

        <Layout.Stack gap="xs">
            {#if tab === 'env'}
                <InputTextarea
                    spellcheck={false}
                    id="variables"
                    bind:value={editorCode}
                    on:input={trySyncDraft}
                    rows={10}
                    placeholder={`SECRET_KEY=dQw4w9WgXcQ...`} />
            {:else if tab === 'json'}
                <InputTextarea
                    spellcheck={false}
                    id="variables"
                    bind:value={editorCode}
                    on:input={trySyncDraft}
                    rows={10}
                    placeholder={`{\n  "SECRET_KEY": "dQw4w9WgXcQ..."\n}`} />
            {/if}
            {#if totalEntries > EDITOR_PAGE_LIMIT}
                <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                    <p class="text">
                        Variables {pageOffset + 1}-{Math.min(
                            pageOffset + EDITOR_PAGE_LIMIT,
                            totalEntries
                        )} of {totalEntries}
                    </p>
                    <Layout.Stack direction="row" gap="xs" inline>
                        <Button
                            size="xs"
                            secondary
                            disabled={pageOffset === 0}
                            on:click={() => changePage(pageOffset - EDITOR_PAGE_LIMIT)}>
                            <Icon size="s" slot="start" icon={IconChevronLeft} />
                            Prev
                        </Button>
                        <Button
                            size="xs"
                            secondary
                            disabled={pageOffset + EDITOR_PAGE_LIMIT >= totalEntries}
                            on:click={() => changePage(pageOffset + EDITOR_PAGE_LIMIT)}>
                            Next
                            <Icon size="s" slot="end" icon={IconChevronRight} />
                        </Button>
                    </Layout.Stack>
                </Layout.Stack>
            {/if}
            <Layout.Stack direction="row" gap="xs">
                <Button size="xs" on:click={() => downloadVariables()} secondary>
                    <Icon size="s" slot="start" icon={IconDownload} />
                    Download
                </Button>
                <Copy value={copyValue}>
                    <Button size="xs" secondary>
                        <Icon size="s" slot="start" icon={IconDuplicate} />
                        Copy
                    </Button>
                </Copy>
            </Layout.Stack>
        </Layout.Stack>
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showEditor = false)} disabled={isSubmitting}>
            Cancel
        </Button>
        <Button submit disabled={isButtonDisabled || isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
    </svelte:fragment>
</Modal>
