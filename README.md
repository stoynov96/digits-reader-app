# Digits-reader-app

Digits reader is a simple web application that allows the user to draw a digit on a canvas and then read it.

The purpose of it is to showcase a neural network by training it to recognize handwritten digits and uploading it as a JSON object.

# How to use

The app is live and ready to be tested at https://stoynov96.github.io/digits-reader-app/

First, write a digit on the canvas (touch screen support implementation is in progress, but for please now use a mouse).

Watch the text under the canvas - the image will be read through a neural net and recognized (hopefully).

Of course, this successful recognition is not achieved in 100% of test cases.

However, the neural network currently used was successful in recognizing about 96% of the test data.
Of course, the sets of the training data and test data were disjoint. 
