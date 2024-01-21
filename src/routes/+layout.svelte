<script lang="ts">
	import '../app.postcss';

	// Highlight JS
	import hljs from 'highlight.js/lib/core';
	import 'highlight.js/styles/github-dark.css';
	import { Modal, storeHighlightJs, type ModalComponent } from '@skeletonlabs/skeleton';
	import xml from 'highlight.js/lib/languages/xml'; // for HTML
	import css from 'highlight.js/lib/languages/css';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';

	import { initializeStores } from '@skeletonlabs/skeleton';

	import DayModal from '$lib/DayModal.svelte';

	initializeStores();

	hljs.registerLanguage('xml', xml); // for HTML
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	storeHighlightJs.set(hljs);

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import Tisdag from '$lib/Tisdag.svelte';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	const modalRegistry: Record<string, ModalComponent> = {
		day: { ref: DayModal },
		tisdag: { ref: Tisdag }
	};
</script>

<Modal components={modalRegistry} />
<slot />
