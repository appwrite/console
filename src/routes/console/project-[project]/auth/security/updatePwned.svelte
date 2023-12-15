<script lang="ts">
    import { Alert, CardGrid, Heading } from '$lib/components';
    import { Button, FormList, InputSwitch } from '$lib/elements/forms';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import { isCloud } from '$lib/system';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';

    let value = false;
</script>

<CardGrid>
    <Heading tag="h6" size="7">Password Pwned</Heading>
    <p class="text">
        Check if your users' password has been compromised in a data breach using the
        <Button href="https://haveibeenpwned.com/API/v3#PwnedPasswords" link external
            >Have I Been Pwned</Button> API.
    </p>
    <svelte:fragment slot="aside">
        {#if isCloud && $organization.billingPlan === 'tier-0'}
            <Alert type="warning">
                <p class="text">
                    You have 234 users with compromised passwords. To view the full list of
                    compromised users, upgrade you plan.
                </p>
                <svelte:fragment slot="buttons">
                    <Button text on:click={() => wizard.start(ChangeOrganizationTierCloud)}>
                        Upgrade plan
                    </Button>
                </svelte:fragment>
            </Alert>
        {:else}
            <div>
                <div class="u-flex u-flex-vertical-mobile u-main-space-between u-gap-16">
                    <ul class="buttons-list">
                        <li class="buttons-list-item">
                            <Button text={true} on:click>Send notification</Button>
                        </li>
                        <li class="buttons-list-item">
                            <Button text={true} on:click>Force password reset</Button>
                        </li>
                    </ul>
                    <Button secondary on:click>
                        <span class="text">View list</span>
                    </Button>
                </div>
                <div class="u-sep-block-start u-padding-block-8 u-margin-block-start-8" />

                <Alert type="info">
                    <p class="text">You have 234 users with compromised passwords.</p>
                </Alert>
                <form class="form u-margin-block-start-24">
                    <FormList>
                        <InputSwitch
                            label="Enable pwned password check"
                            id="pwned-password"
                            bind:value
                            on:change={() => {
                                console.log('w');
                            }}>
                            <svelte:fragment slot="description">
                                <p>
                                    Enable password check using the <a
                                        href="https://haveibeenpwned.com/API/v3#PwnedPasswords"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="link">Have I Been Pwned</a> API.
                                </p>
                            </svelte:fragment>
                        </InputSwitch>
                    </FormList>
                </form>
            </div>
        {/if}
    </svelte:fragment>
    <svelte:fragment slot="actions">
        {#if $organization.billingPlan === 'tier-0'}
            <Button>Update</Button>
        {/if}
    </svelte:fragment>
</CardGrid>
