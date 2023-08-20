<script lang="ts">
    export let radius: keyof typeof radiuses = 'small';
    export let padding = 24;
    let classes: string = '';
    export { classes as class };

    enum radiuses {
        xsmall = '--border-radius-extra-large',
        small = '--border-radius-small',
        medium = '--border-radius-medium',
        large = '--border-radius-large'
    }
</script>

<div
    class="box {classes}"
    style:--box-border-radius={`var(${radiuses[radius]})`}
    style:--box-padding={`${padding / 16}rem`}>
    <slot />
</div>
