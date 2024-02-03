import orjson
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from uvicorn import run

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


class Player:
    def __init__(self, player_id: int, nickname: str = "guest"):
        self.player_id = player_id
        self.nickname = nickname
        self.score = 0
        self.is_dead = False


class EventHandler:
    @staticmethod
    async def onJoin(websocket: WebSocket, room_id: int, parsed_data: dict):
        client_id = parsed_data["id"]
        nickname = parsed_data["nickname"]

        for player in players[room_id].values():
            print(player.player_id)
            await manager.send_personal_message(
                orjson.dumps(
                    {
                        "type": "join",
                        "id": player.player_id,
                        "nickname": player.nickname,
                        "score": player.score,
                    }
                ).decode("utf-8"),
                websocket,
            )

        players[room_id][client_id] = Player(client_id, nickname)

    @staticmethod
    async def onDisconnect(websocket, room_id: int, client_id: int):
        manager.disconnect(websocket)
        del players[room_id][client_id]

        await manager.broadcast(
            orjson.dumps({"type": "disconnect", "id": client_id}).decode("utf-8")
        )

    @staticmethod
    async def onDead(websocket, room_id: int, parsed_data: dict):
        client_id = parsed_data["id"]
        players[room_id][client_id].is_dead = True

        if len(players[room_id]) > 1:
            won_player = list(
                filter(lambda x: not x.is_dead, players[room_id].values())
            )
            if len(won_player) == 1:
                won_player[0].score += 1

                for player in players[room_id].values():
                    print(player.score, player.nickname)

                for player in players[room_id].values():
                    player.is_dead = False
                await manager.broadcast(
                    orjson.dumps({"type": "win", "id": won_player[0].player_id}).decode(
                        "utf-8"
                    )
                )


players: dict[int, dict[int, Player]] = {}  # room_id: {player_id: Player}


@app.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: int,
):
    player = None

    await manager.connect(websocket)
    if room_id not in players:
        players[room_id] = {}

    try:
        while True:
            data = await websocket.receive_text()
            parsed_data = orjson.loads(data)

            print(parsed_data)

            if parsed_data["type"] == "join":
                await EventHandler.onJoin(websocket, room_id, parsed_data)
                player = players[room_id][parsed_data["id"]]

            # if parsed_data["type"] == "message":
            #     EventHandler.onMessage(websocket, room_id, parsed_data)

            if parsed_data["type"] == "dead":
                await EventHandler.onDead(websocket, room_id, parsed_data)

            await manager.broadcast(data)

    # On disconnect
    except WebSocketDisconnect:
        await EventHandler.onDisconnect(websocket, room_id, player.player_id)


if __name__ == "__main__":
    run("main:app", reload=True)
