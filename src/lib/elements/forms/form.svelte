<form class="form common-section" on:invalid={(e) => console.log(e)} on:submit|preventDefault>
    <slot />
</form>
