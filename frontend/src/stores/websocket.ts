import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router';
import {watch} from 'vue';

export const websocketStore = defineStore('websocket', () => {
    const route =  useRoute();

    const adress = ref<String>(`ws://localhost:8000/ws/123`);
    
    watch(route, () => {
        if (!route.params.roomId) return;
        adress.value = `${adress.value}${route.params.roomId}`;
    });

    function getAdress(): string {
        return adress.value as string;
    }

  return { adress, getAdress}
})
