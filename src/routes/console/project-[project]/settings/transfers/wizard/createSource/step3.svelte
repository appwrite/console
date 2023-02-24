<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { WizardStep } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { createSource } from '../store';
    import {
        TableBody,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import Pill from '$lib/elements/pill.svelte';
    import Card from '$lib/components/card.svelte';
    import Heading from '$lib/components/heading.svelte';
    import Output from '$lib/components/output.svelte';

    const permissions = ['Users', 'Databases', 'Documents', 'Files', 'Functions'];
    let returnedPermissions = permissions;
    let isChecking = false;
    let errorMessage = null;
    let canProgress = false;

    async function validate() {
        isChecking = true;
        errorMessage = null;
        canProgress = false;

        try {
            switch ($createSource.type) {
                case 'appwrite':
                    await sdkForProject.transfers.validateAppwriteSource(
                        $createSource.data['project'],
                        $createSource.data['endpoint'],
                        $createSource.data['key']
                    );
                    break;
                case 'supabase':
                    await sdkForProject.transfers.validateSupabaseSource(
                        $createSource.data['host'],
                        $createSource.data['password'],
                        $createSource.data['database'],
                        $createSource.data['username'],
                        parseInt($createSource.data['port'])
                    );
                    break;
                case 'nhost':
                    await sdkForProject.transfers.validateNhostSource(
                        $createSource.data['host'],
                        $createSource.data['password'],
                        $createSource.data['database'],
                        $createSource.data['username'],
                        parseInt($createSource.data['port'])
                    );
                    break;
                case 'firebase':
                    await sdkForProject.transfers.validateFirebaseSource(
                        $createSource.data['account-credentials']
                    );
                    break;
            }

            //TODO: Update this to use the response from the API

            returnedPermissions = permissions;
            isChecking = false;
            canProgress = true;
            addNotification({
                message: `Source is valid`,
                type: 'success'
            });
            trackEvent(Submit.SourceValidate, {
                customId: !!$createSource.id
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.SourceValidate);
            errorMessage = error.message;
            console.error(error);
            returnedPermissions = [];
            isChecking = false;
            canProgress = false;
        }
    }

    onMount(async () => {
        validate();
    });
</script>

<WizardStep>
    <svelte:fragment slot="title">Validation</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >Please wait while we perform valdiation checks.</svelte:fragment>
    <input class="u-hide" type="checkbox" name="isVerified" required bind:checked={canProgress} />
    <div>
        <TableScroll>
            <TableHeader>
                <TableCellHead width={150}>Permission</TableCellHead>
                <TableCellHead width={60}>Status</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each permissions as permission}
                    <TableRow>
                        <TableCellText title="Permission">
                            {permission}
                        </TableCellText>
                        <TableCellText title="Permission Level">
                            <Pill
                                danger={!returnedPermissions.includes(permission)}
                                success={returnedPermissions.includes(permission)}
                                warning={isChecking}>
                                {#if returnedPermissions.includes(permission) && !isChecking}
                                    <span class="icon-check-circle" aria-hidden="true" />
                                {:else if isChecking}
                                    <span class="icon-question-mark-circle" aria-hidden="true" />
                                {:else}
                                    <span class="icon-x-circle" aria-hidden="true" />
                                {/if}
                            </Pill>
                        </TableCellText>
                    </TableRow>
                {/each}
            </TableBody>
        </TableScroll>

        {#if errorMessage}
            <Card danger>
                <div class="u-gap-16">
                    <Heading tag="h6" size="7">Validation Failed</Heading>
                </div>

                <p>
                    There were errors when validating this source. Please go back and fix the errors
                    then run the checks again.
                </p>

                <br />

                <div class="u-flex u-gap-16 u-cross-center card">
                    <Output value={errorMessage}>{errorMessage}</Output>
                </div>
            </Card>
        {/if}
    </div>
</WizardStep>
