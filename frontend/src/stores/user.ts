import { ref } from 'vue'
import { defineStore } from 'pinia'


export const userStore = defineStore('user', () => {
  const nickname = ref<String>('guest');
  const id = ref<Number>(Math.round(Math.random() * 1000));

  return { nickname, id}
})
