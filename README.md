# Digits-reader-app

Digits reader is a simple web application that allows the user to draw a digit on a canvas and then read it.

The purpose of it is to showcase a neural network by training it to recognize handwritten digits and uploading it as a JSON object.

# How to use

The app is live and ready to be tested at https://stoynov96.github.io/digits-reader-app/

### First, write a digit on the canvas (touch screen support implementation is in progress, but for please now use a mouse).
![1 write](https://user-images.githubusercontent.com/5933614/35468824-92bfb1a2-02db-11e8-83f2-29ffb8d695b1.png)

### Watch the text under the canvas - the image will be read through a neural net and recognized (hopefully).
![2 watch](https://user-images.githubusercontent.com/5933614/35468851-4a6b0e82-02dc-11e8-9a38-27ce4bf0abc9.png)

### Of course, this successful recognition is not achieved in 100% of test cases.
![3 fail](https://user-images.githubusercontent.com/5933614/35468894-6b795a56-02dd-11e8-91c9-10142c8683c8.png)

However, the neural network currently used was successful in recognizing about 96% of the test data.
Of course, the sets of the training data and test data were disjoint. 
