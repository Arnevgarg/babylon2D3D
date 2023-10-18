import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';



var drawButton;
var drawnShapes = [];



drawButton = GUI.Button.CreateSimpleButton("drawButton", "Draw");




drawButton.onPointerClickObservable.add(function () {
    if (isDrawing) {
        stopDrawing();
    } else {
        startDrawing();
    }
    drawButton.textBlock.text = isDrawing ? "Stop Drawing" : "Draw";
    drawButton.background = isDrawing ? "red" : "green";
});





// Variables for drawing mode
var isDrawing = false;
var currentShape = null;
var lines = [];

// Function to start drawing
function startDrawing() {
    isDrawing = true;
    currentShape = [];
}

// Function to stop drawing
function stopDrawing() {
    if (currentShape) {
        currentShape.push(currentShape[0]);
        var babylonColor = new BABYLON.Color3(1, 0, 0); // Red color
        var shape = {
            points: currentShape.slice(), // Clone the points
            color: babylonColor,
        };
        drawnShapes.push(shape);
        currentShape = null;
    }
    isDrawing = false;
}



// Event listener for mouse down (left-click or right-click)
canvas.addEventListener("pointerdown", function (event) {
    if (isDrawing) {
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit) {
            var point = pickResult.pickedPoint;
            if (currentShape) {
                currentShape.push(point);

                // Render the shape in real-time
                renderLoop();
            }
        }

        // Check for right-click (event.button === 2) and stop drawing
        if (event.button === 2) {
            event.preventDefault();
            if (isDrawing) {
                stopDrawing();
                startDrawing();
            }
        }
    }
});




function renderLoop() {
    scene.render();

    // Render the drawn shapes
    for (var i = 0; i < drawnShapes.length; i++) {
        var shape = drawnShapes[i];
        if (shape.points.length > 1) {
            if (!lines) {
                // Create the lines mesh if it doesn't exist
                lines = BABYLON.Mesh.CreateLines("lines", shape.points, scene);
                lines.color = new BABYLON.Color3(1, 0, 0); // Red color
                lines.width = 2; // Set the desired thickness
            } else {
                // Update the positions of the lines mesh
                lines = BABYLON.Mesh.CreateLines(null, shape.points, null, lines);
                lines.color = new BABYLON.Color3(1, 0, 0); // Red color
                lines.width = 2; // Set the desired thickness
            }
        }
    }

    if (currentShape && currentShape.length > 1) {
        var currentLinesMesh = BABYLON.Mesh.CreateLines("currentLines", currentShape, scene);
        currentLinesMesh.color =  new BABYLON.Color3(0, 1, 0); // green color
    }

}

engine.runRenderLoop(renderLoop);
