<template>
  <main>
    <div class="canvas">
      <canvas ref="canvas" width="500" height="500" />
      <img src="@/public/game/base.png" />
    </div>
    <div id="chat-container">
      <ul id="chat"></ul>
    </div>
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
  gap: 20px;
  justify-content: center;
  align-items: center;
}

#chat-container {
  width: 300px;
  height: 500px;
  border: 1px solid black;
  overflow-y: scroll;
}

.canvas {
  display: flex;
  flex-direction: column;
}
</style>
