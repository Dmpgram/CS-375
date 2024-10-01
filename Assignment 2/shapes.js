let gl = undefined;
let angle = 0.0;
let axes, cube, sphere, ms;

// Initialize WebGL and set up the scene
function init() {
    let canvas = document.getElementById("webgl-canvas");
    gl = canvas.getContext("webgl2");

    if (!gl) {
        alert("Your Web browser doesn't support WebGL 2\nPlease contact Dave");
        return;
    }

    // Set the background color and enable depth testing
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
   // gl.enable(gl.DEPTH_TEST);  // Enable depth testing for 3D rendering

    // Initialize objects
    axes = new Axes(gl);  // Assuming Axes.js defines this
    cube = new Cube(gl);  // Assuming Cube.js defines this
    sphere = new Sphere(gl, 30, 30);  // Example: 30 strips, 30 slices
    ms = new MatrixStack();  // Assuming MatrixStack.js defines this

    // Start the rendering loop
    render();
}

// Rendering logic
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  // Clear the buffers

    // Increment angle for rotation
    angle += 2.0;
    angle %= 360.0;

    // Draw Axes
    ms.push();
    ms.rotate(angle, [0, 0, 1]);
    ms.scale([0.5, 0.5, 0.5]); 
    axes.MV = ms.current();
    axes.draw();
    ms.pop();

    // Draw Cube
    ms.push();
    ms.translate([-0.5, 0.5, -1.0]);// Move the cube back a bit
    ms.scale([0.3, 0.3, 0.3]); 
    ms.rotate(angle, [1, 0, 0]); // Rotate the cube around multiple axes
    cube.MV = ms.current();
    cube.draw();
    ms.pop();

    angle += 1.0;
    angle %= 360.0;
    // Draw Sphere
    ms.push();
    ms.translate([0.5, -0.75, 1.0]);  // Move the sphere to the left
    ms.scale([0.2, 0.2, 0.2]);   // Scale the sphere down a bit
    ms.rotate(angle, [0, 0, 1]);     
    sphere.MV = ms.current();
    sphere.draw();
    ms.pop();

    // Request animation frame for continuous rendering
    requestAnimationFrame(render);
}

// Call init when the page loads
window.onload = init;
