<script lang="ts">
    import { base } from '$app/paths';
    import { getApexDomain } from '$lib/helpers/tlds';
    import { isCloud } from '$lib/system';
    import { IconDocumentText } from '@appwrite.io/pink-icons-svelte';
    import { ActionMenu } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';

    interface Props {
        rule: Models.ProxyRule;
        organizationDomains?: Models.DomainsList;
    }

    let { rule, organizationDomains }: Props = $props();

    const dnsData = $derived.by(() => {
        if (!isCloud || !organizationDomains) {
            return null;
        }

        const apexDomain = getApexDomain(rule.domain);
        if (!apexDomain) return null;

        const domain = organizationDomains.domains.find(
            (d: Models.Domain) => d.domain === apexDomain
        );
        if (!domain) return null;

        return `${base}/organization-${domain.teamId}/domains/domain-${domain.$id}`;
    });
</script>

{#if dnsData}
    <ActionMenu.Item.Anchor leadingIcon={IconDocumentText} href={dnsData}>
        DNS records
    </ActionMenu.Item.Anchor>
{/if}
