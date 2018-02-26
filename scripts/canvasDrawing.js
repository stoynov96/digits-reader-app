var digit_reader_ns = new function () {

	const CLEAR_KEYCODE = 82; // r

	class Cursor {
		constructor(x = undefined, y = undefined) {
			this.x = x;
			this.y = y;
		}
	}


	var brushRadius = 10;

	var canvas = document.querySelector('#digitReaderCanvas');
	var c = canvas.getContext('2d');

	var cursor = new Cursor();
	var lastCursor = new Cursor();

	var drawing = false;

	// Clearing Canvas
	window.addEventListener('keydown', function(event) {
		digit_reader_ns.clearCanvas();
	});

	// Mouse Handling
	window.addEventListener('mousemove', function(event) {
		draw(event);		
	});
	window.addEventListener('mousedown', function(event) {
		startDrawing();
	});
	window.addEventListener('mouseup', function(event) {
		stopDrawing();
		neural_network_ns.recognizeDigit(canvas.id);
	});

	// Touch handling - TODO
	window.addEventListener('ontouchmove', function(event) {

	});
	window.addEventListener('ontouchstart', function(event) {

	});
	window.addEventListener('ontouchend', function(event) {

	});

	var draw = function(event) {
		cursor = getCursorCoords(event);

		// draw if needed
		if (drawing && isMouseOnCanvas()) {
			// connect last dot with the new one
			c.beginPath();
			c.moveTo(lastCursor.x, lastCursor.y);
			c.lineTo(cursor.x, cursor.y);
			c.lineWidth = 2*brushRadius;
			c.stroke();
			
			// draw new dot
			drawCircle(cursor.x, cursor.y, brushRadius);
			lastCursor.x = cursor.x;
			lastCursor.y = cursor.y;

			// recognize newly drawn digit
			if (isMouseOnCanvas()) {
				// neural_network_ns.recognizeDigit(canvas.id);
			}
		}
	}
	var startDrawing = function() {
		drawing = true;
		c.fillStyle = '#000000';
	}
	var stopDrawing = function() {
		drawing = false;
		resetLastCursor();
	}

	var drawCircle = function(x,y, radius) {
		c.beginPath();
		c.arc(x,y, radius, 0, 2*Math.PI, false)
		c.fill();
	}

	var getCursorCoords = function(event) {
		rect = canvas.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		}
	}
	var resetLastCursor = function() {
		lastCursor.x = undefined;
		lastCursor.y = undefined;
	}

	var isMouseOnCanvas = function () {
		return cursor.x >= 0 && cursor.x <= canvas.width && cursor.y >= 0 && cursor.y <= canvas.height;
	}

	this.invertCanvas = function() {
		var imageData = c.getImageData(0,0,canvas.width, canvas.height);
		for (var i = 0; i < imageData.data.length; i += 4) {
			for (var j = 0; j < 3; ++ j) {
				imageData.data[i+j] = 255 - imageData.data[i+j]; 
			}
			imageData.data[i+3] = 255;
		}
		c.putImageData(imageData,0,0);
	}
	this.clearCanvas = function() {
		c.clearRect(0,0, canvas.width, canvas.height);
		c.beginPath();
		resetLastCursor();
	}
};