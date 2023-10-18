import * as BABYLON from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";
 
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
//create the main scene
var scene = createScene();
engine.runRenderLoop(function () {
  scene.render();
});
 
function createScene() {
  var scene = new BABYLON.Scene(engine);
  var camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 8, 50, BABYLON.Vector3.Zero(), scene);

	camera.attachControl(canvas, true);

	var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
  var light2 = new BABYLON.PointLight(
    "light2",
    new BABYLON.Vector3(0, 10, 0),
    scene
  );
 
  // Ground
  var ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 2, scene, false);
  var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
  groundMaterial.diffuseColor = new BABYLON.Color3(0.10, 0.20, 0.125); //Red
  groundMaterial.specularColor = BABYLON.Color3.Black();
  ground.material = groundMaterial;
  scene.clearColor = new BABYLON.Color3(0, 0, 0);
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
  controlButton = GUI.Button.CreateSimpleButton(
    "controlButton",
    "Toggle Camera Control"
  );
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
    controlButton.background = isCameraControlEnabled ?  "green" : "red";
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
  editButton = GUI.Button.CreateSimpleButton("editButton", "Edit Vertices");
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
    editButton.textBlock.text = isEditActive ? "Stop Editing" : "Edit Vertices";
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
  var editMeshSelect;
  var editVertexSelect;
 
  function getVertices(mesh) {
    if (!mesh) {
      return;
    }
    var piv = mesh.getPivotPoint();
    // console.log(mesh.getPivotPoint());
    var positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    // console.log(mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind));
    if (!positions) {
      return;
    }
    var numberOfPoints = positions.length / 3;
 
    var level = false;
    var map = [];
    var poLoc = [];
    var poGlob = [];
    for (var i = 0; i < numberOfPoints; i++) {
      var p = new BABYLON.Vector3(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      );
      var found = false;
      for (var index = 0; index < map.length && !found; index++) {
        var array = map[index];
        var p0 = array[0];
        if (p0.equals(p) || p0.subtract(p).lengthSquared() < 0.01) {
          found = true;
        }
      }
      if (!found) {
        var array = [];
        poLoc.push(p.subtract(piv));
        poGlob.push({
          cord1: BABYLON.Vector3.TransformCoordinates(p, mesh.getWorldMatrix()),
          index: i,
        });
        array.push(p);
        map.push(array);
      }
    }
    return { local: poLoc, global: poGlob, pivot: piv };
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
    var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
      return mesh == ground;
    });
    if (pickinfo.hit) {
      return pickinfo.pickedPoint;
    }
    return null;
  };
 
  var onPointerDown = function (evt) {
    if (isDrawing) {
      var pickResult = scene.pick(scene.pointerX, scene.pointerY);
      if (pickResult.hit) {
        var point = pickResult.pickedPoint;
        console.log("Picked Point Coordinates: ", point);
        if (currentShape) {
          currentShape.push(point);
        }
        console.log("currentshape Coordinates: ", currentShape);
      }
      renderLoop();
 
      // Check for right-click (event.button === 2) and stop drawing
      if (evt.button === 2) {
        evt.preventDefault();
        if (isDrawing) {
          stopDrawing();
          startDrawing();
        }
      }
    }
    if (isMoveActive) {
      if (evt.button !== 0) {
        return;
      }
      //check if we are under a mesh
      var pickInfo = scene.pick(
        scene.pointerX,
        scene.pointerY,
        function (mesh) {
          return mesh !== ground;
        }
      );
      if (pickInfo.hit) {
        currentMesh = pickInfo.pickedMesh;
        startingPoint = getGroundPosition(evt);
        if (startingPoint) {
          // we need to disconnect camera from canvas
          setTimeout(function () {
            camera.detachControl(canvas);
          }, 0);
        }
      }
    }
    if (isCameraControlEnabled && pickResult.pickedMesh === ground) {
      camera.attachControl(canvas, true);
      console.log("Clicked on the ground mesh.");
    }
    
 
    if (isEditActive) {
      var result = scene.pick(
        scene.pointerX,
        scene.pointerY,
        null,
        null,
        camera
      );
      console.log(result.pickedMesh.name);
      if (result.hit && result.pickedMesh.name !== "ground") {
 
        vertInfo = getVertices(result.pickedMesh);

        vertCount = 0;
        for (var i = 0; i < vertInfo.global.length; i++) {
          if (
            Math.abs(result.pickedPoint.x - vertInfo.global[i].cord1.x) *
              Math.abs(result.pickedPoint.x - vertInfo.global[i].cord1.x) +
              Math.abs(result.pickedPoint.y - vertInfo.global[i].cord1.y) *
                Math.abs(result.pickedPoint.y - vertInfo.global[i].cord1.y) +
              Math.abs(result.pickedPoint.z - vertInfo.global[i].cord1.z) *
                Math.abs(result.pickedPoint.z - vertInfo.global[i].cord1.z) <
            50
          ) {
            console.log(vertInfo.global[i]);
            editMeshSelect = result.pickedMesh;
            editVertexSelect = vertInfo.global[i].index;
            break;
 
          }
        }
      }
    }
  };
 
  var onPointerUp = function () {
    camera.detachControl(canvas);
    if (isEditActive && editMeshSelect) {
      //   let postions;
 
      let positionsNew = editMeshSelect.getVerticesData(
        BABYLON.VertexBuffer.PositionKind
      );
 
      var result = scene.pick(
        scene.pointerX,
        scene.pointerY,
        null,
        null,
        camera
      );
 
      
 
      var m = new BABYLON.Matrix();
      editMeshSelect.getWorldMatrix().invertToRef(m);
      var v = BABYLON.Vector3.TransformCoordinates(result.pickedPoint, m);

      positionsNew[3 * editVertexSelect] = v.x;
      positionsNew[3 * editVertexSelect + 2] = v.z;
      editMeshSelect.updateVerticesData(
        BABYLON.VertexBuffer.PositionKind,
        positionsNew
      );
      scene.render();
      editMeshSelect = null;
    }
    if (isCameraControlEnabled) {
      camera.attachControl(canvas, true);
    }
    if (startingPoint) {

      startingPoint = null;
      return;
    }
    pickedMesh = null;
    pickedPoint = null;
  };
 
  var onPointerMove = function (evt) {
    if (isMoveActive) {
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
  };
 
  // Function to start drawing
  function startDrawing() {
    //engine.runRenderLoop(renderLoop);
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
    if (checkextrude) {
      for (var i = 0; i < drawnShapes.length; i++) {
        var shape = drawnShapes[i];
        // Check if the shape object is defined and contains enough points
        if (shape && shape.points && shape.points.length > 2) {
          polygon = BABYLON.MeshBuilder.ExtrudePolygon(
            "polygon",
            {
              shape: shape.points, // Use the points array
              depth: 3,
              sideOrientation: BABYLON.Mesh.DOUBLESIDE,
              updatable: true,
            },
            scene
          );
          // Position and color the extruded polygon as needed
          polygon.position.y = 3; // Adjust the height as needed
          polygon.material = new BABYLON.StandardMaterial(
            "polygonMaterial",
            scene
          );
          polygon.material.diffuseColor = new BABYLON.Color3(0.627, 0.53, 0.462); // Red color
          editMesh.push(polygon);
        }
      }
      checkextrude = false;
    }
  }
  var lines = BABYLON.MeshBuilder.CreateLines("lines", {
    points:  [
    new BABYLON.Vector3(-30, 0, 30),
    new BABYLON.Vector3(30, 0, 30),
    new BABYLON.Vector3(30, 0, -30),
    new BABYLON.Vector3(-30, 0, -30),
    new BABYLON.Vector3(-30, 0, 30)
]
}, scene);
lines.enableEdgesRendering();
lines.edgesWidth = 20; 
lines.edgesColor = new BABYLON.Color4(1, 1, 1);
  function renderLoop() {
    //scene.render();
    if (currentShape && currentShape.length > 1) {
      var currentLinesMesh = BABYLON.MeshBuilder.CreateLines(
        "currentLinesMesh",
        {points:currentShape},
        scene
      );
      //currentLinesMesh.color = new BABYLON.Color3(0, 0, 0, 1);
      currentLinesMesh.enableEdgesRendering();
      currentLinesMesh.edgesWidth = 20; 
      currentLinesMesh.edgesColor = new BABYLON.Color4(1, 1, 1);
      renderedMeshes.push(currentLinesMesh);
      
    }
  }
 
  // Handle window resize
  window.addEventListener("resize", function () {
    engine.resize();
  });
  return scene;
}




// function createScene() {
// 	var scene = new BABYLON.Scene(engine);

// 	var camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 8, 50, BABYLON.Vector3.Zero(), scene);

// 	camera.attachControl(canvas, true);

// 	var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);


// 	// Creation of a lines mesh
// 	var lines = BABYLON.MeshBuilder.CreateLines("lines", {
//         points:  [
//         new BABYLON.Vector3(-3, 0, 3),
//         new BABYLON.Vector3(3, 0, 3),
//         new BABYLON.Vector3(3, 0, -3),
//         new BABYLON.Vector3(-3, 0, -3),
//         new BABYLON.Vector3(-3, 0, 3)
// 	]
//     }, scene);
//     lines.enableEdgesRendering();
//     lines.edgesWidth = ; 
//     lines.edgesColor = new BABYLON.Color4(0, 0, 1);
//     var mat = new BABYLON.StandardMaterial("texture2", scene);
//     mat.diffuseColor = new BABYLON.Color3(1, 0, 0); //Red

//     var ground = BABYLON.Mesh.CreateGround("ground1", 20, 20, 2, scene);
//     ground.material = mat;



// 	return scene;
// }