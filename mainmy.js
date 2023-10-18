import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
//create the main scene
var scene = createScene();
engine.runRenderLoop(function () {
    scene.render();
});

function createScene() {
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.setPosition(new BABYLON.Vector3(20, 200, 400));
    camera.attachControl(canvas, true);
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = (Math.PI / 2) * 0.99;
    camera.lowerRadiusLimit = 150;

    scene.clearColor = new BABYLON.Color3(0, 0, 0);

    // Light
    var light = new BABYLON.PointLight("light", new BABYLON.Vector3(0, 150, 0), scene);

    // Ground
    var ground = BABYLON.Mesh.CreateGround("ground", 1000, 1000, 1, scene, false);
    var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    groundMaterial.specularColor = BABYLON.Color3.Black();
    ground.material = groundMaterial;



    // Button GUIs

    //Drawing Mode
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
    drawButton.top = "250px";
    drawButton.left = "150px";
    

    // Camera Control
    var isCameraControlEnabled = true; // Initially, camera control is enabled
    controlButton = GUI.Button.CreateSimpleButton("controlButton", "Toggle Camera Control");
    controlButton.width = "150px";
    controlButton.height = "40px";
    controlButton.color = "white";
    controlButton.background = "green";
    controlButton.onPointerClickObservable.add(function () {
        if (isCameraControlEnabled) {
            camera.detachControl(canvas);
        } else {
            camera.attachControl(canvas, true);
        }
        isCameraControlEnabled = !isCameraControlEnabled; // Toggle the state
        controlButton.textBlock.text = isCameraControlEnabled ? "Disable Camera Control" : "Enable Camera Control";
    });
    controlButton.top = "250px";
    controlButton.left = "0px";

    //Extrude Button
    extrudeButton = GUI.Button.CreateSimpleButton("extrudeButton", "Extrude");
    extrudeButton.width = "150px";
    extrudeButton.height = "40px";
    extrudeButton.color = "white";
    extrudeButton.background = "green";
    extrudeButton.onPointerClickObservable.add(function () {
        checkextrude = true;
        renderLoopextrude();
        clearRenderedMeshes();
        drawnShapes = [];
    });
    extrudeButton.top = "250px";
    extrudeButton.left = "300px";


    //Delete Button
    deleteButton = GUI.Button.CreateSimpleButton("deleteButton", "Delete");
    deleteButton.width = "150px";
    deleteButton.height = "40px";
    deleteButton.color = "white";
    deleteButton.background = "green";
    deleteButton.onPointerClickObservable.add(function () {
        clearRenderedMeshes();
        drawnShapes = [];
    });
    deleteButton.top = "250px";
    deleteButton.left = "-150px";


    //Move Button
    moveButton = GUI.Button.CreateSimpleButton("moveButton", "Move");
    moveButton.width = "150px";
    moveButton.height = "40px";
    moveButton.color = "white";
    moveButton.background = "green";
    moveButton.onPointerClickObservable.add(function () {
        isMoveActive = !isMoveActive; // Toggle the state
        if (isMoveActive) {
            // If the toggle button is active, add the event listener
            canvas.addEventListener("pointermove", onPointerMove, false);
        } else {
            // If the toggle button is inactive, remove the event listener
            canvas.removeEventListener("pointermove", onPointerMove, false);
        }
        moveButton.textBlock.text = isMoveActive ? "Stop Moving" : "Move";
        moveButton.background = isMoveActive ? "red" : "green";
    });
    moveButton.top = "250px";
    moveButton.left = "-300px";


    //Delete Button
    editButton = GUI.Button.CreateSimpleButton("editButton", "Edit");
    editButton.width = "150px";
    editButton.height = "40px";
    editButton.color = "white";
    editButton.background = "green";
    editButton.onPointerClickObservable.add(function () {
        isEditActive = !isEditActive; // Toggle the state
        if (isEditActive) {
            // If the toggle button is active, add the event listener
            canvas.addEventListener("pointermove", onPointerMove, false);
        } else {
            // If the toggle button is inactive, remove the event listener
            canvas.removeEventListener("pointermove", onPointerMove, false);
        }
        editButton.textBlock.text = isEditActive ? "Stop Editing" : "Edit";
        editButton.background = isEditActive ? "red" : "green";
    });
    editButton.top = "250px";
    editButton.left = "-450px";


    // Attach the button to the GUI manager
    var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    advancedTexture.addControl(drawButton);
    advancedTexture.addControl(controlButton);
    advancedTexture.addControl(extrudeButton);
    advancedTexture.addControl(deleteButton);
    advancedTexture.addControl(moveButton);
    advancedTexture.addControl(editButton);


    // Events
    var canvas = engine.getRenderingCanvas();
    var startingPoint;
    var currentMesh;
    var drawButton;
    var controlButton;
    var extrudeButton;
    var deleteButton;
    var moveButton;
    var editButton;
    var drawnShapes = [];
    var renderedMeshes = [];
    // Variables for drawing mode
    var isDrawing = false;
    var isMoveActive = false;
    var isEditActive = false;
    var currentShape = null;
    var checkextrude = false;
    var polygon = null;
    var editMesh = [];
    var pickedMesh = null;
    var pickedPoint = null;
    var vertInfo;
    var vertCount;
    var editMeshSel;
    var editVertexSel;


    function getVertices(mesh) {
        if(!mesh){return;}
        var piv = mesh.getPivotPoint();
        console.log(mesh.getPivotPoint());
        var positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        console.log(mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind));
        if(!positions){return;}
        var numberOfPoints = positions.length / 3;
    
        var level = false;
        var map = [];
        var poLoc = [];
        var poGlob = [];
        for (var i = 0; i < numberOfPoints; i++) {
            var p = new BABYLON.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            var found = false;
            for (var index = 0; index < map.length && !found; index++) {
                var array = map[index];
                var p0 = array[0];
                if (p0.equals(p) || (p0.subtract(p)).lengthSquared() < 0.01) {
                    found = true;
                }
            }
            if (!found) {
                var array = [];
                poLoc.push(p.subtract(piv));
                poGlob.push(BABYLON.Vector3.TransformCoordinates(p, mesh.getWorldMatrix()));
                array.push(p);
                map.push(array);
            }
        }
        return {local:poLoc,global:poGlob,pivot:piv};
    }




    function clearRenderedMeshes() {
        for (var i = 0; i < renderedMeshes.length; i++) {
            renderedMeshes[i].dispose();
        }
        
        // Clear the array
        renderedMeshes = [];
    }


    var getGroundPosition = function () {
        // Use a predicate to get position on the ground
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }
        return null;
    }
    

    var onPointerDown = function (evt) {
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
            if (evt.button === 2) {
                evt.preventDefault();
                if (isDrawing) {
                    stopDrawing();
                    startDrawing();
                }
            }
        }
        if(isMoveActive){
            if (evt.button !== 0) {
                return;
            }
            //check if we are under a mesh
            var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== ground; });
            if (pickInfo.hit) {
                currentMesh = pickInfo.pickedMesh;
                startingPoint = getGroundPosition(evt);
                if (startingPoint) { // we need to disconnect camera from canvas
                    setTimeout(function () {
                        camera.detachControl(canvas);
                    }, 0);
                }
            }
        }
        // if(isEditActive){    
        //     var pickResult = scene.pick(evt.clientX, evt.clientY);
        //     if (pickResult.hit && pickResult.pickedMesh) {
        //         pickedMesh = pickResult.pickedMesh;
        //         pickedPoint = pickResult.pickedPoint;
        //         console.log(getVertices(pickedMesh));
        //     }
        // }


        if(isEditActive){
            var result = scene.pick(scene.pointerX, scene.pointerY,null,null,camera);
            if (result.hit && result.pickedMesh.name !== 'ground') {
                 //console.log(result);
                vertInfo = getVertices(result.pickedMesh);
                 //console.log(vertInfo);
                vertCount = 0;
                for (var i = 0; i < vertInfo.global.length; i++) {
                    if(
                        Math.round(result.pickedPoint.x * 100) / 100 === vertInfo.global[i].x ||
                        Math.round(result.pickedPoint.y * 100) / 100 === vertInfo.global[i].y ||
                        Math.round(result.pickedPoint.z * 100) / 100 === vertInfo.global[i].z
                    ){
                        console.log(vertInfo.global[i]);
                    }
            }
        }
        }


    }


    var onPointerUp = function () {
        if (isCameraControlEnabled) {
            camera.attachControl(canvas, true)
        } 
        if (startingPoint) {
            //camera.attachControl(canvas, true);
            // else {
            //     camera.attachControl(canvas, true);
            // }
            startingPoint = null;
            return;
        }
        pickedMesh = null;
        pickedPoint = null;
    }


    var onPointerMove = function (evt) {
        if(isMoveActive){
            if (!startingPoint) {
                return;
            }
            var current = getGroundPosition(evt);
            if (!current) {
                return;
            }
            var diff = current.subtract(startingPoint);
            currentMesh.position.addInPlace(diff);
            startingPoint = current;
        }
        
    }

    // Function to start drawing
    function startDrawing() {
        engine.runRenderLoop(renderLoop);
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

    canvas.addEventListener("pointerdown", onPointerDown, false);
    canvas.addEventListener("pointerup", onPointerUp, false);
    canvas.addEventListener("pointermove", onPointerMove, false);


    //Render

    function renderLoopextrude() {
        //scene.render();
      //  Render the drawn shapes
        if(checkextrude){
            for (var i = 0; i < drawnShapes.length; i++) {
                var shape = drawnShapes[i];
                // Check if the shape object is defined and contains enough points
                if (shape && shape.points && shape.points.length > 2) {
                        polygon = BABYLON.MeshBuilder.ExtrudePolygon("polygon", {
                        shape: shape.points, // Use the points array
                        depth: 30,
                        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
                        updatable: true
                    }, scene);
                    // Position and color the extruded polygon as needed
                    polygon.position.y = 50; // Adjust the height as needed
                    polygon.material = new BABYLON.StandardMaterial("polygonMaterial", scene);
                    polygon.material.diffuseColor = new BABYLON.Color3(1, 0, 0); // Red color 
                    editMesh.push(polygon);  
                }
            }
            checkextrude = false;
        }
    }
    

    function renderLoop() {
        //scene.render();
        if (currentShape && currentShape.length > 1) {
            var currentLinesMesh = BABYLON.Mesh.CreateLines("currentLines", currentShape, scene);
            currentLinesMesh.color =  new BABYLON.Color3(1, 0, 0); // Red color
            renderedMeshes.push(currentLinesMesh);
        }
    }

    
    
    // Handle window resize
    window.addEventListener("resize", function () {
        engine.resize();
    });
    return scene;
}