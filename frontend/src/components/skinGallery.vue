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

import blue_upflap from "@/public/skins/0-upflap.png";
import blue_midflap from "@/public/skins/0-midflap.png";
import blue_downflap from "@/public/skins/0-downflap.png";

import red_upflap from "@/public/skins/1-upflap.png";
import red_midflap from "@/public/skins/1-midflap.png";
import red_downflap from "@/public/skins/1-downflap.png";

import yellow_upflap from "@/public/skins/2-upflap.png";
import yellow_midflap from "@/public/skins/2-midflap.png";
import yellow_downflap from "@/public/skins/2-downflap.png";

const currentSkinId = ref(2);
const skinState = ref(0);
const skinImg = ref<HTMLImageElement | null>(null);

function toogleSkin() {
  if (skinImg.value == null) return;

  if (skinState.value === 0) {
    if (currentSkinId.value === 0) {
      skinImg.value.src = blue_midflap;
    } else if (currentSkinId.value === 1) {
      skinImg.value.src = red_midflap;
    } else {
      skinImg.value.src = yellow_midflap;
    }
    skinState.value = 1;
  } else if (skinState.value === 1) {
    if (currentSkinId.value === 0) {
      skinImg.value.src = blue_downflap;
    } else if (currentSkinId.value === 1) {
      skinImg.value.src = red_downflap;
    } else {
      skinImg.value.src = yellow_downflap;
    }
    skinState.value = 2;
  } else {
    if (currentSkinId.value === 0) {
      skinImg.value.src = blue_upflap;
    } else if (currentSkinId.value === 1) {
      skinImg.value.src = red_upflap;
    } else {
      skinImg.value.src = yellow_upflap;
    }
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
