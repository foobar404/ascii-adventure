import React, {useRef} from 'react'
import {useEffect} from 'react';
import {rooms, characterAtlas, ICharacter} from "./rooms";


let CANVAS: HTMLCanvasElement | null = null;

document.body.addEventListener("keypress", e => {
    if (e.key == "w")
        move("up");
    if (e.key == "s")
        move("down");
    if (e.key == "a")
        move("left");
    if (e.key == "d")
        move("right");
});

let CURRENT_ROOM: ICharacter[][];
let CURRENT_ROOM_SHADOW: boolean[][];

function loadRoom() {
    CURRENT_ROOM = rooms[0].map(row => row.map(character => ({...characterAtlas[character]})));
    CURRENT_ROOM_SHADOW = [...CURRENT_ROOM].map(row => row.map(c => false));
}

function findPlayer() {
    let playerPosition: number[] = [];

    CURRENT_ROOM.forEach((row, y) => {
        row.forEach((char, x) => {
            if (char.character == "@") playerPosition = [x, y];
        })
    })

    return playerPosition;
}

const movementRadius = 6;
let movementDeltas = {x: 0, y: 0};
let lastSeenCharacter: ICharacter = {...characterAtlas["."]};

function move(dir) {
    let [playerX, playerY] = findPlayer();
    let [destinationX, destinationY] = [playerX, playerY];

    if (dir == "up")
        destinationY -= 1;
    if (dir == "down")
        destinationY += 1;
    if (dir == "right")
        destinationX += 1;
    if (dir == "left")
        destinationX -= 1;

    let destinationCharacter = CURRENT_ROOM[destinationY][destinationX];

    if (destinationCharacter.solid) return;

    CURRENT_ROOM[playerY][playerX] = lastSeenCharacter;
    CURRENT_ROOM[destinationY][destinationX] = {...characterAtlas["@"]};
    lastSeenCharacter = destinationCharacter;

    if (dir == "up")
        movementDeltas.y -= 1;
    if (dir == "down")
        movementDeltas.y += 1;
    if (dir == "right")
        movementDeltas.x += 1;
    if (dir == "left")
        movementDeltas.x -= 1;

    reveal();
}

function reveal() {
    let [playerX, playerY] = findPlayer();
    let radius = 1;

    CURRENT_ROOM_SHADOW[playerY][playerX] = true;
    for (let i = 1; i <= radius; i++) {
        if (!(playerY + i >= CURRENT_ROOM.length))
            CURRENT_ROOM_SHADOW[playerY + i][playerX] = true;
        if (!(playerY - i < 0))
            CURRENT_ROOM_SHADOW[playerY - i][playerX] = true;
        if (!(playerX + i >= CURRENT_ROOM[0].length))
            CURRENT_ROOM_SHADOW[playerY][playerX + i] = true;
        if (!(playerX - i < 0))
            CURRENT_ROOM_SHADOW[playerY][playerX - i] = true;
        if (!(playerY - i < 0))
            if (!(playerX - i < 0))
                CURRENT_ROOM_SHADOW[playerY - i][playerX - i] = true;
        if (!(playerX + i >= CURRENT_ROOM[0].length))
            if (!(playerY + i >= CURRENT_ROOM.length))
                CURRENT_ROOM_SHADOW[playerY + i][playerX + i] = true;
        if (!(playerY + i >= CURRENT_ROOM.length))
            if (!(playerX - i < 0))
                CURRENT_ROOM_SHADOW[playerY + i][playerX - i] = true;
        if (!(playerY - i < 0))
            if (!(playerX + i >= CURRENT_ROOM[0].length))
                CURRENT_ROOM_SHADOW[playerY - i][playerX + i] = true;
    }
}

let playerStartPosition: number[];

function draw(deltaTime: number) {
    if (!CANVAS) return;
    if (!playerStartPosition)
        playerStartPosition = findPlayer();

    let context = CANVAS.getContext("2d");
    CANVAS.height = window.innerHeight - 20;
    CANVAS.width = window.innerWidth - 20;

    const fontSize = 25;
    context!.font = `${fontSize}px monospace`;
    context!.textAlign = "left";

    // the center of the screen is the players start position 
    let [screenCenterX, screenCenterY] = [CANVAS.width / 2, CANVAS.height / 2];
    let [playerStartX, playerStartY] = playerStartPosition;
    playerStartX *= fontSize;
    playerStartY *= fontSize;

    // keep the player on the screen
    let x = screenCenterX - playerStartX, y = screenCenterY - playerStartY;
    if (movementDeltas.x > movementRadius || movementDeltas.x < movementRadius * -1)
        x += fontSize * ((movementDeltas.x < 0 ? movementDeltas.x + movementRadius : movementDeltas.x - movementRadius) * -1);
    if (movementDeltas.y > movementRadius || movementDeltas.y < movementRadius * -1)
        y += fontSize * ((movementDeltas.y < 0 ? movementDeltas.y + movementRadius : movementDeltas.y - movementRadius) * -1);

    // draw each character
    CURRENT_ROOM.forEach((row, i) => {
        row.forEach((character, j) => {
            let symbol = character.character;
            let isVisible = CURRENT_ROOM_SHADOW[i][j];

            // animate characters that require it 
            if (character?.animated?.length) {
                let rotateTime = 1000 / character.animationFPS;
                character.animationDeltaTime += deltaTime;

                if (character.animationDeltaTime >= rotateTime) {
                    character.animationIndex += 1;
                    if (character.animationIndex >= character!.animated!.length)
                        character.animationIndex = 0;
                    character.animationDeltaTime = 0;
                }

                symbol = character.animated[character.animationIndex];
            }

            context!.fillStyle = character.color;
            context!.fillText(isVisible ? symbol : " ", x, y);

            x += fontSize;
        })
        y += fontSize;
        x = screenCenterX - playerStartX;
    });
}

function moveEnemies() {
    let playerPosition = findPlayer();
    
    CURRENT_ROOM.forEach((row, y) => row.forEach((character, x) => {
        if (character.enemy) {
                    
        }
    }))
}

function start() {
    let lastDelta = 0;
    loadRoom();
    reveal();

    function loop(delta = 0) {
        draw(delta - lastDelta);
        moveEnemies();
        lastDelta = delta;
        requestAnimationFrame(loop);
    }

    loop();
}

export function Game() {
    let canvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvas.current) return
        CANVAS = canvas.current;
        start();
    }, [canvas]);

    return (
        <canvas ref={canvas}></canvas>
    )
}
