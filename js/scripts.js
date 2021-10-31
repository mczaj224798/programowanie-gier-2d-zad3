



class Game {
  canvas;
  ctx;
  road;
  car;
  keyHandler;
  scoreboard;
  static ROAD_X = 250;
  static ROAD_Y = 0;
  static CAR_Y = 400;
  keyInterval;
  obstacles;

  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (this.canvas.getContext) {
      this.ctx = this.canvas.getContext('2d');
    }
    this.drawBackground();
      this.road = new Road(this.ctx);

      // this.road = new Road(this.ctx, Game.ROAD_X, Game.ROAD_Y);
    this.road.draw();

    this.car = new Car(this.ctx, Game.ROAD_X + 140, Game.CAR_Y);
    this.car.draw();
    this.scoreboard = new Scoreboard(this.ctx);
    this.keyHandler = new KeyHandler();
    // this.obstacles = new Obstacle(this.ctx, 300, 200, 0);


    this.keyInterval = setInterval(e => {
        if (this.keyHandler.arrowUp) {
            this.road.move();
        }
        if (this.keyHandler.arrowLeft) {
            // console.log(this.car, this.road.obstacles);
            this.car.direction = directions.LEFT;
            this.car.moveLeft();


        } else if (this.keyHandler.arrowRight) {
            this.car.direction = directions.RIGHT;
            this.car.moveRight();
        } else {
            this.car.direction = directions.NONE;
        }
        this.redraw();
    }, 20)

  }



  drawBackground() {
      this.ctx.save();
      this.ctx.fillStyle = "green";
      this.ctx.fillRect(0,0,800, 600);
      this.ctx.restore();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  redraw() {
      this.clear()
      this.drawBackground()
      this.road.draw();
      this.car.draw();

      if (this.road.calculateRoadColiision(this.car.postition, Game.CAR_Y)) {
          console.log("XXX")
          this.gameOver();
          return;
      }

      this.road.pointers.forEach(obstacle => {
          if (obstacle.calculateHit(this.car) && obstacle.hit === false) {
              this.scoreboard.increment();
              obstacle.hit = true;
          } else {
              obstacle.draw()
          }
      });

      this.road.obstacles.forEach(obstacle => {
          if (obstacle.calculateHit(this.car)) {
              this.gameOver();
              console.log("HIT")
              return;
          } else {
              obstacle.draw()
          }
      });



      this.scoreboard.draw();
  }

  gameOver() {
      window.clearInterval(this.keyInterval);
      this.clear();
      this.ctx.save();
      this.ctx.translate(200, 200);
      this.ctx.font = 'bold 30px serif';
      this.ctx.fillStyle = "black";
      this.ctx.fillText("GAME OVER!" , 25, 25, 300);
      this.ctx.restore();

  }
}

class Hitable {
    x;
    y;
    ctx;
    height;
    width
    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        // this.height = 0;
        // this.width = 0;
    }

    move() {
        // console.log("obs pos = " + this.x);
        this.y += 10;
    }

    pointInRect(x1, y1, x2, y2, x, y)
    {
        return (x >= x1 && x <= x2 && y <= y1 && y >= y2);
    }

    calculateHit(car) {
        // x - car.postition
        // x1 - this.x
        // y1 - this.y + Obstacle.HEIGHT
        // x2 - this.x + Obstacle.WIDTH
        // y2 - this.y
        let res = this.pointInRect(this.x, this.y + this.height, this.x + this.width, this.y, car.postition, Game.CAR_Y) ||
            this.pointInRect(this.x , this.y + this.height, this.x + this.width, this.y, car.postition + Car.CAR_WIDTH, Game.CAR_Y);
        return res;

    }
}


class Obstacle extends Hitable {
    static WIDTH = 100;
    static HEIGHT = 20;
    constructor(ctx, x, y) {
        super(ctx, x, y);
        this.height = Obstacle.HEIGHT;
        this.width = Obstacle.WIDTH;
    }

    draw() {
        this.ctx.save();
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.x, this.y , Obstacle.WIDTH, Obstacle.HEIGHT);
        this.ctx.restore();
    }
}

class Pointer extends Hitable {
    static WIDTH = 40;
    static HEIGHT = 40;
    hit
    constructor(ctx, x, y) {
        super(ctx, x, y);
        this.height = Pointer.HEIGHT;
        this.width = Pointer.WIDTH;
        this.hit = false;
    }

    draw() {
        if (!this.hit) {
            this.ctx.save();
            this.ctx.fillStyle = "blue";
            this.ctx.fillRect(this.x, this.y, Pointer.WIDTH, Pointer.HEIGHT);
            this.ctx.restore();
        }
    }
}



