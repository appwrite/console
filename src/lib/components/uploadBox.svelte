<script lang="ts">
	export let show = false;
	export let collapsed = false;
</script>

{#if show}
	<section class="upload-box">
		<header class="upload-box-header">
			<h4 class="upload-box-title">
				<span class="text">Uploading files</span>
				<span class="amount">3</span>
			</h4>
			<button
				class="icon-button"
				class:is-open={collapsed}
				aria-label="toggle upload box"
				on:click={() => (collapsed = !collapsed)}
			>
				<span class="icon-up-dir" aria-hidden="true" />
			</button>
			<button class="icon-button" aria-label="close upload box">
				<span class="icon-cancel" aria-hidden="true" />
			</button>
		</header>
		<div class="upload-box-content" class:is-open={collapsed}>
			<ul class="upload-box-list">
				<li class="upload-box-item">
					<div class="upload-image u-margin-inline-end-16">
						<div
							class="progress"
							style="--progress-value:20"
							role="progressbar"
							aria-valuenow={20}
							aria-valuemin={0}
							aria-valuemax={100}
						/>
						<span class="icon">%</span>
					</div>
					<label for="file1" class="file-name">hello.mp4</label>
					<button class="icon-button" aria-label="Uploading"><span class="icon">&</span></button>
				</li>
				<li class="upload-box-item">
					<div class="upload-image u-margin-inline-end-16">
						<div
							class="progress"
							style="--progress-value:70"
							role="progressbar"
							aria-valuenow={20}
							aria-valuemin={0}
							aria-valuemax={100}
						/>
						<span class="icon">%</span>
					</div>
					<label for="file1" class="file-name">hello.mp4</label>
					<button class="icon-button" aria-label="Uploading"><span class="icon">&</span></button>
				</li>
				<li class="upload-box-item">
					<div class="upload-image is-finished u-margin-inline-end-16">
						<div
							class="progress"
							style="--progress-value:100"
							role="progressbar"
							aria-valuenow={20}
							aria-valuemin={0}
							aria-valuemax={100}
						/>
						<span class="icon">%</span>
					</div>
					<label for="file1" class="file-name">hello.mp4</label>
					<button class="icon-button" aria-label="Uploading"><span class="icon">&</span></button>
				</li>
			</ul>
		</div>
	</section>
{/if}

<style>
	section.upload-box {
		position: fixed;
		bottom: 0;
		right: 0;
		margin: 0 1rem 1rem 0;
	}
</style>
