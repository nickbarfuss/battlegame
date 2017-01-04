function getRandomUnitToken(id) {
	var units = game.factions[id].units;
	var totalFrequncy = 0;
	var random = 0;

	$.each(units, function(j) {
		totalFrequncy += units[j].frequency;
	});		

	random = Math.floor(Math.random() * totalFrequncy);

	for (var k = 0; k < units.length; k++) {
		random -= units[k].frequency;

		if (random < 0) {
			return units[k];
		}
	}
} 