class Road {
    current;
    prev;
    ctx;
    static ROAD_WIDTH = 300;
    init
    tracks;
    currentTrack;
    prevTrack;
    static STEP = 10;
    obstacles
    pointers
    switchCounter

    constructor(ctx) {
        this.ctx = ctx;
        this.currentTrack = new RoadPresetInit(this.ctx);
        // this.currentTrack = this.drawInit;

        this.prevTrack = null;
        this.current = 0;
        this.switchCounter = 0;
        this.init = true;

        this.obstacles = this.generateObstacles(this.currentTrack);
        this.pointers = this.generatePointers(this.currentTrack);

    }

    generateObstacles(truck) {
        let obstacles = []
        console.log(truck.lineCords);
        truck.lineCords.forEach( cord => {
            let sign = Math.round(Math.random()) * 2 - 1;
            let horizontalRand = sign * Math.floor(Math.random()*100);
            let verticalRand = sign * Math.floor(Math.random()*30);
            obstacles.push(new Obstacle(this.ctx, cord.x + horizontalRand - Obstacle.WIDTH/2, cord.y + verticalRand))

        })
        return obstacles;
    }

    generatePointers(truck) {
        let obstacles = []
        console.log(truck.lineCords);
        truck.lineCords.forEach( cord => {
            let sign = Math.round(Math.random()) * 2 - 1;
            let horizontalRand = sign * Math.floor(Math.random()*100);
            let verticalRand = sign * Math.floor(Math.random()*30) + 50;
            obstacles.push(new Pointer(this.ctx, cord.x + horizontalRand - Obstacle.WIDTH/2, cord.y + verticalRand))

        })
        return obstacles;
    }

    draw() {
        this.currentTrack.draw(this.current);
        if (this.prevTrack !== null) {
            this.prevTrack.draw(this.prev);
        }
        if (this.current === 1000) {
            this.prevTrack = this.currentTrack;
            this.currentTrack = new RoadPreset(this.ctx);
            this.obstacles.push.apply(this.obstacles, this.generateObstacles(this.currentTrack));
            this.pointers.push.apply(this.pointers, this.generatePointers(this.currentTrack));
            this.prev = 1000;
            this.current = 0;
            this.switchCounter++;
            if (this.switchCounter >= 3) {
                this.switchCounter = 3; // blocking further growth
                // removing obsolete obstacles
                this.obstacles.shift();
                this.obstacles.shift();
                this.obstacles.shift();
                this.obstacles.shift();
            }
        }
        // console.log("current=" + this.current);
    }

    intersects(a,b,c,d,p,q,r,s) {
        let det, gamma, lambda;
        det = (c - a) * (s - q) - (r - p) * (d - b);
        if (det === 0) {
            // lines are paralel
            return false;
        } else {
            lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
            gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
            return (-0.1 < lambda && lambda < 1.1) && (-0.1 < gamma && gamma < 1.1);
        }
    };
    calculateRoadColiision(x, y) {
        let res = false;
        let trucks = [this.currentTrack];
        if (this.prevTrack !== null) {
            trucks.push(this.prevTrack);
        }
        console.log(x + "," + y);
        trucks.forEach(truck => {
            for(let i = 0; i < truck.lineCords.length - 1 ; i++) {
                // console.log(truck.lineCords);
                if (truck.lineCords[i+1].y >= y &&
                    truck.lineCords[i].y <= y) {
                    let leftLine =  {start: {x: truck.lineCords[i].x - (Road.ROAD_WIDTH + 50)/2 , y: truck.lineCords[i].y - 30},
                        end: {x: truck.lineCords[i+1].x - (Road.ROAD_WIDTH + 50)/2 , y: truck.lineCords[i+1].y - 30}};
                    let rightLine =  {start: {x: truck.lineCords[i].x + (Road.ROAD_WIDTH + 100)/2 , y: truck.lineCords[i].y - 30},
                        end: {x: truck.lineCords[i+1].x + (Road.ROAD_WIDTH + 100)/2 , y: truck.lineCords[i+1].y - 30}};
                    let leftLine2 =  {start: {x: truck.lineCords[i].x - (Road.ROAD_WIDTH + 50)/2 , y: truck.lineCords[i].y + 30},
                        end: {x: truck.lineCords[i+1].x - (Road.ROAD_WIDTH + 50)/2 , y: truck.lineCords[i+1].y + 30}};
                    let rightLine2 =  {start: {x: truck.lineCords[i].x + (Road.ROAD_WIDTH + 100)/2 , y: truck.lineCords[i].y + 30},
                        end: {x: truck.lineCords[i+1].x + (Road.ROAD_WIDTH + 100)/2 , y: truck.lineCords[i+1].y + 30}};

                    if ( (this.intersects(leftLine.start.x, leftLine.start.y,
                                            leftLine.end.x, leftLine.end.y,
                                            x, y,x + Car.CAR_WIDTH, y) &&
                            this.intersects(leftLine2.start.x, leftLine2.start.y,
                                leftLine2.end.x, leftLine2.end.y,
                                x, y,x + Car.CAR_WIDTH, y)) ||
                        (this.intersects(rightLine.start.x, rightLine.start.y,
                                rightLine.end.x, rightLine.end.y,
                                x, y,x + Car.CAR_WIDTH, y) &&
                            this.intersects(rightLine2.start.x, rightLine2.start.y,
                                rightLine2.end.x, rightLine2.end.y,
                                x, y,x + Car.CAR_WIDTH, y)) ) {
                            res = true;
                    }
                }
            }
        })

        return res;
    }

