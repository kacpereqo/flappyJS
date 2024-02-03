import { ref } from 'vue'
import { defineStore } from 'pinia'
import { type PlayerUI } from '@/views/playerUI';

export const playersStore = defineStore('players', () => {
    const players = ref<PlayerUI[]>([]);

    function addPlayer(player: PlayerUI): void {
        players.value.push(player);
    }

    function getPlayer(id: number): PlayerUI | undefined {
        return players.value.find((player) => player.id === id);
    }

    function removePlayer(id: number): void {
        const index = players.value.findIndex((player) => player.id === id);
        players.value.splice(index, 1);
    }

    function addScore(id: number): void {
        const player = getPlayer(id);
        if (player) {
            player.score++;
        }

        players.value.sort((a, b) => b.score - a.score);
    }

    function reset(){
        players.value = []
    }

    return { players, addPlayer, getPlayer, removePlayer, addScore, reset }
})
