var neural_network_ns = new function() {
	var network = JSON.parse(network_data_string);

	const FIRST_LAYER_SIZE = 784;

	/*
	Network traversal functions
	*/

	feedForward = function(input, certainty) {
		/*
		Feeds an input through the network
			input: array of size FIRST_LAYER_SIZE that is to be processed by the neural net
			certainty: value of certainty that the net has of its guess
				this is the maximum activation value of the last layer 
		*/
		var activations = input;
		var prev_activations = activations;
		var zs;
		var z;

		for (var layer = 0; layer < network.biases.length; ++ layer) {
			zs = new Array(network.biases[layer].length);
			prev_activations = activations;
			activations = new Array(zs.length);

			for (var neuron_in_layer = 0; neuron_in_layer < network.biases[layer].length; ++ neuron_in_layer) {
				z = getZ(network.biases[layer][neuron_in_layer], network.weights[layer][neuron_in_layer], prev_activations);
				zs[neuron_in_layer] = z;
				activations[neuron_in_layer] = getActivation(z);
			}
		}

		var digit = 0;
		var maxGuess = -1;
		// console.log('activations; ', activations);
		for (var i = 0; i < activations.length; ++ i) {
			if (activations[i] > maxGuess) {
				maxGuess = activations[i];
				digit = i;
			}
		}
		certainty[0] = maxGuess;
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

	function getPixelValues(imageData, refitFillFraction) {
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
		// Refit image (optimize side whitespace)
		pixels = refitImage(pixels, aLarge, refitFillFraction);
		// Resize data
		pixels = resizeData (pixels, FIRST_LAYER_SIZE);
		// DEBUG
		// writeOnDebugCanvas(pixels, "#debugCanvasSmall");

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
	function getSquareAverage(oldArray, oldArraySide, squareSide, startI, startJ) {
		/*
		Gets the average of pixel values (each between 0 and 1) within a square
			with coordinates startI, startJ
		Square is a part of oldArray and has a specified side.
		*/
		var sum = 0.0;
		var endI = startI + squareSide;
		var endJ = startJ + squareSide;
		for (var i = startI; i < endI; ++ i) {
			for (var j = startJ; j < endJ; ++ j) {
				sum = sum + oldArray[i*oldArraySide + j];
			}
		}
		var average = sum / (squareSide*squareSide)
		return average;
	}
	function resizeData(oldArray, newLength) {
		/*
		Resizes an array of pixel values to a new length
		Assumes newLength is smaller than array.length
			otherwise, it returns the old array
		converts "squares" of pixels to a single pixel
		*/
		if (oldArray.length < newLength) {
			return oldArray;
		}

		array = new Array(newLength);

		var aSmall = Math.floor(Math.sqrt(newLength));
		var aLarge = Math.floor(Math.sqrt(oldArray.length));
		// ratio is side of a square
		var ratio = Math.floor(aLarge/aSmall);

		var newArrI = 0, newArrJ = 0;
		for (var i = 0; i < aLarge; i += ratio) {
			for (var j = 0; j < aLarge; j += ratio) {
				array[newArrI*aSmall + newArrJ]
					= getSquareAverage(oldArray, aLarge, ratio, i, j);
				++newArrJ;
			}
			newArrJ = 0;
			++newArrI;
		}

		return array;
	}


	function refitImage(pixelData, squareSide, fillFract, pixelTreshold = 0.05) {
		/*
		Crops whitespace from the sides of a square image
		pixelData - alpha pixel data (0 to 1) of image to be cropped
		squareSide - side of the side of a square image (in pixels)
		fillFract - fract of image height to be non-whitespace
		pixelTreshold - minimum value of a pixel to be considered start of image
		*/

		// Get coordinates of new image
		var firstRow = findFirstRow(pixelData, squareSide, pixelTreshold);
		var lastRow = findLastRow(pixelData, squareSide, pixelTreshold);
		var firstCol = findLeftMostCol(pixelData, squareSide, pixelTreshold);
		var lastCol = findRightMostCol(pixelData, squareSide, pixelTreshold);


		// Check if any black pixels are present
		if (firstCol > lastCol) return pixelData;


		// Error check fraction
		if (fillFract < 0) {
			return pixelData;
		}
		if (fillFract > 1) {
			fillFract = 1;
		}

		// Calculate required values
		var newNonWhiteSqRows = 1 + lastRow - firstRow;
		var newNonWhiteSqCols = 1 + lastCol - firstCol;
		
		var newSqSide = Math.floor( newNonWhiteSqRows / fillFract );

		var newSideWhitespace 
			= Math.floor((newSqSide - newNonWhiteSqCols) / 2); 
		var newTopWhitespace 
			= Math.floor((newSqSide - newNonWhiteSqRows) / 2);

		// TODO: This assumes height > width. Fix to work in both cases
		if (newNonWhiteSqCols > newNonWhiteSqRows)
			return pixelData; // Temporary
		// TODO: Remove when out-of-bounds bug is fixed
		// if (newSqSide > squareSide)
		// 	return pixelData;

		var newPixelData = new Array(newSqSide * newSqSide).fill(0);
		for (var i = 0; i < newSqSide; ++ i) {
			for (var j = 0; j < newSqSide; ++ j) {
				var pixelData_i = firstRow + i - newTopWhitespace;
				var pixelData_j = firstCol + j - newSideWhitespace;
				pixelData_i = fitWithinBounds(pixelData_i, 0, squareSide-1);
				pixelData_j = fitWithinBounds(pixelData_j, 0, squareSide-1);

				newPixelData[i*newSqSide + j]
					= pixelData[pixelData_i*squareSide + pixelData_j];
			}
		}

		// DEBUG
		// DEBUG_displayOnNewCanvas(newPixelData, newSqSide);

		return newPixelData;
	}
	function fitWithinBounds(number, lowerBound, upperBound) {
		/*
		Retrurns a number fitted between lower and upper bound
		if the number is not within bounds, the closes bound is returned
		Parameters:
			number - the number that needs to be fitted
			lowerBound - minimum value to return
			upperBound - maximum value to return
		Returns: number between lowerBound and upperBound
		*/
		if (number < lowerBound) return lowerBound;
		if (number > upperBound) return upperBound;
		return number;
	}
	function DEBUG_displayOnNewCanvas(newPixelData, newSqSide) {
		var ID = 'debugCanvas';
		// Delete debug canvas if one exists
		var debugCanv = document.querySelector('#' + ID);
		if (debugCanv && debugCanv.parentElement) {
			debugCanv.parentElement.removeChild(debugCanv);
		}

		// Create new debug canvas
		debugCanv = document.createElement('canvas');
		debugCanv.id = ID;
		debugCanv.height = newSqSide;
		debugCanv.width = newSqSide;

		// Append new canvas as child
		debugDiv.appendChild(debugCanv);

		// Get context and image data
		var context = debugCanv.getContext('2d');
		var imageData = context.getImageData(0,0,debugCanv.width, debugCanv.height);

		// Write on the new debug canvas
		for (var i = 0; i < newPixelData.length; ++i) {
			imageData.data[3 + i*4] = newPixelData[i]*255;
		}

		context.putImageData(imageData,0,0);

		return newPixelData;
	}

	/*
	TODO: Change find functions to return all 4 paramters with one function
		(pass them by reference)
	*/
	function findFirstRow(pixelData, squareSide, pixelTreshold) {
		/*
		Finds first filled row (non-whitespace) of an image
		pixelData - alpha pixel data (0 to 1) of image to be cropped
		squareSide - side of the side of a square image (in pixels)
		pixelTreshold - minimum value of a pixel to be considered start of image
		*/
		for (var i = 0; i < squareSide; ++ i) {
			for (var j = 0; j < squareSide; ++ j) {
				if (pixelData[i*squareSide + j] > pixelTreshold) {
					return i;
				}
			}
		}
		return squareSide;
	}
	function findLastRow(pixelData, squareSide, pixelTreshold) {
		/*
		Finds last filled row (non-whitespace) of an image
		pixelData - alpha pixel data (0 to 1) of image to be cropped
		squareSide - side of the side of a square image (in pixels)
		pixelTreshold - minimum value of a pixel to be considered start of image
		*/
		var lr = squareSide;	// last row
		for (var i = 0; i < squareSide; ++ i) {
			for (var j = 0; j < squareSide; ++ j) {
				if (pixelData[i*squareSide + j] > pixelTreshold) {
					lr = i;
				}
			}
		}
		return lr;
	}
	function findLeftMostCol(pixelData, squareSide, pixelTreshold) {
		/*
		Finds leftmost filled column (non-whitespace) of an image
		pixelData - alpha pixel data (0 to 1) of image to be cropped
		squareSide - side of the side of a square image (in pixels)
		pixelTreshold - minimum value of a pixel to be considered start of image
		*/
		var minJ = squareSide;	// leftmost column
		for (var i = 0; i < squareSide; ++ i) {
			for (var j = 0; j < squareSide; ++ j) {
				if (pixelData[i*squareSide + j] > pixelTreshold && j < minJ) {
					minJ = j;;
				}
			}
		}
		return minJ;
	}
	function findRightMostCol(pixelData, squareSide, pixelTreshold) {
		/*
		Finds rightmost filled column (non-whitespace) of an image
		pixelData - alpha pixel data (0 to 1) of image to be cropped
		squareSide - side of the side of a square image (in pixels)
		pixelTreshold - minimum value of a pixel to be considered start of image
		*/
		var maxJ = 0;	// rightmost column
		for (var i = 0; i < squareSide; ++ i) {
			for (var j = 0; j < squareSide; ++ j) {
				if (pixelData[i*squareSide + j] > pixelTreshold && j > maxJ) {
					maxJ = j;;
				}
			}
		}
		return maxJ;
	}



	this.recognizeDigit = function(canvasId, logToConsole = false) {
		var canvas = document.querySelector("#" + canvasId);
		var context = canvas.getContext('2d');
		var imageData = context.getImageData(0,0,canvas.width, canvas.height);

		var pixels = getPixelValues(imageData, 0.6);

		var certainty = new Array(1);
		var digit = feedForward(pixels, certainty);

		document.querySelector("#guessSpan").innerText 
			= digit;
		document.querySelector('#certaintySpan').innerText
			= (certainty[0]*100).toFixed(2) + '%';

		context.putImageData(imageData,0,0);

	}

	this.drawWeights = function(canvasId, weightNum = 0) {
		/*
		Displays the weights of the weightNum'th neuron of the second layer
		Most useful if no hidden layers are used
			canvasId - canvas on which weights are displayed
			weightNum - index of neuron from the second layer the weights of which should be displayed
				this index is the digit if no hidden layers are present
		*/
		var canvas = document.querySelector("#" + canvasId);
		var context = canvas.getContext('2d');
		var imageData = context.getImageData(0,0,canvas.width, canvas.height);

		pixels = new Array(network.weights[0][weightNum].length);
		for (var i = 0; i < pixels.length; ++ i) {
			pixels[i] = getActivation(network.weights[0][weightNum][i]);
		}

		for (var i = 0; i < pixels.length; ++ i) {
			imageData.data[3 + i*4] = pixels[i]*255;
		}

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
