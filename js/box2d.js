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

var world;
var SCALE = 30, STEP = 60, TIMESTEP = 1/STEP;

function randomRange(n1, n2) {
	  return Math.floor( (Math.random() * (n2 - n1 + 1)) + n1 );
}

var	box2d = (function init() {
	world = new b2World(
	         new b2Vec2(0, 50 * scaley)
	      ,  true
	      );

	var bodiesToRemove = [];
	var bodies = [];

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
				if(sound) SoundJS.play('eat',SoundJS.INTERRUPT_NONE,0,0,0,1,0);
				contact.SetEnabled(false);
				
				if(body1.GetUserData().id == "Carrot"){
					if(combo >= 40) score += 5;
					else if(combo >= 30) score += 4;
					else if(combo >= 20) score += 3;
					else if(combo >= 5) score += 2;
					else score++;
				}
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
					if(combo % 3 == 0) itemSpawned = false;

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
			} else if(body1.GetUserData().id == "Object" || body1.GetUserData().id == "Gosm"){ 
				if(itemSuperManSpawned && new Date().getTime() - itemSuperManSpawned <= 5000){
					contact.SetEnabled(false);
					var body1pos = body1.GetPosition();
					var body2pos = body2.GetPosition();
					var vX = body1pos.x - body2pos.x;
					var vY = body1pos.y - body2pos.y;
					
					body1.SetLinearVelocity(new b2Vec2(vX * 20, vY * 20));
				} else{
					contact.SetEnabled(false);

					if(die == null) die = new Date().getTime();
					
					if(die && new Date().getTime() - die <= 2000) myBall.set("backgroundImage","rabbit_die");
					else{
						myBall.set("backgroundImage", "rabbit");
						die = null;
					}

					gameOver = true;
				}
			} else if(body1.GetUserData().id == "ItemSuperMan"){
				if(sound) SoundJS.play('Assa');
				contact.SetEnabled(false);
				bodiesToRemove.push(body1);
				itemSuperManSpawned = new Date().getTime();
				if(itemMagnetSpawned) itemMagnetSpawned = null;
			} else if(body1.GetUserData().id == "ItemMagnet"){
				if(sound) SoundJS.play('Ohyeah');
				contact.SetEnabled(false);
				bodiesToRemove.push(body1);
				itemMagnetSpawned = new Date().getTime();
				if(itemSuperManSpawned) itemSuperManSpawned = null;
			} else if(body1.GetUserData().id == "ItemChange"){
				if(sound) SoundJS.play('Yaho');
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
			} else if(body1.GetUserData().id == "Cloud"){
				contact.SetEnabled(false);
			}
		}
	}

	world.SetContactListener(contactListener);

	window.setInterval(removeObjScheduledForRemoval,1000/90);

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
		world.DrawDebugData();

		for(var body = world.GetBodyList(); body; body = body.GetNext()){
			var toRemove = body;
			if(toRemove.GetUserData() && toRemove.GetUserData().skin && 
				(toRemove.GetUserData().skin.get("x") < -300 || toRemove.GetUserData().skin.get("y") < -50 
					|| toRemove.GetUserData().skin.get("y") > layer.option("height") + 50 || toRemove.GetUserData().skin.get("x") > layer.option("width") * 2)){

				bodiesToRemove.push(toRemove);
				if(toRemove.GetUserData().id == "Carrot"){
					if(combo >= 100) comboDO.set("x", comboDO.get("x") + 70 * 2 * scalex);
					if(combo >= 10) comboDO.set("x", comboDO.get("x") + 70 * scalex);
					if(combo > highCombo) highCombo = combo;
					combo = 0;
				}
				if(toRemove.GetUserData().id == "Gosm"){
					hasGosm = false;
				}
			}
		}
	}

	return{
		update : update
	}	
})();