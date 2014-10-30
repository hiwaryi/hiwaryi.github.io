// 기본 변수들 정의
var world;
var layer,debugLayer,startLayer,gameoverLayer;
var gameOver = false, gameStarted = false, gameoverAdded = false, pointAdded = false;;
var bodiesToRemove = [];
var actors = [];
var myBall;
var objectVelocity = -10;
var oneImage = null, tenImage = null;
var canvasX = window.innerWidth, canvasY = window.innerHeight;
var scalex = canvasX / 1280, scaley = canvasY / 768;
if(scalex < 0) scalex *= -1;
if(scaley < 0) scaley *= -1;

var combo = 0, comboHun, comboTen, comboOne, comboDO;
var score = 0, scoreBack, scoreHun = null, scoreTen = null, scoreOne;
var overOne = null, overTen = null, overHun = null;
var itemSpawned = true, itemSuperManSpawned = null, itemMagnetSpawned = null;
var heart = 3, die = null;

var cloudX = [0, 83, 99, 272, 76, 191, 50, 78];
var cloudY = [0, 56, 59, 185, 56, 89, 28, 34];

var myGame = (function(){

	// 특정 함수를 프레임마다 실행 시키기 위한 함수 정의
	// 각 브라우저를 대응
	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame       || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     || 
		function(/* function */ callback, /* DOMElement */ element){
		window.setTimeout(callback, 1000 / 60);
		};
	})();

	// Box2DWeb 함수들을 더 짧게 줄이기 위한 변수 정의
	var   b2Vec2 = Box2D.Common.Math.b2Vec2
		, b2BodyDef = Box2D.Dynamics.b2BodyDef
		, b2Body = Box2D.Dynamics.b2Body
		, b2FixtureDef = Box2D.Dynamics.b2FixtureDef
		, b2Fixture = Box2D.Dynamics.b2Fixture
		, b2World = Box2D.Dynamics.b2World
		, b2MassData = Box2D.Collision.Shapes.b2MassData
		, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
		, b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
		, b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

	//collie 설정
	var setup = (function(){
		SoundJS.FlashPlugin.BASE_PATH = "sound/";
	    if (!SoundJS.checkPlugin(true)) {
	      alert("Error!");
	      return;
	    }
	 
	    manifest = [
	                {src:"sound/Eat.mp3", id:"eat"},
	                {src:"sound/BGM.mp3", id:"BGM"},
	                {src:"sound/Item.mp3", id:"Item"}
	            ];
	 
	    preloader = new PreloadJS();
	    preloader.installPlugin(SoundJS);
	    preloader.loadManifest(manifest);

		layer = new collie.Layer({
			width : canvasX,
			height : canvasY
		}).attach({
			"mousedown" : function(e){
				world.m_gravity.y = -50 * scaley;
				actors[0].body.ApplyForce(new b2Vec2(0,-50 * scaley),actors[0].body.GetWorldCenter());
			},
			"mouseup" : function(){ 
				world.m_gravity.y = 50 * scaley;
				actors[0].body.ApplyForce(new b2Vec2(0,50 * scaley),actors[0].body.GetWorldCenter());
			}
		});

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
			"mousedown" : function(){ 
				collie.Renderer.removeLayer(startLayer);
				gameStarted = true;
				SoundJS.play('BGM',SoundJS.INTERRUPT_NONE,0,0,-1,0.3,0);
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
			originY : "top"
		}).addTo(layer);
		for(var i = 1; i <= 7; i++){
			var obj = {};
			var str = "cloud" + i;
			obj[str] = "img/cloud/cloud_0" + i + ".png"
			collie.ImageManager.add(obj);
		}

		collie.ImageManager.add({"score" : "img/score.png"});
		scoreBack = new collie.DisplayObject({
			width : 258,
			height : 97,
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

		collie.ImageManager.add({"combo" : "img/combo.png"});
		// collie.ImageManager.add({"comboOne" : "img/combo/combo_04.png"});
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
			"click" : function(){
				collie.Renderer.removeLayer(gameoverLayer);
				collie.Renderer.addLayer(startLayer);
				gameoverAdded = false;
				scoreOne.set("x", layer.option("width") - (32 + 90) * scalex);
				scoreOne.set("backgroundImage", "score0");
				gameoverLayer.removeChild(overOne);
				if(score >= 10){ layer.removeChild(scoreTen); gameoverLayer.removeChild(overTen); }
				if(score >= 100){ layer.removeChild(scoreHun); gameoverLayer.removeChild(overHun); }
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
			}
		});
		gameoverLayer.addChild(restartButton);

		collie.Renderer.load(document.getElementById("container"));
	})();


	collie.ImageManager.add({"rabbit" : "img/rabbit.png"});
	collie.ImageManager.add({"rabbit_click" : "img/rabbit_click.png"});
	collie.ImageManager.add({"rabbit_die" : "img/rabbit_die.png"});
	var Ball = (function(){
		var spawn = function(){
			myBall = new collie.MovableObject({
				width : 80,
				height : 80,
				x : 100 * scalex,
				y : 500 * scaley,
				backgroundImage : "rabbit",
				scaleX : scalex,
				scaleY : scaley,
				originX : "left",
				originY : "top"
			});
			layer.addChild(myBall);
			collie.Timer.cycle(myBall, "27fps", {
			    from : 0,
			    to : 8,
			    loop : 0
			});
			box2d.createBall(myBall);
		}

		return {
			spawn : spawn
		}

	})();

	collie.ImageManager.add({ "crow": "img/crow.png" });
	var Objects = (function(){ // 70 72
	    var spawn = function () {
			var objects = new collie.MovableObject({
				width : 70,
				height : 72,
				x : (1280 + 10) * scalex,
				y : (Math.random() * 700) * scaley,
				backgroundImage : "crow",
				scaleX : scalex,
				scaleY : scaley,
				originX : "left",
				originY : "top"
			}).addTo(layer);
			box2d.createObjects(objects);
		}

		return {
			spawn : spawn
		}
	})();

	collie.ImageManager.add({ "gosm": "img/gosm.png" });
	var Gosms = (function(){ // 70 72
	    var spawn = function () {
			var gosms = new collie.MovableObject({
				width : 80,
				height : 57,
				x : (1280 + 10) * scalex,
				y : layer.option("height") - 50,
				backgroundImage : "gosm",
				scaleX : scalex,
				scaleY : scaley,
				originX : "left",
				originY : "top"
			}).addTo(layer);
			collie.Timer.cycle(gosms, "8fps", {
			    from : 0,
			    to : 7,
			    loop : 0
			});
			box2d.createGosms(gosms);
		}

		return {
			spawn : spawn
		}
	})();

	collie.ImageManager.add({"carrot" : "img/carrot.png"});
	var Carrots = (function(){ // 40 86
		var spawn = function(){
			var carrots = new collie.MovableObject({
				width : 60,
				height : 86,
				x : (1280 + 10) * scalex,
				y : (Math.random() * 700) * scaley,
				backgroundImage : "carrot",
				scaleX : scalex,
				scaleY : scaley,
				originX : "left",
				originY : "top"
			}).addTo(layer);
			collie.Timer.cycle(carrots, "9fps", {
			    from: 0,
			    to: 8,
			    loop: 0
			});
			box2d.createCarrots(carrots);
		}

		return {
			spawn : spawn
		}
	})();

	collie.ImageManager.add({"itemSuperCarrot" : "img/item/item_10carrots.png"});
	var ItemSuperCarrot = (function(){
		var spawn = function(){
			var itemSuperCarrot = new collie.MovableObject({
				width : 95,
				height : 104,
				x : (1280 + 10) * scalex,
				y : (Math.random() * 700) * scaley,
				backgroundImage : "itemSuperCarrot",
				scaleX : scalex,
				scaleY : scaley,
				originX : "left",
				originY : "top"
			}).addTo(layer);
			collie.Timer.cycle(itemSuperCarrot, "18fps", {
			    from: 0,
			    to: 8,
			    loop: 0
			});
			box2d.createItemSuperCarrot(itemSuperCarrot);
		}

		return {
			spawn : spawn
		}
	})();

	collie.ImageManager.add({"itemSuperMan" : "img/item/item_star.png"});
	var ItemSuperMan = (function(){
		var spawn = function(){
			var itemSuperMan = new collie.MovableObject({
				width : 70,
				height : 70,
				x : (1280 + 10) * scalex,
				y : (Math.random() * 700) * scaley,
				backgroundImage : "itemSuperMan",
				scaleX : scalex,
				scaleY : scaley,
				originX : "left",
				originY : "top"
			}).addTo(layer);
			collie.Timer.cycle(itemSuperMan, "16fps", {
			    from: 0,
			    to: 7,
			    loop: 0
			});
			box2d.createItemSuperMan(itemSuperMan);
		}

		return {
			spawn : spawn
		}
	})();

	collie.ImageManager.add({"itemMagnet" : "img/item/item_magnet.png"});
	var ItemMagnet = (function(){
		var spawn = function(){
			var itemMagnet = new collie.MovableObject({
				width : 100,
				height : 85,
				x : (1280 + 10) * scalex,
				y : (Math.random() * 700) * scaley,
				backgroundImage : "itemMagnet",
				scaleX : scalex,
				scaleY : scaley,
				originX : "left",
				originY : "top"
			}).addTo(layer);
			collie.Timer.cycle(itemMagnet, "9fps", {
			    from: 0,
			    to: 8,
			    loop: 0
			});
			box2d.createItemMagnet(itemMagnet);
		}

		return {
			spawn : spawn
		}
	})();

	// collie.ImageManager.add({"itemMagnet" : "img/item/item_magnet.png"});
	var ItemChange = (function(){
		var spawn = function(){
			var itemChange = new collie.MovableObject({
				width : 100,
				height : 85,
				x : (1280 + 10) * scalex,
				y : (Math.random() * 700) * scaley,
				// backgroundImage : "itemChange",
				backgroundColor : "red",
				scaleX : scalex,
				scaleY : scaley,
				originX : "left",
				originY : "top"
			}).addTo(layer);
			collie.Timer.cycle(itemChange, "9fps", {
			    from: 0,
			    to: 8,
			    loop: 0
			});
			box2d.createItemChange(itemChange);
		}

		return {
			spawn : spawn
		}
	})();

	// box2d 설정
	var box2d = (function init() {
		world = new b2World(
		         new b2Vec2(0, 50 * scaley)
		      ,  true
		      );

		var bodiesToRemove = [];
		var bodies = [];

		var SCALE = 30, STEP = 60, TIMESTEP = 1/STEP;

		var fixDef = new b2FixtureDef;
		fixDef.density = 100;
		fixDef.restitution = 1;

		var bodyDef = new b2BodyDef;

		bodyDef.type = b2Body.b2_staticBody;
		bodyDef.position.x = layer.option("width") / 2 / SCALE;
		bodyDef.position.y = layer.option("height") / SCALE;
		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox((layer.option("width") / SCALE) / 2, (10/SCALE) / 2);
		fixDef.restitution = 0.5;
		var bottomGround = world.CreateBody(bodyDef);
		bottomGround.CreateFixture(fixDef);
		bottomGround.SetUserData({id:"Ground"});
		bodyDef.position.x = layer.option("height") / 2 / SCALE;
		bodyDef.position.y = 0;
		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox((layer.option("width") / SCALE) / 2, (10/SCALE) / 2);
		fixDef.restitution = 0.2;
		var upperGround = world.CreateBody(bodyDef);
		upperGround.CreateFixture(fixDef);
		upperGround.SetUserData({id:"Ground"});

		var debugDraw = new b2DebugDraw();
		debugDraw.SetSprite(debugLayer.getContext());
		debugDraw.SetDrawScale(SCALE);
		debugDraw.SetFillAlpha(0.3);
		debugDraw.SetLineThickness(1.0);
		debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
		world.SetDebugDraw(debugDraw);

		var contactListener = new Box2D.Dynamics.b2ContactListener;
		contactListener.PreSolve = function(contact, manifold){
			var body1 = contact.GetFixtureA().GetBody();
			var body2 = contact.GetFixtureB().GetBody();

			if(body2.GetUserData().id == "Ball"){
				if(body1.GetUserData().id == "Carrot" || body1.GetUserData().id == "ItemSuperCarrot"){ 
					// SoundJS.play('eat');
					SoundJS.play('eat',SoundJS.INTERRUPT_NONE,0,0,0,1,0);
					contact.SetEnabled(false);
					
					if(body1.GetUserData().id == "Carrot") score++;
					else if(body1.GetUserData().id == "ItemSuperCarrot") score += 10;

					scoreOne.set("backgroundImage", "score" + (score%10));
					if(score >= 10){
						if(scoreTen == null){
							scoreOne.set("x", scoreOne.get("x") + 10 * scalex);
							scoreTen = new collie.DisplayObject({
								width : 32,
								height : 59,
								x : scoreOne.get("x") - (32) * scalex,
								y : 10 * scaley,
								scaleX : scalex,
								scaleY : scaley,
								originX : "left",
								originY : "top",
								zIndex : 101,
								backgroundImage : "score1"
							}).addTo(layer);
						} else{
							scoreTen.set("backgroundImage", "score" + Math.floor((score / 10) % 10));
						}
					}
					if(score >= 100){
						if(scoreHun == null){
							scoreOne.set("x", scoreOne.get("x") + 10 * scalex);
							scoreTen.set("x", scoreTen.get("x") + 10 * scalex);
							scoreHun = new collie.DisplayObject({
								width : 32,
								height : 59,
								x : scoreTen.get("x") - (32) * scalex,
								y : 10 * scaley,
								scaleX : scalex,
								scaleY : scaley,
								originX : "left",
								originY : "top",
								zIndex : 101,
								backgroundImage : "score1"
							}).addTo(layer);
						} else{
							scoreHun.set("backgroundImage", "score" + Math.floor((score / 100)));
						}
					}

					bodiesToRemove.push(body1); 

					combo++;
					if(combo >= 2){
						if(combo % 2 == 0) itemSpawned = false;

						if(combo >= 10){
							if(combo == 10){
								comboDO.set("x", comboDO.get("x") - 70 * scalex);
								comboTen.set("x", comboDO.get("x") + 275 * scalex);
							}
							if(layer.hasChild(comboTen)) layer.removeChild(comboTen);
							comboTen.set("backgroundImage", "combo" + Math.floor(((combo / 10) % 10)));
							layer.addChild(comboTen);
							collie.Timer.cycle(comboTen, "12fps", {
							    from : 0,
							    to : 5,
							    loop : 1
							}).attach({
								"end" : function(){
									layer.removeChild(comboTen);
								}
							});
						}
						if(combo % 100 == 0){
							if(combo == 100){
								comboDO.set("x", comboDO.get("x") - 70 * scalex);
								comboHun.set("x", comboDO.get("x") + 275 * scalex);
							}
							if(layer.hasChild(comboHun)) layer.removeChild(comboHun);
							comboHun.set("backgroundImage", "combo" + Math.floor((combo / 100)));
							layer.addChild(comboHun);
							collie.Timer.cycle(comboHun, "12fps", {
							    from : 0,
							    to : 5,
							    loop : 1
							}).attach({
								"end" : function(){
									layer.removeChild(comboHun);
								}
							});
						}

						if(layer.hasChild(comboDO)) layer.removeChild(comboDO);
						if(layer.hasChild(comboOne)) layer.removeChild(comboOne);

						layer.addChild(comboDO);
						comboOne.set("backgroundImage", "combo" + combo % 10);
						layer.addChild(comboOne);

						collie.Timer.cycle(comboDO, "12fps", {
						    from : 0,
						    to : 5,
						    loop : 1
						}).attach({
							"end" : function(){
								layer.removeChild(comboDO);
							}
						});
						collie.Timer.cycle(comboOne, "12fps", {
						    from : 0,
						    to : 5,
						    loop : 1
						}).attach({
							"end" : function(){
								layer.removeChild(comboOne);
							}
						});
					}
				} else if(body1.GetUserData().id == "Object"){ 
					if(itemSuperManSpawned && new Date().getTime() - itemSuperManSpawned <= 5000){
						contact.SetEnabled(false);
						var body1pos = body1.GetPosition();
						var body2pos = body2.GetPosition();
						var vX = body1pos.x - body2pos.x;
						var vY = body1pos.y - body2pos.y;
						
						body1.SetLinearVelocity(new b2Vec2(vX * 20, vY * 20));
					} else{
						contact.SetEnabled(false);

						if(die == null){
							die = new Date().getTime();
							heart--;
						}
						
						if(die && new Date().getTime() - die <= 2000) myBall.set("backgroundImage","rabbit_die");
						else{
							myBall.set("backgroundImage", "rabbit");
							die = null;
						}
						
						if(heart == 2) gameOver = true;
						itemSuperManSpawned = null;
					}
				} else if(body1.GetUserData().id == "ItemSuperMan"){
					SoundJS.play('Item');
					contact.SetEnabled(false);
					bodiesToRemove.push(body1);
					itemSuperManSpawned = new Date().getTime();
				} else if(body1.GetUserData().id == "ItemMagnet"){
					SoundJS.play('Item');
					contact.SetEnabled(false);
					bodiesToRemove.push(body1);
					itemMagnetSpawned = new Date().getTime();
				} else if(body1.GetUserData().id == "ItemChange"){
					SoundJS.play('Item');
					contact.SetEnabled(false);
					bodiesToRemove.push(body1);
					for(var i = 0, l = actors.length; i < l; i++){
						if(actors[i].body.GetUserData().id == "Object"){
							actors[i].body.GetUserData().id = "Carrot";
							actors[i].skin.set({
								backgroundImage : "carrot",
								width : 60,
								height : 86,
								scaleX : scalex,
								scaleY : scaley,
								originX : "left",
								originY : "top"
							});
							actors[i].body.GetUserData().timer.stop();
							collie.Timer.cycle(actors[i].skin, "9fps", {
								from : 0,
								to : 8,
								loop : 0
							});
						}
					}
				}
			}
		}

		world.SetContactListener(contactListener);

		window.setInterval(removeObjScheduledForRemoval,1000/90);

		var createBall = function(skin){
			var bodyDef = new b2BodyDef;
			var fixDef = new b2FixtureDef;
			bodyDef.type = b2Body.b2_dynamicBody;
			fixDef.shape = new b2CircleShape;
			fixDef.shape.SetRadius((skin.get("width") / 2 - 15 )/ SCALE * scalex);
			bodyDef.position.x = skin.get("x") / SCALE;
			bodyDef.position.y = skin.get("y") / SCALE;
			bodyDef.width = skin.get("width") / SCALE * scalex;
			bodyDef.height = skin.get("height") / SCALE * scaley;
			var ball = world.CreateBody(bodyDef);
			ball.CreateFixture(fixDef);

			var actor = new actorBall(ball,skin);
			ball.SetUserData(actor);
		}

		var createObjects = function(skin){
			var bodyDef = new b2BodyDef;
			var fixDef = new b2FixtureDef;
			bodyDef.type = b2Body.b2_kinectBody;
			fixDef.shape = new b2PolygonShape;
			// fixDef.shape.SetAsBox(( skin.get("width") / 2 - 15 ) / SCALE , ( skin.get("height") / 2 - 15 ) / SCALE);
			fixDef.shape.SetAsBox(1 / SCALE * scalex,1 / SCALE * scaley);
			bodyDef.position.x = skin.get("x") / SCALE;
			for(var i = 0, l = actors.length; i < l; i++){
				if(skin.get("y") - actors[i].skin.get("y") < 30 * scaley && skin.get("x") - actors[i].skin.get("x") < 30 * scalex){
					bodyDef.position.x = (skin.get("x") + 70 * scalex) / SCALE;
					break;
				}
			}
			bodyDef.position.y = skin.get("y") / SCALE;
			bodyDef.width = skin.get("width") / SCALE * scalex;
			bodyDef.height = skin.get("height") / SCALE * scaley;
			fixDef.restitution = 0;

			var objects = world.CreateBody(bodyDef);
			objects.CreateFixture(fixDef);
			objects.SetLinearVelocity(new b2Vec2(objectVelocity * scalex,0));

			var timer = collie.Timer.cycle(skin, "15fps", {
			    from: 0,
			    to: 5,
			    loop: 0
			});

			var actor = new actorObject(objects,skin,timer);
			objects.SetUserData(actor);
		}

		var createGosms = function(skin){
			var bodyDef = new b2BodyDef;
			var fixDef = new b2FixtureDef;
			bodyDef.type = b2Body.b2_kinectBody;
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsBox(1 / SCALE * scalex,1 / SCALE * scaley);
			bodyDef.position.x = skin.get("x") / SCALE;
			bodyDef.position.y = skin.get("y") / SCALE;
			bodyDef.width = skin.get("width") / SCALE * scalex;
			bodyDef.height = skin.get("height") / SCALE * scaley;
			fixDef.restitution = 0;
			var objects = world.CreateBody(bodyDef);
			objects.CreateFixture(fixDef);
			objects.SetLinearVelocity(new b2Vec2(-7 * scalex,0));

			var actor = new actorGosm(objects,skin);
			objects.SetUserData(actor);
		}

		var createCarrots = function(skin){
			var bodyDef = new b2BodyDef;
			var fixDef = new b2FixtureDef;
			bodyDef.type = b2Body.b2_kinectBody;
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsBox((skin.get("width") - 20) / 2 / SCALE * scalex , skin.get("height") / 2 / SCALE * scaley);
			bodyDef.position.x = skin.get("x") / SCALE;
			bodyDef.position.y = skin.get("y") / SCALE;
			bodyDef.width = skin.get("width") / SCALE * scalex;
			bodyDef.height = skin.get("height") / SCALE * scaley;
			var carrots = world.CreateBody(bodyDef);
			carrots.CreateFixture(fixDef);
			carrots.SetLinearVelocity(new b2Vec2(-10 * scalex,0));

			var actor = new actorCarrot(carrots,skin);
			carrots.SetUserData(actor);
		}

		var createItemSuperCarrot = function(skin){
			var bodyDef = new b2BodyDef;
			var fixDef = new b2FixtureDef;
			bodyDef.type = b2Body.b2_kinectBody;
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsBox((skin.get("width") - 20) / 2 / SCALE * scalex , skin.get("height") / 2 / SCALE * scaley);
			bodyDef.position.x = skin.get("x") / SCALE;
			bodyDef.position.y = skin.get("y") / SCALE;
			bodyDef.width = skin.get("width") / SCALE * scalex;
			bodyDef.height = skin.get("height") / SCALE * scaley;
			var items = world.CreateBody(bodyDef);
			items.CreateFixture(fixDef);
			items.SetLinearVelocity(new b2Vec2(-10 * scalex,0));

			var actor = new actorItemSuperCarrot(items,skin);
			items.SetUserData(actor);
		}

		var createItemSuperMan = function(skin){
			var bodyDef = new b2BodyDef;
			var fixDef = new b2FixtureDef;
			bodyDef.type = b2Body.b2_kinectBody;
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsBox((skin.get("width") - 20) / 2 / SCALE * scalex , skin.get("height") / 2 / SCALE * scaley);
			bodyDef.position.x = skin.get("x") / SCALE;
			bodyDef.position.y = skin.get("y") / SCALE;
			bodyDef.width = skin.get("width") / SCALE * scalex;
			bodyDef.height = skin.get("height") / SCALE * scaley;
			var items = world.CreateBody(bodyDef);
			items.CreateFixture(fixDef);
			items.SetLinearVelocity(new b2Vec2(-10 * scalex,0));

			var actor = new actorItemSuperMan(items,skin);
			items.SetUserData(actor);
		}

		var createItemMagnet = function(skin){
			var bodyDef = new b2BodyDef;
			var fixDef = new b2FixtureDef;
			bodyDef.type = b2Body.b2_kinectBody;
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsBox((skin.get("width") - 20) / 2 / SCALE * scalex , skin.get("height") / 2 / SCALE * scaley);
			bodyDef.position.x = skin.get("x") / SCALE;
			bodyDef.position.y = skin.get("y") / SCALE;
			bodyDef.width = skin.get("width") / SCALE * scalex;
			bodyDef.height = skin.get("height") / SCALE * scaley;
			var items = world.CreateBody(bodyDef);
			items.CreateFixture(fixDef);
			items.SetLinearVelocity(new b2Vec2(-10 * scalex,0));

			var actor = new actorItemMagnet(items,skin);
			items.SetUserData(actor);
		}

		var createItemChange = function(skin){
			var bodyDef = new b2BodyDef;
			var fixDef = new b2FixtureDef;
			bodyDef.type = b2Body.b2_kinectBody;
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsBox((skin.get("width") - 20) / 2 / SCALE * scalex , skin.get("height") / 2 / SCALE * scaley);
			bodyDef.position.x = skin.get("x") / SCALE;
			bodyDef.position.y = skin.get("y") / SCALE;
			bodyDef.width = skin.get("width") / SCALE * scalex;
			bodyDef.height = skin.get("height") / SCALE * scaley;
			var items = world.CreateBody(bodyDef);
			items.CreateFixture(fixDef);
			items.SetLinearVelocity(new b2Vec2(-10 * scalex,0));

			var actor = new actorItemChange(items,skin);
			items.SetUserData(actor);
		}

		var actorBall = function(body, skin) {
			this.body = body;
			this.skin = skin;
			this.id = "Ball";
			this.update = function() {
				this.skin.set("angle", this.body.GetAngle());
				this.skin.set("x", (this.body.GetWorldCenter().x - this.skin.get("width") / 2 / SCALE * scalex) * SCALE);
				this.skin.set("y", (this.body.GetWorldCenter().y - this.skin.get("height") / 2 / SCALE * scaley) * SCALE);
			}
			actors.push(this);
		}

		var actorObject = function(body, skin, timer) {
			this.body = body;
			this.skin = skin;
			this.id = "Object";
			this.timer = timer;
			this.update = function() {
				this.skin.set("angle", this.body.GetAngle());
				this.skin.set("x", (this.body.GetWorldCenter().x - this.skin.get("width") / 2 / SCALE * scalex) * SCALE);
				this.skin.set("y", (this.body.GetWorldCenter().y - this.skin.get("height") / 2 / SCALE * scaley) * SCALE);
			}
			actors.push(this);
		}

		var actorGosm = function(body, skin) {
			this.body = body;
			this.skin = skin;
			this.id = "Gosm";
			this.update = function() {
				this.skin.set("angle", this.body.GetAngle());
				this.skin.set("x", (this.body.GetWorldCenter().x - this.skin.get("width") / 2 / SCALE * scalex) * SCALE);
				this.skin.set("y", (this.body.GetWorldCenter().y - this.skin.get("height") / 2 / SCALE * scaley) * SCALE);
			}
			actors.push(this);
		}

		var actorCarrot = function(body, skin) {
			this.body = body;
			this.skin = skin;
			this.id = "Carrot";
			this.update = function() {
				this.skin.set("angle", this.body.GetAngle());
				this.skin.set("x", (this.body.GetWorldCenter().x - this.skin.get("width") / 2 / SCALE * scalex) * SCALE);
				this.skin.set("y", (this.body.GetWorldCenter().y - this.skin.get("height") / 2 / SCALE * scaley) * SCALE);
			}
			actors.push(this);
		}

		var actorItemSuperCarrot = function(body, skin) {
			this.body = body;
			this.skin = skin;
			this.id = "ItemSuperCarrot";
			this.update = function() {
				this.skin.set("angle", this.body.GetAngle());
				this.skin.set("x", (this.body.GetWorldCenter().x - this.skin.get("width") / 2 / SCALE * scalex) * SCALE);
				this.skin.set("y", (this.body.GetWorldCenter().y - this.skin.get("height") / 2 / SCALE * scaley) * SCALE);
			}
			actors.push(this);
		}

		var actorItemSuperMan = function(body, skin) {
			this.body = body;
			this.skin = skin;
			this.id = "ItemSuperMan";
			this.update = function() {
				this.skin.set("angle", this.body.GetAngle());
				this.skin.set("x", (this.body.GetWorldCenter().x - this.skin.get("width") / 2 / SCALE * scalex) * SCALE);
				this.skin.set("y", (this.body.GetWorldCenter().y - this.skin.get("height") / 2 / SCALE * scaley) * SCALE);
			}
			actors.push(this);
		}

		var actorItemMagnet = function(body, skin) {
			this.body = body;
			this.skin = skin;
			this.id = "ItemMagnet";
			this.update = function() {
				this.skin.set("angle", this.body.GetAngle());
				this.skin.set("x", (this.body.GetWorldCenter().x - this.skin.get("width") / 2 / SCALE * scalex) * SCALE);
				this.skin.set("y", (this.body.GetWorldCenter().y - this.skin.get("height") / 2 / SCALE * scaley) * SCALE);
			}
			actors.push(this);
		}

		var actorItemChange = function(body, skin) {
			this.body = body;
			this.skin = skin;
			this.id = "ItemChange";
			this.update = function() {
				this.skin.set("angle", this.body.GetAngle());
				this.skin.set("x", (this.body.GetWorldCenter().x - this.skin.get("width") / 2 / SCALE * scalex) * SCALE);
				this.skin.set("y", (this.body.GetWorldCenter().y - this.skin.get("height") / 2 / SCALE * scaley) * SCALE);
			}
			actors.push(this);
		}

		var removeActor = function(actor) {
			actor.skin.leave();
			actors.splice(actors.indexOf(actor),1);
		}

		function removeObjScheduledForRemoval()
		{
			for(var i = 0; i < bodiesToRemove.length; i++){
				removeActor(bodiesToRemove[i].GetUserData());
				bodiesToRemove[i].SetUserData(null);
				world.DestroyBody(bodiesToRemove[i]);
			}
			bodiesToRemove = [];
		}

		var update = function(){
			for(var i=0, l=actors.length; i<l; i++) {
				actors[i].update();
			}

			world.Step(TIMESTEP, 10, 10);

			world.ClearForces();
   			world.m_debugDraw.m_sprite.graphics.clear();
   			//world.DrawDebugData();

   			for(var body = world.GetBodyList(); body; body = body.GetNext()){
				var toRemove = body;
				if(toRemove.GetUserData() && toRemove.GetUserData().skin && 
					(toRemove.GetUserData().skin.get("x") < -50 || toRemove.GetUserData().skin.get("y") < -50 
						|| toRemove.GetUserData().skin.get("y") > layer.option("height") + 50 || toRemove.GetUserData().skin.get("x") > layer.option("width") * 2)){

					bodiesToRemove.push(toRemove);
					if(toRemove.GetUserData().id == "Carrot"){
						if(combo >= 100) comboDO.set("x", comboDO.get("x") + 70 * 2 * scalex);
						if(combo >= 10) comboDO.set("x", comboDO.get("x") + 70 * scalex);
						combo = 0;
					}
				}
			}
   		}

		return{
			setup : setup,
			update : update,
			createBall : createBall,
			createObjects : createObjects,
			createCarrots : createCarrots,
			createItemSuperCarrot : createItemSuperCarrot,
			createItemSuperMan : createItemSuperMan,
			createItemMagnet : createItemMagnet,
			createItemChange : createItemChange,
			createGosms : createGosms
		}
	})();

	function randomRange(n1, n2) {
	  return Math.floor( (Math.random() * (n2 - n1 + 1)) + n1 );
	}

	var carrotCounter = 0, objectCounter = 0, gosmCounter = 0, levelSelector = 50 , checker1 = false, checker2 = false, cloudTiming = 5;
	var init = (function(){
		Ball.spawn();
		collie.Renderer.addLayer(layer);
		collie.Renderer.addLayer(debugLayer);
		collie.Renderer.addLayer(startLayer);

		var starting = collie.Renderer.start(1000/60, function (dt) {
			if(gameOver == false && gameStarted == true){
				box2d.update();

				carrotCounter++;
				objectCounter++;
				gosmCounter++;

				if(carrotCounter % 100 == 0) {
					carrotCounter = 0;
					Carrots.spawn();
				}
				if(objectCounter % 50 == 0){
					objectCounter = 0;
					Objects.spawn();

					if(score % 5 == 0 && score != 0 && checker1 == false){
						levelSelector -= 5;
						checker1 = true;
					} else checker1 = false;
					if(score % 10 == 0 && score != 0 && checker2 == false){
							objectVelocity -= 1;
							checker2 = true;
					} else checker2 = false;
				}
				if(gosmCounter % randomRange(1000,3000) == 0){
					gosmCounter = 0;
					Gosms.spawn();
				}
				if(cloudTiming == randomRange(1,100)){
					var num = randomRange(1,7);

					var cloud = new collie.MovableObject({
						width : cloudX[num],
						height : cloudY[num],
						x : layer.option("width") + 10,
						y : randomRange(0, layer.option("height") / 2),
						velocityX : -100 * scalex,
						backgroundImage : "cloud" + num,
						scaleX : scalex,
						scaleY : scaley,
						originX : "left",
						originY : "top"
					}).addTo(layer);
				}



				// 아이템 생성
				if(itemSpawned == false){
					var whichItem = randomRange(2,2);
					switch(whichItem){
						case 1 : 
							ItemSuperCarrot.spawn();
							itemSpawned = true;
							break;
						case 2 :
							ItemSuperMan.spawn();
							itemSpawned = true;
							break;
						case 3 :
							ItemMagnet.spawn();
							itemSpawned = true;
							break;
						case 4 :
							ItemChange.spawn();
							itemSpawned = true;
							break;
					}
				}

				if(itemMagnetSpawned && new Date().getTime() - itemMagnetSpawned <= 5000){
					for(var i = 0, l = actors.length; i < l; i++){
						if(actors[i].body.GetUserData().id == "Carrot" && actors[i].skin.get("x") < layer.option("width") / 2){
							var vX = actors[0].skin.get("x") - actors[i].skin.get("x");
							var vY = actors[0].skin.get("y") - actors[i].skin.get("y");

							actors[i].body.SetLinearVelocity(new b2Vec2(vX / 10, vY / 10));
						}
					}
				}


			} else if(gameOver == true){
				for(var body = world.GetBodyList(); body; body = body.GetNext()){
					var toRemove = body;
					if(toRemove.GetUserData() && toRemove.GetUserData().id != "Ground"){
						toRemove.GetUserData().skin.leave();
						world.DestroyBody(toRemove);
					}
				}

				box2d.update();

				if(gameoverAdded == false){
					SoundJS.stop('BGM');
					overOne = new collie.MovableObject({
						width : 54,
						height : 76,
						x : 708 * scalex,
						y : 390 * scaley,
						backgroundImage : "over" + (score % 10),
						scaleX : scalex,
						scaleY : scaley,
						originX : "left",
						originY : "top"
					}).addTo(gameoverLayer);

					if(score >= 10){
						overOne.set("x", overOne.get("x") + 10 * scalex);
						overTen = new collie.MovableObject({
							width : 54,
							height : 76,
							x : overOne.get("x") - (54 - 20) * scalex,
							y : 390 * scaley,
							backgroundImage : "over" + Math.floor((score / 10) % 10),
							scaleX : scalex,
							scaleY : scaley,
							originX : "left",
							originY : "top"
						}).addTo(gameoverLayer);
					}
					if(score >= 100){
						overOne.set("x", overOne.get("x") + 10 * scalex);
						overTen.set("x", overTen.get("x") + 10 * scalex);
						overHun = new collie.MovableObject({
							width : 54,
							height : 76,
							x : overTen.get("x") - (54 - 20) * scalex,
							y : 390 * scaley,
							backgroundImage : "over" + Math.floor((score/100)),
							scaleX : scalex,
							scaleY : scaley,
							originX : "left",
							originY : "top"
						}).addTo(gameoverLayer);
					}

					collie.Renderer.addLayer(gameoverLayer);
					gameoverAdded = true;
				}
			}
		});
	})();
})();