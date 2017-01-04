<!doctype html> 
<html lang="en"> 
<head> 
	<meta charset="UTF-8" />
	<meta name="robots" content="noindex">
	
	<title>Battle Game Template</title>
	
	<link href="css/game.css?<?php echo time(); ?>" media="screen" rel="stylesheet" type="text/css" />
	<link href="css/vendor/tooltipster/tooltipster.bundle.min.css" media="screen" rel="stylesheet" type="text/css" />

</head>

<body id="game">

    	<div id="game_template" class="template">
		<div id="bg"></div>
		<div id="header">
			<div id="active_location"></div>
			<div id="inactive_locations"></div>		
		</div>
		<div id="main"></div>
		<div id="footer"></div>
	</div>
    	
    	<div id="location_active_template" class="template">
		<div id="header_{{player_id}}_{{location_id}}" class="container faction_{{faction_id}}">
			<div class="header">
				<div class="point_frame">
					<div class="points">{{value}}</div>
				</div>
			</div>
			<div class="content">
				<div class="player">{{player_name}}</div>
				<div class="title">{{name}}</div>
				<div class="text">{{flavor}}</div>
			</div>
		</div>
	</div>

	<div id="location_inactive_template" class="template">
		<div id="header_{{player_id}}_{{location_id}}" class="container faction_{{faction_id}}">
			<div class="card">
				<div class="front">
					<div class="point_frame">
						<div class="points">{{value}}</div>
					</div>
					<div class="title">{{name}}</div>
				</div>
				<div class="back">
					<div class="portrait_container">
						<div class="bg"></div>
						<div class="fg">
							<div class="portrait">
								<div class="img" style="background-image: url(img/faction_{{faction_id}}/player/portrait.png);"></div>
							</div>
						</div>
					</div>
					<div class="title">{{player_name}}</div>
				</div>
			</div>
		</div>
	</div>

    	<div id="footer_template" class="template">
		<div id="footer_{{player_id}}" class="container faction_{{faction_id}}" title="Test">
			<div class="player_container">
				<div class="player">
					<div class="portrait_container">
						<div class="bg"></div>
						<div class="fg">
							<div class="portrait">
								<div class="img" style="background-image: url(img/faction_{{faction_id}}/player/portrait.png);"></div>
							</div>
						</div>
					</div>
					<div class="point_container">
						<div class="point_frame">
							<div class="points">{{score}}</div>
						</div>
					</div>
				</div>
			</div>
			<div class="unit_container"></div>
			<div class="boost_container"></div>
		</div>
	</div>
   	
    	<div id="main_card_template" class="template">
		<div id="main_{{player_id}}" class="container faction_{{faction_id}} ">
			<div class="card">
				<div class="card_front"></div>
				<div class="card_back"></div>
			</div>
		</div>
	</div>
	
	<div id="main_card_front_template" class="template">
		<div class="card_image">
			<div class="bg" style="background-image: url(img/faction_{{faction_id}}/player/portrait.png);"></div>
			<div class="fg"></div>			
		</div>
		<div class="header">
			<div class="point_frame">
				<div class="points">{{player_score}}</div>
			</div>
		</div>
		<div class="content">
			<div class="portrait_container">
				<div class="bg"></div>
				<div class="fg">
					<div class="portrait">
						<div class="img" style="background-image: url(img/faction_{{faction_id}}/player/portrait.png);"></div>
					</div>
				</div>
			</div>
			<div class="title">{{faction_name}}</div>
			<div class="text">{{faction_flavor}}</div>
		</div>
		<div class="footer">
			<div class="player">{{player_name}}</div>
		</div>
	</div>
	
	<div id="main_card_back_template" class="template">
		<div class="card_image">
			<div class="bg"></div>
			<div class="fg"></div>			
		</div>
		<div class="header">
			<div class="value_frame">
				<div class="value">{{value}}</div>
			</div>
		</div>
		<div class="content">
			<div class="token_container">
				<div class="bg"></div>
				<div class="fg"></div>
			</div>
			<div class="title">{{title}}</div>
			<div class="text">{{flavor}}</div>
		</div>
		<div class="footer">
			<div class="type">{{type}}</div>
		</div>
		<div class="progress">
			<div class="bar"></div>
		</div>
	</div>

	<div id="unit_token_container_template" class="template">
		<div id="unit_token_container_{{player_id}}_{{token_id}}" class="empty_container"></div>
	</div>
	
	<div id="boost_token_container_template" class="template">
		<div id="boost_token_container_{{player_id}}_{{token_id}}" class="empty_container"></div>
	</div>
	
	<div id="unit_token_template" class="template">
		<div id="unit_token_{{player_id}}_{{token_id}}" class="token unit_token unit_token_group_{{player_id}} disabled">
			<div class="pog">
				<div class="pog_front">
					<div class="img" style="background-image: url(img/faction_{{faction_id}}/units/{{img}});"></div>
					<div class="value">
						<span class="type">{{type}}</span>
						<span class="number">{{value}}</span>
					</div>
				</div>
				<div class="pog_back"></div>
			</div>		
		</div>
	</div>
	
	<div id="boost_token_template" class="template">
		<div id="boost_token_{{player_id}}_{{token_id}}" class="token boost_token disabled">
			<div class="pog">
				<div class="pog_front">
					<div class="img" style="background-image: url(img/faction_{{faction_id}}/boosts/{{img}});"></div>
					<div class="value">
						<span class="type">{{type}}</span>
						<span class="number">{{value}}</span>
					</div>
				</div>
				<div class="pog_back"></div>
			</div>
		</div>
	</div>
	
	<div id="unit_card_template" class="template">
		<div id="unit_card_{{player_id}}_{{unit_id}}" class="unit_card">
			<div class="card_image">
				<div class="bg" style="background-image: url(img/faction_{{faction_id}}/units/{{img}});"></div>
				<div class="fg"></div>			
			</div>
			<div class="header">
				<div class="value_frame">
					<div class="value">{{value}}</div>
				</div>
			</div>
			<div class="content">
				<div class="title">{{title}}</div>
				<div class="text">{{flavor}}</div>
			</div>
			<div class="footer">
				<div class="type">{{type}}</div>
			</div>
		</div>
	</div>

	
	<script type="text/javascript" src="js/vendor/jquery/jquery-3.1.1.min.js"></script>
	<script type="text/javascript" src="js/vendor/jquery/plugins/jquery.shuffle.js"></script>
	<script type="text/javascript" src="js/vendor/jquery/plugins/jquery.flip.min.js"></script>
	
	<script type="text/javascript" src="js/vendor/jquery/jquery-ui.min.js"></script>
	
	<script type="text/javascript" src="js/vendor/mustache/mustache.min.js"></script>
	
	<script type="text/javascript" src="js/vendor/tooltipster/tooltipster.bundle.min.js"></script>
	<script type="text/javascript" src="js/vendor/tooltipster/plugins/tooltipster-discovery.min.js"></script>

	<script type="text/javascript" src="js/vendor/greensock/TweenMax.min.js"></script>
	<script type="text/javascript" src="js/vendor/greensock/TimelineMax.min.js"></script>
	<script type="text/javascript" src="js/vendor/greensock/plugins/CSSPlugin.min.js"></script>
	<script type="text/javascript" src="js/vendor/greensock/plugins/ThrowPropsPlugin.min.js"></script>
	<script type="text/javascript" src="js/vendor/greensock/utils/Draggable.min.js"></script>
	<script type="text/javascript" src="js/vendor/greensock/utils/SplitText.min.js"></script>
	
	<script type="text/javascript" src="js/utils/ArrayHelper.js"></script>

	<script type="text/javascript" src="js/game.js"></script>
	
</body>

</html>