import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRoute } from 'vue-router';

export const websocketStore = defineStore('websocket', () => {
    
    const route =  useRoute();
    const _adress = ref<String>('');

    function setAdress(adress: string): void {
        _adress.value = adress;
    }

    function getAdress(): string {
        return `${_adress.value}/${route.params.roomId}`;
    }

  return { getAdress, setAdress, _adress}
},{persist: true})
