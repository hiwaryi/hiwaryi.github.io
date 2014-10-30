// values for init
var sound = true;
var canvasX = window.innerWidth, canvasY = window.innerHeight;
var scalex = canvasX / 1280, scaley = canvasY / 768;
if(scalex < 0) scalex *= -1;
if(scaley < 0) scaley *= -1;

window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame       || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     || 
		function(callback,element){
		window.setTimeout(callback, 1000 / 60);
		};
})();

var mainSoundON, mainSoundOFF,resumeButton,pause_back;

function fly(){
	world.m_gravity.y = -50 * scaley;
	actors[0].body.ApplyForce(new b2Vec2(0,-50 * scaley),actors[0].body.GetWorldCenter());
}
function fall(){
	world.m_gravity.y = 50 * scaley;
	actors[0].body.ApplyForce(new b2Vec2(0,50 * scaley),actors[0].body.GetWorldCenter());
}
function pause(){
	if(!gameStarted) return;
	gameStarted = false;

	pause_back = new collie.DisplayObject({
		width : layer.option("width"),
		height : layer.option("height"),
		x : 0,
		y : 0,
		zIndex : 200,
		backgroundColor : "black",
		opacity : 0.5
	}).addTo(layer);
	resumeButton = new collie.DisplayObject({
		width : 301,
		height : 283,
		x : layer.option("width") / 2 - (301 / 2) * scalex,
		y : layer.option("height") / 2 - (283 / 2) * scalex,
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top",
		zIndex : 201,
		backgroundImage : "resumeButton"
	}).addTo(layer).attach({
		"mousedown" : function(){
			resumeButton.set("backgroundImage", "resume_push");
		},
		"mouseup" : resume
	});
	if(sound) layer.addChild(mainSoundON);
	else layer.addChild(mainSoundOFF);
}
function resume(){
	layer.removeChild(resumeButton);
	layer.removeChild(pause_back);
	if(layer.hasChild(mainSoundON)) layer.removeChild(mainSoundON);
	if(layer.hasChild(mainSoundOFF)) layer.removeChild(mainSoundOFF);
	gameStarted = true;
}
function start(){
	collie.Renderer.removeLayer(startLayer);
	gameStarted = true;
	if(sound) SoundJS.play('Start');
	if(sound) SoundJS.play('BGM',SoundJS.INTERRUPT_NONE,0,0,-1,0.3,0);
}
function restart(){
	collie.Renderer.removeLayer(gameoverLayer);
	collie.Renderer.addLayer(startLayer);
	gameoverAdded = false;
	scoreOne.set("x", layer.option("width") - (32 + 90) * scalex);
	scoreOne.set("backgroundImage", "score0");
	gameoverLayer.removeChild(overOne); gameoverLayer.removeChild(highOne); gameoverLayer.removeChild(highCOne);
	if(score >= 10){ layer.removeChild(scoreTen); gameoverLayer.removeChild(overTen); gameoverLayer.removeChild(highTen); }
	if(score >= 100){ layer.removeChild(scoreHun); gameoverLayer.removeChild(overHun); gameoverLayer.removeChild(highHun); }
	if(highCombo >= 10){ gameoverLayer.removeChild(highCTen); }
	if(highCombo >= 100){ gameoverLayer.removeChild(highCHun); }
	score = 0;
	carrotCounter = 0; objectCounter = 0; gosmCounter = 0; levelSelector = 100; checker1 = false; checker2 = false;
	objectVelocity = -10;
	actors = []; bodiesToRemove = [];
	Ball.spawn();
	gameOver = false;
	pointAdded = false;
	gameStarted = false;
	combo = 0;
	comboDO.set("x", layer.option("width") - (434 + 50 - 70) * scalex);
	scoreHun = null; scoreTen = null;
	itemSpawned = true; itemSuperManSpawned = null; itemMagnetSpawned = null;
	heart = 3; die = null;
	overOne = null; overTen = null; overHun = null;
	highOne = null; highTen = null; highHun = null;
	highCOne = null; highCTen = null; highHun = null;
	layer.removeChild(printItemState);
	highCombo = 0;
}

