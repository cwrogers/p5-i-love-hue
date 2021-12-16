var drawableObjects = [];
var finalArray = [];
var draggedIndex = null;
var cubeWidth;
var gridWidth;
var gridHeight;
var moveCount = 0;
var gameStarted = false;

function setup() {
    createCanvas(400, 720);
    cubeWidth = width / 5;
    gridWidth = width / cubeWidth;
    gridHeight = height / cubeWidth;
    background(255);
    noStroke();
    setupCubes();
}

function draw() {
    background(255);
    drawableObjects.forEach(function(o) {
        if(!o.dragging) {
            o.show();            
        }
    });
    if(draggedIndex != null) {
        drawableObjects[draggedIndex].show();    
    }
}

function mouseReleased() {
    if(!gameStarted) {
        return;
    }
    if(draggedIndex != null) {
        var drg = drawableObjects[draggedIndex];
        let mPos = createVector(drg.currentPosition.x + (drg.size / 2), drg.currentPosition.y + (drg.size / 2));
       
        if(mPos.x > drg.formerPosition.x && mPos.x < drg.formerPosition.x + drg.size && mPos.y > drg.formerPosition.y && mPos.y < drg.formerPosition.y + drg.size && i != draggedIndex) {
          drg.update(drg.formerPosition.x + cubeWidth / 2, drg.formerPosition.y + cubeWidth / 2) 
          draggedIndex = null;
        } else {
          for(var i = 0; i < drawableObjects.length; i++) {
              var obj = drawableObjects[i];
              if(mPos.x > obj.currentPosition.x && mPos.x < obj.currentPosition.x + obj.size && mPos.y > obj.currentPosition.y && mPos.y < obj.currentPosition.y + obj.size && i != draggedIndex) {
                  if(obj.locked) {
                      drg.changePosition(drg.formerPosition.x, drg.formerPosition.y);
                  } else {
                      obj.changePosition(drg.formerPosition.x, drg.formerPosition.y);
                      drg.changePosition(obj.formerPosition.x, obj.formerPosition.y);
                      obj.drop();
                      drg.drop(false);
                      obj.currentSize = 0;
                      moveCount++;
                      console.log(moveCount);
                  }
                  draggedIndex = null;
                  break;
              }
          }
        }
        var won = true;
        for(var i = 0; i < drawableObjects.length; i++) {
            var obj = drawableObjects[i];
            if(obj.currentPosition.x != obj.finalPosition.x || obj.currentPosition.y != obj.finalPosition.y) {
                won = false;
                break;
            }
        }
        if(won) {
            gameWon();
            return;
        }
    }
}

function mouseDragged() {
    if(!gameStarted) {
        return;
    }
    if(draggedIndex != null) {
        drawableObjects[draggedIndex].update(mouseX, mouseY);       
    } else {
        for(var i = 0; i < drawableObjects.length; i++) {
            var obj = drawableObjects[i];
            if(mouseX > obj.currentPosition.x && mouseX < obj.currentPosition.x + obj.size && mouseY > obj.currentPosition.y && mouseY < obj.currentPosition.y + obj.size) {
                if(!obj.locked){
                    draggedIndex = i;
                }
                break;
            }
        }
    }
}

function setupCubes() {
    gameStarted = false;
    draggedIndex = null;
    moveCount = 0;
    drawableObjects = [];
    colorOneHue = random(0, 360);
    colorTwoHue = random(0, 360);
    light = Math.floor(random(0, 200)) % 2;

    colorMode(HSL);
    
    
    
    m = colorOneHue - colorTwoHue;
    m = m / gridWidth;
    lightM = (Math.floor(random(70, 80) - random(30, 20))) / gridHeight;

    for(var i = 0; i < gridWidth; i++) {
        for (var j = 0; j < gridHeight; j++) {
            if(light == 1) {
                cubeColor = color(colorOneHue + (i * m), map(i+j, 0, gridWidth+gridHeight, 20, 100 ), 20 + (j * lightM));
            } else {
                cubeColor = color(colorOneHue + (i * m), map(i+j, 0, gridWidth+gridHeight, 20, 100 ), 80 - (j * lightM));
            }
            drawableObjects.push(new Cube(i * cubeWidth, j*cubeWidth, cubeWidth, cubeColor));
        }
    }


    lockCubes();
    setTimeout(animateCubes, 1500, true);
    setTimeout(function() {
        randomizeBoard();
        animateCubes();
        setTimeout(function(){
            gameStarted = true;
        }, (gridWidth+ gridHeight) * 150);
    }, (gridHeight + gridWidth) * 150 + 1500);
}

function lockCubes() {

    switch(Math.floor(random(0, 2))){
        case 0:
            for(var i = 0;i < gridHeight; i++) {
                drawableObjects[i].locked = true;
                drawableObjects[drawableObjects.length - 1 - i].locked = true;
            }
            for(var i = 0; i < gridWidth; i++) {
                drawableObjects[(i*gridHeight)].locked = true;
                drawableObjects[drawableObjects.length - 1 - (i*gridHeight)].locked = true;
                
            }
            break;
        case 1:
        drawableObjects[0].locked = true;
        drawableObjects[gridHeight - 1].locked = true;        
        drawableObjects[drawableObjects.length - 1].locked = true;
        drawableObjects[drawableObjects.length - gridHeight].locked = true;
        
        break;
    }

}

