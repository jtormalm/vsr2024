<script lang="ts">
	import { VSRViewer } from '$lib/VSRViewer.tsx';

	import { matches } from '$lib/matches';
	import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	export let data;

	let innerHeight: number;
	let innerWidth: number;

	let clientHeight: number;
	let clientWidth: number;

	let loaded = false;

	onMount(() => {
		loaded = true;
	});

	let selected = 'vsr';

	let textHeight = 0;
	let radioHeight = 0;

	const getPlayerNameById = (id: number | null): string | null => {
		if (id === null) return null;
		const player = data.players.find((player) => player.id === id);
		return player ? player.name : null;
	};

	const result = data.matches.map((match) => ({
		id: match.id,
		name: match.name,
		nextMatchId: match.next_match_id,
		nextLooserMatchId: null, // Assuming there's no direct mapping for this
		tournamentRoundText: match.round.toString(),
		startTime: match.created_at,
		state: match.winner === 'NONE' ? 'SCHEDULED' : 'FINISHED',
		participants: [
			match.p1 !== null
				? {
						id: match.p1.toString(),
						resultText: null,
						isWinner: match.winner === 'P1',
						status: null,
						name: getPlayerNameById(match.p1)
					}
				: null,
			match.p2 !== null
				? {
						id: match.p2.toString(),
						resultText: null,
						isWinner: match.winner === 'P2',
						status: null,
						name: getPlayerNameById(match.p2)
					}
				: null
		].filter((participant) => participant !== null) // Filter out null participants
	}));
</script>

<svelte:window bind:innerHeight bind:innerWidth />

<div class="flex sm:p-4 p-2 w-screen text-white flex-col justify-center items-center">
	<div
		bind:clientHeight={textHeight}
		class="w-full text-center z-20 mt-4 mb-4 text-xl sm:text-2xl font-bold"
	>
		Valla Saucer Rennen 2024
	</div>
	<div class="mb-4" bind:clientHeight={radioHeight}>
		<RadioGroup class="font-medium">
			<RadioItem
				active="text-black bg-primary-400"
				class="px-8"
				bind:group={selected}
				name="justify"
				value={'kvalet'}>Kvalet</RadioItem
			>
			<RadioItem
				active="text-black bg-primary-400"
				class="px-8"
				bind:group={selected}
				name="justify"
				value={'vsr'}>VSR 2024</RadioItem
			>
		</RadioGroup>
	</div>

	{#if selected === 'vsr'}
		<div
			class="rounded-xl h-full w-full items-center flex justify-center"
			bind:clientHeight
			bind:clientWidth
		>
			{#if loaded}
				<react:VSRViewer
					matches={result}
					width={innerWidth}
					height={innerHeight - radioHeight - textHeight - 48 - 32}
				/>
			{/if}
		</div>
	{:else}
		<div class="h-full grid grid-cols-2 mb- sm:grid-cols-4 gap-4 sm:gap-8 overflow-y-scroll">
			{#each data.players.sort((a, b) => a.id - b.id) as player}
				<div class="rounded-lg min-w-40 w-full flex flex-col border-2 border-surface-600">
					<div class="text-primary-500 p-2 font-bold">
						{player.name}
					</div>
					<hr />
					<div class="text-surface-300 p-2">
						{player.best_time}s
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
