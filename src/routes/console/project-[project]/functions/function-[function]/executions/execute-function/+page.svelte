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
        InputText,
        InputTextarea,
        InputTime
    } from '$lib/elements/forms';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import {
        WizardSecondaryContainer,
        WizardSecondaryContent,
        WizardSecondaryFooter,
        WizardSecondaryHeader
    } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { ExecutionMethod, type Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import DeploymentSource from '../../deploymentSource.svelte';
    import DeploymentDomains from '../../deploymentDomains.svelte';
    import { proxyRuleList } from '../../store';
    import DeploymentCreatedBy from '../../deploymentCreatedBy.svelte';
    import {
        isSameDay,
        toLocaleDateISO,
        toLocaleDateTime,
        toLocaleTimeISO
    } from '$lib/helpers/date';

    let previousPage: string = `${base}/console`;

    afterNavigate(({ from }) => {
        previousPage = from?.url?.pathname || previousPage;
    });

    export let data;

    const func = data.function as Models.Function;
    const deployment = data.activeDeployment as Models.Deployment;

    const keyList = [
        { label: 'Authorization', value: 'Authorization' },
        { label: 'Cache-Control', value: 'Cache-Control' },
        { label: 'Content-Length', value: 'Content-Length' },
        { label: 'Content-Type', value: 'Content-Type' },
        { label: 'User-Agent', value: 'User-Agent' },
        { label: 'X-Appwrite-Project', value: 'X-Appwrite-Project' },
        { label: 'X-Appwrite-Key', value: 'X-Appwrite-Key' },
        { label: 'X-Appwrite-JWT', value: 'X-Appwrite-JWT' },
        { label: 'X-Appwrite-Response-Format', value: 'X-Appwrite-Response-Format' },
        { label: 'X-Fallback-Cookies', value: 'X-Fallback-Cookies' }
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

            await sdk.forProject.functions.createExecution(
                func.$id,
                body,
                true,
                path,
                method,
                headersObject,
                isScheduled ? dateTime.toString() : undefined
            );
            await goto(
                `${base}/console/project-${$page.params.project}/functions/function-${func.$id}/executions`
            );
            invalidate(Dependencies.EXECUTIONS);
            close();
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
    let time: string = toLocaleTimeISO(now.getTime());
    $: minDate = toLocaleDateISO(now.getTime());
    $: minTime = isSameDay(new Date(date), new Date(minDate))
        ? toLocaleTimeISO(now.getTime())
        : '00:00';
    $: dateTime = new Date(`${date}T${time}`);
</script>

<svelte:head>
    <title>Execute function - Appwrite</title>
</svelte:head>

<WizardSecondaryContainer>
    <WizardSecondaryHeader href={previousPage}>Execute function</WizardSecondaryHeader>
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
                                        <InputSelect
                                            isMultiple
                                            fullWidth
                                            label="Key"
                                            placeholder="Select key"
                                            options={keyList}
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
                <ul class="u-flex u-main-space-between">
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
                        <p class="u-color-text-offline">Size</p>
                        <p>
                            {humanFileSize(deployment.size).value +
                                humanFileSize(deployment.size).unit}
                        </p>
                    </li>
                </ul>
                <div class="u-flex-vertical u-gap-8">
                    <p class="u-color-text-offline">Source</p>
                    <span>
                        <DeploymentSource {deployment} />
                    </span>
                </div>
                <div class="u-flex-vertical u-gap-8">
                    <p class="u-color-text-offline">Domains</p>
                    <span>
                        <DeploymentDomains domain={$proxyRuleList} />
                    </span>
                </div>
                <div class="u-flex-vertical u-gap-8">
                    <p class="u-color-text-offline">Updated</p>
                    <span>
                        <DeploymentCreatedBy {deployment} />
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
