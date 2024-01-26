<template>
  <main>
    <canvas ref="canvas" width="500" height="500" />
    <img src="@/public/game/base.png" />
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onMounted } from "vue";
import { Engine } from "./engine";

const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  const engine = new Engine(canvas?.value!);
  engine.gameLoop();
});
</script>

<style>
canvas {
  border: 1px solid black;
}

main {
  display: flex;
  flex-direction: column;
}
</style>
@/views/player
