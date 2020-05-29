const fileUrl = 'https://github.com/claire-lugrin/JSCode/blob/master/trials_table.csv' // provide file location

fetch(fileUrl)
   .then( r => r.json() )
   .then( t => console.log(t) )

// mock number of elements for now -> TODO: load them from csv table
var nbTrials=100;
var arrNbSquares=Array.from({length: nbTrials}, () => Math.ceil(Math.random() * 30));
var arrNbDiamonds=Array.from({length: nbTrials}, () => Math.ceil(Math.random() * 30));

// define the patch as an object
var patch={
	xCenter:250,
    yCenter:250,
    radius:150,
    color:'rgb(204,204,204)',
    colSurround:'rgb(128,128,128)'}

// compute the possible positions of squares and diamonds
var meshInfo={
	dimMesh:30,
    radius:patch.radius,
    xCenter:patch.xCenter,
    yCenter:patch.yCenter,
    boderTolerance:12,
    get xstart(){return(this.xCenter-this.radius+this.boderTolerance);},
    get ystart(){return(this.yCenter-this.radius+this.boderTolerance);},
    get xend(){return(this.xCenter+this.radius-this.boderTolerance);},
    get yend(){return(this.yCenter+this.radius-this.boderTolerance);},
};


// function that returns the x and y poisiton of the nodes where we can have te poins
function createMesh(meshInfo){
	// x positions
	var xpos=[];
	var i;
	for (i=meshInfo.xstart;i<meshInfo.xend;i=i+meshInfo.dimMesh){
		xpos.push(i);
	}

	// y positions
  var ypos=[];
  var j;
	for (j=meshInfo.ystart;j<meshInfo.yend;j=j+meshInfo.dimMesh){
		ypos.push(j);
	}

	// vectors with combination of both: repeat the xpos for all ypos and vice versa
	var xposall=[];
	var yposall=[];
	xpos.forEach(function(x){
		ypos.forEach(function(y){
			xposall.push(x);
			yposall.push(y);
		});
	});

	// restrict the positions to inside the patch
    var xposGood=[];
    var yposGood=[];
    var k;
    for(k=0;k<xposall.length;k++){
    	var criterion=(xposall[k]-meshInfo.xCenter)*(xposall[k]-meshInfo.xCenter)+(yposall[k]-meshInfo.yCenter)*(yposall[k]-meshInfo.yCenter)
    	var rad2=(meshInfo.radius-meshInfo.boderTolerance)*(meshInfo.radius-meshInfo.boderTolerance)
    	if (criterion<rad2){
    		xposGood.push(xposall[k])
    		yposGood.push(yposall[k])
    	}
    }
	// retrun an array with both
	return [xposGood,yposGood]
}

var possPositions=createMesh(meshInfo)


// define the position of diamonds and squares, random for each trial among the possible posiitons + add a jitter to each dot 
function defineStimuliPosition(trial,arrNbSquares,arrNbDiamonds,possPositions){
	var nSquares=arrNbSquares[trial];
	var nDiamonds=arrNbDiamonds[trial];
	var maxJitter=8;

	// initialize all locations
	var allLocations=Array.from({length: possPositions[0].length}, (_, index) => index + 1);
	// find a random location that was not taken before

	var ix_loc

	// for squares
    var xposSquares=[];
	var yposSquares=[];
	for(var ns=0;ns<nSquares;ns++){

		// chose a random node
		ix_loc=Math.floor(Math.random()*allLocations.length);

		// append the values of x and y for this node to the vectors
		xposSquares.push(possPositions[0][allLocations[ix_loc]] +Math.ceil(Math.random() * (maxJitter + maxJitter) - maxJitter));
        yposSquares.push(possPositions[1][allLocations[ix_loc]] +Math.ceil(Math.random() * (maxJitter + maxJitter) - maxJitter));

        // remove the location from the available ones
		allLocations.splice(ix_loc,1);
	}

	// for diamonds
	var xposDiamonds=[];
	var yposDiamonds=[];
	for(var nd=0;nd<nDiamonds;nd++){

		// chose a random node
		ix_loc=Math.floor(Math.random()*allLocations.length);
		
		// append the values of x and y for this node to the vectors
		xposDiamonds.push(possPositions[0][allLocations[ix_loc]] +Math.ceil(Math.random() * (maxJitter + maxJitter) - maxJitter));
        yposDiamonds.push(possPositions[1][allLocations[ix_loc]] +Math.ceil(Math.random() * (maxJitter + maxJitter) - maxJitter));


        // remove the location from the available ones
		allLocations.splice(ix_loc,1);

	}
	return {
		xposSquares, 
		yposSquares,
		xposDiamonds,
		yposDiamonds}
};

