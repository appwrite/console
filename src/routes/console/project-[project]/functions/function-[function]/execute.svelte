<script lang="ts">
    import { afterNavigate, goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import Collapsible from '$lib/components/collapsible.svelte';
    import CollapsibleItem from '$lib/components/collapsibleItem.svelte';
    import { Button } from '$lib/elements/forms';
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
            goto(
                `${base}/console/project-${$page.params.project}/functions/function-${selectedFunction.$id}/executions`
            );
            close();
            addNotification({
                type: 'success',
                message: `Function has been executed`
            });
            trackEvent(Submit.ExecutionCreate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ExecutionCreate);
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

<Modal headerDivider={false} bind:show size="big" onSubmit={handleSubmit} on:close={close}>
    <svelte:fragment slot="header">Execute function</svelte:fragment>
    <p class="text">
        Manually execute your function. <a
            class="link"
            href="https://appwrite.io/docs/functions#execute"
            target="_blank"
            rel="noopener noreferrer">
            Learn more
        </a>.
    </p>

    <FormList>
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
                        Customize your execution with headers or body. To customize parameters, add
                        them to path.
                    </p>

                    <Label
                        tooltip="Headers should contain alphanumeric characters (a-z, A-Z, and 0-9) and hyphens only (- and _).">
                        Headers
                    </Label>
                    <div class="form u-grid u-gap-16">
                        <ul class="form-list">
                            {#if headers}
                                {#each headers as [name, value], index}
                                    <li class="form-item is-multiple">
                                        <div class="form-item-part u-stretch">
                                            <label class="label" for={`key-${index}`}>Name</label>
                                            <div class="input-text-wrapper">
                                                <input
                                                    id={`key-${name}`}
                                                    placeholder="Enter Name"
                                                    type="text"
                                                    class="input-text"
                                                    bind:value={name} />
                                            </div>
                                        </div>
                                        <div class="form-item-part u-stretch">
                                            <label class="label" for={`value-${index}`}>
                                                Value
                                            </label>
                                            <div class="input-text-wrapper">
                                                <input
                                                    id={`value-${value}`}
                                                    placeholder="Enter value"
                                                    type="text"
                                                    class="input-text"
                                                    bind:value />
                                            </div>
                                        </div>
                                        <div class="form-item-part u-cross-child-end">
                                            <Button
                                                text
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
                                        </div>
                                    </li>
                                {/each}
                            {/if}
                        </ul>
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

                    <InputTextarea
                        label="Body"
                        placeholder={`{ "myKey": "myValue" }`}
                        id="body"
                        bind:value={body} />
                </FormList>
            </CollapsibleItem>
        </Collapsible>
    </FormList>

    <svelte:fragment slot="footer">
        <Button text on:click={close}>Cancel</Button>
        <Button disabled={submitting} submit>Execute</Button>
    </svelte:fragment>
</Modal>
