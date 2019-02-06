{
    // here we define a variable for record keeping
    distances : [],    
    // optional function called at the beginning of the simulation
    setupSimulation: function() {
	this.startPos = this.getRobot().getCoreComponent().getRootPosition();
	return true;
    },
/*
    // optional function called after each step of simulation
    afterSimulationStep: function() {
	return true;
    },
*/
    // optional function called at the end of the simulation
    endSimulation: function() {

	// Compute robot ending position from its closest part to the origin
	var minDistance = Number.MAX_VALUE;
	        
	bodyParts = this.getRobot().getBodyParts();
	console.log(bodyParts.length + " body parts");
	var lightSourcePos = this.getEnvironment().getLightSources()[0].getPosition();
	for (var i = 0; i < bodyParts.length; i++) {
		var xDiff = (bodyParts[i].getRootPosition().x - lightSourcePos.x);
		var yDiff = (bodyParts[i].getRootPosition().y - lightSourcePos.y);
		var dist = Math.sqrt(Math.pow(xDiff,2) + Math.pow(yDiff,2));
                
		if (dist < minDistance) {
			minDistance = dist;
		}
	}
	
	this.distances.push(minDistance);
	return true;
    },
    // the one required method... return the fitness!
    // here we return minimum distance travelled across evaluations
    getFitness: function() {
	fitness = this.distances[0];
        for (var i=1; i<this.distances.length; i++) {
		if (this.distances[i] < fitness)
			fitness = this.distances[i];
	}
        return fitness;
    },

}
