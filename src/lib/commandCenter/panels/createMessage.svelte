<script lang="ts">
    import { providers } from '$routes/(console)/project-[region]-[project]/messaging/providers/store';
    import {
        messageParams,
        providerType,
        targetsById
    } from '$routes/(console)/project-[region]-[project]/messaging/wizard/store';
    import { MessagingProviderType } from '@appwrite.io/console';
    import Template from './template.svelte';
    import { wizard } from '$lib/stores/wizard';
    import Create from '$routes/(console)/project-[region]-[project]/messaging/create.svelte';
    import { topicsById } from '$routes/(console)/project-[region]-[project]/messaging/store';

    let search = '';

    let options = Object.entries(providers).map(([type, option]) => {
        return {
            label: option.name,
            icon: option.icon,
            callback() {
                if (
                    type !== MessagingProviderType.Email &&
                    type !== MessagingProviderType.Sms &&
                    type !== MessagingProviderType.Push
                )
                    return;
                $providerType = type;
                $topicsById = {};
                $targetsById = {};
                const common = {
                    topics: [],
                    users: [],
                    targets: []
                };
                switch (type) {
                    case MessagingProviderType.Email:
                        $messageParams[$providerType] = {
                            ...common,
                            subject: '',
                            content: ''
                        };
                        break;
                    case MessagingProviderType.Sms:
                        $messageParams[$providerType] = {
                            ...common,
                            content: ''
                        };
                        break;
                    case MessagingProviderType.Push:
                        $messageParams[$providerType] = {
                            ...common,
                            title: '',
                            body: '',
                            data: [['', '']]
                        };
                        break;
                }
                wizard.start(Create);
            }
        };
    });

    $: filteredOptions = options.filter((option) => {
        return option.label.toLowerCase().includes(search.toLowerCase());
    });
</script>

<Template options={filteredOptions} bind:search>
    <div class="u-flex u-cross-center u-gap-8" slot="option" let:option>
        <i class="icon-{option.icon}"></i>
        <span>{option.label}</span>
    </div>
</Template>
