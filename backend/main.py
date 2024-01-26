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
    def __init__(self, player_id: int):
        self.player_id = player_id


players: dict[int, list[Player]] = {}


@app.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int, room_id: int):
    await manager.connect(websocket)

    if room_id not in players:
        players[room_id] = []
    players[room_id].append(Player(client_id))

    try:
        for player in players[room_id]:
            await manager.send_personal_message(
                orjson.dumps({"type": "join", "id": player.player_id}).decode("utf-8"),
                websocket,
            )
        while True:
            data = await websocket.receive_text()
            print(data)
            await manager.broadcast(data)

    except WebSocketDisconnect:
        manager.disconnect(websocket)

        players[room_id] = [
            player for player in players[room_id] if player.player_id != client_id
        ]
        print(players)
        await manager.broadcast(
            orjson.dumps({"type": "disconnect", "id": client_id}).decode("utf-8")
        )


if __name__ == "__main__":
    run("main:app", reload=True)
