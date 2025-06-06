<script lang="ts">
    import { page } from '$app/state';
    import { Modal } from '$lib/components';
    import Card from '$lib/components/card.svelte';
    import { Button, InputSelect } from '$lib/elements/forms';
    import { copy } from '$lib/helpers/copy';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Image, Layout, Tooltip } from '@appwrite.io/pink-svelte';
    import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';

    let {
        show = $bindable(),
        proxyRuleList,
        selectedUrl = ''
    }: {
        show: boolean;
        proxyRuleList: Models.ProxyRuleList;
        selectedUrl?: string;
    } = $props();

    const options = proxyRuleList?.total
        ? proxyRuleList.rules.map((rule) => {
              return {
                  label: rule.domain,
                  value: $regionalProtocol + rule.domain
              };
          })
        : [];

    let url = $state(selectedUrl ? $regionalProtocol + selectedUrl : (options[0]?.value ?? ''));
    let tooltipMessage = $state('Copy');

    function getImage(url: string) {
        return sdk.forProject(page.params.region, page.params.project).avatars.getQR(url, 352);
    }
</script>

<Modal title="Open on mobile" bind:show hideFooter>
    <span slot="description">Open the preview of your site on any mobile or tablet device.</span>
    <Layout.Stack gap="l">
        <Layout.Stack gap="m" direction="row">
            <div style="width: 100%;max-width: 91.5%">
                <InputSelect id="copy" bind:value={url} {options}></InputSelect>
            </div>
            <Tooltip placement="bottom">
                <div>
                    <Button
                        secondary
                        icon
                        on:click={() => {
                            copy(url);
                            tooltipMessage = 'Copied';
                            setTimeout(() => {
                                tooltipMessage = 'Copy';
                            }, 1000);
                        }}>
                        <Icon icon={IconDuplicate}></Icon>
                    </Button>
                </div>
                <svelte:fragment slot="tooltip">{tooltipMessage}</svelte:fragment>
            </Tooltip>
        </Layout.Stack>
        <Card padding="l" radius="l">
            <Layout.Stack justifyContent="center" alignItems="center">
                <Image src={getImage(url)} height={176} width={176} alt="QR code" radius="xxs" />
            </Layout.Stack>
        </Card>
    </Layout.Stack>
</Modal>
