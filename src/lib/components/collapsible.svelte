<ul class="collapsible">
	<li class="collapsible-item">
		<details class="collapsible-wrapper">
			<summary class="collapsible-button">
				<span class="text">
					<slot name="header" />
				</span>
				<span class="collapsible-button-optional">
					<slot name="subheader" />
				</span>
				<div class="icon">
					<span class="icon-plus" aria-hidden="true" />
					<span class="icon-minus" aria-hidden="true" />
				</div>
			</summary>
			<p class="collapsible-content">
				<slot />
			</p>
		</details>
	</li>
</ul>