var setup = (function(){
	// SoundJS.FlashPlugin.BASE_PATH = "sound/";
 //    if (!SoundJS.checkPlugin(true)) {
 //      alert("Error!");
 //      return;
 //    }
 
    manifest = [
                {src:"sound/Eat.mp3", id:"eat"},
                {src:"sound/BGM.mp3", id:"BGM"},
                {src:"sound/Item.mp3", id:"Item"},
                {src:"sound/sound_assa.mp3", id:"Assa"},
                {src:"sound/sound_letsgo.mp3", id:"Letsgo"},
                {src:"sound/sound_ohyeah.mp3", id:"Ohyeah"},
                {src:"sound/sound_ong.mp3", id:"Ong"},
                {src:"sound/sound_start.mp3", id:"Start"},
                {src:"sound/sound_yaho.mp3", id:"Yaho"},
            ];
 
    var preloader = new PreloadJS();
    preloader.installPlugin(SoundJS);
    preloader.loadManifest(manifest);

    if(sound) SoundJS.play('Letsgo');

	layer = new collie.Layer({
		width : canvasX,
		height : canvasY
	}).attach({
		"mousedown" : fly,
		"mouseup" : fall
	});

	document.onkeydown = function(e){
		if(e.keyCode == 32 || e.keyCode == 13){
			if(gameStarted && gameOver) restart();
			if(gameStarted && !gameOver) fly();
			if(!gameStarted) start();
		}
		else if(e.keyCode == 27){
			if(!gameOver && gameStarted) pause();
			else resume();
		}
	}
	document.onkeyup = function(e){
		fall();
	}

	collie.ImageManager.add({"background" : "img/background.png"});
	collie.ImageManager.add({"screenMain" : "img/screen_main.png"});
	collie.ImageManager.add({"ruleButton" : "img/button_rule.png"});
	collie.ImageManager.add({"startButton" : "img/button_start.png"});
	collie.ImageManager.add({"rule" : "img/screen_rule.png"});
	collie.ImageManager.add({"gameover" : "img/screen_gameover.png"});

	startLayer = new collie.Layer({
		width : canvasX,
		height : canvasY
	});

	var screenMain = new collie.DisplayObject({
		x : 0,
		y : 0,
		width : 1280,
		height : 768,
		backgroundImage : "screenMain",
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top"
	}).addTo(startLayer);
	var startButton = new collie.DisplayObject({
		x : startLayer.option("width") - (420 + 30) * scalex,
		y : startLayer.option("height") - (101 + 30) * scaley,
		width : 420,
		height : 101,
		backgroundImage : "startButton",
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top"
	}).attach({
		"mousedown" : start
	});

	collie.ImageManager.add({"soundON" : "img/sound_on.png"});
	collie.ImageManager.add({"soundOFF" : "img/sound_off.png"});
	var soundON = new collie.DisplayObject({
		width : 154,
		height : 35,
		x : 10,
		y : 10,
		backgroundImage : "soundON",
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top"
	}).attach({
		"click" : function(){
			startLayer.removeChild(soundON);
			startLayer.addChild(soundOFF);
			sound = false;
		}
	});
	var soundOFF = new collie.DisplayObject({
		width : 154,
		height : 35,
		x : 10,
		y : 10,
		backgroundImage : "soundOFF",
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top"
	}).attach({
		"click" : function(){
			startLayer.removeChild(soundOFF);
			startLayer.addChild(soundON);
			sound = true;
		}
	});

	var rule = new collie.DisplayObject({
		x : 0,
		y : 0,
		width : 1280,
		height : 768,
		backgroundImage : "rule",
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top"
	}).attach({
		"mousedown" : function(){
			startLayer.removeChild(rule);
		}
	});
	var ruleButton = new collie.DisplayObject({
		x : startButton.get("x") - (420 + 30) * scalex,
		y : startButton.get("y"),
		width : 420,
		height : 101,
		backgroundImage : "ruleButton",
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top"
	}).attach({
		"mousedown" : function(){
			startLayer.addChild(rule);
		}
	})
	startLayer.addChild(startButton);
	startLayer.addChild(ruleButton);

	debugLayer = new collie.Layer({
		width : 1280,
		height : 768
	});
	
	var Ground = new collie.MovableObject({
		width : 1280 * 2,
		height : 768,
		velocityX : -80, 
		backgroundRepeat : "repeat-x",
		rangeX : [(-1) * canvasX, 0],
		positionRepeat : true,
		backgroundImage : "background",
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top",
		zIndex : -100
	}).addTo(layer);
	for(var i = 1; i <= 7; i++){
		var obj = {};
		var str = "cloud" + i;
		obj[str] = "img/cloud/cloud_0" + i + ".png";
		collie.ImageManager.add(obj);
	}

	collie.ImageManager.add({"score" : "img/score.png"});
	scoreBack = new collie.DisplayObject({
		width : 258,
		height : 106,
		x : layer.option("width") - 258 * scalex,
		y : 0,
		backgroundImage : "score",
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top",
		zIndex : 100
	}).addTo(layer);
	for(var i = 0; i <= 9; i++){
		var str = "score" + i;
		var obj = {};
		obj[str] = "img/score/score_0" + i + ".png";
		collie.ImageManager.add(obj);
	}
	scoreOne = new collie.DisplayObject({
		width : 32,
		height : 59,
		x : layer.option("width") - (32 + 90) * scalex,
		y : 10 * scaley,
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top",
		zIndex : 101,
		backgroundImage : "score0"
	}).addTo(layer);

	collie.ImageManager.add({"pauseButton" : "img/button_pause.png"});
	collie.ImageManager.add({"resumeButton" : "img/button_resume.png"});
	collie.ImageManager.add({"resume_push" : "img/button_resume_push.png"});
	var pauseButton = new collie.DisplayObject({
		width : 58,
		height : 58,
		x : 10 * scalex,
		y : 10 * scaley,
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top",
		zIndex : 101,
		backgroundImage : "pauseButton"
	}).addTo(layer).attach({
		"click" : pause
	});

	collie.ImageManager.add({"mainSoundON" : "img/button_mute_01.png"});
	collie.ImageManager.add({"mainSoundOFF" : "img/button_mute_02.png"});
	mainSoundON = new collie.DisplayObject({
		x : pauseButton.get("x") + (10 + pauseButton.get("width")) * scalex,
		y : pauseButton.get("y"),
		width : 58,
		height : 58,
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top",
		zIndex : 200,
		backgroundImage : "mainSoundON"
	}).attach({
		"click" : function(){
			layer.removeChild(mainSoundON);
			layer.addChild(mainSoundOFF);
			sound = false;
		}
	});
	mainSoundOFF = new collie.DisplayObject({
		x : pauseButton.get("x") + (10 + pauseButton.get("width")) * scalex,
		y : pauseButton.get("y"),
		width : 58,
		height : 58,
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top",
		zIndex : 200,
		backgroundImage : "mainSoundOFF"
	}).attach({
		"click" : function(){
			layer.removeChild(mainSoundOFF);
			layer.addChild(mainSoundON);
			sound = true;
		}
	});

	if(sound) startLayer.addChild(soundON);
	else startLayer.addChild(soundOFF);

	collie.ImageManager.add({"combo" : "img/combo.png"});
	for(var i = 0; i<=9; i++){
		var obj  = {};
		var str = "combo" + i;
		obj[str] = "img/combo/combo_0" + i + ".png";
		collie.ImageManager.add(obj);
	}

	comboDO = new collie.MovableObject({
		width : 434,
		height : 255,
		x : layer.option("width") - (434 + 50 - 70) * scalex,
		y : layer.option("height") - 255 * scaley,
		backgroundImage : "combo",
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top",
		zIndex : 100
	});
	comboOne = new collie.MovableObject({
		width : 103,
		height : 112,
		x : comboDO.get("x") + 275 * scalex,
		y : 634 * scaley,
		backgroundImage : "combo1",
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top",
		zIndex : 101
	});
	comboTen = new collie.MovableObject({
		width : 103,
		height : 112,
		x : comboOne.get("x") + 70 * scalex,
		y : 634 * scaley,
		backgroundImage : "combo1",
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top",
		zIndex : 102
	});
	comboHun = new collie.MovableObject({
		width : 103,
		height : 112,
		x : comboOne.get("x") + 70 * scalex,
		y : 634 * scaley,
		backgroundImage : "combo1",
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top",
		zIndex : 103
	});

	for(var i = 0; i <= 9; i++){
		var obj = {};
		var str = "over" + i;
		obj[str] = "img/number/" + i + ".png";
		collie.ImageManager.add(obj);
	}
	collie.ImageManager.add({"replayButton" : "img/button_replay.png"});
	gameoverLayer = new collie.Layer({
		width : layer.option("width"),
		height : layer.option("height")
	});

	for(var i = 1; i <= 5; i++){
		var obj = {};
		var str1 = "magnetState" + i;
		var str2 = "supermanState" + i;
		obj[str1] = "img/item/magnet/timebar_magnet_0" + i + ".png";
		obj[str2] = "img/item/star/timebar_star_0" + i + ".png";
		collie.ImageManager.add(obj);
	}

	printItemState = new collie.DisplayObject({
		width : 421,
		height : 127,
		x : layer.option("width") / 2 - 421 / 2 * scalex,
		y : 10 * scaley,
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top",
		zIndex : 0
	});

	for(var i = 0; i <= 9; i++){
		var obj = {};
		var str = "high" + i;
		obj[str] = "img/number_combo/" + i + ".png";
		collie.ImageManager.add(obj);
	}

	var gameoverBack = new collie.DisplayObject({
		x : 0,
		y : 0,
		width : 1280,
		height : 768,
		backgroundImage : "gameover",
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top"
	}).addTo(gameoverLayer);
	var restartButton = new collie.DisplayObject({
		x : gameoverLayer.option("width") - (420 + 30) * scalex,
		y : gameoverLayer.option("height") - (101 + 30) * scaley,
		width : 420,
		height : 101,
		backgroundImage : "replayButton",
		scaleX : scalex,
		scaleY : scaley,
		originX : "left",
		originY : "top"
	}).attach({
		"click" : restart
	});
	gameoverLayer.addChild(restartButton);

	collie.Renderer.load(document.getElementById("container"));
})();