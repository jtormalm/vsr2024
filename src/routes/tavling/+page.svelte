<script lang="ts">
	import { VSRViewer } from '$lib/VSRViewer.tsx';

	import { matches } from '$lib/matches';
	import { RadioGroup, RadioItem, type ToastSettings } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';

	import { getToastStore } from '@skeletonlabs/skeleton';
	const toastStore = getToastStore();

	export let data;

	let innerHeight: number;
	let innerWidth: number;

	let clientHeight: number;
	let clientWidth: number;

	let loaded = false;

	onMount(() => {
		loaded = true;
	});

	let selected: 'vsr' | 'kvalet' = 'vsr';

	let textHeight = 0;
	let radioHeight = 0;

	const getPlayerNameById = (id: number | null): string | null => {
		if (id === null) return null;
		const player = data.players.find((player) => player.id === id);
		return player ? player.name : null;
	};

	const deepEqual = (object1, object2) => {
		if (object1 === object2) {
			return true;
		}

		if (
			object1 === null ||
			typeof object1 !== 'object' ||
			object2 === null ||
			typeof object2 !== 'object'
		) {
			return false;
		}

		const keys1 = Object.keys(object1);
		const keys2 = Object.keys(object2);

		if (keys1.length !== keys2.length) {
			return false;
		}

		for (const key of keys1) {
			if (!keys2.includes(key) || !deepEqual(object1[key], object2[key])) {
				return false;
			}
		}

		return true;
	};

	data.supabase
		.channel('player')
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public'
			},
			async (payload) => {
				if (payload.eventType != 'UPDATE') return;

				const { data: players } = await data.supabase.from('player').select('*');

				if (deepEqual(players, data.players)) return;
				data.players = players ?? [];
			}
		)
		.subscribe();

	// do the same but for matches

	data.supabase
		.channel('match')
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public'
			},
			async (payload) => {
				const { data: matches } = await data.supabase.from('match').select('*');

				if (deepEqual(matches, data.matches)) return;
				data.matches = matches ?? [];
			}
		)
		.subscribe();

	$: result = data.matches.map((match) => ({
		id: match.id,
		name: match.name,
		nextMatchId: match.next_match_id,
		nextLooserMatchId: null, // Assuming there's no direct mapping for this
		tournamentRoundText: match.round.toString(),
		startTime: match.start_time,
		state: match.winner === 'NONE' ? 'SCHEDULED' : 'FINISHED',
		participants: [
			match.p1 !== null
				? {
						id: match.p1.toString(),
						resultText: match.winner !== 'NONE' ? (match.winner === 'P1' ? 'W' : 'L') : null,
						isWinner: match.winner === 'P1',
						status: null,
						name: getPlayerNameById(match.p1)
					}
				: null,
			match.p2 !== null
				? {
						id: match.p2.toString(),
						resultText: match.winner !== 'NONE' ? (match.winner === 'P2' ? 'W' : 'L') : null,
						isWinner: match.winner === 'P2',
						status: null,
						name: getPlayerNameById(match.p2)
					}
				: null
		].filter((participant) => participant !== null) // Filter out null participants
	}));

	let container: HTMLDivElement;
</script>

<svelte:head>
	<title>Valla Saucer Rennen 2024</title>
</svelte:head>

<svelte:window bind:innerHeight bind:innerWidth />

<div
	class="fixed z-20 flex flex-col items-center font-medium text-sm sm:text-base bottom-4 w-full text-center"
>
	<span class="flex gap-1 items-center">
		<!-- <Copyright class="w-4" />  -->

		<img class="w-4" src="/images/copyright.svg" alt="CopyRight Symbol" />
		Jakob Tormalm - Simon Bonnedahl
	</span>
</div>

<div
	bind:this={container}
	class="flex sm:p-4 p-2 w-screen text-white flex-col justify-center items-center"
>
	<a
		href="/"
		bind:clientHeight={textHeight}
		class="w-full text-center z-20 mt-4 mb-4 text-xl sm:text-2xl font-bold"
	>
		Valla Saucer Rennen 2024
	</a>
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
		<div class="table-container max-w-3xl mb-10 w-full overflow-auto relative">
			<table class="table table-hover table-fixed">
				<thead class="sticky top-0">
					<tr>
						<th>Namn</th>
						<th class="text-center w-20 sm:w-auto !px-0">Startar</th>
						<th class="text-center w-20 sm:w-auto !px-0">Bästa</th>
					</tr>
				</thead>
				<tbody>
					{#each data.players.sort((a, b) => {
						// Handle best_time sorting, treat undefined as Infinity
						const timeA = a.best_time ?? Infinity;
						const timeB = b.best_time ?? Infinity;

						// Players who have played
						if (timeA > 0 && timeB > 0) {
							return timeA - timeB; // Sort by best_time
						}

						// Players who have not played
						if (timeA === 0 && timeB === 0) {
							// Set a large number for null start_time to push players to the end
							const maxTime = 24 * 60; // e.g., 24 hours converted to minutes

							// Convert start_time to comparable format (e.g., 'HH:MM' to minutes) or set to maxTime if null
							const startTimeA = a.start_time ? parseInt(a.start_time.split(':')[0]) * 60 + parseInt(a.start_time.split(':')[1]) : maxTime;
							const startTimeB = b.start_time ? parseInt(b.start_time.split(':')[0]) * 60 + parseInt(b.start_time.split(':')[1]) : maxTime;

							return startTimeA - startTimeB;
						}

						// Push players who haven't played to the end
						return timeA === 0 ? 1 : -1;
					}) as player}
						<tr>
							<td class="overflow-x-hidden text-ellipsis">{player.name}</td>
							<td class="text-center sm:w-auto !px-0"
								>{player.start_time == '' || player.start_time == null
									? '-'
									: player.start_time}</td
							>
							<td class="text-center sm:w-auto !px-0 font-medium text-black">
								<span class="badge variant-filled-primary text-sm">
									{player.best_time == 0 || player.best_time == null
										? `-`
										: `${player.best_time.toString().slice(0, 4)}s`}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