function randomizeBoard() {
    var availablePositions = [];
    var newArray = [];
    var allPositions = [];
    var inc = 0;
    for(var i = 0; i < width / cubeWidth; i++) {
        for(var j = 0; j < height / cubeWidth; j++) {
            if(!drawableObjects[inc].locked) {
                availablePositions.push(createVector(i * cubeWidth, j*cubeWidth));
            }
            allPositions.push(createVector(i * cubeWidth, j*cubeWidth));            
            inc++;
        }   
    }

    drawableObjects.forEach(function(o) {
        if(!o.locked) {
            pos = random(availablePositions);
            o.changePosition(pos.x, pos.y);
            o.drop();
            idx = availablePositions.indexOf(pos);
            if (idx != -1) availablePositions.splice(idx, 1);
        }
    });
    
    
    allPositions.forEach(function(pos) {
        for(var i = 0; i < drawableObjects.length; i++){
            objPos = drawableObjects[i].currentPosition;
            if(pos.x == objPos.x && pos.y == objPos.y) {
                newArray.push(drawableObjects[i]);
                break;
            }
        }
    });

    finalArray = drawableObjects.slice();
    drawableObjects = newArray.slice();
}

function animateCubes(out = false) {

    var timeBetween = 150;

    for(var i = 0; i < gridHeight; i++) {
        if(i == 0) {
            if(out) {
                drawableObjects[0].animateOut = true;                
            }
            drawableObjects[0].animateable = true;
        }
        for(var j = 0; j < i; j++) {
            mult = j + 1;
            if(j + 1 >= gridWidth) {
                break;
            }
            setTimeout(function(a) {
                if(a[2]) {
                    drawableObjects[a[0] + ((gridHeight - 1) * a[1])].animateOut = true;
                    drawableObjects[a[0]].animateOut = true;
                }
                drawableObjects[a[0] + ((gridHeight - 1) * a[1])].animateable = true;
                drawableObjects[a[0]].animateable = true;

            }, i*timeBetween, [i, mult, out]);
        }
    }
    setTimeout(function(out) {
        for(var i = 0; i < gridWidth - 1; i++) {
            var item = (gridHeight) + gridHeight * (i+1) - 1;
            
            //console.log(item);
            
            for(var j = gridWidth - i - 2; j > 0; j--) {
                itemTwo = item + (gridHeight - 1) * j;
                setTimeout(function(a) {
                    if(a[2]) {
                        drawableObjects[a[0]].animateOut = true;
                        drawableObjects[a[1]].animateOut = true;
                    }
                    drawableObjects[a[0]].animateable = true;
                    drawableObjects[a[1]].animateable = true;
                }, i*timeBetween, [item, itemTwo, out]);     
            }


        }
    }, gridHeight * timeBetween, out)

    setTimeout(function(out) {
        if(out) {
            drawableObjects[drawableObjects.length - 1].animateOut = true;                
        }
        drawableObjects[drawableObjects.length - 1].animateable = true;    
    }, (gridHeight + (gridWidth - 2)) * timeBetween, out);
}


function gameWon() {
    gameStarted = false;
    drawableObjects = finalArray.slice();
    drawableObjects.forEach(function(o) {
        o.locked = false;
    });
    setTimeout(animateCubes, 500, true);
    setTimeout(setupCubes, 500 + ((gridHeight + gridWidth) * 150));        
}




function Cube(initX, initY, size, cubeColor) {
    this.finalPosition = createVector(initX, initY);
    this.locked = false;
    this.currentPosition = createVector(initX, initY);
    this.size = size;
    this.currentSize = this.size;
    this.color = cubeColor;
    this.formerPosition = createVector(initX, initY);
    this.animateable = false;
    this.animateOut = false;

    this.update = function(x, y) {
        this.currentPosition = createVector(x - (this.size/2), y - (this.size/2));
    }

    this.show = function() {
        fill(this.color);
        if(this.animateOut && this.currentSize > 0) {
            this.currentSize -= 2;
        } else if(this.animateOut && this.currentSize <= 0) {
            this.currentSize = 0;
            this.animateable = false;
            this.animateOut = false;
        }
        if(this.locked && this.currentSize != this.size) {
            this.currentSize = this.size;
        } else if(this.currentSize < this.size && this.animateable && this.animateOut == false) {
            this.currentSize += 2;
        } else if( this.currentSize > this.size && this.animateable && this.animateOut == false) {
            this.currentSize = this.size;
        }
        rect(this.currentPosition.x + (this.size - this.currentSize) / 2, this.currentPosition.y + (this.size - this.currentSize) / 2, this.currentSize, this.currentSize);
        if(this.locked) {
            fill(0)
            ellipse(this.currentPosition.x + (this.size / 2) - 2.5, this.currentPosition.y + (this.size / 2) + 2.5, 10, 10)
        }
    }

    this.drop = function(animate = true) {
        this.formerPosition = this.currentPosition;
        if(animate) this.currentSize = 0;
    }

    this.changePosition = function(x, y) {
        this.currentPosition = createVector(x, y);
    }
}
