var cloudX = [0, 83, 99, 272, 76, 191, 50, 78];
var cloudY = [0, 56, 59, 185, 56, 89, 28, 34];

var Ball, Objects, Gosms, GosmNeedles, Carrots, ItemSuperCarrot, ItemMagnet, ItemChange, Cloud;

var createActor = function(body, skin, id, timer){
	this.body = body;
	this.skin = skin;
	this.id = id;
	this.timer = timer;
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


collie.ImageManager.add({"rabbit" : "img/rabbit.png"});
collie.ImageManager.add({"rabbit_click" : "img/rabbit_click.png"});
collie.ImageManager.add({"rabbit_die" : "img/rabbit_die.png"});
Ball = (function(){
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
			originY : "top",
			zIndex : 100
		});
		layer.addChild(myBall);
		collie.Timer.cycle(myBall, "27fps", {
		    from : 0,
		    to : 8,
		    loop : 0
		});
		createBall(myBall);
	}

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

		var actor = new createActor(ball,skin,"Ball",null);
		ball.SetUserData(actor);
	}

	return {
		spawn : spawn
	}
})();

collie.ImageManager.add({ "crow": "img/crow.png" });
Objects = (function(){ // 70 72
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
			originY : "top",
			zIndex : 1
		}).addTo(layer);
		createObjects(objects);
	}

	var createObjects = function(skin){
		var bodyDef = new b2BodyDef;
		var fixDef = new b2FixtureDef;
		bodyDef.type = b2Body.b2_kinectBody;
		fixDef.shape = new b2PolygonShape;
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

		var actor = new createActor(objects,skin,"Object",timer);
		objects.SetUserData(actor);
	}

	return {
		spawn : spawn
	}
})();

collie.ImageManager.add({ "gosm": "img/gosm.png" });
Gosms = (function(){ // 70 72
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
		createGosms(gosms);
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

		var actor = new createActor(objects,skin,"Gosm",null);
		objects.SetUserData(actor);
	}

	return {
		spawn : spawn
	}
})();

collie.ImageManager.add({"carrot" : "img/carrot.png"});
Carrots = (function(){ // 40 86
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
			originY : "top",
			zIndex : 1
		}).addTo(layer);
		collie.Timer.cycle(carrots, "9fps", {
		    from: 0,
		    to: 8,
		    loop: 0
		})
		createCarrots(carrots);
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

		var actor = new createActor(carrots,skin,"Carrot",null);
		carrots.SetUserData(actor);
	}

	return {
		spawn : spawn
	}
})();

collie.ImageManager.add({"itemSuperCarrot" : "img/item/item_10carrots.png"});
ItemSuperCarrot = (function(){
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
		createItemSuperCarrot(itemSuperCarrot);
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

		var actor = new createActor(items,skin,"ItemSuperCarrot",null);
		items.SetUserData(actor);
	}

	return {
		spawn : spawn
	}
})();

collie.ImageManager.add({"itemSuperMan" : "img/item/item_star.png"});
ItemSuperMan = (function(){
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
		createItemSuperMan(itemSuperMan);
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

		var actor = new createActor(items,skin,"ItemSuperMan",null);
		items.SetUserData(actor);
	}

	return {
		spawn : spawn
	}
})();

collie.ImageManager.add({"itemMagnet" : "img/item/item_magnet.png"});
ItemMagnet = (function(){
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
		createItemMagnet(itemMagnet);
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

		var actor = new createActor(items,skin,"ItemMagnet",null);
		items.SetUserData(actor);
	}

	return {
		spawn : spawn
	}
})();

collie.ImageManager.add({"itemChange" : "img/item/item_clover.png"});
ItemChange = (function(){
	var spawn = function(){
		var itemChange = new collie.DisplayObject({
			width : 116,
			height : 116,
			x : (1280 + 10) * scalex,
			y : (Math.random() * 700) * scaley,
			backgroundImage : "itemChange",
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
		createItemChange(itemChange);
	}

	var createItemChange = function(skin){
		var bodyDef = new b2BodyDef;
		var fixDef = new b2FixtureDef;
		bodyDef.type = b2Body.b2_kinectBody;
		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox((skin.get("width") - 50) / 2 / SCALE * scalex , (skin.get("height") - 50) / 2 / SCALE * scaley);
		bodyDef.position.x = skin.get("x") / SCALE;
		bodyDef.position.y = skin.get("y") / SCALE;
		bodyDef.width = skin.get("width") / SCALE * scalex;
		bodyDef.height = skin.get("height") / SCALE * scaley;
		var items = world.CreateBody(bodyDef);
		items.CreateFixture(fixDef);
		items.SetLinearVelocity(new b2Vec2(-10 * scalex,0));

		var actor = new createActor(items,skin,"ItemChange",null);
		items.SetUserData(actor);
	}

	return {
		spawn : spawn
	}
})();

Cloud = (function(){
	var spawn = function(){
		var num = randomRange(1,7);

		var cloud = new collie.MovableObject({
			width : cloudX[num],
			height : cloudY[num],
			x : layer.option("width") + cloudX[num] * scalex,
			y : randomRange(0, layer.option("height") / 2 - cloudY[num]),
			backgroundImage : "cloud" + num,
			scaleX : scalex,
			scaleY : scaley,
			originX : "left",
			originY : "top",
			zIndex : -1
		}).addTo(layer);
		createCloud(cloud);
	}

	var createCloud = function(skin){
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
		items.SetLinearVelocity(new b2Vec2(randomRange(-10,-1),0));

		var actor = new createActor(items,skin,"Cloud",null);
		items.SetUserData(actor);
	}

	return {
		spawn : spawn
	}
})();