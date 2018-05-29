/*

Game of Life
Written by Alex Manno
May 2018

The Game of Life is a "zero-player game" created by John Conway. Click on
"dead" (black) tiles to make them "alive" (yellow), and click on alive tiles
to make them dead. When the game is started, the following rules are applied
in each step:

1. Any living tile with fewer than two or greater than three living "neighbors"
   (the 8 tiles adjacent to it) dies in the following step of the game.
2. Any dead tile with exactly three living neighbors comes to life in the
   following step of the game.

Click the play button to start the game. Click the button again to pause.
When the game is being played, the tiles can not be clicked on to make them
alive or dead again until the game is paused. Click the reset button to stop
the game and return all the tiles to their dead state.

 */

// Variables for the game canvas, the play button, and the reset button
var canvas = document.getElementById("canvas");
var playButton = document.getElementById("play");
var resetButton = document.getElementById("reset");

// Width and height of the game's canvas, in pixels
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Number of tiles that span the width and height of the game's canvas
const NUM_TILES_WIDE = 25;
const NUM_TILES_HIGH = 25;

// Width and height of each tile, in pixels
const TILE_WIDTH = CANVAS_WIDTH / NUM_TILES_WIDE;
const TILE_HEIGHT = CANVAS_HEIGHT / NUM_TILES_HIGH;

// Integers to represent the dead, alive, pending dead, and pending alive state
// of each tile; pending dead and pending alive are used in between states
const DEAD = 1;
const ALIVE = 2;
const PENDING_DEAD = 3;
const PENDING_ALIVE = 4;

// Colors used to represent a dead tile and an alive tile
const DEAD_COLOR ="black";
const ALIVE_COLOR ="yellow";

// How often the board should be updated when playing, in milliseconds
const NUM_MILLISECONDS = 100;

// 2D array used to store the tiles
var board = new Array(NUM_TILES_WIDE);
// Boolean value that changes whether the game is playing or paused
var isPlaying;

// Fill array with arrays to make it a 2D array
for (var i = 0; i < NUM_TILES_WIDE; i++) {
    board[i] = new Array(NUM_TILES_HIGH);
}

/*
setup

Called when the program begins. Draws board and sets all tiles to dead, adds
event listeners for clicking on canvas and buttons, and sets an interval of
time during which to update the game when it's being played.
 */
function setup() {
    clearBoard();
    canvas.addEventListener("mousedown", changeTile);
    playButton.addEventListener("click", function() { playOrPause(); });
    resetButton.addEventListener("click", function() { clearBoard(); });
    setInterval(playGame, NUM_MILLISECONDS);
}

/*
clearBoard

Stops the game if it's being played, and sets all tiles to dead.
 */
function clearBoard() {
    playButton.value = "Play";
    isPlaying = false;
    for (var i = 0; i < NUM_TILES_WIDE; i++) {
	for (var j = 0; j < NUM_TILES_HIGH; j++) {
	    setTile(i, j, DEAD);
	}
    }
}

/*
setTile

Takes xPos and yPos as x-coordinates and y-coordinates respectively for a tile
on the board, and lifeStatus as a constant integer representing if a tile is
dead, alive, pending dead, or pending alive, and changes the given tile's life
status. Also changes the tile's color if the life status isn't pending.
 */
function setTile(xPos, yPos, lifeStatus) {
    board[xPos][yPos] = lifeStatus;
    if (lifeStatus == DEAD) {
	drawTile(xPos, yPos, DEAD_COLOR);
    } else if (lifeStatus == ALIVE) {
	drawTile(xPos, yPos, ALIVE_COLOR);
    }
}

/*
drawTile

Takes xPos and yPos as x-coordinates and y-coordinates respectively for a tile
on the board, and color as a string, and draws the given tile as the given
color
 */
function drawTile(xPos, yPos, color) {
    var context = canvas.getContext("2d");
    context.fillStyle = color;
    context.fillRect(xPos * TILE_WIDTH, yPos * TILE_HEIGHT,
		     TILE_WIDTH - 1, TILE_HEIGHT - 1);
}

/*
mousePositionToTile

Takes xMousePos and yMousePos as x-coordinates and y-coordinates respectively
for the mouse's position in pixels, and returns xPos and yPos as x-coordinates
and y-coordinates respectively for a tile on the board.
 */
