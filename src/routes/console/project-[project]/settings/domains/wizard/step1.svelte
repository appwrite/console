<script lang="ts">
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { FormList, InputDomain } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../../store';
    import { domain } from './store';
    import LL from '$i18n/i18n-svelte';

    const projectId = $project.$id;
    const createDomain = async () => {
        if ($domain.$id) {
            await sdk.forConsole.projects.deleteDomain(projectId, $domain.$id);
        }

        const { $id } = await sdk.forConsole.projects.createDomain(projectId, $domain.domain);
        $domain.$id = $id;
        trackEvent(Submit.DomainCreate);
    };
</script>

<WizardStep beforeSubmit={createDomain}>
    <svelte:fragment slot="title"
        >{$LL.console.project.title.wizards.addYourDomain()}</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {$LL.console.project.title.wizards.subTitle()}
    </svelte:fragment>

    <FormList>
        <InputDomain
            id="domain"
            label={$LL.console.project.forms.settings.domain.inputs.domain.label()}
            placeholder={$LL.console.project.forms.settings.domain.inputs.domain.project()}
            autocomplete={false}
            required
            bind:value={$domain.domain} />
    </FormList>
    <div class="common-section">
        <p>
            {$LL.console.project.texts.consoleSettings.dnsDoc()}
            <a
                class="link"
                href="https://appwrite.io/docs/custom-domains#addCNAME"
                target="_blank"
                rel="noreferrer">here</a
            >. {$LL.console.project.texts.consoleSettings.domainProvider()}
        </p>
    </div>
</WizardStep>
