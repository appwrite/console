<script lang="ts">
    export let direction: 'up' | 'down' | 'left' | 'right' = 'right';
    $: angle = {
        down: 0,
        left: 90,
        up: 180,
        right: 270
    }[direction];
</script>

<svg
    width="16"
    height="17"
    viewBox="0 0 16 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style:transform="rotate({angle}deg)">
    <path
        d="M7.64645 15.8622C7.84171 16.0574 8.15829 16.0574 8.35355 15.8622L11.5355 12.6802C11.7308 12.4849 11.7308 12.1683 11.5355 11.9731C11.3403 11.7778 11.0237 11.7778 10.8284 11.9731L8 14.8015L5.17157 11.9731C4.97631 11.7778 4.65973 11.7778 4.46447 11.9731C4.2692 12.1683 4.2692 12.4849 4.46447 12.6802L7.64645 15.8622ZM7.5 1V15.5086H8.5V1H7.5Z"
        fill="#C4C6D7" />
</svg>
