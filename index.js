const webcamElement = document.getElementById('webcam');
var classifier = knnClassifier.create();

async function setupWebcam() {
    return new Promise((resolve, reject) => {
      const navigatorAny = navigator;
      navigator.getUserMedia = navigator.getUserMedia ||
          navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
          navigatorAny.msGetUserMedia;
      if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true},
          stream => {
            webcamElement.srcObject = stream;
            webcamElement.addEventListener('loadeddata',  () => resolve(), false);
          },
          error => reject());
      } else {
        reject();
      }
    });
}

let net;

classAcount = 0;
classBcount = 0;
classCcount = 0;

async function app() {
    console.log('Loading mobilenet..');
  
    // Load the model.
    net = await mobilenet.load();

    var elem = document.querySelector('#wait-msg');
    elem.parentNode.removeChild(elem);

    console.log('Sucessfully loaded model');
  
    await setupWebcam();
  
    // Reads an image from the webcam and associates it with a specific class
    // index.
    const addExample = classId => {
      // Get the intermediate activation of MobileNet 'conv_preds' and pass that
      // to the KNN classifier.
      const activation = net.infer(webcamElement, 'conv_preds');
  
      // Pass the intermediate activation to the classifier.
      classifier.addExample(activation, classId);
    };
  
    // When clicking a button, add an example for that class.
    document.getElementById('class-a').addEventListener('click', () => {addExample(0); classAcount++;});
    document.getElementById('class-b').addEventListener('click', () => {addExample(1); classBcount++;});
    document.getElementById('class-c').addEventListener('click', () => {addExample(2); classCcount++;});
    document.getElementById('reset-btn').addEventListener('click', () => {
      classAcount = 0;
      classBcount = 0;
      classCcount = 0;
      classifier = knnClassifier.create();
    });
  
    while (true) {
      if (classifier.getNumClasses() > 0) {
        // Get the activation from mobilenet from the webcam.
        const activation = net.infer(webcamElement, 'conv_preds');
        // Get the most likely class and confidences from the classifier module.
        const result = await classifier.predictClass(activation);
  
        const classes = ['A', 'B', 'C'];

        document.getElementById('console').innerText = `
          Prediction Class: ${classes[result.classIndex]}\n
          Probability: ${result.confidences[result.classIndex]}
        `;

        document.getElementById('example-count').innerText = `
          Examples in Class A: ${classAcount}\n
          Examples in Class B: ${classBcount}\n
          Examples in Class C: ${classCcount}
        `;
      }
  
      await tf.nextFrame();
    }
}

app();