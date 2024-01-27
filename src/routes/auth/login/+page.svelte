<script lang="ts">
	import { goto } from '$app/navigation';

	export let data;

	let { supabase } = data;
	$: ({ supabase } = data);

	$: console.log(data);

	let wrongPassword = false;
	let password = '';
	let loginSuccess = false;

	const signIn = async () => {
		console.log('signing in');
		const { data, error } = await supabase.auth.signInWithPassword({
			email: 'admin@ysex.se',
			password
		});
		if (error) {
			wrongPassword = true;
			console.error(error);
		} else {
			loginSuccess = true;

			setTimeout(() => {
				goto('/admin');
			}, 500);
		}
	};
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="w-screen h-screen flex justify-center items-center">
	<label class="label">
		<span>Lösenord</span>
		<div class="flex gap-2">
			<input
				on:input={() => (wrongPassword = false)}
				class="input"
				class:!border-error-500={wrongPassword}
				class:!border-success-500={loginSuccess}
				type="password"
				bind:value={password}
			/>
			<button on:click={signIn} type="button" class="btn variant-filled-primary">Login</button>
		</div>
	</label>
</div>
