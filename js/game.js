// global variables...
/* global Mustache */
/* global TweenMax */
/* global TweenMax */
/* global TimelineMax */
/* global Draggable */
/* global SplitText */
/* global Power1 */
/* global Power4 */
/* global Back */
/* global Circ */
/* tooltipster */


function Game() {

	this.testMode = false;
	this.timeScale = 4;	

	this.currentRound = 0;
	this.currentPhase = 0;
	this.currentTurn = 0;
	
	this.init();
	
}
function Player() {
	//console.log(this);
}
function Location() {
	//console.log(this);
}
function UnitToken() {
	//console.log(this);
}
function UnitCard() {
	//console.log(this);
}
function BoostToken() {
	//console.log(this);
}

Game.prototype = {

	init: function() {
		
		var self = this;
		var config = $.getJSON('data/game.json');
		
		$.when(config).done(function (data){

			self.text = data.data;
			self.players = [];

			var deferreds = [];
			var players = $.shuffle(data.players);

			players.splice(0, data.players.length - data.config.gameSize);

			$.each(players, function(i) {

				var player = new Player();
				player.id = i+1;
				player.name = players[i].name;
				player.score = 0;				

				self.players.splice(i, 0, player);

				var faction = $.getJSON('data/faction_' + players[i].faction + '.json');
				deferreds.push(faction);
			});

			$.when.apply($, deferreds).done(function() {

				$.each(arguments, function(i) {
					var player = self.players[i];
					player.faction = arguments[1][0];//This works, not sure how though.
				});

				self.initFramework();
				self.initGame();

			});
		});
		
	},
	initFramework: function() {
		var data = {};
		var $container = $('#game');
		var $template = $('#game_template').html();
		var html = Mustache.render($template, data);
		$container.prepend(html);
	},	
	initGame: function() {

		var players = this.players;

		$.each(players, function(i) {
			var player = players[i];
			player.initUnitDeck();
			player.initBoostDeck();
			player.initFooter();
		});
		this.initLocations();
	},	
	initBattleCards: function() {

		var players = this.players;

		var $main = $('#main');
		$main.empty();

		$.each(players, function(i) {
			var player = players[i];
			player.initBattleCard(i);
		});	
	},	
	initTokens: function() {

		var players = this.players;

		if (this.currentRound === 0 && this.currentPhase === 0 && this.currentTurn === 0) {
			$.each(players, function(i) {
				var player = players[i];
				player.initUnitTokens();
				player.initBoostTokens();
			});
		} else {
			$.each(players, function(i) {
				var player = players[i];
				player.bindUnitTokens();
				player.bindBoostTokens();
			});
		}
	},	
	initLocations: function() {

		var players = this.players;
		var locations = this.locations = [];

		locations.deck = [];
		locations.upcoming = [];
		locations.active = {};

		$.each(players, function(i) {

			var player = players[i];
			var playerLocations = player.faction.locations;

			$.each(playerLocations, function(j) {
				var location = new Location();
				location.id = j+1;
				//location.owner = player.id;
				location.player = player;
				location.name = playerLocations[j].name;
				location.flavor = playerLocations[j].flavor;
				location.value = playerLocations[j].value;
				location.img = playerLocations[j].img;
				

				locations.deck.push(location);
			});
		});
		$.shuffle(locations.deck);

		for ( var i = 0; i < 4; i++ ) {						
			this.getDeckLocation().showUpcoming();
		}		
		this.getUpcomingLocation().hideUpcoming();
	},

	newLocation: function() {
		this.getActiveLocation().hideActive();
	},	
	newRound: function() {

		if (this.currentRound < 5) {
			this.currentRound++;
			this.newPhase();
		} else {
			//console.log('Rounds Complete');
			this.currentRound = 0;			
		}

	},	
	newPhase: function() {

		if (this.currentPhase < 2) {
			this.currentPhase++;
			this.newTurn();
		} else {
			//console.log('Phases Complete');
			this.currentPhase = 0;
			this.endRound();
		}

	},	
	newTurn: function() {
		if (this.currentTurn < this.players.length) {
			this.currentTurn++;
			this.newPlayer();
		} else {
			//console.log('Turns Complete Complete');
			this.currentTurn = 0;
			this.newPhase();			
		}
	},	
	newPlayer: function() {		
		var player = this.players[this.currentTurn-1];
		player.activate();
	},

	getDeckLocation: function() {
		var location = this.locations.deck.shift();
		this.locations.upcoming.push(location);
		return location;

	},	
	getUpcomingLocation: function() {
		var location = this.locations.upcoming.shift();
		this.locations.active = location;
		return location;

	},	
	getActiveLocation: function() {
		var location = this.locations.active;
		return location;
	},

	startRound: function() {
		//console.log('Round Started');

		this.getActiveLocation().setTurnOrder();

		this.initBattleCards();		
		this.initTokens();

		this.newRound();

	},	
	endRound: function() {
		//console.log('Round Ended');
		var self = this;

		var tl = new TimelineMax({onComplete:function() {
				self.newLocation();
		}});

		var $container = $('#main .container');

		tl.to($container, 0.25, {
			scale: 0,
			ease:Back.easeIn
		}, 0);
	}

};

