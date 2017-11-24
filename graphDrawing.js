var drawing_ns = new function() {
	const orange = '#fc4a1a';
	const yellow = '#f7b733';
	const cyan = '#4abdac';
	const grey = '#dfdce3';

	var canvas = document.querySelector('#digitReaderCanvas');

	if (!canvas) {
		alert('cannot find canvas');
	}

	var c = canvas.getContext('2d');

	this.drawGraph1 = function (circleCount, 
		minRad = 3, maxRad = 10,
		color = orange) {

		c.beginPath();
		c.fillStyle = color;
		c.lineWidth = 1;

		var radius, x, y;
		for (var i = 0; i < circleCount; ++ i) {
			radius = minRad + Math.random()*(maxRad-minRad);
			x = radius + Math.random() * (canvas.width - 2*radius);
			y = radius + Math.random() * (canvas.height - 2*radius);

			c.lineTo(x,y);
			c.stroke();
				
			c.beginPath();
			c.arc(x,y, radius,  0, 2*Math.PI, false);
			c.fill();
		}
	}

	this.drawGraph2 = function (circleCount,
		minRad = 3, maxRad = 10,
		color = orange) {

		c.fillStyle = color
		c.lineWidth = 1;

		var radius = minRad + Math.random()*(maxRad - minRad);
		var startx = radius + Math.random() * (canvas.width - 2*radius);
		var starty = radius + Math.random() * (canvas.height - 2*radius);

		var x,y;
		for (var i = 0; i < circleCount; ++ i) {
			radius = minRad + Math.random()*(maxRad-minRad);
			x = radius + Math.random() * (canvas.width - 2*radius);
			y = radius + Math.random() * (canvas.height - 2*radius);

			c.beginPath();
			c.moveTo(startx, starty);
			c.lineTo(x,y);
			c.stroke();

			c.beginPath();
			c.arc(x,y, radius, 0, 2*Math.PI, false);
			c.fill();
		}

		c.beginPath();
		c.arc(startx,starty, radius, 0, 2*Math.PI, false);
		c.fill();
	}

	this.clearCanvas = function() {
		c.clearRect(0,0, canvas.width, canvas.height);
	}
};