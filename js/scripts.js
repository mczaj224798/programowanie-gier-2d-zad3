



class Game {
  canvas;
  ctx;
  road;
  car;
  keyHandler;
  static ROAD_X = 250;
  static ROAD_Y = 0;
  keyInterval;

  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (this.canvas.getContext) {
      this.ctx = this.canvas.getContext('2d');
    }
    this.drawBackground();
    this.road = new Road(this.ctx, Game.ROAD_X, Game.ROAD_Y);
    this.road.draw();

    this.car = new Car(this.ctx, Game.ROAD_X + 135, 400);
    this.car.draw();
    this.keyHandler = new KeyHandler();

    this.keyInterval = setInterval(e => {
        if (this.keyHandler.arrowUp) {
            this.road.move();
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
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(0,0,800, 600);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  redraw() {
      this.clear()
      this.drawBackground()
      this.road.draw();
      this.car.draw();
  }


}

class Road {
  x;
  y;
  ctx;
  middleStrip;
  leftSideStrip;
  rightSideStrip;
  static ROAD_WIDTH = 200;
  static ROAD_HEIGHT = 600;

  constructor(ctx, x, y) {
      this.ctx = ctx;
      this.x = x;
      this.y = y;
      this.middleStrip = new MiddleStrip(this.ctx, this.x + Road.ROAD_WIDTH/2 - MiddleStrip.STRIP_WIDTH/2, this.y);
      this.leftSideStrip = new SideStrip(this.ctx, this.x - SideStrip.STRIP_WIDTH/2, this.y);
      this.rightSideStrip = new SideStrip(this.ctx, this.x + Road.ROAD_WIDTH, this.y);

  }

  draw() {
      this.ctx.fillStyle = 'grey';
      this.ctx.fillRect(this.x, this.y, Road.ROAD_WIDTH, Road.ROAD_HEIGHT);
      this.middleStrip.draw();
      this.leftSideStrip.draw();
      this.rightSideStrip.draw();
  }

  move()  {
      this.middleStrip.move();
      this.leftSideStrip.move();
      this.rightSideStrip.move();
  }

}

class MiddleStrip {
    x;
    y;
    ctx;
    static STRIP_WIDTH = 10;
    static STRIP_HEIGHT = 60;
    startPos;

    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.startPos = -960;
    }

    draw() {
        this.ctx.fillStyle = 'white';
        for (let i=0; i < 30 ; i++) {
            this.ctx.fillRect(this.x, this.startPos + i*80, MiddleStrip.STRIP_WIDTH, MiddleStrip.STRIP_HEIGHT);
        }
    }

    move() {
        if ( this.startPos == 0) {
            this.startPos = -960;
        } else {
            this.startPos += 5;
        }
    }
}

class SideStrip {
    x;
    y;
    ctx;
    startPos;
    static STRIP_WIDTH = 10;
    static STRIP_HEIGHT = 20;

    constructor(ctx, x, y) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.startPos = -960
    }

    draw() {
        for (let i=0; i < 300 ; i++) {
            if ((i%2) === 0) {
                this.ctx.fillStyle = 'white';
            } else {
                this.ctx.fillStyle = 'red';
            }
            this.ctx.fillRect(this.x, this.startPos + i*20, SideStrip.STRIP_WIDTH, SideStrip.STRIP_HEIGHT);
        }
    }

    move() {
        if ( this.startPos == 0) {
            this.startPos = -960;
        } else {
            this.startPos += 5;
        }
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
        }
    }

    drawNone() {
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.postition, this.y, Car.CAR_WIDTH, Car.CAR_HEIGHT);
        this.ctx.fillStyle = 'black';

        this.drawTire(this.postition, this.y + 20);
        this.drawTire(this.postition, this.y + 50);
        this.drawTire(this.postition + 35, this.y + 20);
        this.drawTire(this.postition + 35, this.y + 50);
    }

    drawLeft() {
        // Rotated rectangle
        this.ctx.save();
        this.ctx.translate(this.x + Car.CAR_WIDTH, this.y + Car.CAR_HEIGHT);
        this.ctx.rotate(Math.PI / 180);
        // this.ctx.translate(-canvas.width / 2, -canvas.height / 2);
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.postition, this.y, Car.CAR_WIDTH, Car.CAR_HEIGHT);
        this.ctx.restore();
        this.ctx.fillStyle = 'black';

        this.drawTire(this.postition, this.y + 20);
        this.drawTire(this.postition, this.y + 50);
        this.drawTire(this.postition + 35, this.y + 20);
        this.drawTire(this.postition + 35, this.y + 50);
    }

    drawTire(x, y) {
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 4, 7, 0, 0, 2 * Math.PI);
        this.ctx.fill();
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