Player.prototype = {

	initFooter: function() {

		var footerData = {
			player_id: this.id,
			faction_id: this.faction.id,
			score: this.score
		};
		var $footerContainer = $('#footer');
		var $footerTemplate = $('#footer_template').html();
		var footerHtml = Mustache.render($footerTemplate, footerData);
		$footerContainer.append(footerHtml);

		for ( var j = 1; j <= 5; j++ ) {
			//unit containers
			var unitData = {
				player_id: this.id,
				token_id: j,
			};
			var $unitContainer = $('#footer_' + this.id + ' .unit_container');
			var $unitTemplate = $('#unit_token_container_template').html();
			var unitHtml = Mustache.render($unitTemplate, unitData);
			$unitContainer.append(unitHtml);

			//boost containers
			var boostData = {
				player_id: this.id,
				token_id: j 
			};
			var $boostContainer = $('#footer_' + this.id + ' .boost_container');
			var $boostTemplate = $('#boost_token_container_template').html();
			var boostHtml = Mustache.render($boostTemplate, boostData);
			$boostContainer.append(boostHtml);
		}

	},
	initBattleCard: function(delay) {
				
		if(!delay || game.testMode) {
			delay = 0;
		} else {
			delay = (delay * 0.15);
		}

		var self = this;
		var data = {
			player_id: this.id,
			faction_id: this.faction.id
		};

		var $container = $('#main');
		var template = $('#main_card_template').html();
		var html = Mustache.render(template, data);	
		$container.append(html);

		//flip functionaility
		var $main = $('#main_' + this.id);
		var $card = $('#main_' + this.id + ' .card');
		var $cardFront = $('#main_' + this.id + ' .card .card_front');
		var $cardBack = $('#main_' + this.id + ' .card .card_back');


		TweenMax.from($card, 0.5, {marginRight:'2vw', scale:0.8, opacity:0, ease:Back.easeOut, delay:delay, onComplete:function() {
			//need to do anything?
		}});

		$card.click( function(){
			self.view();
		});
		$card.mouseover( function(){
			if ( $card.hasClass('flipped') && !($main.hasClass('active')) ) {
				$card.flip(false);
			}
		});
		$card.mouseout( function(){
			if ( $card.hasClass('flipped') ) {
				$card.flip(true);
			}
		});
		$card.flip({
			trigger: 'manual',				
			front: $cardFront,
			back: $cardBack,
			speed: 200
		});

		this.resetBattleCard();
		this.initBattleCardFront();
		this.initBattleCardBack();

	},
	initBattleCardFront: function() {

		var data = {
			player_score: this.score,
			player_name: this.name,
			faction_id: this.faction.id,
			faction_name: this.faction.name,
			faction_flavor: this.faction.flavor
		};
		var $container = $('#main_' + this.id + ' .card .card_front');
		var template = $('#main_card_front_template').html();
		var html = Mustache.render(template, data);	
		$container.append(html);

	},
	initBattleCardBack: function() {

		var data = {
			title: game.text.unitCard.title,
			flavor: game.text.unitCard.flavor,
			value: game.text.unitCard.value,
			type: game.text.unitCard.type
		};
		var $container = $('#main_' + this.id + ' .card .card_back');
		var template = $('#main_card_back_template').html();
		var html = Mustache.render(template, data);
		$container.append(html);

	},
	resetBattleCard: function() {
		this.battleCard = {
			value: 0
		};
		this.units.active.length = 0;
		this.boosts.active.length = 0;
		//clear all active units & boosts
	},

	enableTokens: function() {

		if (game.currentPhase === 1) {
			this.enableUnitTokens();
			this.disableBoostTokens();
		}
		if (game.currentPhase === 2) {
			this.disableUnitTokens();
			this.enableBoostTokens();
		} 

	},	

	initUnitDeck: function() {

		this.units = {};
		this.units.deck = [];
		this.units.available = [];
		this.units.active = [];

		var self = this;
		var units = this.faction.units;
		var deck = [];

		$.each(units, function(i) {
			
			var unit = new UnitToken();
			//unit.owner = self.id;
			unit.player = self;
			unit.name = units[i].name;
			unit.flavor = units[i].flavor;
			unit.img = units[i].img;
			unit.type = units[i].type;
			unit.frequency = units[i].frequency;
			unit.value = units[i].value;
			
			for ( var j = 1; j <= unit.frequency; j++ ) {
				deck.push(unit);
			}
		});	
		this.units.deck = $.shuffle(deck);
	},
	initUnitTokens: function() {

		for ( var j = 1; j <= 5; j++ ) {

			var token = this.getUnitToken();	
			token.id = j;
			
			var data = {
				player_id: this.id,
				faction_id: this.faction.id,
				token_id: token.id,
				value: token.value,
				img: token.img,
				type: token.getIcon()
			};

			var $container = $('#unit_token_container_' + this.id + '_' + token.id);
			var template = $('#unit_token_template').html();
			var html = Mustache.render(template, data);
			$container.append(html);

			this.units.available.push(token);

			token.init();
			
			$container.click(function() {
				console.log(token);
			});


		}
		//console.log(player.units.available);

	},
	getUnitToken: function() {

		var deck = this.units.deck;

		if (deck.length === 0 ) {
			this.initUnitDeck();
			this.getUnitToken();
		} else {
			return Object.assign(new UnitToken(), deck.pop());
		}

	},
	enableUnitTokens: function() {

		var tokens = this.units.available;

		$.each(tokens, function(i) {
			var token = tokens[i];
			token.enable();
		});
	},
	disableUnitTokens: function() {

		var tokens = this.units.available;

		$.each(tokens, function(i) {
			var token = tokens[i];
			token.disable();
		});
	},
	flipUnitTokens: function() {

		var tokens = this.units.available;

		$.each(tokens, function(i) {
			tokens[i].flip();
		});
	},
	upflipUnitTokens: function() {

		var tokens = this.units.available;

		$.each(tokens, function(i) {
			tokens[i].unflip();
		});
	},
	bindUnitTokens: function() {
		var tokens = this.units.available;

		$.each(tokens, function(i) {
			tokens[i].init();
		});
	},

	initBoostDeck: function() {

		this.boosts = {};
		this.boosts.deck = [];
		this.boosts.available = [];
		this.boosts.active = [];

		var self = this;
		var boosts = this.faction.boosts;
		var deck = [];

		$.each(boosts, function(i) {
			var boostType = boosts[i];

			$.each(boostType.items, function(j) {
				var boost = new BoostToken();
				//boost.owner = self.id;
				boost.player = self;
				boost.type = boostType.name;
				boost.name = boosts[i].items[j].name;
				boost.flavor = boosts[i].items[j].flavor;
				boost.img = boosts[i].items[j].img;
				boost.value = boosts[i].items[j].value;

				deck.push(boost);
			});
		});
		this.boosts.deck = $.shuffle(deck);
		//console.log(this.boosts.deck);
	},
	initBoostTokens: function() {

		for ( var j = 1; j <= 5; j++ ) {

			var token = this.getBoostToken();	
			//token.owner = this.id;
			token.id = j;

			var data = {
				player_id: this.id,
				faction_id: this.faction.id,
				token_id: token.id,
				value: token.value,
				img: token.img,
				type: token.getIcon()
			};

			var $container = $('#boost_token_container_' + this.id + '_' + token.id);
			var template = $('#boost_token_template').html();
			var html = Mustache.render(template, data);
			$container.append(html);

			this.boosts.available.push(token);

			token.init();

		}
		//console.log(player.boosts.available);
	},
	getBoostToken: function() {

		var deck = this.boosts.deck;

		if (deck.length === 0 ) {
			this.initBoosttDeck();
			this.getBoostToken();
		} else {
			return Object.assign(new BoostToken(), deck.pop());
		}

	},
	enableBoostTokens: function() {

		var tokens = this.boosts.available;

		$.each(tokens, function(i) {
			var token = tokens[i];
			token.enable();
		});

		var $container = $('#main_' + this.id + ' .card .card_back .content .token_container');

		var tl = new TimelineMax();	

		tl.to($container, 0.25, {
			scale: 1,
			ease:Back.easeIn,
		}, 0);

	},
	disableBoostTokens: function() {

		var tokens = this.boosts.available;

		$.each(tokens, function(i) {
			var token = tokens[i];
			token.disable();
		});
	},
	flipBoostTokens: function() {

		var tokens = this.boosts.available;

		$.each(tokens, function(i) {
			tokens[i].flip();
		});
	},
	upflipBoostTokens: function() {

		var tokens = this.boosts.available;

		$.each(tokens, function(i) {
			tokens[i].unflip();
		});
	},
	bindBoostTokens: function() {
		var tokens = this.boosts.available;

		$.each(tokens, function(i) {
			tokens[i].init();
		});
	},

	view: function() {

		var self = this;
		var players = game.players;

		$.each(players, function(i) {
			var $main = $('#main_' + this.id);
			var $footer = $('#footer_' + this.id);	

			var tl = new TimelineMax();

			if (players[i].id === self.id) {
				tl.to($main, 0.25, {scale: 1.02, className: "+=viewing", ease:Power4.easeInOut}, 0);						
				$footer.css({'z-index':1});
				tl.to($footer, 0.5, {className: "+=viewing", ease:Power4.easeOut}, 0);
			} else {
				tl.to($main, 0.25, {scale:1, className: "-=viewing", ease:Power4.easeInOut}, 0);						
				$footer.css({'z-index':0});
				tl.to($footer, 0.5, {className: "-=viewing", ease:Power4.easeOut}, 0);
			}
		});

	},
	activate: function() {

		var self = this;

		var $card = $('#main_' + this.id + ' .card');
		var $main = $('#main_' + this.id );
		var $footer = $('#footer_' + this.id );	

		var tl = new TimelineMax({onComplete: function() {
			$card.flip(true).on('flip:done',function(){
				$card.addClass('flipped');
			});
			self.view();
			self.enableTokens();
			self.upflipBoostTokens();
		}});
		tl.to($main, 0.25, {className: "+=active", ease:Power4.easeInOut}, 0);						
		tl.to($footer, 0.25, {className: "+=active", ease:Power4.easeInOut}, 0);

	},
	deactivate: function() {

		var self = this;

		var $main = $('#main_' + this.id );
		var $footer = $('#footer_' + this.id );	

		var tl = new TimelineMax({onComplete: function() {
			self.disableUnitTokens();
		}});
		tl.to($main, 0.25, {className: "-=active", ease:Power4.easeInOut}, 0);						
		tl.to($footer, 0.25, {className: "-=active", ease:Power4.easeInOut}, 0);

		this.flipBoostTokens();

	},

	activateUnit: function() {
		this.deactivate();
		game.newTurn();	
	},
	activateBoost: function() {
		this.deactivate();
		game.newTurn();	
	}

};