// here to change 1 for the current trial family 
var stimuliPosition=defineStimuliPosition(1,arrNbSquares,arrNbDiamonds,possPositions);


function drawPatch(patch,ctx,colSurround){
// draw patch
  var circle = new Path2D();
  circle.arc(patch.xCenter, patch.yCenter, patch.radius, 0, 2 * Math.PI);
  ctx.fillStyle = patch.color;
  ctx.fill(circle);
  ctx.lineWidth=4
  ctx.strokeStyle=colSurround;
  ctx.stroke(circle);
}


// draw the cues
function drawCues(patch,stimCond,respCond,tranStim,transResp){
    
    var stimSize=16;
    var ystimPos=patch.yCenter-25;
    var yrespPos=patch.yCenter+20;
    
	// define the color of the stimulus cue
	if (tranStim){
		var colStim='rgb(53, 77, 229)';
	} else {
		if (stimCond===1){
		var colStim=patch.colSurround;
		}else{
			var colStim='rgb(0,0,0)';
		}
	};

	// define the color of the response
	if (transResp){
		var colResp='rgb(53, 77, 229)';
	} else {
		var colResp='rgb(0,0,0)';
	};

 	var canvas = document.getElementById('canvas');
 	if (canvas.getContext) {
   		var ctx = canvas.getContext('2d');

    	// draw patch
    	drawPatch(patch,ctx,patch.colSurround)

    	// draw the cross
    	var crossSize=10;
      ctx.strokeStyle = patch.colSurround;
      ctx.lineWidth=1;
      ctx.moveTo(patch.xCenter - crossSize / 2, patch.yCenter);
      ctx.lineTo(patch.xCenter + crossSize / 2, patch.yCenter);
      ctx.stroke();
      ctx.moveTo(patch.xCenter , patch.yCenter - crossSize / 2);
      ctx.lineTo(patch.xCenter , patch.yCenter+ crossSize / 2);
      ctx.stroke();

    	// draw the stimulus cue
    	ctx.fillStyle = colStim;
    	if (stimCond===1){
		var circle = new Path2D();
 			circle.arc(patch.xCenter, patch.yCenter-24, 12, 0, 2 * Math.PI);
  			ctx.fill(circle);
		}else{
			ctx.fillStyle = colStim;
    		var diagSize=Math.floor(stimSize*Math.sqrt(2))
      		ctx.moveTo(patch.xCenter - diagSize / 2, ystimPos);
      		ctx.lineTo(patch.xCenter, ystimPos- diagSize/2);
      		ctx.lineTo(patch.xCenter + diagSize / 2, ystimPos);
      		ctx.lineTo(patch.xCenter , ystimPos+ diagSize / 2);
      		ctx.closePath();     
      		ctx.fill();		
		}

      // draw the response cue 
      if(respCond===1){
      	var textCue='1-2';
      }else{
      	var textCue='2-1'
      }

	ctx.moveTo(patch.xCenter , yrespPos);
    ctx.font = "30px Arial";
    ctx.fillStyle=colResp;
    ctx.textAlign='center';
    ctx.fillText(textCue,patch.xCenter , yrespPos+30/2)
     };
}


