import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

var drawButton;
var controlButton;
var extrudeButton;
var drawnShapes = [];
// Variables for drawing mode
var isDrawing = false;
var currentShape = null;
//var lines = [];
var checkextrude;


var ground;
var selectedObject = null;




// Initialize Babylon.js

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
let scene;







function initializeApplication() {
    
    
    

    // Create the main scene
    scene = createScene(engine);

    // Run the engine
    engine.runRenderLoop(function () {
        scene.render();
    });

    // Handle window resize
    window.addEventListener("resize", function () {
        engine.resize();
    });
}


// Call initializeApplication when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApplication);















function createScene(engine) {
        
    var newScene = new BABYLON.Scene(engine);

    // Create a camera
    var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -10), newScene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);

    // Create a light
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), newScene);

    // Create a ground plane
    ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, newScene);
    
    
    
    
    
    
    // Create a GUI button to toggle drawing mode
    
    drawButton = GUI.Button.CreateSimpleButton("drawButton", "Draw");
    drawButton.width = "150px";
    drawButton.height = "40px";
    drawButton.color = "white";
    drawButton.background = "green";
    drawButton.onPointerClickObservable.add(function () {
        if (isDrawing) {
            stopDrawing();
        } else {
            startDrawing();
        }
        drawButton.textBlock.text = isDrawing ? "Stop Drawing" : "Draw";
        drawButton.background = isDrawing ? "red" : "green";
    });

    drawButton.top = "0px";
    drawButton.left = "200px";
    
    

    // control buttons toogle Gui
    
    var isCameraControlEnabled = true; // Initially, camera control is enabled


    controlButton = GUI.Button.CreateSimpleButton("controlButton", "Toggle Camera Control");
    controlButton.width = "150px";
    controlButton.height = "40px";
    controlButton.color = "white";
    controlButton.background = "green";

    var isCameraControlEnabled = true; // Initially, camera control is enabled

    controlButton.onPointerClickObservable.add(function () {
        if (isCameraControlEnabled) {
            camera.detachControl(canvas);
        } else {
            camera.attachControl(canvas, true);
        }
        isCameraControlEnabled = !isCameraControlEnabled; // Toggle the state
        controlButton.textBlock.text = isCameraControlEnabled ? "Disable Camera Control" : "Enable Camera Control";
    });



    //gui for extrudeButton
    extrudeButton = GUI.Button.CreateSimpleButton("extrudeButton", "Extrude");
    extrudeButton.width = "150px";
    extrudeButton.height = "40px";
    extrudeButton.color = "white";
    extrudeButton.background = "green";

    extrudeButton.onPointerClickObservable.add(function () {
        checkextrude = true;
        // Render the shape in real-time
       // renderLoop();
    });

    extrudeButton.top = "0px";
    extrudeButton.left = "350px";



    // Attach the button to the GUI manager
    var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    advancedTexture.addControl(drawButton);

    advancedTexture.addControl(controlButton);

    advancedTexture.addControl(extrudeButton);
    

    
    return newScene;
}





















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


//function to get coordinates of mouse position
function getCoordinates(evt) {
    if (!canvas) return null;

    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}



// // Event listener for mouse down (left-click)
// canvas.addEventListener("pointerdown", function (event) {
//     if (isDrawing) {
//         if (event.button === 0) {
//             var pickResult = scene.pick(scene.pointerX, scene.pointerY);
//             if (pickResult.hit) {
//                 var point = pickResult.pickedPoint;
//                 if (currentShape) {
//                     currentShape.push(point);
//                 }
//             }
//         }
//     }
// });

// // Event listener for mouse up (right-click)
// canvas.addEventListener("contextmenu", function (event) {
//     event.preventDefault();
//     if (isDrawing) {
//         stopDrawing();
//     }
// });

