<script lang="ts">
    import { FormList, InputDomain } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../../store';
    import { domain } from './store';
    import { domainList } from '../store';

    // Handle if user goes back to this step to update
    // the domain name after creating the domain
    const originalDomainName = $domain.name;
    const originalDomainId = $domain.id;
    const unsubscribe = domain.subscribe((newDomain) => {
        if (
            originalDomainName !== '' &&
            newDomain.id !== '' &&
            newDomain.name !== originalDomainName
        ) {
            $domain.id = '';
        }
    });

    const projectId = $project.$id;
    const createDomain = async () => {
        unsubscribe();
        if ($domain.name !== originalDomainName && originalDomainId) {
            await sdkForConsole.projects.deleteDomain(projectId, originalDomainId);
        }

        if ($domain.id == '') {
            const newDomain = await sdkForConsole.projects.createDomain(projectId, $domain.name);
            domainList.load(projectId);
            $domain.id = newDomain.$id;
        }
    };
</script>

<WizardStep beforeSubmit={createDomain}>
    <svelte:fragment slot="title">Add your domain</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Use your self-owned domain as the endpoint of your Appwrite API.
    </svelte:fragment>

    <FormList>
        <InputDomain
            id="domain"
            label="Custom Domain"
            placeholder="appwrite.example.com"
            autocomplete={false}
            required
            bind:value={$domain.name} />
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