Location.prototype = {

	getPlayer: function() {

		var self = this;
		var players = game.players;
		var player = {};	

		$.each(players, function(i) {
			if ( self.player.id === players[i].id ) {
				player = players[i];
			}
		});	
		return player;
	},
	showUpcoming: function() {

		var data = {
			player_id: this.player.id,
			player_name: this.player.name,
			faction_id: this.player.faction.id,
			location_id: this.id,
			name: this.name,
			value: this.value,
			flavor: this.flavor
		};

		var $container = $('#header #inactive_locations');
		var template = $('#location_inactive_template').html();	
		var html = Mustache.render(template, data);		
		$container.append(html);	

		var $location = $('#header_' + this.player.id + '_' + this.id);
		TweenMax.from($location, 0.25, {scale:0.4, opacity:0, ease:Back.easeOut, onComplete:function() {
			//do anyhting?
		}});

		var $card = $('#header_' + this.player.id + '_' + this.id + ' .card');
		$card.flip( {trigger: 'hover', speed: 200} );

	},
	hideUpcoming: function() {


		var $location = $('#header_' + this.player.id + '_' + this.id);
		var $locationCard = $('#header_' + this.player.id + '_' + this.id + ' .card');

		var tl = new TimelineMax({onComplete:function() {
			$location.remove();		
			game.getActiveLocation().showActive();
			game.getDeckLocation().showUpcoming();
		}});

		tl.to($locationCard, 0.5, {onStart:function() {
			$locationCard.flip(true);
		}});	
		tl.to($location, 0.5, {scale:0.4, opacity:0, ease:Power4.easeIn});

	},
	showActive: function() {

		var data = {
			player_id: this.player.id,
			player_name: this.player.name,
			faction_id: this.player.faction.id,
			location_id: this.id,
			name: this.name,
			value: this.value,
			flavor: this.flavor
		};

		var $container = $('#header #active_location');
		var template = $('#location_active_template').html();
		var html = Mustache.render(template, data);
		$container.append(html);

		var $points = $('#header_' + this.player.id + '_' + this.id + ' .header .point_frame');
		var $player = $('#header_' + this.player.id + '_' + this.id + ' .content .player');	
		var $title = $('#header_' + this.player.id + '_' + this.id + ' .content .title');	
		var $text = new SplitText($('#header_' + this.player.id + '_' + this.id + ' .content .text'), {type:'words,chars'});
		var $bg = $('#bg');

		$bg.css({'background-image': 'url(img/faction_' + this.player.faction.id + '/locations/' + this.img + ')'});

		var tl = new TimelineMax({onComplete:function() {
			game.startRound();
		}});
		tl.from($points, 0.5, {scale:0, ease:Back.easeOut});
		tl.from($player, 0.25, {xPercent:-100, ease:Circ.easeOut}, 0.1);
		tl.from($title, 0.25, {xPercent:-100, ease:Circ.easeOut}, 0.2);
		tl.staggerFrom($text.words, 0.01, {opacity:0, ease:Power4.easeInOut}, -0.01, 0.3, function() {
			$text.revert();
		});
		tl.from($bg, 3, {opacity:0});
		
		if(game.testMode) {
			tl.timeScale(game.timeScale);
		}

	},
	hideActive: function() {

		var $location = $('#header_' + this.player.id + '_' + this.id );
		var $points = $('#header_' + this.player.id + '_' + this.id + ' .header .point_frame');	
		var $player = $('#header_' + this.player.id + '_' + this.id + ' .content .player');	
		var $title = $('#header_' + this.player.id + '_' + this.id + ' .content .title');
		var $text = new SplitText($('#header_' + this.player.id + '_' + this.id + ' .content .text'), {type:'words,chars'});

		var tl = new TimelineMax({onComplete:function() {
			$location.remove();
			game.getUpcomingLocation().hideUpcoming();
		}});	

		tl.to($player, 0.25, {xPercent:-100, ease:Circ.easeOut}, 0);
		tl.to($title, 0.25, {xPercent:-100, ease:Circ.easeOut}, 0.1);
		tl.staggerTo($text.words, 0.01, {opacity:0, ease:Power4.easeInOut}, -0.01, 0.2 );
		tl.to($points, 0.25, {scale:0, ease:Back.easeIn}, 0.5);

	},
	setTurnOrder: function() {

		var self = this;
		
		var players = game.players;
		var l = 0;

		$.shuffle(players);

		$.each(players, function(i) {
			if ( self.player.id === players[i].id ) {
				l = i;
			}
		});	
		players.move(l,0);
	}

};