// Event listener for mouse down (left-click or right-click)
canvas.addEventListener("pointerdown", function (event) {
    if (isDrawing) {
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (pickResult.hit) {
            var point = pickResult.pickedPoint;
            //console.log("Picked Point Coordinates: ", point);
            if (currentShape) {
                currentShape.push(point);

                // 
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

// canvas.addEventListener("pointerup", function (event) {
//     selectedObject = null;
// });



var polygon = null;


// Create an empty lines mesh outside of the render loop
//var lines = null;

function renderLoop() {
    scene.render();

  //  Render the drawn shapes
    for (var i = 0; i < drawnShapes.length; i++) {
        var shape = drawnShapes[i];

        // Check if the shape object is defined and contains enough points
        if (checkextrude && shape && shape.points && shape.points.length > 2) {
                polygon = BABYLON.MeshBuilder.ExtrudePolygon("polygon", {
                shape: shape.points, // Use the points array
                depth: 2,
                sideOrientation: BABYLON.Mesh.DOUBLESIDE
            }, scene);

            // Position and color the extruded polygon as needed
            polygon.position.y = 2; // Adjust the height as needed
            polygon.material = new BABYLON.StandardMaterial("polygonMaterial", scene);
            polygon.material.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red color

            
            
        }

        


        // if (shape.points.length > 1) {
        //    // if (!lines) {
        //         // Create the lines mesh if it doesn't exist
        //         var lines = BABYLON.Mesh.CreateLines("lines", shape.points, scene);
        //         lines.color = new BABYLON.Color3(1, 0, 0); // Red color
        //         lines.width = 8; // Set the desired thickness
        //     // } else {
        //     //     // Update the positions of the lines mesh
        //     //     lines = BABYLON.Mesh.CreateLines(null, shape.points, null, lines);
        //     //     lines.color = new BABYLON.Color3(1, 0, 0); // Red color
        //     //     lines.width = 2; // Set the desired thickness
        //     // }
        // }
        // if (shape.points.length > 2) {
        //     var polygon = BABYLON.MeshBuilder.ExtrudePolygon("polygon", { shape: shape, depth: 2, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);

        //     // Position the extruded polygon
        //     polygon.position.y = 1; // Adjust the height as needed

        //     // Set the color of the polygon
        //     polygon.material = new BABYLON.StandardMaterial("polygonMaterial", scene);
        //     polygon.material.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red color
        // }

    }
    // Add pointer down event for object selection
    // polygon.isPickable = true;
    // polygon.actionManager = new BABYLON.ActionManager(scene);
    // polygon.actionManager.registerAction(
    //     new BABYLON.ExecuteCodeAction(
    //         BABYLON.ActionManager.OnPickTrigger,
    //         function () {
    //             selectedObject = polygon;
    //         }
    //     )
    //);
    
    // if (selectedObject) {
    //     // Get the current mouse position in world coordinates
    //     var pickResult = scene.pick(scene.pointerX, scene.pointerY);
    //     if (pickResult.hit) {
    //         var newPosition = pickResult.pickedPoint.clone();
    //         newPosition.y = selectedObject.position.y; // Keep the object at the same height
    //         selectedObject.position = newPosition;
    //     }
    // }
    
    
    checkextrude = false;
    if (currentShape && currentShape.length > 1) {
        var currentLinesMesh = BABYLON.Mesh.CreateLines("currentLines", currentShape, scene);
        currentLinesMesh.color =  new BABYLON.Color3(1, 0, 0); // Red color
    }



    










}

engine.runRenderLoop(renderLoop);


// //events
//    //canvas = engine.getRenderingCanvas();
//     var startingPoint;
//     var currentMesh;

//     var getGroundPosition = function () {
//         // Use a predicate to get position on the ground
//         var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground; });
//         if (pickinfo.hit) {
//             return pickinfo.pickedPoint;
//         }

//         return null;
//     }

//     var onPointerDown = function (evt) {
//         if (evt.button !== 0) {
//             return;
//         }

//         // check if we are under a mesh
//         var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== ground; });
//         if (pickInfo.hit) {
//             currentMesh = pickInfo.pickedMesh;
//             startingPoint = getGroundPosition(evt);

//             if (startingPoint) { // we need to disconnect camera from canvas
//                 setTimeout(function () {
//                     camera.detachControl(canvas);
//                 }, 0);
//             }
//         }
//     }

//     var onPointerUp = function () {
//         if (startingPoint) {
//             camera.attachControl(canvas, true);
//             startingPoint = null;
//             return;
//         }
//     }

//     var onPointerMove = function (evt) {
//         if (!startingPoint) {
//             return;
//         }

//         var current = getGroundPosition(evt);

//         if (!current) {
//             return;
//         }

//         var diff = current.subtract(startingPoint);
//         currentMesh.position.addInPlace(diff);

//         startingPoint = current;

//     }

//     canvas.addEventListener("pointerdown", onPointerDown, false);
//     canvas.addEventListener("pointerup", onPointerUp, false);
//     canvas.addEventListener("pointermove", onPointerMove, false);






// function renderLoop() {
//     scene.render();

//     // Render the drawn shapes
//     for (var i = 0; i < drawnShapes.length; i++) {
//         var shape = drawnShapes[i];
//         if (shape.points.length > 1) {
//             var lines = BABYLON.MeshBuilder.CreateLines("lines", shape.points, scene);
//             lines.color = BABYLON.Color3.FromHexString(shape.color);
//         }
//     }
// }

// engine.runRenderLoop(renderLoop);







// Handle window resize
window.addEventListener("resize", function () {
    engine.resize();
});





// document.addEventListener("DOMContentLoaded", function () {
//   // Initialize Babylon.js
//     const canvas = document.getElementById("renderCanvas");
//     const engine = new BABYLON.Engine(canvas, true);


    
//     // Create a scene
//     let scene = createScene();
    



//     // Rest of the code for drawing functionality, button, and event listeners


//     // Variables for drawing mode
//     var isDrawing = false;
//     var currentShape = null;
//     var lines = [];

//     // Function to start drawing
//     function startDrawing() {
//         isDrawing = true;
//         currentShape = [];
//     }

//     // Function to stop drawing
//     function stopDrawing() {
//         if (currentShape) {
//             var shape = {
//                 points: currentShape.slice(), // Clone the points
//                 color: drawButton.background, // Store the color
//             };
//             drawnShapes.push(shape);
//             currentShape = null;
//         }
//         isDrawing = false;
//     }
    

//     //function to get coordinates of mouse position
//     function getCoordinates(evt) {
//         if (!canvas) return null;

//         var rect = canvas.getBoundingClientRect();
//         return {
//             x: evt.clientX - rect.left,
//             y: evt.clientY - rect.top
//         };
//     }



//     // Event listener for mouse down (left-click)
//     canvas.addEventListener("pointerdown", function (event) {
//         if (isDrawing) {
//             if (event.button === 0) {
//                 var pickResult = scene.pick(scene.pointerX, scene.pointerY);
//                 if (pickResult.hit) {
//                     var point = pickResult.pickedPoint;
//                     if (currentShape) {
//                         currentShape.push(point);
//                     }
//                 }
//             }
//         }
//     });

//     // Event listener for mouse up (right-click)
//     canvas.addEventListener("contextmenu", function (event) {
//         event.preventDefault();
//         if (isDrawing) {
//             stopDrawing();
//         }
//     });

//     // Run the engine
//     engine.runRenderLoop(function () {
//         scene.render();

//         // Render the drawn shapes
//         for (var i = 0; i < drawnShapes.length; i++) {
//             var shape = drawnShapes[i];
//             if (shape.points.length > 1) {
//                 var lines = BABYLON.Mesh.CreateLines("lines", shape.points, newScene);
//                 lines.color = BABYLON.Color3.FromHexString(shape.color);
//             }
//         }










//     });


// });



