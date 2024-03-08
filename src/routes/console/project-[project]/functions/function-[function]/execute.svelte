<script lang="ts">
    import { afterNavigate, goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Alert, Modal } from '$lib/components';
    import Collapsible from '$lib/components/collapsible.svelte';
    import CollapsibleItem from '$lib/components/collapsibleItem.svelte';
    import { Dependencies } from '$lib/constants';
    import { Button, FormItem, FormItemPart } from '$lib/elements/forms';
    import { FormList } from '$lib/elements/forms';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import InputText from '$lib/elements/forms/inputText.svelte';
    import InputTextarea from '$lib/elements/forms/inputTextarea.svelte';
    import Label from '$lib/elements/forms/label.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export let selectedFunction: Models.Function = null;

    let path = '/';
    let method = 'GET';
    let body = '';
    let headers: [string, string][] = [['', '']];
    let error: string = null;

    const methodOptions = [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'PATCH', value: 'PATCH' },
        { label: 'DELETE', value: 'DELETE' },
        { label: 'OPTIONS', value: 'OPTIONS' }
    ];

    let show = false;
    let submitting = false;

    $: if (selectedFunction && !show) {
        show = true;
    }

    const handleSubmit = async () => {
        submitting = true;
        try {
            const headersObject = {};

            for (const [name, value] of headers) {
                headersObject[name] = value;
            }

            await sdk.forProject.functions.createExecution(
                selectedFunction.$id,
                body,
                true,
                path,
                method,
                headersObject
            );
            if (!$page.url?.toString()?.includes('/executions')) {
                await goto(
                    `${base}/console/project-${$page.params.project}/functions/function-${selectedFunction.$id}/executions`
                );
            }
            invalidate(Dependencies.EXECUTIONS);
            close();
            addNotification({
                type: 'success',
                message: `Function has been executed`
            });
            trackEvent(Submit.ExecutionCreate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ExecutionCreate);
        } finally {
            submitting = false;
        }
    };

    function close() {
        selectedFunction = null;
        show = false;
    }

    afterNavigate(close);
</script>

<Modal
    title="Execute function"
    headerDivider={false}
    bind:show
    size="big"
    onSubmit={handleSubmit}
    on:close={close}
    bind:error>
    <p class="text">
        Manually execute your function. <a
            class="link"
            href="https://appwrite.io/docs/products/functions/execution"
            target="_blank"
            rel="noopener noreferrer">
            Learn more
        </a>.
    </p>

    <FormList>
        {#if selectedFunction?.version !== 'v3'}
            <Alert type="info">
                <svelte:fragment slot="title">
                    Customizable execution data now available for functions v3.0
                </svelte:fragment>
                Update your function version to make use of new features including customizable HTTP
                data in your executions.
                <svelte:fragment slot="buttons">
                    <Button
                        href="https://appwrite.io/docs/products/functions/development"
                        external
                        text>
                        Learn more
                    </Button>
                </svelte:fragment>
            </Alert>
            <InputTextarea
                label="Body"
                placeholder={`{ "myKey": "myValue" }`}
                id="body"
                bind:value={body} />
        {:else}
            <InputText label="Path" id="path" placeholder="/" bind:value={path} required />

            <InputSelect
                required
                id="method"
                label="Method"
                options={methodOptions}
                bind:value={method} />

            <Collapsible>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Advanced settings</svelte:fragment>
                    <svelte:fragment slot="subtitle">(optional)</svelte:fragment>
                    <FormList>
                        <p class="text">
                            Customize your execution with headers or body. To customize parameters,
                            add them to path.
                        </p>
                        <div>
                            <Label
                                tooltip="Headers should contain alphanumeric characters (a-z, A-Z, and 0-9) and hyphens only (- and _).">
                                Headers
                            </Label>
                            <div class="form u-grid u-gap-8 u-margin-block-start-8">
                                <FormList>
                                    {#if headers}
                                        {#each headers as [name, value], index}
                                            <FormItem isMultiple>
                                                <InputText
                                                    isMultiple
                                                    fullWidth
                                                    label="Name"
                                                    placeholder="Enter Name"
                                                    id={`key-${index}`}
                                                    bind:value={name} />
                                                <InputText
                                                    isMultiple
                                                    fullWidth
                                                    label="Value"
                                                    placeholder="Enter value"
                                                    id={`value-${index}`}
                                                    bind:value />
                                                <FormItemPart alignEnd>
                                                    <Button
                                                        text
                                                        noMargin
                                                        disabled={(!name || !value) && index === 0}
                                                        on:click={() => {
                                                            if (index === 0) {
                                                                headers = [['', '']];
                                                            } else {
                                                                headers.splice(index, 1);
                                                                headers = headers;
                                                            }
                                                        }}>
                                                        <span class="icon-x" aria-hidden="true" />
                                                    </Button>
                                                </FormItemPart>
                                            </FormItem>
                                        {/each}
                                    {/if}
                                </FormList>
                                <Button
                                    noMargin
                                    text
                                    disabled={headers?.length &&
                                    headers[headers.length - 1][0] &&
                                    headers[headers.length - 1][1]
                                        ? false
                                        : true}
                                    on:click={() => {
                                        if (
                                            headers[headers.length - 1][0] &&
                                            headers[headers.length - 1][1]
                                        ) {
                                            headers.push(['', '']);
                                            headers = headers;
                                        }
                                    }}>
                                    <span class="icon-plus" aria-hidden="true" />
                                    <span class="text">Add Header</span>
                                </Button>
                            </div>
                        </div>

                        <InputTextarea
                            label="Body"
                            placeholder={`{ "myKey": "myValue" }`}
                            id="body"
                            bind:value={body} />
                    </FormList>
                </CollapsibleItem>
            </Collapsible>
        {/if}
    </FormList>

    <svelte:fragment slot="footer">
        <Button text on:click={close}>Cancel</Button>
        <Button disabled={submitting} submit>Execute</Button>
    </svelte:fragment>
</Modal>
