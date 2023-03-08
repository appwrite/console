<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { FormList, InputDomain } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdkForProject } from '$lib/stores/sdk';
    import { func } from '../store';
    import { rule } from './store';

    const createDomain = async () => {
        if ($rule.$id) {
            await sdkForProject.proxy.deleteRule($rule.$id);
        }

        const newRule = await sdkForProject.proxy.createRule($rule.domain, 'function', $func.$id);
        $rule = newRule;
        trackEvent('submit_rule_create');
    };
</script>

<WizardStep beforeSubmit={createDomain}>
    <svelte:fragment slot="title">Add function domain</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Use your self-owned domain as the endpoint of your Appwrite Function.
    </svelte:fragment>

    <FormList>
        <InputDomain
            id="domain"
            label="Custom Domain"
            placeholder="appwrite.example.com"
            autocomplete={false}
            required
            bind:value={$rule.domain} />
    </FormList>
    <div class="common-section ">
        <p>
            You can find a list of domain providers and their DNS setting documentation <a
                class="link"
                href="https://appwrite.io/docs/custom-domains#addCNAME"
                target="_blank"
                rel="noreferrer">here</a
            >. If your domain provider isn't listed, please contact us, and we'll include their
            settings as well.
        </p>
    </div>
</WizardStep>
