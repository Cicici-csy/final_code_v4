let sentiment;
let inputBox, sentimentResult, conversation;
let totalConfidence = 0, inputCount = 0, maxInputs = 5;
let colorChosen = false, balloonColor = "", colorScore = 0;
let totalsensor = 0, count = 0;

const serial = new p5.WebSerial();

function preload() {
  sentiment = ml5.sentiment("MovieReviews");
}

function setup() {
  noCanvas();


  if (!navigator.serial) {
    alert("WebSerial is not supported. Try Chrome.");
  }
  serial.getPorts();
  serial.on("portavailable", openPort);
  serial.on("data", serialEvent);


  inputBox = select("#userInput");
  sentimentResult = select("#feedback");
  conversation = select("#conversation");
  sentimentResult.html("Please choose your balloon color.");


  inputBox.elt.addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleSubmit();
  });
}

function handleSubmit() {
  let text = inputBox.value().trim();
  if (!colorChosen) {
    handleColorChoice(text);
  } else {
    getSentiment(text);
  }
}

function handleColorChoice(text) {
  const validColors = { red: 100, yellow: 75, blue: 50, green: 25 };
  if (validColors[text.toLowerCase()]) {
    balloonColor = text.toLowerCase();
    colorScore = validColors[balloonColor];
    colorChosen = true;
    conversation.html(conversation.html() + `> Chosen balloon color: ${balloonColor}\n`);
    sentimentResult.html("Now type your thoughts below.");
    inputBox.value("");
  } else {
    sentimentResult.html("Invalid color. Please choose from red, yellow, blue, or green.");
  }
}

function getSentiment(text) {
  if (inputCount < maxInputs) {
    conversation.html(conversation.html() + `> ${text}\n`);
    sentiment.predict(text, gotResult);
  }
}

function gotResult(prediction) {
  totalConfidence += prediction.confidence;
  inputCount++;

  if (inputCount >= maxInputs) {

    let averageConfidence = (1 - totalConfidence / maxInputs).toFixed(2);
    let sensorAverage = totalsensor / Number(count); 
    let finalScore = (Number(colorScore) * 0.5) + (Number(averageConfidence) * 100 * 0.6) + Number(sensorAverage) * 0.1;
    console.log(sensorAverage)
    sentimentResult.html(
      `>>> Test report:<br>
      Final Score: ${finalScore.toFixed(2)}<br>`
    );


    if (finalScore < 25) {
      sentimentResult.html(sentimentResult.html() + "<br>> Sentiment: Smiling Angel!<br>> Suggested Action: Keep smiling and enjoy!");
    } else if (finalScore >= 25 && finalScore < 50) {
      sentimentResult.html(sentimentResult.html() + "<br>> Sentiment: A bit nervous, relax!<br>> Suggested Action: Try deep breaths.");
    } else if (finalScore >= 50 && finalScore < 75) {
      sentimentResult.html(sentimentResult.html() + "<br>> Sentiment: A little uneasy, take a deep breath!<br>> Suggested Action: Don't worry, take a break.");
    } else {
      sentimentResult.html(sentimentResult.html() + "<br>> Sentiment: Crying, let's soothe you!<br>> Suggested Action: Relax and let go of tension.");
    }

    inputBox.attribute("disabled", true);
  } else {
    sentimentResult.html("Keep typing!");
    inputBox.value("");
  }
}

function serialEvent() {
  let inString = serial.readStringUntil("\r\n");
  if (inString) {
    let sensorValue = Number(inString.trim().replace(",",''));
    totalsensor += sensorValue;  
    count++;  
  }
}

function openPort() {
  serial.open();
}