function mousePositionToTile(xMousePos, yMousePos) {
    var xPos = Math.floor(xMousePos / TILE_WIDTH);
    var yPos = Math.floor(yMousePos / TILE_HEIGHT);
    return {
	xPos: xPos,
	yPos: yPos
    };
}

/*
changeTile

If the game is not currently being played, allows the user to click on a dead
tile to make it living and a living tile to make it dead.
 */
function changeTile(event) {
    if (!isPlaying) {
	var mouseCoordinates =
	    mousePositionToTile(event.offsetX, event.offsetY);
	var xPos = mouseCoordinates.xPos;
	var yPos = mouseCoordinates.yPos;
	if (board[xPos][yPos] == DEAD) {
	    setTile(xPos, yPos, ALIVE);
	} else {
	    setTile(xPos, yPos, DEAD);
	}
    }
}

/*
playGame

If the game is currently being played (as in if the user has clicked the play
button), goes through the board tile by tile, counts the number of that tile's
alive neighbors, and changes the given tile to pending dead or pending alive as
necessary according to the rules of the game. After going through the entire
board, refreshes the board to change all pending dead tiles to dead and all
pending alive tiles to alive, and draws those tiles as dead or alive
respectively.
 */
function playGame() {
    if (isPlaying) {
	for (var i = 0; i < NUM_TILES_WIDE; i++) {
	    for (var j = 0; j < NUM_TILES_HIGH; j++) {
		var numAliveNeighbors = getNumAliveNeighbors(i, j);
		if (board[i][j] == ALIVE && 
		    (numAliveNeighbors < 2 || numAliveNeighbors > 3)) {
		    setTile(i, j, PENDING_DEAD);
		} else if (board[i][j] == DEAD && numAliveNeighbors == 3) {
		    setTile(i, j, PENDING_ALIVE);
		}
	    }
	}
	refreshBoard();
    }
}

/*
playOrPause

Called when the player hits the play/pause button. If the game is playing,
pause the game and change the button's text to say "Play." If the game is
stopped/paused, play the game and change the button's text to say "Pause."
 */
function playOrPause() {
    if (isPlaying) {
	playButton.value = "Play";
	isPlaying = false;
    } else {
	playButton.value = "Pause";
	isPlaying = true;
    }
}

/*
getNumAliveNeighbors

Takes xPos and yPos as x-coordinates and y-coordinates respectively for a tile
on the board, goes through all the neighbors of that tile to count how many
of them are alive, and then returns the number of that tile's alive neighbors.
 */
function getNumAliveNeighbors(xPos, yPos) {
    var numAliveNeighbors = 0;
    for (var i = xPos - 1; i <= xPos + 1; i++) {
	for (var j = yPos - 1; j <= yPos + 1; j++) {
	    // Checks if tile is alive only if the coordinates are within the
	    // 2D array's coordinates, and if the coordinates don't point to
	    // the given tile itself
	    if (i >= 0 && i < NUM_TILES_WIDE &&
		j >= 0 && j < NUM_TILES_HIGH &&
		!(i == xPos && j == yPos) && isTileAlive(i, j)) {
		numAliveNeighbors += 1;
	    }
	}
    }
    return numAliveNeighbors;
}

/*
isTileAlive

Takes xPos and yPos as x-coordinates and y-coordinates respectively for a tile
on the board, and returns true if the tile is alive (which includes if it's
pending dead) and false if the tile is dead (which includes pending alive).
 */
function isTileAlive(xPos, yPos) {
    return board[xPos][yPos] == ALIVE || board[xPos][yPos] == PENDING_DEAD;
}

/*
refreshBoard

Goes through the entire board and changes all pending dead tiles to dead and
all pending alive tiles to alive, which also draws them the appropriate colors.
 */
function refreshBoard() {
    for(var i = 0; i < NUM_TILES_WIDE; i++) {
	for(var j = 0; j < NUM_TILES_HIGH; j++) {
	    if(board[i][j] == PENDING_DEAD) {
		setTile(i, j, DEAD);
	    } else if(board[i][j] == PENDING_ALIVE) {
		setTile(i, j, ALIVE);
	    }
	}
    }
}