UnitToken.prototype = {

	init: function() {
		this.initDrag();
		this.initFlip();
		this.initTip();
	},
	initDrag: function() {
		
		var self = this;

		var $pog = $('#unit_token_' + this.player.id + '_' + this.id);	
		var $pogTarget = $('#main_' + this.player.id  + ' .card .card_back .token_container');
		var threshold = '100%';

		var $container = $('#main_' + this.player.id );
		var $card = $('#main_' + this.player.id  + ' .card');
		var $fg = $('#main_' + this.player.id  + ' .card .card_back .token_container');			
		var $bg = $('#main_' + this.player.id  + ' .card .card_back .token_container .bg');

		Draggable.create($pog, {
			cursor: '-webkit-grab',
			bounds:$('#game'),
			onDragStart:function() {
				$pog.addClass('dragging');
				$container.addClass('ready');
				TweenMax.set($pog, {scale:1.8});			
				TweenMax.to($bg, 1, {opacity: 0.7, repeat:-1, yoyo:true, ease:Power1.easeInOut});
				TweenMax.to($card, 0.25, {scale:1.02});
				
				$pog.tooltipster('close');
				
			},
			onDrag: function() {
				if ( this.hitTest($pogTarget, $pog, threshold) ) {
					TweenMax.to($pogTarget, 0.5, {scale:1.02});
					TweenMax.to($card, 0.25, {scale:1.03});
				} else {
					TweenMax.to($pogTarget, 0.5, {scale:1});
					TweenMax.to($card, 0.25, {scale:1.02});
				}
			},
			onDragEnd:function() {

				$pog.removeClass('dragging');
				$container.removeClass('ready');

				TweenMax.to($bg, 1, {opacity:1});
				TweenMax.to($card, 0.5, {scale:1});

				if ( this.hitTest($pogTarget, $pog, threshold) ) {

					this.disable();

					TweenMax.to($pog, 0.25, {clearProps:'all', scale:0.7, onComplete:function() {
						$pog.detach().css({top: 0,left: 0}).appendTo($fg);
						self.activate();
					}});

				} else {
					TweenMax.to(this.target, 0.15, {x:0, y:0, scale:1, delay:0.1});
				}
			}
		});
		Draggable.get($pog).disable();
		TweenMax.set($pog, {x:0, y:0});		
	},	
	initFlip: function() {
		
		var $pog = $('#unit_token_' + this.player.id + '_' + this.id);
		var $pogFront = $('#unit_token_' + this.player.id + '_' + this.id + ' .pog .pog_front');	
		var $pogBack = $('#unit_token_' + this.player.id + '_' + this.id + ' .pog .pog_back');	
		
		$pog.flip({
			trigger: 'manual',				
			front: $pogFront,
			back: $pogBack,
			speed: 200,

		});

	},
	initTip: function() {
		
		var self = this;
		
		var unitCard = new UnitCard();
		unitCard.player = this.player;
		unitCard.unit = this;
		unitCard.init();
		
		var $unitCard = $('#unit_card_' + this.player.id + '_' + this.id).detach();		
		var $pog = $('#unit_token_' + this.player.id + '_' + this.id);
				
		$pog.tooltipster({
			theme: ['card', 'faction_' + this.player.faction.id],
			interactive: true,
			animationDuration: [100,100],
			delay: [400,200],
			trigger: 'custom',
			selfDestruction: true,
			triggerOpen: {
				mouseenter: true
			},
			triggerClose: {
				mouseleave: true,
			},
			content: $unitCard,
		});		
		$.tooltipster.group('unit_token_group_' + self.player.id);
		
	},
	
	getIcon: function() {

		var icon = '\uE500';

		switch(this.type) {
			case 'type_1':
				icon = '\uE200';
				break;
			case 'type_2':
				icon = '\uE203';
				break;
			case 'type_3':
				icon = '\uE204';
				break;
			case 'type_4':
				icon = '\uE204';
				break;
			default:
				icon = icon;
		}
		return icon;
	},

	enable: function() {

		var $unitToken = $('#unit_token_' + this.player.id + '_' + this.id);	
		Draggable.get($unitToken).enable();
		TweenMax.set($unitToken, {x:0, y:0, className:'-=disabled'});

	},
	disable: function() {

		var $unitToken = $('#unit_token_' + this.player.id + '_' + this.id);	
		Draggable.get($unitToken).disable();
		TweenMax.set($unitToken, {className:'+=disabled'});

	},

	flip: function() {

		var $unitToken = $('#unit_token_' + this.player.id + '_' + this.id);	
		$unitToken.flip(true);
	},
	unflip: function() {

		var $unitToken = $('#unit_token_' + this.player.id + '_' + this.id);	
		$unitToken.flip(false);
	},

	activate: function() {

		var availableUnits = this.player.units.available;
		var activeUnits = this.player.units.active;

		availableUnits.splice(availableUnits.indexOf(this),1);
		activeUnits.push(this);

		this.updateBattleCard();
	},
	updateBattleCard: function() {

		var self = this;
		
		var activeUnits = this.player.units.active;
		var cardCounter = { var: this.player.battleCard.value };

		$.each(activeUnits, function(i) {
			self.player.battleCard.value += activeUnits[i].value;
		});

		var $image = $('#main_' + this.player.id + ' .card .card_back .card_image .bg');
		var $value = $('#main_' + this.player.id + ' .card .card_back .header .value');
		var $container = $('#main_' +this.player.id + ' .card .card_back .content .token_container');
		var $fg = $('#main_' + this.player.id + ' .card .card_back .content .token_container .fg');
		var $title = $('#main_' + this.player.id + ' .card .card_back .content .title');
		var $text = $('#main_' + this.player.id + ' .card .card_back .content .text');
		var $type = $('#main_' + this.player.id + ' .card .card_back .footer .type');
		var $unitToken = $('#unit_token_' + this.player.id + '_' + this.id);
		var $unitValue = $('#unit_token_' + this.player.id + '_' + this.id + ' .pog .pog_front .value');
		var $unitType = $('#unit_token_' + this.player.id + '_' + this.id + ' .pog .pog_front .value .type');

		$type.html(this.getIcon());
		$title.html(this.name);
		$text.html(this.flavor);
		$image.css({'background-image': 'url(img/faction_' + this.player.faction.id + '/units/' + this.img + ')'});

		var tl = new TimelineMax({onComplete:function() {
			$unitToken.remove();
			self.player.activateUnit();
		}});	

		tl.from($unitToken, 0.25, {
			scale: 0.8,
			ease:Back.easeOut,
		}, 'step_1');
		tl.to($unitType, 0.25, {
			width: 0,
			ease:Back.easeOut,
			onComplete:function() {
				$unitType.html('+');
			}
		}, 'step_2');			
		tl.from($type, 0.25, {
			scale: 0,
			ease:Back.easeOut
		}, 'step_3');			
		tl.to($unitValue, 0.5, {
			marginTop: '-6vh',
			background: 'none',
			opacity: 0.5,
			onComplete: function() {
				$unitValue.hide();
			},
			ease:Circ.easeOut
		}, 'step_4');
		tl.to(cardCounter, 1, { 
			var: self.player.battleCard.value, 
			onUpdate: function () {
				$value.html(Math.ceil(cardCounter.var));
			},
			ease:Circ.easeOut
		}, 'step_5');
		tl.from($image, 1, {
			opacity: 0
		}, 'step_6');
		tl.to($container, 0.25, {
			scale: 0,
			ease:Back.easeIn,
			onComplete: function() {
				$fg.empty();
			}
		}, 'step_7');

		if (game.testMode) {
			tl.timeScale(game.timeScale);
		}			

	},

};

