<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import {
        readImpersonationTargetUserId,
        readTargetSnapshot,
        readOperatorSnapshot,
        stopImpersonation,
        impersonationRevision
    } from '$lib/appwrite/impersonation';
    import { user } from '$lib/stores/user';

    // Re-read sessionStorage whenever the revision bumps (start/stop) or $user changes
    // (account invalidated after impersonation). Without this the plain function calls
    // only execute once on mount and show stale data from previous sessions.
    let targetSnapshot = readTargetSnapshot();
    let operatorSnapshot = readOperatorSnapshot();
    let targetId = readImpersonationTargetUserId();
    $: {
        void $impersonationRevision;
        void $user;
        targetSnapshot = readTargetSnapshot();
        operatorSnapshot = readOperatorSnapshot();
        targetId = readImpersonationTargetUserId();
    }

    $: isImpersonating = !!$user?.impersonatorUserId || !!targetId;

    // Effective user: always from the stored target snapshot (written at pick-time from
    // the search result, so it's always the correct selected user identity).
    $: effectiveLabel = targetSnapshot
        ? targetSnapshot.name || targetSnapshot.email || targetSnapshot.$id
        : $user?.impersonatorUserId
          ? $user?.name || $user?.email || $user?.$id
          : (targetId ?? 'unknown');

    // Operator: always from the stored operator snapshot (written at pick-time from $user,
    // which is the real operator session before the header is applied).
    $: operatorLabel = operatorSnapshot
        ? operatorSnapshot.name || operatorSnapshot.email || operatorSnapshot.$id
        : ($user?.impersonatorUserId ?? 'operator');

    async function exit() {
        stopImpersonation();
        await invalidate(Dependencies.ACCOUNT);
        await invalidate(Dependencies.ORGANIZATIONS);
        await goto(base);
    }
</script>

{#if isImpersonating}
    <HeaderAlert type="warning" title="Impersonation active">
        <svelte:fragment>
            You are operating as <b>{effectiveLabel}</b> on behalf of operator
            <b>{operatorLabel}</b>.
        </svelte:fragment>
        <svelte:fragment slot="buttons">
            <Button secondary on:click={exit}>Exit impersonation</Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
