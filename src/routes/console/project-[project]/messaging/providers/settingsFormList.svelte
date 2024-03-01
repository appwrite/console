<script lang="ts">
    import { FormItem, FormList } from '$lib/elements/forms';
    import SettingsFormInput from './settingsFormInput.svelte';
    import type {
        ProviderInput,
        TwilioProviderParams,
        Msg91ProviderParams,
        TelesignProviderParams,
        TextmagicProviderParams,
        VonageProviderParams,
        MailgunProviderParams,
        SendgridProviderParams,
        SMTPProviderParams,
        FCMProviderParams,
        APNSProviderParams
    } from './store';

    export let files: Record<string, FileList>;
    export let inputs: (ProviderInput | ProviderInput[])[];
    export let params: Partial<
        | TwilioProviderParams
        | Msg91ProviderParams
        | TelesignProviderParams
        | TextmagicProviderParams
        | VonageProviderParams
        | MailgunProviderParams
        | SendgridProviderParams
        | SMTPProviderParams
        | FCMProviderParams
        | APNSProviderParams
    >;
</script>

<FormList>
    {#each inputs as input}
        {#if Array.isArray(input)}
            <FormItem isMultiple>
                {#each input as i}
                    <div class="u-flex u-flex-basis-50-percent">
                        <SettingsFormInput input={i} bind:params bind:files fullWidth />
                    </div>
                {/each}
            </FormItem>
        {:else}
            <SettingsFormInput {input} bind:params bind:files />
        {/if}
    {/each}
</FormList>
