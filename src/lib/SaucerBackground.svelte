<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	const MIN_SPEED = 0.3;
	const MAX_SPEED = 0.5;

	const MIN_SIZE = 30;
	const MAX_SIZE = 45;

	const MAX_UFOS = 12;
	const RESPAWN_INTERVAL = 2500;

	type UFO = {
		id: number;
		x: number;
		y: number;
		vec: {
			x: number;
			y: number;
		};
		timeAtLastCollision: number;
	};

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	let image: HTMLImageElement;
	let animationFrameId: number;

	let addUfoInterval: number;

	let scrollY: number;
	let innerWidth: number;
	let innerHeight: number;

	$: speed =
		innerWidth < 500
			? MIN_SPEED
			: innerWidth > 1200
				? MAX_SPEED
				: MIN_SPEED + (MAX_SPEED - MIN_SPEED) * ((innerWidth - 500) / (1200 - 500));

	let ufos: UFO[] = [];
	const isUFOOutOfBounds = (ufo: UFO) => {
		return ufo.x < -50 || ufo.x > innerWidth + 50 || ufo.y < -50 || ufo.y > innerHeight + 50;
	};

	$: ufoWidth =
		innerWidth < 500
			? MIN_SIZE
			: innerWidth > 1200
				? MAX_SIZE
				: MIN_SIZE + (MAX_SIZE - MIN_SIZE) * ((innerWidth - 500) / (1200 - 500));

	const moveUfos = (ufos: UFO[]) => {
		ufos.forEach((ufo, index) => {
			ufo.x += ufo.vec.x * speed;
			ufo.y += ufo.vec.y * speed;

			// Check for collisions
			// for (let i = 0; i < ufos.length; i++) {
			for (const other of ufos) {
				if (ufo.id !== other.id && ufo.timeAtLastCollision < Date.now() - 1000) {
					if (isColliding(ufo, other)) {
						// Reflect the velocity vectors
						// ufo.vec.x *= -1;
						// ufo.vec.y *= -1;
						// other.vec.x *= -1;
						// other.vec.y *= -1;

						// // Normalize the vectors
						// normalizeVector(ufo.vec);
						// normalizeVector(other.vec);

						// // Add the collided UFO to the list
						// ufo.collidedWith.push(other.id);
						// other.collidedWith.push(ufo.id);

						const dx = ufo.x - other.x;
						const dy = ufo.y - other.y;

						// Calculate distance between objects
						const distance = Math.sqrt(dx * dx + dy * dy);

						// Prevent division by zero
						if (distance === 0) return;

						// Calculate the normalized collision vector
						const nx = dx / distance;
						const ny = dy / distance;

						// Calculate relative velocity
						const vx = ufo.vec.x - other.vec.x;
						const vy = ufo.vec.y - other.vec.y;

						// Calculate velocity along the normalized collision vector
						const dot = vx * nx + vy * ny;

						// Calculate and apply response velocities
						ufo.vec.x -= nx * dot;
						ufo.vec.y -= ny * dot;
						other.vec.x += nx * dot;
						other.vec.y += ny * dot;

						ufo.vec = normalizeVector(ufo.vec);
						other.vec = normalizeVector(other.vec);

						// ufo.collidedWith.push(other.id);
						// other.collidedWith.push(ufo.id);
						ufo.timeAtLastCollision = Date.now();
						other.timeAtLastCollision = Date.now();
					}
				}
			}
		});

		return ufos.filter((ufo) => !isUFOOutOfBounds(ufo));
	};

	const isColliding = (ufo1: UFO, ufo2: UFO) => {
		const dx = ufo1.x - ufo2.x;
		const dy = ufo1.y - ufo2.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// Assuming UFOs are circles for simplicity, adjust radius as needed
		const radiusSum = ufoWidth / 2;
		return distance < radiusSum * 2;
	};

	const normalizeVector = (vec: { x: number; y: number }) => {
		const magnitude = Math.sqrt(vec.x * vec.x + vec.y * vec.y);

		return {
			x: vec.x / magnitude,
			y: vec.y / magnitude
		};
	};

	const createRandomUFO = (): UFO => {
		// Choose a side randomly (0: left, 1: right, 2: top, 3: bottom)
		const side = Math.floor(Math.random() * 4);

		let x, y;
		let vecX, vecY;

		switch (side) {
			case 0: // left
				x = -50; // outside left boundary
				y = Math.random() * innerHeight;
				vecX = Math.random(); // Only positive X (right direction)
				vecY = Math.random() * 2 - 1; // Random Y
				break;
			case 1: // right
				x = innerWidth + 50; // outside right boundary
				y = Math.random() * innerHeight;
				vecX = -Math.random(); // Only negative X (left direction)
				vecY = Math.random() * 2 - 1; // Random Y
				break;
			case 2: // top
				x = Math.random() * innerWidth;
				y = -50; // outside top boundary
				vecX = Math.random() * 2 - 1; // Random X
				vecY = Math.random(); // Only positive Y (down direction)
				break;
			case 3: // bottom
				x = Math.random() * innerWidth;
				y = innerHeight + 50; // outside bottom boundary
				vecX = Math.random() * 2 - 1; // Random X
				vecY = -Math.random(); // Only negative Y (up direction)
				break;
			default:
				x = 0;
				y = 0;
				vecX = 0;
				vecY = 0;
		}

		// Normalize the vector
		const magnitude = Math.sqrt(vecX * vecX + vecY * vecY);
		const vec = {
			x: vecX / magnitude,
			y: vecY / magnitude
		};

		return { x, y, vec, id: Math.random(), timeAtLastCollision: Date.now() };
	};

	onMount(() => {
		ctx = canvas.getContext('2d');
		image = new Image();
		image.src = '/images/ufo.png';
		image.onload = () => {
			ufos.push(createRandomUFO());
			animate();
		};

		addUfoInterval = setInterval(() => {
			if (ufos.length < MAX_UFOS) {
				ufos.push(createRandomUFO());
			}
		}, RESPAWN_INTERVAL);
	});
	onDestroy(() => {
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
		if (addUfoInterval) clearInterval(addUfoInterval);
	});

	const animate = () => {
		ctx.clearRect(0, 0, innerWidth, innerHeight);

		ufos = moveUfos(ufos); // Update and filter UFOs

		ufos.forEach((ufo) => {
			ctx.save();
			ctx.translate(ufo.x, ufo.y);
			const angle = Math.atan2(ufo.vec.y, ufo.vec.x);
			ctx.rotate(angle);
			ctx.drawImage(image, -ufoWidth / 2, -(ufoWidth / 1.5) / 2, ufoWidth, ufoWidth / 1.5);
			ctx.restore();
		});

		animationFrameId = requestAnimationFrame(animate);
	};

	let lastMouseX = 0;
	let lastMouseY = 0;
	const handleMouseMove = (event: MouseEvent) => {
		const mouseX = event.clientX;
		const mouseY = event.clientY;

		const vec = {
			x: mouseX - lastMouseX,
			y: mouseY - lastMouseY
		};

		lastMouseX = mouseX;
		lastMouseY = mouseY;

		ufos.forEach((ufo) => {
			const dx = mouseX - ufo.x;
			const dy = mouseY - ufo.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			const radiusSum = ufoWidth / 2;
			if (distance < radiusSum * 2 && ufo.timeAtLastCollision < Date.now() - 1000) {
				// Use the mouse movement vector to change the UFO's direction
				ufo.vec.x += vec.x;
				ufo.vec.y += vec.y;

				// Normalize the updated vector
				ufo.vec = normalizeVector(ufo.vec);

				ufo.timeAtLastCollision = Date.now();
			}
		});
	};
</script>

<svelte:window bind:scrollY bind:innerWidth bind:innerHeight on:mousemove={handleMouseMove} />

<canvas bind:this={canvas} width={innerWidth} height={innerHeight} class="fixed inset-0 z-0"
></canvas>
