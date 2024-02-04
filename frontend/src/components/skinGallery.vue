<template>
  <div class="skin-gallery">
    <div class="left-arrow">
      <button
        type="button"
        @click="currentSkinId = (currentSkinId - 1 + 3) % 3"
        @onclick.prevent.stop
      >
        ←
      </button>
    </div>
    <div class="skin">
      <img
        :src="`/src/public/game/skins/${currentSkinId}-upflap.png`"
        alt="loading..."
        ref="skinImg"
      />
    </div>

    <div class="right-arrow">
      <button type="button" @click="currentSkinId = (currentSkinId + 1) % 3">
        →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const currentSkinId = ref(2);
const skinState = ref(0);
const skinImg = ref<HTMLImageElement | null>(null);

const publicPath = !import.meta.env.DEV ? "/" : "src/public/";

function toogleSkin() {
  if (skinImg.value == null) return;

  if (skinState.value === 0) {
    skinImg.value.src = `${publicPath}/skins/${currentSkinId.value}-downflap.png`;
    skinState.value = 1;
  } else if (skinState.value === 1) {
    skinImg.value.src = `${publicPath}/skins/${currentSkinId.value}-midflap.png`;
    skinState.value = 2;
  } else {
    skinImg.value.src = `${publicPath}/skins/${currentSkinId.value}-upflap.png`;
    skinState.value = 0;
  }
}

function getSkinId() {
  return currentSkinId.value;
}

defineExpose({
  getSkinId,
});

onMounted(() => {
  setInterval(toogleSkin, 100);
});
</script>

<style>
.skin-gallery {
  display: flex;
  justify-content: center;
  align-items: center;
}

.skin {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
