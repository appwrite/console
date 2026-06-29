<script lang="ts">
    import { computePosition, flip, offset, shift, autoUpdate } from '@floating-ui/dom';
    import { Icon, ActionMenu } from '@appwrite.io/pink-svelte';
    import {
        IconDotsHorizontal,
        IconPencil,
        IconEyeOff,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import { Button as PinkButton } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';

    let {
        variable,
        onUpdate,
        onSecret,
        onDelete
    }: {
        variable: Partial<Models.Variable>;
        onUpdate: () => void;
        onSecret: () => void;
        onDelete: () => void;
    } = $props();

    let open = $state(false);
    let triggerEl = $state<HTMLElement | null>(null);
    let menuEl = $state<HTMLElement | null>(null);
    let cleanup: (() => void) | null = null;

    function hide() {
        open = false;
    }

    function toggle() {
        open = !open;
    }

    function portalToBody(node: HTMLElement) {
        document.body.appendChild(node);
        return {
            destroy() {
                node.parentNode?.removeChild(node);
            }
        };
    }

    $effect(() => {
        if (open && triggerEl && menuEl) {
            cleanup = autoUpdate(triggerEl, menuEl, () => {
                computePosition(triggerEl, menuEl, {
                    placement: 'bottom-end',
                    middleware: [offset(2), flip(), shift()]
                }).then(({ x, y }) => {
                    if (menuEl) {
                        Object.assign(menuEl.style, { left: `${x}px`, top: `${y}px` });
                    }
                });
            });
        } else {
            cleanup?.();
            cleanup = null;
        }
    });

    function handleWindowClick(e: MouseEvent) {
        if (!open) return;
        const target = e.target as Node;
        if (triggerEl?.contains(target) || menuEl?.contains(target)) return;
        hide();
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') hide();
    }
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} />

<span bind:this={triggerEl}>
    <PinkButton.Button
        icon
        variant="text"
        size="s"
        aria-label="More options"
        onclick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle();
        }}>
        <Icon icon={IconDotsHorizontal} size="s" />
    </PinkButton.Button>
</span>

{#if open}
    <div
        use:portalToBody
        bind:this={menuEl}
        style="position: fixed; z-index: 9001; background: var(--bgcolor-neutral-primary); border: var(--border-width-s) solid var(--border-neutral); border-radius: var(--border-radius-m); box-shadow: 0 1px 3px 0 rgba(0,0,0,0.03), 0 4px 4px 0 rgba(0,0,0,0.04); overflow: hidden;"
        role="menu">
        <ActionMenu.Root>
            {#if !variable?.secret}
                <ActionMenu.Item.Button
                    leadingIcon={IconPencil}
                    on:click={() => {
                        hide();
                        onUpdate();
                    }}>
                    Update
                </ActionMenu.Item.Button>
            {/if}
            {#if !variable?.secret}
                <ActionMenu.Item.Button
                    leadingIcon={IconEyeOff}
                    on:click={() => {
                        hide();
                        onSecret();
                    }}>
                    Secret
                </ActionMenu.Item.Button>
            {/if}
            <ActionMenu.Item.Button
                status="danger"
                leadingIcon={IconTrash}
                on:click={() => {
                    hide();
                    onDelete();
                }}>
                Delete
            </ActionMenu.Item.Button>
        </ActionMenu.Root>
    </div>
{/if}
