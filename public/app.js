 let otherVideos = {};
 let myVideo;
let poseNet;
let poses = [];

function setup() {
    
    const myCanvas=createCanvas(640,480);
    myCanvas.parent("canvas-container");
    let constraints = {audio: false, video: true};
  myVideo = createCapture(constraints, 
    function(stream) {
	  let p5l = new p5LiveMedia(this, "CAPTURE", stream, "Shared Space")
	  p5l.on('stream', gotStream);
      p5l.on('disconnect', gotDisconnect);
    }
  );  
  myVideo.elt.muted = true;     
  myVideo.hide();
    poseNet = ml5.poseNet(myVideo, modelReady);
    // This sets up an event that fills the global variable "poses"
    // with an array every time new poses are detected
    poseNet.on('pose', function(results) {
        poses = results;
    });    
    

    
}

function draw() {
    tint(255,0,0,125);
    image(myVideo,0,0,width,height);
  
    for (const id in otherVideos) {
        tint(0,0,255,125);
        image(otherVideos[id],30,0,width,height);
    }
  
    
    drawKeypoints();
    drawSkeleton();
}		



function modelReady() {
    select('#status').html('Model Loaded');
    }
    function drawKeypoints()  {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {
        // For each pose detected, loop through all the keypoints
        let pose = poses[i].pose;
        for (let j = 0; j < pose.keypoints.length; j++) {
        // A keypoint is an object describing a body part (like rightArm or leftShoulder)
        let keypoint = pose.keypoints[j];
        // Only draw an ellipse is the pose probability is bigger than 0.2
        if (keypoint.score > 0.2) {
            fill(255, 0, 0);
            noStroke();
            ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
        }
        }
    }
    }
    
    // A function to draw the skeletons
    function drawSkeleton() {
    // Loop through all the skeletons detected
    for (let i = 0; i < poses.length; i++) {
        let skeleton = poses[i].skeleton;
        // For every skeleton, loop through all body connections
        for (let j = 0; j < skeleton.length; j++) {
        let partA = skeleton[j][0];
        let partB = skeleton[j][1];
        stroke(255, 0, 0);
        line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
    }
    }
    

 
// We got a new stream!
function gotStream(stream, id) {
  // This is just like a video/stream from createCapture(VIDEO)
  otherVideo = stream;
  //otherVideo.id and id are the same and unique identifiers
  otherVideo.hide();
  
  otherVideos[id] = stream;
}

function gotDisconnect(id) {
 delete otherVideos[id]; 
}