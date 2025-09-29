<script lang="ts">
    import { page } from '$app/state';
    import { type Snippet } from 'svelte';
    import {
        type AnalyticsResult,
        type DependenciesResult,
        type TerminologyResult,
        useAnalytics,
        useDependencies,
        useTerminology
    } from '$database/(entity)';

    const terminology = $derived(useTerminology(page));
    const analytics = $derived(useAnalytics(terminology));
    const dependencies = $derived(useDependencies(terminology));

    const {
        children
    }: {
        children: Snippet<[AnalyticsResult, DependenciesResult, TerminologyResult]>;
    } = $props();
</script>

{@render children(analytics, dependencies, terminology)}
