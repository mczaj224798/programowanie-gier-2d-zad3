



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
  enterInterval;
  keyInterval;
  obstacles;

  constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (this.canvas.getContext) {
        this.ctx = this.canvas.getContext('2d');
      }
      this.keyHandler = new KeyHandler();
      this.enterInterval = setInterval(e => {
          if (this.keyHandler.enter) {
                this.start();
            }
      });
      this.ctx.save();
      this.ctx.translate(0, 0);
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height)
      this.ctx.font = 'bold 30px serif';
      this.ctx.fillStyle = "white";
      this.ctx.fillText("Instructions:" , 250, 40, 300);
      this.ctx.font = 'bold 22px serif';
      this.ctx.fillText("1) Avoid hitting black walls and going off the road." , 0, 100);
      this.ctx.fillText("2) Collect yellow rectangles to score points." , 0, 150);
      this.ctx.fillText("3) Use right and left arrows to turn." , 0, 200);
      this.ctx.fillText("4) Keep arrow up pressed to accelerate." , 0, 250);
      this.ctx.fillText("Press enter to start. Good luck!" , 180, 350);
      this.ctx.restore();
  }


    start() {
        this.clear();
        window.clearInterval(this.enterInterval);
        this.drawBackground();
        this.road = new Road(this.ctx);

        this.road.draw();

        this.car = new Car(this.ctx, Game.ROAD_X + 140, Game.CAR_Y);
        this.car.draw();
        this.scoreboard = new Scoreboard(this.ctx);


        this.keyInterval = setInterval(e => {
            this.road.move(5);

            if (this.keyHandler.arrowUp) {
                this.road.move(10);
            }
            if (this.keyHandler.arrowLeft) {
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
      this.ctx.translate(0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  redraw() {
      this.clear()
      this.drawBackground()
      this.road.draw();
      this.car.draw();

      if (this.road.calculateRoadCollision(this.car.postition, Game.CAR_Y)) {
          this.gameOver();
          return;
      }

      this.road.pointers.forEach(obstacle => {
          obstacle.draw()
          if (obstacle.calculateHit(this.car) && obstacle.hit === false) {
              this.scoreboard.increment();
              obstacle.hit = true;
          }
      });

      try {
          this.road.obstacles.forEach(obstacle => {
              obstacle.draw()
              if (obstacle.calculateHit(this.car)) {
                  this.gameOver();
                  throw new DOMException();
              }
          });
      } catch (e) {
          // console.log(e.message)
          //do nothing, just to break forEach
      }

      this.scoreboard.draw();
  }

  gameOver() {
      window.clearInterval(this.keyInterval);
      this.clear();
      this.clear();
      this.ctx.save();
      this.ctx.translate(200, 200);
      this.ctx.font = 'bold 30px serif';
      this.ctx.fillStyle = "black";
      this.ctx.fillText("GAME OVER!" , 25, 25, 300);
      this.ctx.restore();
      this.scoreboard.draw();

  }
}

class Hittable {
    x;
    y;
    ctx;
    height;
    width
    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
    }

    move(step) {
        this.y += step;
    }

    // pointInRect(x1, y1, x2, y2, x, y)
    // {
    //     return (x >= x1 && x <= x2 && y <= y1 && y >= y2);
    // }

    calculateHit(car) {
        // x - car.postition
        // x1 - this.x
        // y1 - this.y + Obstacle.HEIGHT
        // x2 - this.x + Obstacle.WIDTH
        // y2 - this.y
        let carVar =     {x: car.postition,  y: car.y,  w: Car.CAR_WIDTH, h: Car.CAR_HEIGHT};
        let obstacleVar= {x: this.x, y: this.y, w: this.width,    h: this.height};
        if (carVar.x <= obstacleVar.x + obstacleVar.w &&
                carVar.x + carVar.w >= obstacleVar.x &&
                carVar.y <= obstacleVar.y + obstacleVar.h &&
                carVar.h + carVar.y >= obstacleVar.y) {
                return true;
         }
        return  false;
    }
}


class Obstacle extends Hittable {
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

class Pointer extends Hittable {
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
            this.ctx.fillStyle = "yellow";
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
    currentTrack;
    prevTrack;
    static STEP = 10;
    obstacles
    pointers
    switchCounter

    constructor(ctx) {
        this.ctx = ctx;
        this.currentTrack = new RoadPresetInit(this.ctx);

        this.prevTrack = null;
        this.current = 0;
        this.switchCounter = 0;
        this.init = true;

        this.obstacles = this.generateObstacles(this.currentTrack);
        this.pointers = this.generatePointers(this.currentTrack);
    }

    generateObstacles(truck) {
        let obstacles = []
        let counter = 0;
        truck.lineCords.forEach( cord => {
            if (counter%2 === 1) {
                let sign = Math.round(Math.random()) * 2 - 1;
                let horizontalRand = sign * Math.floor(Math.random() * 100);
                let verticalRand = sign * Math.floor(Math.random() * 30);
                if (counter === 5 && verticalRand > 0) {
                    verticalRand = -verticalRand; // so they dont appear en route
                }
                obstacles.push(new Obstacle(this.ctx, cord.x + horizontalRand - Obstacle.WIDTH / 2, cord.y + verticalRand))
            }
            counter++;
        })
        return obstacles;
    }

    generatePointers(truck) {
        let obstacles = []
        let counter = 0;
        truck.lineCords.forEach( cord => {
            if (counter%2 === 0) {
                let sign = Math.round(Math.random()) * 2 - 1;
                let horizontalRand = sign * Math.floor(Math.random() * 100);
                let verticalRand = sign * Math.floor(Math.random() * 30);
                if (counter === 0 && verticalRand < 0) {
                    verticalRand = -verticalRand; // so they dont appear en route
                }
                obstacles.push(new Pointer(this.ctx, cord.x + horizontalRand - Pointer.WIDTH / 2, cord.y + verticalRand))
            }
            counter++;
        })
        return obstacles;
    }

    draw() {
        this.currentTrack.draw(this.current);
        if (this.prevTrack !== null) {
            this.prevTrack.draw(this.prev);
        }
        if (this.current >= 1000 ) {
            this.prevTrack = this.currentTrack;
            this.currentTrack = new RoadPreset(this.ctx);
            this.obstacles = this.obstacles.concat(this.generateObstacles(this.currentTrack));
            this.pointers = this.pointers.concat(this.generatePointers(this.currentTrack));
            this.prev = 1000;
                // this.current;
            this.current = 0;
            this.switchCounter++;
            if (this.switchCounter >= 3) {
                this.switchCounter = 0; // blocking further growth
                // removing obsolete obstacles
                for(let i=0; i<3; i++) {
                    this.obstacles.shift();
                    this.pointers.shift();
                }
            }
        }
    }

    intersects(firstX1,firstY1, firstX2,firstY2,secondX1, secondY1,secondX2,secondY2) {
        let det, lambda, lambda2;
        det = (firstX2 - firstX1) * (secondY2 - secondY1) - (secondX2 - secondX1) * (firstY2 - firstY1);
        if (det === 0) {
            // lines are parallel
            return false;
        } else {
            lambda = ((secondY2 - secondY1) * (secondX2 - firstX1) + (secondX1 - secondX2) * (secondY2 - firstY1)) / det;
            lambda2 = ((firstY1 - firstY2) * (secondX2 - firstX1) + (firstX2 - firstX1) * (secondY2 - firstY1)) / det;
            return (-0.1 < lambda && lambda < 1.1) && (-0.1 < lambda2 && lambda2 < 1.1);
        }
    }
    
    calculateRoadCollision(x, y) {
        let res = false;
        let trucks = [this.currentTrack];
        if (this.prevTrack !== null) {
            trucks.push(this.prevTrack);
        }
        trucks.forEach(truck => {
            for(let i = 0; i < truck.lineCords.length - 1 ; i++) {
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

    move(step)  {
        this.current += step;
        this.prev += step;
        this.obstacles.forEach(obstacle => {
            obstacle.move(step);
        })

        this.pointers.forEach(obstacle => {
            obstacle.move(step);
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
        this.lineCords = [  {x: 300, y: -300},
            {x: 300, y: 0 }];
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
        this.ctx.fillRect(-2,60, Car.CAR_WIDTH + 4, 5);
        this.ctx.fillStyle = "royalblue";
        this.ctx.fillRect(2.5,10, 30, 10);
        this.ctx.fillRect(2.5, 40, 30,15);
        this.ctx.fillRect(1.5,15, 2, 35);
        this.ctx.fillRect(31.5,15, 2, 35);

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
        this.ctx.fillRect(-2,60, Car.CAR_WIDTH + 4, 5);
        this.ctx.fillStyle = "royalblue";
        this.ctx.fillRect(2.5,10, 30, 10);
        this.ctx.fillRect(2.5, 40, 30,15);
        this.ctx.fillRect(1.5,15, 2, 35);
        this.ctx.fillRect(31.5,15, 2, 35);
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
        this.ctx.fillRect(-2,60, Car.CAR_WIDTH + 4, 5);
        this.ctx.fillStyle = "royalblue";
        this.ctx.fillRect(2.5,10, 30, 10);
        this.ctx.fillRect(2.5, 40, 30,15);
        this.ctx.fillRect(1.5,15, 2, 35);
        this.ctx.fillRect(31.5,15, 2, 35);
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
        this.enter = false;

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
            if (e.key === "Enter") {
                this.enter = true;
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