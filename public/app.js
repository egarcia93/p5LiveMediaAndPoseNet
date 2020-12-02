let otherVideos = {};
let myVideo;
let poseNet;
let poses = [];
let flag = false;
let player;
let panner;
let player2;
let panner2;
let p5l;



//Listen for confirmation of connection



function setup() {
    
    const myCanvas=createCanvas(640,480);
    myCanvas.parent("canvas-container");
    let constraints = {audio: false, video: true};
    myVideo = createCapture(constraints, 
    function(stream) {
	  p5l = new p5LiveMedia(this, "CAPTURE", stream, "Shared Space")
	  p5l.on('stream', gotStream);
      p5l.on('disconnect', gotDisconnect)
      p5l.on('data',gotData);
    });
      
  
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

    if(!flag){
        fill(0);
        rect(0,0,width,height);
        fill(255);
        textSize(50);
        textAlign(CENTER, CENTER);
        text('Click to start', width/2, height/2);

    }else{
        push();
        tint(255,0,0,125);
    
        translate(myVideo.width, 0);
        scale(-1, 1);
        image(myVideo,0,0,width,height);
  
  
    for (const id in otherVideos) {
        tint(0,0,255,125);
        image(otherVideos[id],0,0,width,height);
    }
    pop();
    
    drawKeypoints();
 
    }

    
 
   
}		

function mouseClicked(){
    if(!flag){

        panner = new Tone.Panner(1).toMaster();
        player = new Tone.Player("data/river.wav").connect(panner);
        
        panner2 = new Tone.Panner(1).toMaster();
        player2 = new Tone.Player("data/wind.wav").connect(panner2);
        // play as soon as the buffer is loaded
        player.autostart = true;
        player.loop = true;
        player2.autostart = true;
        player2.loop = true;
        flag = true;     

    }
   
}

function modelReady() {
    select('#status').html('Model Loaded');
    }

    function drawKeypoints()  {
    // Loop through all the poses detected
    for(let i = 0; i < poses.length; i++){
        let nose = poses[i].pose.nose;

       
        if(nose.confidence > 0.5){
            
           
            fill(255);
            textSize(20);
            text('Move your nose around', width-nose.x, nose.y);
            
            let dataToSend = {x: nose.x, y: nose.y};
  
            // Send it
            p5l.send(JSON.stringify(dataToSend));
            if(flag){
               panner.set({pan: map(nose.x,0,width,1,-1)}); 
               player.set({playbackRate: (nose.y/width)*2});

            }
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

function gotData(data, id) {
    console.log(id + ":" + data);
    
    // If it is JSON, parse it
    let d = JSON.parse(data);
    otherX = d.x;
    otherY = d.y;
    ellipse(otherX,otherY,10,10);
    panner2.set({pan: map(otherX,0,width,1,-1)}); 
    player2.set({playbackRate: (otherY/width)*2});
  }
  