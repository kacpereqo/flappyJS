<template>
  <main>
    <form action="/player" @submit.prevent="onSubmit">
      <input
        type="text"
        name="name"
        placeholder="Enter your name"
        ref="nickInput"
      />
      <input
        type="text"
        name="serverAdress"
        placeholder="Enter server adress"
        ref="serverAdressInput"
      />

      <input
        type="text"
        name="roomId"
        placeholder="Enter room id"
        ref="roomIdInput"
      />

      <input type="submit" value="Submit" />
    </form>
  </main>
</template>

<script setup lang="ts">
import { userStore } from "@/stores/user";
import { useRouter } from "vue-router";
import { websocketStore } from "@/stores/websocket";
import { onMounted, ref } from "vue";

const router = useRouter();
const user = userStore();
const websocket = websocketStore();

const serverAdressInput = ref<HTMLInputElement | null>(null);
const nickInput = ref<HTMLInputElement | null>(null);
const roomIdInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  serverAdressInput.value!.value = "ws://localhost:8000/ws/";
  nickInput.value!.value = "test";
  roomIdInput.value!.value = "1";
});

function onSubmit() {
  user.nickname = nickInput.value?.value!;
  websocket.adress = serverAdressInput.value?.value!;

  router.push({
    name: "game",
    params: {
      roomId: roomIdInput.value?.value!,
    },
  });
}
</script>

<style>
form {
  border: 1px solid black;
  padding: 20px;
  border-radius: 10px;
  width: fit-content;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

main {
  margin-top: 300px;
}
</style>
