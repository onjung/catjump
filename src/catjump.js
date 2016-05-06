// Game variables.
var gLoop;
var points = 0;
var state = true;
var c = document.getElementById('c');
var ctx = c.getContext('2d');
var width = 320;
var height = 480;
c.width = width;
c.height = height;

var bg = new Image();
var rock = new Image();	
bg.src = "res/bg.png";
rock.src = "res/rock.png";

// Clear the context.
var clear = function() {
	ctx.beginPath();
	ctx.drawImage(bg, 0, 0);
	ctx.closePath();
}

var howManyCircles = 3;
var circles = [];

// Randomly generate the circles.
for (var i = 0; i < howManyCircles; i++) 
	circles.push([Math.random() * width, Math.random() * height, Math.random() * 100]);

// Draw the circles in the list.
var DrawCircles = function() {
	for (var i = 0; i < howManyCircles; i++) {
		ctx.beginPath();
		ctx.drawImage(rock, circles[i][0], circles[i][1]);
		ctx.closePath();
	}
};

// Animate the circles.
var MoveCircles = function(e){
	for (var i = 0; i < howManyCircles; i++) {
		if (circles[i][1] - circles[i][2] > height) {
			circles[i][0] = Math.random() * width;
			circles[i][2] = Math.random() * 100;
			circles[i][1] = 0 - circles[i][2];
		}
		else {
			circles[i][1] += e;
		}
	}
};

// player
var player = new (function() {
	var that = this;
	that.image = new Image();

	that.image.src = "res/cat.png"
	that.width = 40;
	that.height = 20;
	that.X = 0;
	that.Y = 0;	

	that.isJumping = false;
	that.isFalling = false;
	that.jumpSpeed = 0;
	that.fallSpeed = 0;
	
	that.jump = function() {
    	// If the player is not jumping nor falling.
    	if (!that.isJumping && !that.isFalling) {
    		that.fallSpeed = 0;
    		that.isJumping = true;
    		that.jumpSpeed = 17; // This can be adjusted.
    	}
    }

	// A jump checker.
	that.checkJump = function() {
		if (that.Y > height*0.4) {
			that.setPosition(that.X, that.Y - that.jumpSpeed);		
		} else {
			if (that.jumpSpeed > 10) {
				points++;
			}

			MoveCircles(that.jumpSpeed * 0.5);
			
			platforms.forEach(function(platform, ind){
				platform.y += that.jumpSpeed;

				if (platform.y > height) {
					var type = ~~(Math.random() * 5);
					if (type == 0) {
						type = 1;
					} else {
						type = 0;
					}
					platforms[ind] = new Platform(Math.random() * (width - platformWidth), platform.y - height, type);
				}
			});
		}
		that.jumpSpeed--;

		if (that.jumpSpeed == 0) {
			that.isJumping = false;
			that.isFalling = true;
			that.fallSpeed = 1;
		}

	}
	
	that.fallStop = function() {
		that.isFalling = false;
		that.fallSpeed = 0;
		that.jump();	
	}
	
	// A fall checker.
	that.checkFall = function() {
		if (that.Y < height - that.height) {
			that.setPosition(that.X, that.Y + that.fallSpeed);
			that.fallSpeed++;
		} else {
			if (points == 0) {
				that.fallStop();
			} else { 
				GameOver();
			}
		}
	}
	
	that.moveLeft = function() {
		if (that.X > 0) {
			that.setPosition(that.X - 5, that.Y);
		}
	}
	
	that.moveRight = function() {
		if (that.X + that.width < width) {
			that.setPosition(that.X + 5, that.Y);
		}
	}
	
	that.setPosition = function(x, y){
		that.X = x;
		that.Y = y;
	}
	
	that.draw = function() {
		try {
			ctx.drawImage(that.image, 0, 0, that.width, that.height, that.X, that.Y, that.width, that.height);
		} 
		catch (e) {
		};	
	}
})();

// Position of the player.
player.setPosition(~~((width-player.width)/2), height - player.height);
// Start jumping.
player.jump();

// Mouse move.
document.onmousemove = function(e){
	if (player.X + c.offsetLeft > e.pageX) {
		player.moveLeft();
	} else if (player.X + c.offsetLeft < e.pageX) {
		player.moveRight();
	}
}
var nrOfPlatforms = 5; 
var platforms = [];
var platformWidth = 70;
var platformHeight = 20;

var Platform = function(x, y, type){
	var that=this;
	var p = new Image();

	if (type === 0) {
		// Regular jump.
		p.src = "res/normal-platform.png";
		that.onCollide = function() {
			player.fallStop();
		};
	} else {
		// Higher jump.
		p.src = "res/special-platform.png";
		that.onCollide = function() {
			player.fallStop();
			player.jumpSpeed = 50;
		};
	}

	that.x = ~~ x;
	that.y = y;
	that.type = type;

	that.isMoving = ~~(Math.random()*2);
	that.direction= ~~(Math.random()*2) ? -1 : 1;

	that.draw = function() {
		ctx.drawImage(p, that.x, that.y);
	};
	
	return that;
};

// A platform (stepper) generator.
var generatePlatforms = function() {
	var position = 0, type;
	for (var i = 0; i < nrOfPlatforms; i++) {
		// Randomize the types of the platform.
		type = ~~(Math.random()*5);
		if (type == 0) {
			type = 1;
		} else { 
			type = 0;
		}
		platforms[i] = new Platform(Math.random()*(width - platformWidth), position, type);
		if (position < height - platformHeight) {
			position += ~~(height / nrOfPlatforms);
		}
	}
}();

// A collision ditector.
var checkCollision = function() {
	platforms.forEach(function(e, ind) {
		if ( (player.isFalling) && 
			(player.X < e.x + platformWidth) && 
			(player.X + player.width > e.x) && 
			(player.Y + player.height > e.y) && 
			(player.Y + player.height < e.y + platformHeight) ) { e.onCollide(); 
		}
})
}

// Game
var GameLoop = function() {
	clear();
	DrawCircles();

	if (player.isJumping) player.checkJump();
	if (player.isFalling) player.checkFall();
	
	player.draw();
	
	platforms.forEach(function(platform, index) {
		if (platform.isMoving) {
			if (platform.x < 0) {
				platform.direction = 1;
			} else if (platform.x > width - platformWidth) {
				platform.direction = -1;
			}
			platform.x += platform.direction * (index/2) * ~~(points/100);
		}
		platform.draw();
	});
	
	checkCollision();
	
	ctx.fillStyle = "Yellow";
	ctx.font = "14pt Arial";
	ctx.fillText("SCORE:  " + points, 10, 20);
	
	if (state)
		gLoop = setTimeout(GameLoop, 1000/50);
}

// Game Over
var GameOver = function() {
	state = false;
	clearTimeout(gLoop);
	
	setTimeout(function() {
		clear();

		ctx.fillText("SCORE:  " + points, 10, 20);
		ctx.fillStyle = "White";
		ctx.font = "36pt Arial";
		ctx.fillText("GAME OVER", 15, height/2 - 60);
	}, 100);
};

GameLoop();
