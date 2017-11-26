var digit_reader_ns = new function () {
	var brushRadius = 10;

	var canvas = document.querySelector('#digitReaderCanvas');
	var c = canvas.getContext('2d');

	console.log(canvas);

	var cursor = {
		x: undefined,
		y: undefined
	}
	var lastCursor = {
		x: undefined,
		y: undefined
	}

	var drawing = false;

	window.addEventListener('mousemove', function(event) {
		getMousePos(event);

		// draw if needed
		if (drawing) {
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
		}
	})
	window.addEventListener('mousedown', function(event) {
		drawing = true;
		c.fillStyle = '#000000';
	})
	window.addEventListener('mouseup', function(event) {
		drawing = false;
		resetLastCursor();
	})

	var drawCircle = function(x,y, radius) {
		c.beginPath();
		c.arc(x,y, radius, 0, 2*Math.PI, false)
		c.fill();
	}

	var getMousePos = function(event) {
		rect = canvas.getBoundingClientRect();
		cursor.x = event.clientX - rect.left;
		cursor.y = event.clientY - rect.top;
	}
	var resetLastCursor = function() {
		lastCursor.x = undefined;
		lastCursor.y = undefined;
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
