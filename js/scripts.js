



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

    this.car = new Car(this.ctx, Game.ROAD_X + 135, Game.CAR_Y);
    this.car.draw();
    this.scoreboard = new Scoreboard(this.ctx);
    this.keyHandler = new KeyHandler();
    // this.obstacles = new Obstacle(this.ctx, 300, 200, 0);


    this.keyInterval = setInterval(e => {
        if (this.keyHandler.arrowUp) {
            this.road.move();
            // this.obstacles.move();
        }
        if (this.keyHandler.arrowLeft) {
            this.car.direction = directions.LEFT;
            this.car.moveLeft()
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
      this.road.obstacles.forEach(obstacle => {
          if (obstacle.calculateHit(this.car)) {
              this.scoreboard.increment();
              console.log("HIT")
          } else {
              obstacle.draw()
          }
      })

      this.scoreboard.draw();
  }
}

class Obstacle {
    x;
    y;
    ctx;
    position;
    static RADIUS= 20;
    static WIDTH = 100;
    static HEIGHT = 30;
    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.position = 0;
    }

    draw() {
        this.ctx.save();
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(this.x, this.y + this.position, Obstacle.WIDTH, Obstacle.HEIGHT);
        // this.ctx.arc(this.x, this.y + this.position, Obstacle.RADIUS, 0, 2*Math.PI, false);
        // this.ctx.fill();
        this.ctx.restore();
    }

    move() {
        this.position += 10;
    }

    calculateHit(car) {
        if ( (Game.CAR_Y === (this.y+this.position + Obstacle.HEIGHT)) &&
            ((car.postition >= this.x && car.postition <= this.x + Obstacle.WIDTH) ||
                (car.postition + Car.CAR_WIDTH >= this.x && car.postition + Car.CAR_WIDTH <= this.x + Obstacle.WIDTH ))) {
            return true;
        } else {
            return false;
        }
    }
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

    constructor(ctx) {
        this.ctx = ctx;
        this.tracks = [this.draw1, this.draw2, this.draw3, this.draw4];
        this.currentTrack = this.drawInit;
        this.prevTrack = null;
        this.current = 0;
        this.init = true;
        this.obstacles = [];
    }

    draw() {
        this.currentTrack(this.current);
        if (this.prevTrack !== null) {
            this.prevTrack(this.prev);
        }

        if (this.current === 1000) {
            let rand = Math.floor(Math.random()*4);
            this.prevTrack = this.currentTrack;
            this.currentTrack = this.tracks[rand];
            this.prev = 1000;
            this.current = 0;
        }
        console.log("current=" + this.current);
    }

    drawInit(Y) {
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
        this.ctx.lineWidth = 15;
        this.ctx.stroke();
        this.ctx.closePath();

        this.obstacles.push(new Obstacle(this.ctx, 270, -900));
        this.obstacles.push(new Obstacle(this.ctx, 330, -800));

        this.ctx.restore();
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

    draw1(Y) {
        this.ctx.translate(0,0);
        this.ctx.save();

        this.ctx.beginPath();
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = this.getSidePattern(Y);
        this.ctx.lineJoin = 'round';
        this.ctx.moveTo(300,-1000 + Y);
        this.ctx.lineTo(300, -800 + Y);
        this.ctx.lineTo(500, -400 + Y);
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
        this.ctx.lineTo(500, -400 + Y);
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
        this.ctx.lineTo(500, -400 + Y);
        this.ctx.lineTo(300, -200 + Y);
        this.ctx.lineTo(300, 0 + Y);
        this.ctx.lineWidth = 15;
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }

    draw2(Y) {
        this.ctx.translate(0,0);
        this.ctx.save();

        this.ctx.beginPath();
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = this.getSidePattern(Y);
        this.ctx.lineJoin = 'round';
        this.ctx.moveTo(300,-1000 + Y);
        this.ctx.lineTo(300, -800 + Y);
        this.ctx.lineTo(170, -400 + Y);
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
        this.ctx.lineTo(170, -400 + Y);
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
        this.ctx.lineTo(170, -400 + Y);
        this.ctx.lineTo(300, -200 + Y);
        this.ctx.lineTo(300, 0 + Y);
        this.ctx.lineWidth = 15;
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }

    draw3(Y) {
        this.ctx.translate(0,0);
        this.ctx.save();

        this.ctx.beginPath();
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = this.getSidePattern(Y);
        this.ctx.lineJoin = 'round';
        this.ctx.moveTo(300,-1000 + Y);
        this.ctx.lineTo(300, -800 + Y);
        this.ctx.lineTo(400, -400 + Y);
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
        this.ctx.lineTo(400, -400 + Y);
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
        this.ctx.lineTo(400, -400 + Y);
        this.ctx.lineTo(300, -200 + Y);
        this.ctx.lineTo(300, 0 + Y);
        this.ctx.lineWidth = 15;
        this.ctx.stroke();
        this.ctx.restore();
        this.ctx.closePath();
    }

    draw4(Y) {
        this.ctx.translate(0,0);
        this.ctx.save();

        this.ctx.beginPath();
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = this.getSidePattern(Y);
        this.ctx.lineJoin = 'round';
        this.ctx.moveTo(300,-1000 + Y);
        this.ctx.lineTo(300, -800 + Y);
        this.ctx.lineTo(600, -400 + Y);
        this.ctx.lineTo(300, -100 + Y);
        this.ctx.lineTo(300, 0 + Y);
        this.ctx.lineWidth = Road.ROAD_WIDTH + 30;
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = 'grey';
        this.ctx.moveTo(300,-1000 + Y);
        this.ctx.lineTo(300, -800 + Y);
        this.ctx.lineTo(600, -400 + Y);
        this.ctx.lineTo(300, -100 + Y);
        this.ctx.lineTo(300, 0 + Y);
        this.ctx.lineWidth = Road.ROAD_WIDTH;
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.strokeStyle = 'white';
        this.ctx.setLineDash([40, 10]);
        this.ctx.moveTo(300,-1000 + Y);
        this.ctx.lineTo(300, -800 + Y);
        this.ctx.lineTo(600, -400 + Y);
        this.ctx.lineTo(300, -100 + Y);
        this.ctx.lineTo(300, 0 + Y);
        this.ctx.lineWidth = 15;
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }

    move()  {
        this.current += Road.STEP;
        this.prev += Road.STEP;
        this.obstacles.forEach(obstacle => {
            obstacle.move();
        })
    }
}

const directions = {
    LEFT: "left",
    RIGHT: "right",
    NONE: "none"
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