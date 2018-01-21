var carPic = document.createElement("img");
var carPicLoaded = false;

var canvas, canvasContext;
var carX = 75;
var carY = 75;
var carAng = 0;
var carSpeed = 0;

const GROUNDSPEED_DECAY_MULT = 0.94;
const DRIVE_POWER = 0.5;
const REVERSE_POWER = 0.2;
const TURN_RATE = 0.03;

const TRACK_W = 40;
const TRACK_H = 40;
const TRACK_COLS = 20;
const TRACK_ROWS = 15;
const TRACK_GAP = 2;
var trackGrid = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
				 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
				 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1,
				 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1,
				 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1,
				 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1,
				 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
				 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
				 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
				 1, 0, 2, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1,
				 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1,
				 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1,
				 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1,
				 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
				 // 0 = empty space, 1 = wall, 2 = starting spot

const TRACK_ROAD = 0;
const TRACK_WALL = 1;
const TRACK_PLAYERSTART = 2;

const KEY_LEFT_ARROW = 37;
const KEY_UP_ARROW = 38;
const KEY_RIGHT_ARROW = 39;
const KEY_DOWN_ARROW = 40;

var keyHeld_Gas = false;
var keyHeld_Reverse = false;
var keyHeld_TurnLeft = false;
var keyHeld_TurnRight = false;

var mouseX = 0;
var mouseY = 0;

function updateMousePos(evt) {
	var rect = canvas.getBoundingClientRect();
	var root = document.documentElement;

	mouseX = evt.clientX - rect.left - root.scrollLeft;
	mouseY = evt.clientY - rect.top - root.scrollTop;

// cheat/hack to test car in any position
	/*carX = mouseX;
	carY = mouseY;
	carSpeedX = 4;
	carSpeedY = -4;*/
}

function keyPressed(evt) {
	// console.log("Key pressed: " + evt.keyCode);
	if (evt.keyCode == KEY_LEFT_ARROW) {
		keyHeld_TurnLeft = true;
	}
	if (evt.keyCode == KEY_RIGHT_ARROW) {
		keyHeld_TurnRight = true;
	}
	if (evt.keyCode == KEY_UP_ARROW) {
		keyHeld_Gas = true;
	}
	if (evt.keyCode == KEY_DOWN_ARROW) {
		keyHeld_Reverse = true;
	}
}

function keyReleased(evt) {
	if (evt.keyCode == KEY_LEFT_ARROW) {
		keyHeld_TurnLeft = false;
	}
	if (evt.keyCode == KEY_RIGHT_ARROW) {
		keyHeld_TurnRight = false;
	}
	if (evt.keyCode == KEY_UP_ARROW) {
		keyHeld_Gas = false;
	}
	if (evt.keyCode == KEY_DOWN_ARROW) {
		keyHeld_Reverse = false;
	}
	// console.log("Key released: " + evt.keyCode);
}

window.onload = function() {
	canvas = document.getElementById('gameCanvas');
	canvasContext = canvas.getContext('2d');
	
	var framesPerSecond = 30;
	setInterval(updateAll, 1000/framesPerSecond);

	canvas.addEventListener('mousemove', updateMousePos);

	document.addEventListener('keydown', keyPressed);
	document.addEventListener('keyup', keyReleased);

	carPic.onload = function() {
		carPicLoaded = true;
	}
	carPic.src = "player1car.png";

	carReset();
}

function updateAll() {
	moveAll();
	drawAll();
}

function carReset() {
	for (var eachRow = 0; eachRow < TRACK_ROWS; eachRow++) {
		for(var eachCol=0; eachCol<TRACK_COLS;eachCol++) {

			var arrayIndex = rowColToArrayIndex(eachCol, eachRow);
			if (trackGrid[arrayIndex] == TRACK_PLAYERSTART) {
				trackGrid[arrayIndex] = TRACK_ROAD;
				carAng = -Math.PI/2;
				carX = eachCol * TRACK_W + TRACK_W/2;
				carY = eachRow * TRACK_H + TRACK_H/2;
			}
		}
	}
}

function carMove() {
	carSpeed *= 0.97;

	if (keyHeld_Gas) {
		carSpeed += DRIVE_POWER;
	}
	if (keyHeld_Reverse) {
		carSpeed -= REVERSE_POWER;
	}
	if (keyHeld_TurnLeft) {
		carAng -= TURN_RATE;
	}
	if (keyHeld_TurnRight) {
		carAng += TURN_RATE;
	}


	carX += Math.cos(carAng) * carSpeed;
	carY += Math.sin(carAng) * carSpeed;
}

function isWallAtColRow(col, row) {
	if (col >= 0 && col < TRACK_COLS && 
		row >= 0 && row < TRACK_ROWS) {
		var trackIndexUnderCoord = rowColToArrayIndex(col, row);
		return (trackGrid[trackIndexUnderCoord] == TRACK_WALL);
	} else {
		return false;
	}
}

function carTrackHandling() {
	var carTrackCol = Math.floor(carX / TRACK_W);
	var carTrackRow = Math.floor(carY / TRACK_H);
	var trackIndexUnderCar = rowColToArrayIndex(carTrackCol, carTrackRow);
	

	if (carTrackCol >= 0 && carTrackCol < TRACK_COLS && 
		carTrackRow >= 0 && carTrackRow < TRACK_ROWS) {
			
		if (isWallAtColRow(carTrackCol, carTrackRow)) {
			carX -= Math.cos(carAng) * carSpeed;
			carY -= Math.sin(carAng) * carSpeed;

			carSpeed *= -0.5;
		} // end of track found
	} // end of valid col and row
} // end of carTrackHandling();

function moveAll() {
	carMove();

	carTrackHandling();
}

function rowColToArrayIndex(col, row) {
	return col + TRACK_COLS * row;
}

function drawTracks() {
	for (var eachRow = 0; eachRow < TRACK_ROWS; eachRow++) {
		for(var eachCol=0;eachCol<TRACK_COLS;eachCol++) {

			var arrayIndex = rowColToArrayIndex(eachCol, eachRow);

			if (trackGrid[arrayIndex] == TRACK_WALL) {
			colorRect(TRACK_W*eachCol,TRACK_H*eachRow, TRACK_W-TRACK_GAP, TRACK_H-TRACK_GAP, "blue");
			} // end of if this track is here
		} // end of loop through array
	}
	

} // end of drawTracks func
	
function drawAll() {
	colorRect(0, 0, canvas.width, canvas.height, 'black');
	// colorCircle(carX, carY, 10, 'white');
	if (carPicLoaded) {
		drawBitmapCenteredWithRotation(carPic, carX, carY, carAng);
	}

	drawTracks();
}

function drawBitmapCenteredWithRotation(useBitmap, atX, atY, withAng) {
	canvasContext.save();
	canvasContext.translate(atX, atY);
	canvasContext.rotate(withAng);
	canvasContext.drawImage(useBitmap, -useBitmap.width/2, -useBitmap.height/2);
	canvasContext.restore(); 
}

function colorRect(topLeftX, topLeftY, boxWidth, boxHeight, fillColor) {
	canvasContext.fillStyle = fillColor;
	canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

function colorCircle(centerX,centerY, radius, fillColor) {
	canvasContext.fillStyle = fillColor;
	canvasContext.beginPath();
	canvasContext.arc(centerX,centerY, radius, 0,Math.PI*2, true);
	canvasContext.fill();
}

function colorText(showWords, textX,textY, fillColor) {
	canvasContext.fillStyle = fillColor;
	canvasContext.fillText(showWords, textX, textY);
}