<script lang="ts">
    import { afterNavigate, goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import {
        Button,
        Form,
        Helper,
        InputDate,
        InputSelect,
        InputText,
        InputTextarea,
        InputTime
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ExecutionMethod, type Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import {
        isSameDay,
        toLocaleDateISO,
        toLocaleDateTime,
        toLocaleTimeISO
    } from '$lib/helpers/date';
    import { last } from '$lib/helpers/array';
    import {
        Accordion,
        Alert,
        Fieldset,
        Icon,
        Input,
        Layout,
        Tooltip,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { IconInfo, IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
    import Wizard from '$lib/layout/wizard.svelte';
    import Aside from './aside.svelte';

    let previousPage: string = `${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/executions`;

    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });

    export let data;

    const func = data.function as Models.Function;
    const deployment = data.activeDeployment as Models.Deployment;

    const keyList = [
        // Communication
        { label: 'Content-Type', value: 'Content-Type' },
        { label: 'Accept', value: 'Accept' },
        // Auth
        { label: 'Authorization', value: 'Authorization' },
        { label: 'Cookie', value: 'Cookie' },
        // Optimizations
        { label: 'Cache-control', value: 'Cache-control' },
        { label: 'Forwarded', value: 'Forwarded' },
        // Client-details
        { label: 'User-Agent', value: 'User-Agent' },
        { label: 'Referer', value: 'Referer' },
        { label: 'Forwarded', value: 'Forwarded' },
        { label: 'Host', value: 'Host' },
        { label: 'Origin', value: 'Origin' }
    ];

    const methodOptions = [
        { label: 'GET', value: ExecutionMethod.GET },
        { label: 'POST', value: ExecutionMethod.POST },
        { label: 'PUT', value: ExecutionMethod.PUT },
        { label: 'PATCH', value: ExecutionMethod.PATCH },
        { label: 'DELETE', value: ExecutionMethod.DELETE },
        { label: 'OPTIONS', value: ExecutionMethod.OPTIONS }
    ];

    let formComponent: Form;
    let isSubmitting = writable(false);

    let path = '/';
    let method = ExecutionMethod.GET;
    let body = '';
    let headers: [string, string][] = [[null, '']];

    async function handleSubmit() {
        try {
            const headersObject = {};

            for (const [name, value] of headers) {
                headersObject[name] = value;
            }

            await sdk
                .forProject(page.params.region, page.params.project)
                .functions.createExecution(
                    func.$id,
                    body,
                    true,
                    path,
                    method,
                    headersObject,
                    isScheduled ? dateTime.toISOString() : undefined
                );
            await goto(
                `${base}/project-${page.params.region}-${page.params.project}/functions/function-${func.$id}/executions`
            );
            invalidate(Dependencies.EXECUTIONS);
            addNotification({
                type: 'success',
                message: `Function has been executed`
            });
            trackEvent(Submit.ExecutionCreate);
        } catch (e) {
            trackError(e, Submit.ExecutionCreate);
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }
    let isScheduled: boolean = null;
    let now = new Date();
    let minDate: string;
    let date: string = toLocaleDateISO(now.getTime());
    // We need to remove seconds from the min so the seconds are not displayed in the time picker
    let time: string = toLocaleTimeISO(now.getTime()).split(':').slice(0, 2).join(':');
    $: minDate = toLocaleDateISO(now.toString());
    $: minTime = isSameDay(new Date(date), new Date(minDate))
        ? toLocaleTimeISO(now.getTime()).split(':').slice(0, 2).join(':')
        : '00:00';
    $: dateTime = new Date(`${date}T${time}`);

    $: filteredKeyList = keyList.filter((key) => {
        const name = last(headers)[0];
        if (!name) return true;
        return key.value.toLowerCase().includes(name?.toLowerCase());
    });
</script>

<svelte:head>
    <title>Create execution - Appwrite</title>
</svelte:head>

<Wizard title="Create execution" href={previousPage}>
    <svelte:fragment slot="title">Create execution</svelte:fragment>
    <Form bind:this={formComponent} onSubmit={handleSubmit} bind:isSubmitting>
        <Layout.Stack gap="xl">
            {#if func?.version === 'v2'}
                <Alert.Inline
                    status="info"
                    title="Customizable execution data now available for functions v3.0">
                    <svelte:fragment slot="title"></svelte:fragment>

                    Update your function version to make use of new features including customizable
                    HTTP data in your executions.
                    <svelte:fragment slot="actions">
                        <Button
                            href="https://appwrite.io/docs/products/functions/development"
                            external
                            compact>
                            Learn more
                        </Button>
                    </svelte:fragment>
                </Alert.Inline>
                <Fieldset legend="Request">
                    <Accordion title="Body" badge="Optional" hideDivider open>
                        <Layout.Stack gap="xl">
                            <Typography.Text>
                                Provide the request body to include the main data you want to send
                                to the server.
                            </Typography.Text>
                            <InputTextarea
                                placeholder="Enter request body here..."
                                id="body"
                                bind:value={body} />
                        </Layout.Stack>
                    </Accordion>
                </Fieldset>
            {:else}
                <Fieldset legend="Request">
                    <Layout.Stack gap="xl">
                        <Layout.GridFraction start={1} end={3}>
                            <InputSelect
                                required
                                id="method"
                                label="Method"
                                options={methodOptions}
                                bind:value={method} />
                            <InputText
                                label="Path"
                                id="path"
                                placeholder="/"
                                bind:value={path}
                                required />
                        </Layout.GridFraction>

                        <Layout.Stack gap="s">
                            <Accordion title="Headers" badge="Optional">
                                <Layout.Stack gap="xl">
                                    <Typography.Text>
                                        Provide essential metadata to define the content type,
                                        authentication details, and the expected response format.
                                    </Typography.Text>

                                    <Layout.Stack gap="xs">
                                        {#if headers}
                                            {#each headers as [name, value], index}
                                                <Layout.Stack direction="row" alignItems="flex-end">
                                                    <Input.ComboBox
                                                        fullWidth
                                                        label={index === 0 ? 'Key' : ''}
                                                        placeholder="Select key"
                                                        interactiveOutput
                                                        hideEmpty
                                                        options={filteredKeyList}
                                                        id={`key-${index}`}
                                                        bind:value={name}
                                                        bind:search={name}>
                                                    </Input.ComboBox>
                                                    <InputText
                                                        label={index === 0 ? 'Value' : ''}
                                                        placeholder="Enter value"
                                                        id={`value-${index}`}
                                                        bind:value>
                                                        <span slot="info">
                                                            <Tooltip>
                                                                <Layout.Stack alignItems="center">
                                                                    <Icon
                                                                        icon={IconInfo}
                                                                        size="s" />
                                                                </Layout.Stack>
                                                                <span slot="tooltip">
                                                                    Values should contain
                                                                    alphanumeric characters (a-z,
                                                                    A-Z, and 0-9) and hyphens only
                                                                    (- and _).
                                                                </span>
                                                            </Tooltip>
                                                        </span>
                                                    </InputText>
                                                    <Button
                                                        text
                                                        icon
                                                        disabled={(!name || !value) && index === 0}
                                                        on:click={() => {
                                                            if (index === 0) {
                                                                headers = [['', '']];
                                                            } else {
                                                                headers.splice(index, 1);
                                                                headers = headers;
                                                            }
                                                        }}>
                                                        <Icon icon={IconX} />
                                                    </Button>
                                                </Layout.Stack>
                                            {/each}
                                        {/if}
                                        <div>
                                            <Button
                                                compact
                                                disabled={headers?.length &&
                                                headers[headers.length - 1][0]
                                                    ? false
                                                    : true}
                                                on:click={() => {
                                                    if (headers[headers.length - 1][0]) {
                                                        headers.push(['', '']);
                                                        headers = headers;
                                                    }
                                                }}>
                                                <Icon icon={IconPlus} slot="start" size="s" />
                                                Add header
                                            </Button>
                                        </div>
                                    </Layout.Stack>
                                </Layout.Stack>
                            </Accordion>

                            <Accordion title="Body" badge="Optional" hideDivider>
                                <Layout.Stack gap="xl">
                                    <Typography.Text>
                                        Provide the request body to include the main data you want
                                        to send to the server.
                                    </Typography.Text>
                                    <InputTextarea
                                        placeholder="Enter request body here..."
                                        id="body"
                                        bind:value={body} />
                                </Layout.Stack>
                            </Accordion>
                        </Layout.Stack>
                    </Layout.Stack>
                </Fieldset>

                <Fieldset legend="Settings">
                    <Layout.Stack gap="l">
                        <Layout.Stack gap="xs">
                            <InputSelect
                                bind:value={isScheduled}
                                id="schedule"
                                label="Schedule"
                                required
                                options={[
                                    {
                                        label: 'Now',
                                        value: null
                                    },
                                    {
                                        label: 'Custom',
                                        value: true
                                    }
                                ]} />
                            {#if !isScheduled}
                                <Helper type="neutral">
                                    Your function will be executed immediately
                                </Helper>
                            {/if}
                        </Layout.Stack>
                        {#if isScheduled}
                            <Layout.Stack gap="xs">
                                <Layout.GridFraction start={3} end={1}>
                                    <InputDate
                                        id="date"
                                        required={true}
                                        min={minDate}
                                        bind:value={date} />
                                    <InputTime
                                        id="time"
                                        required={true}
                                        min={minTime}
                                        bind:value={time} />
                                </Layout.GridFraction>
                                <Helper type="neutral">
                                    Your function will be executed on {toLocaleDateTime(
                                        dateTime?.toString()
                                    )}
                                </Helper>
                            </Layout.Stack>
                        {/if}
                    </Layout.Stack>
                </Fieldset>
            {/if}
        </Layout.Stack>
    </Form>
    <svelte:fragment slot="aside">
        <Aside {deployment} proxyRuleList={data.proxyRuleList} />
    </svelte:fragment>

    <svelte:fragment slot="footer">
        <Button fullWidthMobile secondary href={previousPage}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Create
        </Button>
    </svelte:fragment>
</Wizard>
