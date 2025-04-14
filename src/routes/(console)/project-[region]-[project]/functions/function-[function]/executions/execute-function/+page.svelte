<script lang="ts">
    import { afterNavigate, goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { timer } from '$lib/actions/timer';
    import { tooltip } from '$lib/actions/tooltip';
    import { Alert, Card, Id } from '$lib/components';

    import { Dependencies } from '$lib/constants';
    import { Pill } from '$lib/elements';
    import {
        Button,
        Form,
        FormItem,
        FormItemPart,
        FormList,
        Helper,
        InputDate,
        InputSelect,
        InputSelectSearch,
        InputText,
        InputTextarea,
        InputTime
    } from '$lib/elements/forms';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter
    } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ExecutionMethod, type Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import DeploymentSource from '../../deploymentSource.svelte';
    import DeploymentDomains from '../../deploymentDomains.svelte';
    import { proxyRuleList } from '../../store';
    import DeploymentBy from '../../deploymentBy.svelte';
    import {
        isSameDay,
        toLocaleDateISO,
        toLocaleDateTime,
        toLocaleTimeISO
    } from '$lib/helpers/date';
    import { last } from '$lib/helpers/array';

    let previousPage: string = `${base}/project-${$page.params.region}-${$page.params.project}/functions/function-${$page.params.function}/executions`;

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
                .forProject($page.params.region, $page.params.project)
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
                `${base}/project-${$page.params.region}-${$page.params.project}/functions/function-${func.$id}/executions`
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
    <title>Execute function - Appwrite</title>
</svelte:head>

