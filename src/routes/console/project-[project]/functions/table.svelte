<script lang="ts">
    // import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    // import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Id /*Modal*/ } from '$lib/components';
    import FloatingActionBar from '$lib/components/floatingActionBar.svelte';
    // import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellHeadCheck,
        TableCellText,
        TableHeader,
        TableRowLink,
        TableScroll,
        TableCellCheck
    } from '$lib/elements/table';
    // import { addNotification } from '$lib/stores/notifications';
    // import { sdk } from '$lib/stores/sdk';
    import type { PageData } from './$types';
    import { columns } from './store';

    export let data: PageData;

    const project = $page.params.project;

    let selected: string[] = [];
    let showDelete: boolean;
    // let deleting = false;
</script>

<TableScroll>
    <TableHeader>
        <TableCellHeadCheck
            bind:selected
            pageItemsIds={data.functions.functions.map((c) => c.$id)} />
        {#each $columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.title}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
      {#each data.functions.functions as fn}
          <TableRowLink href={`${base}/console/project-${project}/functions/function-${fn.$id}`}>
              <TableCellCheck bind:selectedIds={selected} id={fn.$id} />
              {#each $columns as column}
                  {#if column.show}
                      {#if column.id === '$id'}
                          {#key $columns}
                              <TableCell width={column.width} title={column.title}>
                                  <Id value={fn.$id}>
                                      {fn.$id}
                                  </Id>
                              </TableCell>
                          {/key}
                      {:else}
                          <TableCellText width={column.width} title={column.title}>
                              {#if column.transform}
                                  {column.transform(fn[column.id])}
                              {:else}
                                  {fn[column.id]}
                              {/if}
                          </TableCellText>
                      {/if}
                  {/if}
              {/each}
          </TableRowLink>
      {/each}
    </TableBody>
</TableScroll>

<FloatingActionBar show={selected.length > 0}>
    <div class="u-flex u-cross-center u-main-space-between actions">
        <div class="u-flex u-cross-center u-gap-8">
            <span class="indicator body-text-2 u-bold">{selected.length}</span>
            <p>
                <span class="is-only-desktop">
                    {selected.length > 1 ? 'functions' : 'function'}
                </span>
                selected
            </p>
        </div>

        <div class="u-flex u-cross-center u-gap-8">
            <Button text on:click={() => (selected = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>
                <p>Delete</p>
            </Button>
        </div>
    </div>
</FloatingActionBar>

<style lang="scss">
    .actions {
        .indicator {
            border-radius: 0.25rem;
            background: hsl(var(--color-information-100));
            color: hsl(var(--color-neutral-0));

            padding: 0rem 0.375rem;
            display: inline-block;
        }
    }
</style>