    move()  {
        this.current += Road.STEP;
        this.prev += Road.STEP;
        this.obstacles.forEach(obstacle => {
            obstacle.move();
        })

        this.pointers.forEach(obstacle => {
            obstacle.move();
        })
    }
}

class RoadPreset {
    ctx;
    offset;
    lineCords;

    constructor(ctx) {
        this.ctx = ctx;
        this.offset = 100 + Math.floor(Math.random()*550);
        this.offset2 = 100 + Math.floor(Math.random()*550);
        this.lineCords = this.lineCords = [  {x: 300, y: -1000 },
            {x: 300, y: -800 },
            {x: this.offset, y: -600},
            {x: this.offset2, y: -400 },
            {x: 300, y: -200 },
            {x: 300, y: 0 }]
    }

    draw(Y) {
        this.ctx.translate(0,0);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = this.getSidePattern(Y);
        this.ctx.lineJoin = 'round';
        this.ctx.moveTo(300,-1000 + Y);
        this.ctx.lineTo(300, -800 + Y);
        this.ctx.lineTo(this.offset, -600 + Y);
        this.ctx.lineTo(this.offset2, -400 + Y);
        this.ctx.lineTo(300, -200 + Y);
        this.ctx.lineTo(300, 0 + Y);
        this.ctx.lineWidth = Road.ROAD_WIDTH + 30;
        this.ctx.stroke();
        this.ctx.closePath();


        this.ctx.beginPath();
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = 'grey';
        this.ctx.moveTo(300,-1000 + Y);
        this.ctx.lineTo(300, -800 + Y);
        this.ctx.lineTo(this.offset, -600 + Y);
        this.ctx.lineTo(this.offset2, -400 + Y);
        this.ctx.lineTo(300, -200 + Y);
        this.ctx.lineTo(300, 0 + Y);
        this.ctx.lineWidth = Road.ROAD_WIDTH;
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.strokeStyle = 'white';
        this.ctx.setLineDash([40, 10]);
        this.ctx.moveTo(300,-1000 + Y);
        this.ctx.lineTo(300, -800 + Y);
        this.ctx.lineTo(this.offset, -600 + Y);
        this.ctx.lineTo(this.offset2, -400 + Y);
        this.ctx.lineTo(300, -200 + Y);
        this.ctx.lineTo(300, 0 + Y);
        // this.ctx.lineWidth = 15;
        this.ctx.lineWidth = 5;
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
        this.lineCords = [  {x: 300, y: -1000 + Y},
                            {x: 300, y: -800 + Y},
                            {x: this.offset, y: -600 + Y},
                            {x: this.offset2, y: -400 + Y},
                            {x: 300, y: -200 + Y},
                            {x: 300, y: 0 + Y}]
    }

    getSidePattern(Y) {
        let patternCanvas = document.createElement('canvas');
        let patternContext = patternCanvas.getContext('2d');
        patternCanvas.width = 20;
        patternCanvas.height = 1000;
        patternContext.fillStyle = 'white';
        patternContext.fillRect(0, -1000, patternCanvas.width, 2000);
        patternContext.strokeStyle = 'red';
        patternContext.setLineDash([20,20]);
        patternContext.lineWidth = 40;
        patternContext.moveTo(10, -1000 + Y);
        patternContext.lineTo(10, 1000)
        patternContext.stroke();
        return  this.ctx.createPattern(patternCanvas, 'repeat');
    }
}

class RoadPresetInit extends RoadPreset {

    constructor(ctx) {
        super(ctx);
        this.lineCords = [  {x: 300, y: 0},
            {x: 300, y: 200 }];
    }

