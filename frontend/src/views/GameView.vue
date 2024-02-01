<template>
  <main>
    <div class="canvas" ref="canvasContainer">
      <canvas ref="canvas" width="800" height="500" />
      <div id="ground" />
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
const canvasContainer = ref<HTMLDivElement | null>(null);

onMounted(() => {
  canvas.value!.width = canvasContainer.value?.clientWidth!;
  window.addEventListener("resize", () => {
    canvas.value!.width = canvasContainer.value?.clientWidth!;
  });
  const engine = new Engine(canvas?.value!);
  engine.gameLoop();
});
</script>

<style>
canvas {
  border: 1px solid black;
}

main {
  margin: 100px;
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
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

@keyframes groundTransition {
  0% {
    background-position: 0px 0px;
  }
  100% {
    background-position: 336px 0px;
  }
}

#ground {
  width: 100%;
  background-image: url("/src/public/game/base.png");
  background-color: red;
  height: 112px;
  animation: groundTransition 3.36s linear infinite reverse;
}
</style>
