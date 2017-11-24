var neural_network_ns = new function() {
	var network = JSON.parse(network_data_string);

	const FIRST_LAYER_SIZE = 784;

	feedForward = function(input) {
		// var activations = new Array(FIRST_LAYER_SIZE);
		var activations = input;
		var prev_activations = activations;
		var zs;
		var z;

		for (var layer = 0; layer < network.biases.length; ++ layer) {
			// console.log(network.biases[layer]);
			zs = new Array(network.biases[layer].length);
			prev_activations = activations;
			activations = new Array(zs.length);

			for (var neuron_in_layer = 0; neuron_in_layer < network.biases[layer].length; ++ neuron_in_layer) {
				// console.log(neuron_in_layer, network.biases[layer][neuron_in_layer]);
				z = getZ(network.biases[layer][neuron_in_layer], network.weights[layer][neuron_in_layer], prev_activations);
				zs[neuron_in_layer] = z;
				activations[neuron_in_layer] = getActivation(z);
			}
		}

		var digit = 0;
		var maxGuess = -1;
		console.log(activations);
		for (var i = 0; i < activations.length; ++ i) {
			if (activations[i] > maxGuess) {
				maxGuess = activations[i];
				digit = i;
			}
		}
		return digit;
	}

	function getZ(biases, weights, activations) {
	/*
	returns the z = (sum(weight*activation) + bias) of a single neuron
	biases 		- expected to be a vector of length 1
	weights		- expected to be a vector of length x, where x is the number of neurons in the PREVIOUS layer of the network
	activations	- expected to be a vector of length x, where x is the number of neurons in the PREVIOUS layer of the network
				- contains the activations of the previous layer of neurons
	*/
		var sum = 0;
		for (var i = 0; i < weights.length; ++ i) {
			sum += (weights[i] * activations[i]);
		}
		sum += biases[0];

		return sum;
	}

	function getActivation(z) {
	/*
	Returns the sigmoid (1/(1+e^-z)) of z
	*/
		return 1/(1+Math.pow(Math.E,-z));
	}



	/*
	Digit Recognition
	*/

	function getPixelValues(imageData) {
		/*
		Returns an array of FIRST_LAYER_SIZE numbers from 0 to 1
		with the alpha values of each pixel to be fed in the net
		*/
		var dataLen = imageData.data.length / 4;
		// small square size
		var aSmall = Math.round(Math.sqrt(FIRST_LAYER_SIZE));
		// large square size
		var aLarge = Math.round(Math.sqrt(dataLen));

		// Get relevant data (alpha values)
		var pixels = getRelevantData(imageData, dataLen);
		// Normalize relevant data and store it
		normalizeData (pixels, 255);
		// Resize data
		pixels = resizeData (pixels, FIRST_LAYER_SIZE);

		return pixels;
	}
	function getRelevantData(imageData, dataLen) {
		/*
		Returns an array with only the alpha values of the image
		*/
		var relevant = new Array(dataLen);
		for (var i = 0; i < dataLen; ++ i) {
			relevant[i] = imageData.data[3 + i*4];
		}

		return relevant;
	}
	function normalizeData(array, maxE) {
		/*
		Normalizes assuming data[i] is from 0 to maxE
		*/
		for (var i = 0; i < array.length; ++ i) {
			array[i] = array[i] / maxE;
		}
	}
	function resizeData(oldArray, newLength) {
		/*
		Resizes an array of pixel values to a new length
		Assumes newLength is smaller than array.length
		*/
		// TODO: Make a sumation-based resize as opposed to just taking
		// the first pixel of every square
		array = new Array(newLength);

		var aSmall = Math.floor(Math.sqrt(newLength));
		var aLarge = Math.floor(Math.sqrt(oldArray.length));
		var ratio = Math.floor(aLarge/aSmall);

		for (var i = 0; i < aSmall; ++ i) {
			for (var j = 0; j < aLarge; ++ j) {
				// array[i][j] = oldArray[i*ratio][j*ratio];
				array[i*aSmall + j] = oldArray[i*ratio*aLarge + j*ratio];
			}
		}

		return array;
	}

	this.recognizeDigit = function(canvasId) {
		var canvas = document.querySelector("#" + canvasId);
		var context = canvas.getContext('2d');
		var imageData = context.getImageData(0,0,canvas.width, canvas.height);

		var pixels = getPixelValues(imageData);
		var pixelsSize = Math.floor(Math.sqrt(pixels.length));

		writeOnDebugCanvas(pixels, "#debugCanvasSmall");

		var digit = feedForward(pixels);

		console.log(digit);

		document.querySelector("#guessParagraph").innerText = digit;

		context.putImageData(imageData,0,0);

	}


	function writeOnDebugCanvas(pixelData, canvasSelector) {
		var canvas = document.querySelector(canvasSelector);
		var context = canvas.getContext('2d');
		var imageData = context.getImageData(0,0,canvas.width, canvas.height);

		for (var i = 0; i < pixelData.length; ++i) {
			imageData.data[3 + i*4] = pixelData[i]*255;
		}

		context.putImageData(imageData,0,0);
}
}