// draw the stimuli: diamonds and squares
function drawStimuli(patch,stimuliPosition) {
  // define the colors
  var colDiamonds='rgb(112,0,0)';
  var colSquares='rgb(0, 84, 112)';

  var stimSize=8;
  var nbDiamonds=stimuliPosition.xposDiamonds.length;
  var nbSquares=stimuliPosition.xposSquares.length;

  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');

    // draw patch
    drawPatch(patch,ctx,patch.colSurround)

    // draw squares
    ctx.fillStyle = colSquares;
    ctx.strokeStyle = colSquares;
    ctx.lineWidth=1.5
    var ns
    for(ns=0;ns<nbSquares;ns++){
     ctx.fillRect(stimuliPosition.xposSquares[ns]-stimSize/2, stimuliPosition.yposSquares[ns]-stimSize/2, stimSize, stimSize);
     ctx.strokeRect(stimuliPosition.xposSquares[ns]-stimSize/2, stimuliPosition.yposSquares[ns]-stimSize/2, stimSize, stimSize);
    }

    // draw diamonds
    ctx.fillStyle = colDiamonds;
    var nd
    var diagSize=Math.floor(stimSize*Math.sqrt(2))
    
    for(nd=0;nd<nbDiamonds;nd++){
      ctx.moveTo(stimuliPosition.xposDiamonds[nd] - diagSize / 2, stimuliPosition.yposDiamonds[nd]);
      ctx.lineTo(stimuliPosition.xposDiamonds[nd], stimuliPosition.yposDiamonds[nd]- diagSize/2);
      ctx.lineTo(stimuliPosition.xposDiamonds[nd] + diagSize / 2, stimuliPosition.yposDiamonds[nd]);
      ctx.lineTo(stimuliPosition.xposDiamonds[nd] , stimuliPosition.yposDiamonds[nd]+ diagSize / 2);
      ctx.closePath();     
      ctx.fill();
    }
  }
}

// draw the cloud selected 1 or 2
function drawFeedbackSel(patch,cloudSelected) {
    // define the colors
    var colFeedback='rgb(255,255,255)';
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');

      // draw patch
    	drawPatch(patch,ctx,colFeedback)

      // draw the number selected in the middle
      ctx.moveTo(patch.xCenter , patch.yCenter);
      ctx.font = "30px Arial";
      ctx.fillStyle=colFeedback;
      ctx.textAlign='center';
      ctx.fillText(cloudSelected,patch.xCenter , patch.yCenter+30/2)

   }
}

// draw the feedback correct or wrong
function drawFeedbackCorrWrong(patch,cloudSelected,correct) {
    // define the colors
    if (correct){
	var colFeedback='rgb(51, 255, 72)';
    } else {
    	var colFeedback='rgb(229, 52, 52)';
    }
    
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');

      // draw patch
    	drawPatch(patch,ctx,colFeedback)

      // draw the number selected in the middle
      ctx.moveTo(patch.xCenter , patch.yCenter);
      ctx.font = "30px Arial";
      ctx.fillStyle=colFeedback;
      ctx.textAlign='center';
      ctx.fillText(cloudSelected,patch.xCenter , patch.yCenter+30/2)

   }
}


// draw the fixation cross
function drawFixationCross(patch) {
    // define the colors
    var colCross=patch.colSurround;
    var crossSize=10;
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
      var ctx = canvas.getContext('2d');

   	// draw patch
    	drawPatch(patch,ctx,patch.colSurround)

      // draw cross
      ctx.strokeStyle = colCross;
      ctx.lineWidth=1;
      ctx.moveTo(patch.xCenter - crossSize / 2, patch.yCenter);
      ctx.lineTo(patch.xCenter + crossSize / 2, patch.yCenter);
      ctx.stroke();
      ctx.moveTo(patch.xCenter , patch.yCenter - crossSize / 2);
      ctx.lineTo(patch.xCenter , patch.yCenter+ crossSize / 2);
      ctx.stroke();

   }
}

