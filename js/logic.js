var layer,debugLayer,startLayer,gameoverLayer;
var gameOver = false, gameStarted = false, gameoverAdded = false, pointAdded = false;;
var bodiesToRemove = [];
var actors = [];
var myBall;
var objectVelocity = -10;
var oneImage = null, tenImage = null;

var combo = 0, highCombo = 0, comboHun, comboTen, comboOne, comboDO;
var score = 0, scoreBack, scoreHun = null, scoreTen = null, scoreOne;
var overOne = null, overTen = null, overHun = null;
var highOne = null, highTen = null, highHun = null;
var highCOne = null, highCTen = null, highCHun = null;
var itemSpawned = true, itemSuperManSpawned = null, itemMagnetSpawned = null, printItemState, printItemStated = false;
var die = null;

var hasGosm = false;

var Logic = (function(){
	var carrotCounter = 0, objectCounter = 0, gosmCounter = 300, levelSelector = 50 , checker1 = false, checker2 = false, cloudTiming = 5;
	Ball.spawn();
	collie.Renderer.addLayer(layer);
	collie.Renderer.addLayer(debugLayer);
	collie.Renderer.addLayer(startLayer);

	var starting = collie.Renderer.start(1000/60, function (dt) {
		if(gameOver == false && gameStarted == true){
			box2d.update();

			carrotCounter++;
			objectCounter++;
			if(gosmCounter){
				if(!hasGosm) gosmCounter--;
			}
			else{ 
				gosmCounter = randomRange(1,500);
				Gosms.spawn();
				hasGosm = true;
			}

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
			if(cloudTiming == randomRange(1,100)){
				Cloud.spawn();
			}

			// 아이템 생성
			if(itemSpawned == false){
				var whichItem = randomRange(2,3);
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

			if(itemMagnetSpawned || itemSuperManSpawned) var DT = new Date().getTime();

			if(itemMagnetSpawned && DT - itemMagnetSpawned <= 5000){
				if(!printItemStated){
					printItemState.set("backgroundImage","magnetState5");
					layer.addChild(printItemState);
					printItemStated = true;
				}

				if(DT - itemMagnetSpawned >= 4000){
					printItemState.set("backgroundImage","magnetState5");
				} else if(DT - itemMagnetSpawned >= 3000){
					printItemState.set("backgroundImage","magnetState4");
				} else if(DT - itemMagnetSpawned >= 2000){
					printItemState.set("backgroundImage","magnetState3");
				} else if(DT - itemMagnetSpawned >= 1000){
					printItemState.set("backgroundImage","magnetState2");
				} else{
					printItemState.set("backgroundImage","magnetState1");
				}

				for(var i = 0, l = actors.length; i < l; i++){
					if(actors[i].body.GetUserData().id == "Carrot" && actors[i].skin.get("x") < layer.option("width") / 2){
						var vX = actors[0].skin.get("x") - actors[i].skin.get("x");
						var vY = actors[0].skin.get("y") - actors[i].skin.get("y");

						actors[i].body.SetLinearVelocity(new b2Vec2(vX / 10, vY / 10));
					}
				}
			} else if(itemMagnetSpawned){
				itemMagnetSpawned = false;
				printItemStated = false;
				layer.removeChild(printItemState);
			}

			if(itemSuperManSpawned && DT - itemSuperManSpawned <= 5000){
				if(!printItemStated){
					printItemState.set("backgroundImage","supermanState5");
					layer.addChild(printItemState);
					printItemStated = true;
				}

				if(DT - itemSuperManSpawned >= 4000){
					printItemState.set("backgroundImage","supermanState5");
				} else if(DT - itemSuperManSpawned >= 3000){
					printItemState.set("backgroundImage","supermanState4");
				} else if(DT - itemSuperManSpawned >= 2000){
					printItemState.set("backgroundImage","supermanState3");
				} else if(DT - itemSuperManSpawned >= 1000){
					printItemState.set("backgroundImage","supermanState2");
				} else{
					printItemState.set("backgroundImage","supermanState1");
				}
			} else if(itemSuperManSpawned){
				itemSuperManSpawned = false;
				printItemStated = false;
				layer.removeChild(printItemState);
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

			if(gameoverAdded == false){ // 1000:377/494
				SoundJS.stop('BGM');
				if(sound) SoundJS.play('Ong');
				
				// 현재 점수 출력
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

				// 최고점수 출력
				highOne = new collie.DisplayObject({
					width : 31,
					height : 53,
					x : 990 * scalex,
					y : 450 * scaley,
					backgroundImage : "high" + (score % 10),
					scaleX : scalex,
					scaleY : scaley,
					originX : "left",
					originY : "top"
				}).addTo(gameoverLayer);
				if(score >= 10){
					highOne.set("x", highOne.get("x") + 13 * scalex);
					highTen = new collie.DisplayObject({
						width : 31,
						height : 53,
						x : highOne.get("x") - (31 - 10) * scalex,
						y : 450 * scaley,
						backgroundImage : "high" + Math.floor((score / 10) % 10),
						scaleX : scalex,
						scaleY : scaley,
						originX : "left",
						originY : "top"
					}).addTo(gameoverLayer);
				}
				if(score >= 100){
					highOne.set("x", highOne.get("x") + 13 * scalex);
					highTen.set("x", highTen.get("x") + 13 * scalex);
					highHun = new collie.DisplayObject({
						width : 31,
						height : 53,
						x : highTen.get("x") - (31 - 10) * scalex,
						y : 450 * scaley,
						backgroundImage : "high" + Math.floor((score/100)),
						scaleX : scalex,
						scaleY : scaley,
						originX : "left",
						originY : "top"
					}).addTo(gameoverLayer);
				}

				// 콤보 출력
				if(highCombo == 0) highCombo = combo;
				highCOne = new collie.DisplayObject({
					width : 31,
					height : 53,
					x : 990 * scalex,
					y : 340 * scaley,
					backgroundImage : "high" + (highCombo % 10),
					scaleX : scalex,
					scaleY : scaley,
					originX : "left",
					originY : "top"
				}).addTo(gameoverLayer);
				if(highCombo >= 10){
					highCOne.set("x", highCOne.get("x") + 13 * scalex);
					highCTen = new collie.DisplayObject({
						width : 31,
						height : 53,
						x : highCOne.get("x") - (31 - 10) * scalex,
						y : 340 * scaley,
						backgroundImage : "high" + Math.floor((highCombo / 10) % 10),
						scaleX : scalex,
						scaleY : scaley,
						originX : "left",
						originY : "top"
					}).addTo(gameoverLayer);	
				}
				if(highCombo >= 100){
					highCOne.set("x", highCOne.get("x") + 13 * scalex);
					highCTen.set("x", highCTen.get("x") + 13 * scalex);
					highCHun = new collie.DisplayObject({
						width : 31,
						height : 53,
						x : highCTen.get("x") - (31 - 10) * scalex,
						y : 340 * scaley,
						backgroundImage : "high" + Math.floor((highCombo/100)),
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