<WizardSecondaryContainer href={previousPage}>
    <svelte:fragment slot="title">Execute Function</svelte:fragment>
    <WizardSecondaryContent>
        <Form bind:this={formComponent} onSubmit={handleSubmit} bind:isSubmitting>
            <FormList>
                {#if func?.version === 'v2'}
                    <Alert type="info">
                        <svelte:fragment slot="title">
                            Customizable execution data now available for functions v3.0
                        </svelte:fragment>
                        Update your function version to make use of new features including customizable
                        HTTP data in your executions.
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
                        placeholder={`Hello, World!`}
                        id="body"
                        bind:value={body} />
                {:else}
                    <FormItem isMultiple stackOnMobile style="gap: 1rem">
                        <InputSelect
                            required
                            id="method"
                            label="Method"
                            options={methodOptions}
                            bind:value={method} />
                        <InputText
                            label="Path"
                            id="path"
                            fullWidth
                            placeholder="/"
                            bind:value={path}
                            required />
                    </FormItem>
                    <div>
                        <h3>
                            <span class="body-text-2 u-bold">Headers</span>
                            <span class="optional">(optional)</span>
                            <span
                                use:tooltip={{
                                    content:
                                        'Headers should contain alphanumeric characters (a-z, A-Z, and 0-9) and hyphens only (- and _).'
                                }}
                                class="icon-info"></span>
                        </h3>

                        <FormList class="u-gap-8 u-margin-block-start-8">
                            {#if headers}
                                {#each headers as [name, value], index}
                                    <FormItem isMultiple style="gap: 1rem">
                                        <InputSelectSearch
                                            fullWidth
                                            label="Key"
                                            placeholder="Select key"
                                            interactiveOutput
                                            hideEmpty
                                            options={filteredKeyList}
                                            id={`key-${index}`}
                                            bind:value={name}
                                            bind:search={name}>
                                        </InputSelectSearch>
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
                            disabled={headers?.length && headers[headers.length - 1][0]
                                ? false
                                : true}
                            on:click={() => {
                                if (headers[headers.length - 1][0]) {
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
                        placeholder={`Hello, World!`}
                        id="body"
                        bind:value={body} />

                    <li>
                        <InputSelect
                            bind:value={isScheduled}
                            id="schedule"
                            label="Schedule"
                            options={[
                                {
                                    label: 'Now',
                                    value: null
                                },
                                {
                                    label: 'Schedule',
                                    value: true
                                }
                            ]} />
                        {#if isScheduled}
                            <FormItem isMultiple tag="div" class="u-margin-block-start-16">
                                <InputDate
                                    id="date"
                                    label="Date"
                                    required={true}
                                    min={minDate}
                                    bind:value={date}
                                    isMultiple
                                    fullWidth />
                                <InputTime
                                    id="time"
                                    label="Time"
                                    required={true}
                                    min={minTime}
                                    bind:value={time}
                                    isMultiple
                                    fullWidth />
                            </FormItem>
                        {/if}
                        <Helper type="neutral">
                            {isScheduled
                                ? `Your function will be executed on ${toLocaleDateTime(dateTime?.toString())}`
                                : 'Your function will be executed immediately'}
                        </Helper>
                    </li>
                {/if}
            </FormList>
        </Form>
        <svelte:fragment slot="aside">
            <Card class="u-flex-vertical u-gap-24" style="--p-card-padding: 1.5rem">
                <div class="u-flex-vertical u-gap-8">
                    <p class="u-color-text-offline">Deployment ID</p>

                    <Id value={func.deployment}>
                        {func.deployment}
                    </Id>
                </div>
                <ul
                    class="u-grid u-width-full-line u-gap-16"
                    style:grid-template-columns="repeat(3, 1fr)">
                    <li class="u-flex-vertical u-gap-8">
                        <p class="u-color-text-offline">Status</p>
                        <p>
                            <Pill success>
                                <span class="icon-lightning-bolt"></span><span>active</span>
                            </Pill>
                            <!-- {#if deployment?.$id === func.deployment && deployment?.status === 'active'}
                             {:else}
                                <Pill
                                    danger={deployment?.status === 'failed'}
                                    warning={deployment?.status === 'building'}
                                    info={deployment?.status === 'ready'}>
                                    {deployment?.status}
                                </Pill>
                            {/if} -->
                        </p>
                    </li>
                    <li class="u-flex-vertical u-gap-8">
                        <p class="u-color-text-offline">Build time</p>
                        <p>
                            {#if ['processing', 'building'].includes(deployment.status)}
                                <span use:timer={{ start: deployment.$createdAt }} />
                            {:else}
                                {calculateTime(deployment.buildTime)}
                            {/if}
                        </p>
                    </li>
                    <li class="u-flex-vertical u-gap-8">
                        <p class="u-color-text-offline">Total size</p>
                        <p>
                            {humanFileSize(deployment.size + deployment.buildSize).value +
                                humanFileSize(deployment.size + deployment.buildSize).unit}
                            <button
                                type="button"
                                on:click|preventDefault
                                class="tooltip"
                                aria-label="input tooltip"
                                use:tooltip={{
                                    content: `
                                <p><b>Deployment size:</b> ${
                                    humanFileSize(deployment.size).value +
                                    humanFileSize(deployment.size).unit
                                }</p>
                                <p><b>Build size:</b> ${
                                    humanFileSize(deployment.buildSize).value +
                                    humanFileSize(deployment.buildSize).unit
                                }</p>
                            `,
                                    allowHTML: true,
                                    appendTo: 'parent'
                                }}>
                                <span
                                    class="icon-info"
                                    aria-hidden="true"
                                    style="font-size: var(--icon-size-small)" />
                            </button>
                        </p>
                    </li>
                </ul>
                <div class="u-flex-vertical u-gap-8">
                    <p class="u-color-text-offline">Source</p>
                    <span>
                        <DeploymentSource {deployment} />
                    </span>
                </div>
                {#if $proxyRuleList?.rules?.length}
                    <div class="u-flex-vertical u-gap-8">
                        <p class="u-color-text-offline">Domains</p>
                        <span>
                            <DeploymentDomains domain={$proxyRuleList} />
                        </span>
                    </div>
                {/if}
                <div class="u-flex-vertical u-gap-8">
                    <p class="u-color-text-offline">Updated</p>
                    <span>
                        <DeploymentBy {deployment} type="update" />
                    </span>
                </div>
            </Card>
        </svelte:fragment>
    </WizardSecondaryContent>

    <WizardSecondaryFooter>
        <Button fullWidthMobile secondary href={previousPage}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Execute
        </Button>
    </WizardSecondaryFooter>
</WizardSecondaryContainer>
