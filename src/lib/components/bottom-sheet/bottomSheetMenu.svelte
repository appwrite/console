<script lang="ts">
    import SheetMenuBlock from './SheetMenuBlock.svelte';
    import { BottomSheet } from '@appwrite.io/pink-svelte';
    import type { $$Props, SheetMenu } from '$lib/components/bottom-sheet/index';

    export let menu: $$Props['menu'];
    export let isOpen: $$Props['isOpen'] = false;
    let sheetContainerRef: $$Props['sheetContainerRef'];
    let activeMenu = menu;
    let showDivider = true;
    let previousMenu = activeMenu;

    function navigateSubMenu(subMenu: SheetMenu) {
        previousMenu = activeMenu;
        if (sheetContainerRef) {
            const currentHeight = sheetContainerRef.offsetHeight;
            sheetContainerRef.style.overflowY = 'hidden';
            sheetContainerRef.style.maxHeight = `${currentHeight}px`;
            activeMenu = subMenu;
            requestAnimationFrame(() => {
                if (sheetContainerRef) {
                    const newHeight = sheetContainerRef.scrollHeight;
                    sheetContainerRef.style.maxHeight = `${newHeight + 5}px`;
                }
            });
        } else {
            activeMenu = subMenu;
        }
        showDivider = activeMenu.bottom !== undefined;
    }

    function navigatePreviousMenu() {
        activeMenu = previousMenu;
        showDivider = activeMenu.bottom !== undefined;
    }

    function restoreMenu(isOpenState: boolean) {
        showDivider = activeMenu.bottom !== undefined;
        if (!isOpenState) {
            setTimeout(() => {
                activeMenu = menu;
            }, 400);
        }
    }

    $: restoreMenu(isOpen);
</script>

<BottomSheet.Default bind:isOpen useSlots={true} bind:sheetContainerRef bind:showDivider>
    <div slot="top">
        <SheetMenuBlock
            menu={activeMenu.top}
            {navigateSubMenu}
            {navigatePreviousMenu}
            bind:isOpen />
    </div>
    <div slot="bottom">
        {#if activeMenu.bottom}
            <SheetMenuBlock
                menu={activeMenu.bottom}
                {navigateSubMenu}
                {navigatePreviousMenu}
                bind:isOpen />
        {/if}
    </div>
</BottomSheet.Default>
