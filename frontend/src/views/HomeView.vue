<template>
  <main>
    <canvas ref="canvas" width="500" height="500" />
    <img src="@/public/game/base.png" />
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onMounted } from "vue";
import { Player } from "@/views/player";
import { Pipe } from "@/views/pipe";
import backgroundImage from "@/public/game/background-day.png";

const canvas = ref<HTMLCanvasElement | null>(null);
const player = new Player();
const background = new Image();
const pipes: any = [];
background.src = backgroundImage;
let keyDown = false;
let clock = 0;

function init(): void {
  addPipe();
}

function renderBackground(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  for (let i = 0; i < canvas.width / 288 + 1; i++) {
    ctx?.drawImage(
      background,
      0,
      0,
      canvas.width,
      canvas.height,
      (i - 1) * 287 + ((clock * 20) % 288),
      0,
      canvas.width,
      canvas.height
    );
  }
}

function render(): void {
  const ctx = canvas.value?.getContext("2d");
  if (!ctx || !canvas.value) return;
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  renderBackground(canvas.value);

  ctx?.translate(canvas.value.width / 2, canvas.value.height / 2);

  player.render(canvas.value);

  for (let i = 0; i < pipes.length; i++) {
    pipes[i].render(canvas.value);
  }

  ctx.font = "bold 48px sans-serif";
  ctx.fillStyle = "white";
  ctx.fillText(player.score.toString(), 0, -canvas.value.height / 2 + 50);

  ctx?.translate(-canvas.value.width / 2, -canvas.value.height / 2);
}

function input(): void {
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && !keyDown) {
      player.jump();
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp") {
      keyDown = false;
    }
  });
}

function update(dt: number): void {
  player.update(dt);
  for (let i = 0; i < pipes.length; i++) {
    pipes[i].update(dt);
    if (pipes[i].x < -250 - 52) {
      pipes.splice(i, 1);
    }
  }

  for (const pipe of pipes) {
    if (pipe.collide(player)) {
      player.reset();
      break;
    } else if (pipe.x < player.x && !pipe.passed) {
      pipe.passed = true;
      player.score++;
    }
  }
}

function addPipe(): void {
  pipes.push(new Pipe());
  setTimeout(addPipe, 2000);
}

function gameLoop(): void {
  const dt = 1 / 60;
  clock += dt;
  input();
  update(dt);
  render();
  setTimeout(gameLoop, 1000 / 120);
}

onMounted(() => {
  init();
  gameLoop();
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
