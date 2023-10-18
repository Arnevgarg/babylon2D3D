HOW TO RUN:
STEP 1: Type in ternimanl : npm i               // to install all the dependencies
STEP 2: Type in termminal : npm run dev         // to start the server
STEP 3: Open the generates local URL in browser // to view the generated application

There are five main buttons:
Draw :          Enables Drawing mode, where you can draw on canvas.
                single click will initiate line origin and you can keep clicking on to define edges of a polygon that 
                you wish to draw. Right click will save the shapes you drew on the screen. 
                You can move pointer to a different location to start drawing a different shape.

Delete :        Clicking delete button will clear the canvas of any lines drawn. 
                However, it won't remove the extruded objects.

Extrude :       Clicking extrude button will turn any 2D shape drawn on the screen to a 3D object.

Move :          Clicking this enables Move mode. you can simply click and drag any object you want to move around.

Edit Vertices : Enables editing mode. you can simply click and drag the vertex you want to its new position.
                It is recommended that you you move camera to top view before using this so as to get accurate drag 
                results and avoid prespective error due to 3D view.
                
Enable/Disable: Clicking this enables/ disables your abilty to Control camera through click and drag.
Camera Control  This i useful as Camera Control might be undesirable in some situations,
                and interefere with working of other modes.


NOTE -  Try using modes in isolation for best results. For example, turn off Drawing mode before using Extrusion.
        Or Disable Camera Control before entering Edit vertices mode.
                                