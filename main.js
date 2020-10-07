var game = {

	players: 1,
	score: [0,0],
	gameStarted: false,

	gameCanvas: null,
	ctx: null,
	canvasSize: {x:800,y:600},
	defaultFont: 'sans-serif',
	centreLineWidth: 4,
	showScore: true,
	serveCount:0,
	
	paddleHeight: 110,
	paddleWidth: 20,
	paddleOffset: 20,
	paddlePos: [64, 64],
	paddleSpeed: 2,

	ballPos: {x:0, y:0},
	ballSize: 10,
	ballSpeed: 8,
	ballAttached: null,
	ballVelocity: {x:0, y:0},
	ballOut: false,
	
	cpuPlayerServeTime: 800,

	//-----------------
	      
	init: function(){
		this.attachBall(0);
		this.eventListeners();
		this.gameCanvas=new canvas(this.canvasSize.x,this.canvasSize.y,"container");
		this.gameStartTime=new Date();

		game.ctx = game.gameCanvas.contex;
		game.ctx.font = "20px " + game.defaultFont;
		game.ctx.fillStyle = '#ffffff';
		game.ctx.textAlign = 'center';

		//Stretch canvas
		var canvasElement = document.getElementsByTagName('canvas')[0];
		canvasElement.style.height = '80%';

		this.go();
	},

	//-----------------

	eventListeners: function(){
		window.onkeydown=function(e){
			var keyCode = e.code.toLowerCase();

			if(keyCode == 'space'){
				game.serveBall();

				if(!game.gameStarted){
					game.gameStarted = true;
				}
			}
			
		};
	},

	//-----------------

	getPaddlePos: function(player){
		var posPercent = (this.paddlePos[player] / 127) * 100;
		var offset = game.paddleOffset + game.paddleWidth;
		var innerEdge;
		
		if(player === 0){	
			innerEdge = offset;
		} else {
			innerEdge = game.canvasSize.x - offset;
		}

		var screenPos = {
			x: innerEdge,
			y: ( (this.canvasSize.y - game.paddleHeight) / 100) * posPercent 
		};

		if(screenPos.y < 0){
			screenPos.y = 0;
		} else if(screenPos.y > (game.canvasSize.y - game.paddleHeight) ){
			screenPos.y = game.canvasSize.y - game.paddleHeight;
		}

		return screenPos;
	},

	//-----------------

	attachBall: function(player){
		/*
		var newPos = {
			x: game.paddleOffset + game.paddleWidth,
			y: game.getPaddlePos(player) + (game.paddleHeight/2) - (game.ballSize/2)
		};

		game.ballPos = newPos;
		*/

		game.ballOut = false;
		game.ballVelocity.x = 0;
		game.ballVelocity.y = 0;
		game.ballAttached = player;

	},

	//-----------------

	serveBall: function(){
		if(game.ballAttached === null) return;

		game.serveCount++;
		
		var player = game.ballAttached;
		game.ballAttached = null;

		if(player === 0){
			game.ballVelocity.x = game.ballSpeed;
		} else {
			game.ballVelocity.x = -Math.abs(game.ballSpeed);
		}

		game.ballVelocity.y = game.ballSpeed;

	},

	//-----------------

	drawPaddles: function(){
		
		var screenPos, paddlePadding;

		for(var i=0; i<this.paddlePos.length; i++){

			screenPos = game.getPaddlePos(i);
			screenPos = screenPos.y;
			
			if(i === 0){
				paddlePadding = (i*this.canvasSize.x) + this.paddleOffset;
			} else {
				paddlePadding = (i*this.canvasSize.x) - this.paddleWidth - this.paddleOffset;
			}

			this.gameCanvas.quad(paddlePadding,screenPos,this.paddleWidth,this.paddleHeight,'#FFFFFF');

		}

	},

	//-----------------

	drawBall: function(){

		var ballPos = game.ballPos;

		//Check if ball should move with paddle (unserved)
		if(game.ballAttached !== null){

			ballPos = {};
			var player = game.ballAttached;
			var paddlePos = game.getPaddlePos(player);

			if(player === 0){
				ballPos.x = paddlePos.x;
			} else {
				ballPos.x = paddlePos.x - game.ballSize;
			}

			//Stop at top
			if(paddlePos.y < 0 ){
				
			}

			ballPos.y = paddlePos.y + (game.paddleHeight/2) - (game.ballSize/2);

		} else {

			//Ball not attached - move it
			ballPos.x += game.ballVelocity.x;
			ballPos.y += game.ballVelocity.y;

		}

		game.ballPos = ballPos;
		game.gameCanvas.quad(ballPos.x,ballPos.y,game.ballSize,game.ballSize,'#FFFFFF');

	},

	//-----------------

	setPaddlePos: function(player,pos){
		var newPos = 127 - pos;
		this.paddlePos[player] = newPos;
	},

	//-----------------

	moveCpuPlayer: function(){

		//if(game.ballAttached === 0 || game.ballOut || game.ballPos.x < (game.canvasSize.x/8)) return;
		if(game.ballAttached === 0 || game.ballOut) return;
		
		if(game.ballAttached ===1){

			//Serve the ball
			setTimeout(function(){
				game.serveBall();
			}, game.cpuPlayerServeTime);
		}

		else {
			//Move the paddle
			var ballPercent = (game.ballPos.y / game.canvasSize.y) * 100;
			var midiBallPos = (127 / 100) * ballPercent;
			var newPaddlePos = midiBallPos;

			newPaddlePos = 127 - newPaddlePos;

			game.setPaddlePos(1, newPaddlePos);
		}

	},

	//-----------------

	collisionCheck: function(){

		if(game.ballOut) return;

		//Check floor / ceiling collision
		if(game.ballPos.y <= 0){
			game.ballPos.y = 1;
			game.changeBallDirection('y');
		} else if(game.ballPos.y >= (game.canvasSize.y - game.ballSize) ){
			game.ballPos.y = game.canvasSize.y - game.ballSize - 1;
			game.changeBallDirection('y');
		}

		//Check if ball is not near paddles
		if( (game.ballPos.x > (game.paddleOffset + game.paddleWidth) ) &&  (game.ballPos.x < (game.canvasSize.x - game.paddleOffset - game.paddleWidth) ) ){
			return;
		}

		var paddlePos;
		for(var i=0; i<2; i++){
			paddlePos = game.getPaddlePos(i);

			if(i===0 && (game.ballPos.x < paddlePos.x ) && (game.ballPos.y + game.ballSize >= paddlePos.y ) && (game.ballPos.y <= (paddlePos.y + game.paddleHeight)) ){
				game.ballPos.x = paddlePos.x + 1;
				game.changeBallDirection('x');
			} 

			//Hit Paddle 2
			else if (i===1 && (game.ballPos.x + game.ballSize) > paddlePos.x && (game.ballPos.y + game.ballSize >= paddlePos.y) && (game.ballPos.y <= (paddlePos.y + game.paddleHeight)) ){
				//Re-position ball to make sure it's not overlapping when direction changes
				game.ballPos.x = paddlePos.x - game.ballSize - 1;
				game.changeBallDirection('x');
			}

			//Past paddle 1
			else if(i===0 && game.ballPos.x < paddlePos.x ){
				game.goal(1);
			}

			//Past paddle 2
			else if(i===1 && game.ballPos.x + game.ballSize > paddlePos.x){
				game.goal(0);
			}

		}

	},

	//-----------------

	goal: function(player){
		game.ballOut = true;
		game.score[player]++;

		game.showScore = true;

		setTimeout(function(){
			game.showScore = true;
			game.attachBall(player);
		}, 1200);

	},

	//-----------------

	changeBallDirection: function(axis){
		
		if(game.ballVelocity[axis] < 0){
			game.ballVelocity[axis] = game.ballSpeed;
		} else {
			game.ballVelocity[axis] = -Math.abs(game.ballSpeed);
		}

	},

	//-----------------

	drawScore: function(){

		game.ctx.fillStyle = '#ffffff';
		game.ctx.font = "36px " + game.defaultFont;
		game.ctx.fillText(game.score[0] ,game.canvasSize.x/2 - 64, 64);
		game.ctx.fillText(game.score[1] ,game.canvasSize.x/2 + 64, 64);

	},

	//-----------------

	showTitle: function(){

		var backgroundWidth = 300;
		var backgroundHeight = 400;
		game.gameCanvas.quad( (game.canvasSize.x/2) -backgroundWidth/2,game.canvasSize.y/2 - backgroundHeight/2,backgroundWidth,backgroundHeight, 'rgba(0,0,0,0.4)');
		
		game.ctx.font = "60px " + game.defaultFont;
		game.ctx.fillStyle = '#ffffff';
		game.ctx.fillText('MIDI', game.canvasSize.x/2, 200);
		game.ctx.fillText('PONG', game.canvasSize.x/2, 260);

		game.ctx.font = "bold 20px " + game.defaultFont;
		game.ctx.fillStyle = '#ffffff';
		game.ctx.fillText('How to play', game.canvasSize.x/2, 312);

		//Instructions
		game.ctx.font = "20px " + game.defaultFont;
		game.ctx.fillStyle = 'rgba(255,255,0,0.8)';
		var text = "Turn any knob on your \nMIDI controller to move.\nSpace to serve the ball.";
		var lineHeight = 30;
		text = text.split('\n');

		for(var i=0; i<text.length; i++){
			game.ctx.fillText(text[i], game.canvasSize.x/2, 350 + (i*lineHeight));
		}

		var d = new Date();

		//No midi message
		if(midi.deviceCount < 1 && (d - game.gameStartTime) > 500){
			game.gameCanvas.quad( (game.canvasSize.x/2) -backgroundWidth/2,game.canvasSize.y - 80,backgroundWidth,60, 'rgba(150,0,0,0.4)');
			game.ctx.font = "bold 20px " + game.defaultFont;
			game.ctx.fillStyle = 'rgba(200,0,0,1)';
			game.ctx.fillText('No MIDI device found', game.canvasSize.x/2, game.canvasSize.y - 42);
		}

		//Cycle Colours for this message
		var alphaVal = Math.abs(Math.cos(d/700)) - 0.2;
		game.ctx.fillStyle = 'rgba(255,255,255,' + alphaVal + ')';
		game.ctx.font = "20px " + game.defaultFont;
		game.ctx.fillText('Press space to start', game.canvasSize.x/2, 452);
	},

	//-----------------

	//Main loop
	go: function(){

		//Clear and draw bg 
		game.gameCanvas.fill('rgb(0,0,100)');

		//Centre line
		game.gameCanvas.quad( (game.canvasSize.x/2) - (game.centreLineWidth/2) ,0,game.centreLineWidth,game.canvasSize.y, 'rgba(255,255,255,0.2)');

		//Move CPU player
		if(game.players < 2){
			game.moveCpuPlayer();
		}

		if(game.showScore){
			game.drawScore();
		}

		if(!game.gameStarted){
			game.showTitle();
		}

		game.drawPaddles();
		game.drawBall();
		game.collisionCheck();

		requestAnimFrame( game.go );
	},

	//-----------------

}

game.init();