BoostToken.prototype = {

	init: function() {

		var self = this;

		var $pog = $('#boost_token_' + this.player.id + '_' + this.id);	
		var $pogFront = $('#boost_token_' + this.player.id + '_' + this.id + ' .pog .pog_front');	
		var $pogBack = $('#boost_token_' + this.player.id + '_' + this.id + ' .pog .pog_back');	
		var $pogTarget = $('#main_' + this.player.id  + ' .card .card_back .token_container');
		var threshold = '100%';

		var $container = $('#main_' + this.player.id );
		var $card = $('#main_' + this.player.id  + ' .card');
		var $fg = $('#main_' + this.player.id  + ' .card .card_back .token_container');			
		var $bg = $('#main_' + this.player.id  + ' .card .card_back .token_container .bg');

		Draggable.create($pog, {
			cursor: '-webkit-grab',
			bounds:$('#game'),
			onDragStart:function() {
				$pog.addClass('dragging');
				$container.addClass('ready');
				TweenMax.set($pog, {scale:1.8});			
				TweenMax.to($bg, 1, {opacity: 0.7, repeat:-1, yoyo:true, ease:Power1.easeInOut});
				TweenMax.to($card, 0.25, {scale:1.02});
			},
			onDrag: function() {
				if ( this.hitTest($pogTarget, $pog, threshold) ) {
					TweenMax.to($pogTarget, 0.5, {scale:1.02});
					TweenMax.to($card, 0.25, {scale:1.03});
				} else {
					TweenMax.to($pogTarget, 0.5, {scale:1});
					TweenMax.to($card, 0.25, {scale:1.02});
				}
			},
			onDragEnd:function() {

				$pog.removeClass('dragging');
				$container.removeClass('ready');

				TweenMax.to($bg, 1, {opacity:1});
				TweenMax.to($card, 0.5, {scale:1});

				if ( this.hitTest($pogTarget, $pog, threshold) ) {

					this.disable();

					TweenMax.to($pog, 0.25, {clearProps:'all', scale:0.7, onComplete:function() {
						$pog.detach().css({top: 0,left: 0}).appendTo($fg);
						self.activate();
					}});

				} else {
					TweenMax.to(this.target, 0.15, {x:0, y:0, scale:1, delay:0.1});
				}
			}
		});

		$pog.flip({
			trigger: 'manual',				
			front: $pogFront,
			back: $pogBack,
			speed: 200,

		});

		Draggable.get($pog).disable();
		TweenMax.set($pog, {x:0, y:0});

		this.flip();

	},
	
	getIcon: function() {

		var icon = '\uE500';

		switch(this.type) {
			case 'type_1':
				icon = '\uE001';
				break;
			case 'type_2':
				icon = '\uE002';
				break;
			case 'type_3':
				icon = '\uE003';
				break;
			case 'type_4':
				icon = '\uE004';
				break;
			case 'type_5':
				icon = '\uE000';
				break;
			default:
				icon = icon;
		}
		return icon;
	},

	enable: function() {

		var $boostToken = $('#boost_token_' + this.player.id + '_' + this.id);	
		Draggable.get($boostToken).enable();
		TweenMax.set($boostToken, {x:0, y:0, className:'-=disabled'});

	},
	disable: function() {

		var $boostToken = $('#boost_token_' + this.player.id + '_' + this.id);	
		Draggable.get($boostToken).disable();
		TweenMax.set($boostToken, {className:'+=disabled'});

	},

	flip: function() {

		var $boostToken = $('#boost_token_' + this.player.id + '_' + this.id);	
		$boostToken.flip(true);
	},
	unflip: function() {

		var $boostToken = $('#boost_token_' + this.player.id + '_' + this.id);	
		$boostToken.flip(false);
	},

	activate: function() {

		var availableBoosts = this.player.boosts.available;
		var activeBoosts = this.player.boosts.active;

		availableBoosts.splice(availableBoosts.indexOf(this),1);
		activeBoosts.push(this);

		this.updateBattleCard();

	},
	updateBattleCard: function() {

		var self = this;
		
		var activeBoosts = this.player.boosts.active;			
		var cardCounter = { var: this.player.battleCard.value };			

		$.each(activeBoosts, function(i) {
			self.player.battleCard.value += activeBoosts[i].value;
		});

		var $container = $('#main_' + this.player.id + ' .card .card_back .content .token_container');
		var $fg = $('#main_' + this.player.id + ' .card .card_back .content .token_container .fg');
		var $value = $('#main_' + this.player.id + ' .card .card_back .value');
		var $boostToken = $('#boost_token_' + this.player.id + '_' + this.id);
		var $boostValue = $('#boost_token_' + this.player.id + '_' + this.id + ' .pog .pog_front .value');
		//var $boostType = $('#boost_token_' + player.id + '_' + this.id + ' .pog .pog_front .value .type');

		var tl = new TimelineMax({onComplete:function() {
			$boostToken.remove();
			self.player.activateBoost();
		}});	

		tl.to(cardCounter, 1, { 
			var: self.player.battleCard.value, 
			onUpdate: function () {
				$value.html(Math.ceil(cardCounter.var));
			},
			ease:Circ.easeOut
		}, 'step_0');
		tl.to($boostValue, 0.5, {
			marginTop: '-6vh',
			background: 'none',
			onComplete: function() {
				$boostValue.hide();
			},
			ease:Circ.easeOut
		}, 'step_0');
		tl.to($container, 0.25, {
			scale: 0,
			ease:Back.easeIn,
			onComplete: function() {
				$fg.empty();
			}
		}, 'step_2');


	},

};

UnitCard.prototype = {
		
	init: function() {

		var data = {
			player_id: this.player.id,
			faction_id: this.player.faction.id,
			unit_id: this.unit.id,
			img: this.unit.img,
			title: this.unit.name,
			flavor: this.unit.flavor,
			value: this.unit.value,
			type: this.unit.getIcon()
		};

		//console.log(this.player.id + ' ' + this.unit.id);

		var $container = $('#game');
		var template = $('#unit_card_template').html();
		var html = Mustache.render(template, data);
		$container.append(html);

	}	
	
};

var game = new Game();