    draw(Y) {
        this.ctx.save();

        this.ctx.translate(0,0);

        this.ctx.beginPath();
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = 'white';
        this.ctx.moveTo(300,-1000 + Y);
        this.ctx.lineTo(300, 800 + Y);
        this.ctx.lineWidth = Road.ROAD_WIDTH + 30;
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.setLineDash([20, 20]);
        this.ctx.strokeStyle = 'red';
        this.ctx.moveTo(300,-1000 + Y);
        this.ctx.lineTo(300, 800 + Y);
        this.ctx.lineWidth = Road.ROAD_WIDTH + 30;
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = 'grey';
        this.ctx.moveTo(300,-1000 + Y);
        this.ctx.lineTo(300, 800 + Y);
        this.ctx.lineWidth = Road.ROAD_WIDTH;
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.strokeStyle = 'white';
        this.ctx.setLineDash([40, 10]);
        this.ctx.moveTo(300,-1000 + Y);
        this.ctx.lineTo(300, 800 + Y);
        this.ctx.lineWidth = 5;
        // this.ctx.lineWidth = 15;
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.restore();

        this.lineCords = [  {x: 300, y: -1000 + Y},
            {x: 300, y: 800 + Y}];
    }
}

const directions = {
    LEFT: "left",
    RIGHT: "right",
    NONE: "none"
}

class Scoreboard {
    score;
    ctx;
    constructor(ctx) {
        this.ctx = ctx;
        this.score = 0;
    }

    increment() {
        this.score++;
    }

    draw() {
        this.ctx.save();
        this.ctx.translate(600, 30);
        this.ctx.setLineDash([]);
        this.ctx.closePath();
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0,0, 120, 50);
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(5,5, 110, 40);
        this.ctx.font = 'bold 12px serif';
        this.ctx.fillStyle = "black";
        this.ctx.fillText("Score: " + this.score , 25, 25, 90);
        this.ctx.restore();
    }
}

class Car {
    x;
    y;
    ctx;
    static CAR_WIDTH = 35;
    static CAR_HEIGHT = 65;
    direction;

    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.postition = this.x;
        this.direction = directions.NONE;
    }

    draw() {
        switch (this.direction) {
            case directions.NONE:
                this.drawNone();
                break;
            case directions.LEFT:
                this.drawLeft();
                break;
            case directions.RIGHT:
                this.drawRight();
                break;
        }
    }

    drawNone() {
        this.ctx.save();
        this.ctx.translate(this.postition, this.y);
        this.drawTire(0, 20);
        this.drawTire(0, 45);
        this.drawTire(35, 20);
        this.drawTire(35, 45);
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(0,0, Car.CAR_WIDTH, Car.CAR_HEIGHT);
        this.ctx.restore();
    }

    drawLeft() {
        this.ctx.save()
        this.ctx.translate(this.postition, this.y);
        this.ctx.rotate(-Math.PI/10);
        this.drawTire(0, 20);
        this.drawTire(0, 45);
        this.drawTire(35, 20);
        this.drawTire(35, 45);
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(0,0, Car.CAR_WIDTH, Car.CAR_HEIGHT);
        this.ctx.restore();
    }

    drawRight() {
        this.ctx.save()
        this.ctx.translate(this.postition, this.y);
        this.ctx.rotate(Math.PI/10);
        this.drawTire(0, 20);
        this.drawTire(0, 45);
        this.drawTire(35, 20);
        this.drawTire(35, 45);
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(0,0, Car.CAR_WIDTH, Car.CAR_HEIGHT);
        this.ctx.restore();
    }


    drawTire(x, y) {
        this.ctx.save();
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 4, 7, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.restore();
    }

    moveLeft() {
        this.postition -= 10;
    }

    moveRight() {
        this.postition += 10;
    }
}

class KeyHandler {
    arrowUp;
    arrowDown;
    arrowLeft;
    arrowRight;

    constructor() {
        this.arrowUp = false;
        this.arrowDown = false;
        this.arrowRight = false;
        this.arrowLeft = false;

        window.addEventListener("keydown", e => {
            if (e.key === "ArrowUp") {
                this.arrowUp = true;
            }
            if (e.key === "ArrowDown") {
                this.arrowDown = true;
            }
            if (e.key === "ArrowLeft") {
                this.arrowLeft = true;
            }
            if (e.key === "ArrowRight") {
                this.arrowRight = true;
            }
        }, true);

        window.addEventListener("keyup", e => {
            if (e.key === "ArrowUp") {
                this.arrowUp = false;
            }
            if (e.key === "ArrowDown") {
                this.arrowDown = false;
            }
            if (e.key === "ArrowLeft") {
                this.arrowLeft = false;
            }
            if (e.key === "ArrowRight") {
                this.arrowRight = false;
            }
        }, true);
    }




}


let game = new Game("canvas");