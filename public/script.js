var stage, time, bodies;

// Body class defines a celestial body and all of its needed properties
var Body = function(mass, radius, x, y, color) {
  this.mass = mass;
  this.radius = radius;
  this.vx = 0;
  this.vy = 0;
  this.x = x;
  this.y = y;

  this.visualObject = new createjs.Shape();
  this.visualObject.graphics.beginFill(color).drawCircle(0, 0, this.radius);
  this.visualObject.x = this.x;
  this.visualObject.y = this.y;

  this.text = new createjs.Text(mass, '12px Arial', 'black');
  this.text.x = this.x - this.text.getMeasuredWidth() / 2;
  this.text.y = this.y - this.text.getMeasuredHeight() / 2;
};

// This updates the velocity of the celestial body
Body.prototype.updateVelocity = function(vx, vy) {
  this.vx = vx;
  this.vy = vy;
};

// This updates both the actual position of the celestial body in our 2D world
// and the visual position so that they are always together
Body.prototype.updatePosition = function(x, y) {
  this.visualObject.x = x;
  this.visualObject.y = y;
  this.text.x = x - this.text.getMeasuredWidth() / 2;
  this.text.y = y - this.text.getMeasuredHeight() / 2;
  this.x = x;
  this.y = y;
};

// A planet is a type of celestial body that has incredibly low mass compared
// to stars and it also has the ability to begin with an initial velocity
var Planet = function(mass, radius, x, y, color, initvx, initvy) {
  Body.call(this, mass, radius, x, y, color);
  this.vx = initvx;
  this.vy = initvy;
};

Planet.prototype = Object.create(Body.prototype);
Planet.prototype.constructor = Planet;

// This function initializes everything
function init() {
  // Initialize the stage and the actors
  time = 0;
  bodies = [];
  var canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth - 20;
  canvas.height = window.innerHeight - 20;

  stage = new createjs.Stage(canvas);

  var perfspeed = 1.332;
  bodies.push(new Planet(1000, 20, stage.canvas.width / 2 + 50, stage.canvas.height / 2 + 50, 'yellow', -perfspeed, perfspeed));
  bodies.push(new Planet(1000, 20, stage.canvas.width / 2 - 50, stage.canvas.height / 2 - 50, 'red', perfspeed, -perfspeed));
  // bodies.push(new Body(1000, 40, stage.canvas.width / 2, stage.canvas.height / 2, 'yellow'));
  // bodies.push(new Planet(3, 20, 500, 500, 'blue', -1, 1));
  // bodies.push(new Planet(3, 20, 250, 500, 'purple', 2, -1));
  bodies.push(new Planet(1, 10, stage.canvas.width / 2 - 200, stage.canvas.height / 2 - 200, 'green', -2, 2));

  // Add elements to canvas stage
  for(var i = 0, l1 = bodies.length; i < l1; i++) {
    stage.addChild(bodies[i].visualObject);
    stage.addChild(bodies[i].text);
  }
  stage.update();

  stage.on('stagemousedown', addRandomBody);

  // Add ticker and set fps
  createjs.Ticker.on('tick', tick);
  createjs.Ticker.setFPS(60);
}

function tick(event) {
  //console.log(bodies);
  // Update x and y positions
  updatePositions();

  // Update the velocites for next tick
  updateVelocites();

  // Update stage and time
  stage.update(event);
  time++;
}

// Update the position of all bodies based on their respective velocites
function updatePositions() {
  for(var i = 0, l1 = bodies.length; i < l1; i++) {
    bodies[i].updatePosition(bodies[i].x + bodies[i].vx, bodies[i].y + bodies[i].vy);
  }
}

// Update the velocites of all bodies based on their relative position and masses
// of each body
function updateVelocites() {
  for(var i = 0, l1 = bodies.length; i < l1; i++) {
    for(var j = i + 1, l2 = bodies.length; j < l2; j++) {
      // Get the distance between the two bodies and the x distance
      var distance = Math.sqrt(Math.pow((bodies[i].x  - bodies[j].x), 2) +
        Math.pow((bodies[i].y - bodies[j].y), 2));
      var xdistance = bodies[i].x - bodies[j].x;
      if(xdistance < 0) { xdistance = xdistance * -1; }

      // Retrieve the angle of the right triangle formed by the two bodies
      var angle = Math.asin(xdistance / distance);

      // Calculate the force being applied to each other based on the distance
      // and their masses
      var force = (bodies[i].mass * bodies[j].mass) / Math.pow(distance, 2);

      // Calcuate total acceleration vectors for each body based on the force
      // and their mass
      var ai = force / bodies[i].mass;
      var aj = force /bodies[j].mass;

      // Figure out the relative x and y componenet of the acceleration for each
      // body and compensate if they go past each other in space.
      var aiax = ai * Math.sin(angle);
      var aiay = ai * Math.cos(angle);

      if(bodies[i].x > bodies[j].x) { aiax = aiax * -1; }
      if(bodies[i].y > bodies[j].y) { aiay = aiay * -1; }

      var ajax = aj * Math.sin(angle);
      var ajay = aj * Math.cos(angle);

      if(bodies[j].x > bodies[i].x) { ajax = ajax * -1; }
      if(bodies[j].y > bodies[i].y) { ajay = ajay * -1; }

      // Update each body with the new velocites
      bodies[i].updateVelocity(bodies[i].vx + aiax, bodies[i].vy + aiay);
      bodies[j].updateVelocity(bodies[j].vx + ajax, bodies[j].vy + ajay);
    }
  }
}

// Random variables to draw from
var masses = [1, 2, 3];
var radii = [10, 20, 30];
var colors = ['green', 'purple', 'red', 'blue', '#00FF00', '#669900', '#FF00FF',
  '#996633'];
var velocites = [-3, -2, -1, 1, 2, 3];

// Grab random values and create a new planet and add it to the bodies array
function addRandomBody(evt) {
  var mass = masses[Math.floor(Math.random() * masses.length)];
  var radius = radii[Math.floor(Math.random() * radii.length)];
  var x = evt.stageX;
  var y = evt.stageY;
  var color = colors[Math.floor(Math.random() * colors.length)];
  var vx = velocites[Math.floor(Math.random() * velocites.length)];
  var vy = velocites[Math.floor(Math.random() * velocites.length)];
  var newPlanet = new Planet(mass, radius, x, y, color, vx, vy);

  bodies.push(newPlanet);
  stage.addChild(newPlanet.visualObject);
  stage.addChild(newPlanet.text);

  console.log(newPlanet);
}
