<script lang="ts">
	import type { SvelteComponent } from 'svelte';

	import { getModalStore } from '@skeletonlabs/skeleton';

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

	const modalStore = getModalStore();

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
</script>

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>Biljettsläpp - 31.1.2024</header>
		<article>Biljetsläppet sker på Orbi på Tisdag</article>
		<div class="table-container">
			<!-- Native Table Element -->
			<table class="table table-hover">
				<thead>
					<tr>
						<th></th>
						<th>Tid</th>
						<th>Pris</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Torsdag</td>
						<td>12:30</td>
						<td>135kr</td>
					</tr>
					<tr>
						<td>Lördag</td>
						<td>12:45</td>
						<td>140kr</td>
					</tr>
					<tr>
						<td>Märke</td>
						<td></td>
						<td>30kr</td>
					</tr>
				</tbody>
			</table>
		</div>
		<span class="text-primary-500">OBS</span> Max två biljetter per person
		<footer class="modal-footer {parent.regionFooter}">
			<button class="btn {parent.buttonPositive}" on:click={parent.onClose}>Stäng</button>
		</footer>
	</div>
{/if}
