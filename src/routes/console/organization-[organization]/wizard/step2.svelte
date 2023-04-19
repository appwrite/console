<script lang="ts">
    import { LabelCard } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { createProject } from './store';

    const regions = [
        { name: 'eu-central-1', label: 'EU (Frankfurt)', flag: 'de', disabled: false },
        { name: 'eu-west-1', label: 'EU (Ireland)', flag: 'ie', disabled: true },
        { name: 'eu-west-2', label: 'EU (London)', flag: 'gb', disabled: true },
        { name: 'eu-west-3', label: 'EU (Paris)', flag: 'fr', disabled: true },
        { name: 'eu-north-1', label: 'EU (Stockholm)', flag: 'se', disabled: true },
        { name: 'eu-south-1', label: 'EU (Milan)', flag: 'it', disabled: true },
        { name: 'us-east-1', label: 'US (Virginia)', flag: 'us', disabled: true },
        { name: 'us-east-2', label: 'US (Ohio)', flag: 'us', disabled: true },
        { name: 'us-west-1', label: 'US (N. California)', flag: 'us', disabled: true },
        { name: 'us-west-2', label: 'US (Oregon)', flag: 'us', disabled: true },
        { name: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)', flag: 'jp', disabled: true },
        { name: 'ap-northeast-2', label: 'Asia Pacific (Seoul)', flag: 'kr', disabled: true },
        { name: 'ap-northeast-3', label: 'Asia Pacific (Osaka-Local)', flag: 'jp', disabled: true },
        { name: 'ap-southeast-1', label: 'Asia Pacific (Singapore)', flag: 'sg', disabled: true },
        { name: 'ap-southeast-2', label: 'Asia Pacific (Sydney)', flag: 'au', disabled: true },
        { name: 'ap-south-1', label: 'Asia Pacific (Mumbai)', flag: 'in', disabled: true },
        { name: 'ca-central-1', label: 'Canada (Central)', flag: 'ca', disabled: true }
    ];

    function getFlag(country: string) {
        let flag = sdk.forProject.avatars.getFlag(country, 80, 60)?.toString();
        flag?.includes('&project=')
            ? (flag = flag.replace('&project=', '&mode=admin'))
            : flag + '&mode=admin';
        return flag;
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Select region</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Choose a deployment region for your project. This region cannot be changed.
    </svelte:fragment>

    <ul
        class="grid-box u-margin-block-start-16"
        style="--p-grid-item-size:12em; --p-grid-item-size-small-screens:12rem; --grid-gap: 1rem;">
        {#each regions as region}
            <li>
                <LabelCard
                    name="region"
                    bind:group={$createProject.region}
                    value={region.name}
                    disabled={region.disabled}>
                    <svelte:fragment slot="custom">
                        <div
                            class="u-flex u-flex-vertical u-gap-12 u-justify-main-center u-cross-center u-margin-inline-auto">
                            {#if region.disabled}
                                <img
                                    src={getFlag(region.flag)}
                                    alt={region.name}
                                    width="40"
                                    height="30" />
                                {region.label}
                                <Pill button>
                                    <span class="icon-bell" aria-hidden="true" />
                                    <span class="text">Notify me</span>
                                </Pill>
                            {:else}
                                <img
                                    src={getFlag(region.flag)}
                                    alt={region.name}
                                    width="40"
                                    height="30" />
                                {region.label}
                            {/if}
                        </div>
                    </svelte:fragment>
                </LabelCard>
            </li>
        {/each}
    </ul>

    <p class="text u-margin-block-start-16">
        Edge Network is enabled on all regions. For more details, check out our <a
            class="link"
            href="http://#"
            target="_blank"
            rel="noopener noreferrer">Documentation</a
        >.
    </p>
</WizardStep>
