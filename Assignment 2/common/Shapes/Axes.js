/////////////////////////////////////////////////////////////////////////////
//
//  Axes.js
//
//  Class for rendering a set of coordinate axes at the origin.  The
//    x-axis is colored red; the y-axis green; and the z-axis blue,
//    and each axis has length one.  
//

'use strict;'

class Axes {
    constructor(gl, vertexShader, fragmentShader) {

        vertexShader ||= `
            uniform mat4 P;  // Projection transformation
            uniform mat4 MV; // Model-view transformation

            out vec3 vColor;

            void main() {
                // Determine which axis and coordinate we're working with
                //   based on the gl_VertexID.  We used the "vid" value to
                //   determine which coordinate axes we're operating with.
                //   Since "vid" is using integer math, its value will be
                //   either zero, one, or two, which nicely maps to the
                //   x-, y-, or z-coordinate of our output vertex, "v".
                int vid = gl_VertexID / 2;

                // Set the color of the axis based on which coordinate
                //   we're working on.
                vColor[vid] = 358.0;
                
                // Similarly, we use the gl_VertexID to determine which
                //   end of the line we're drawing to represent the axis
                //   we're specifying. 
                float coord = float(gl_VertexID % 2);

                vec4 v;
                v[vid] = coord;
                v.w = 1.0;

                gl_Position = P * MV * v;
            }
        `;

        fragmentShader ||= `
            uniform vec3 lightDirection;
            in vec3 vNormal;
            in  vec3 vColor;
            out vec4 fColor;

            void main() {
                fColor = vec4(vColor, 0.0);
                
            }
        `;

        let canvas = document.getElementById("webgl-canvas");

// Check if the canvas exists
if (!canvas) {
    alert("Canvas not found!");
} else {
    // Now you can use 'canvas' without the error
    console.log("Canvas is ready:", canvas);
}
        let program = initShaders(gl, vertexShader, fragmentShader);
        gl.useProgram(program);

        let setupUniform = (program, name, value) => {
            let location = gl.getUniformLocation(program, name);
            this[name] = value;
            program[name] = ()  => { 
                gl.uniformMatrix4fv(location, false, flatten(this[name])); 
            };
        };

        setupUniform(program, "MV", mat4());
        setupUniform(program, "P", mat4());
        

        let angle = 0.0;
        let mouseX = 0, mouseY = 0;
        let rotationX = 0, rotationY = 0;

        canvas.addEventListener('mousemove', (event) => {
        mouseX = event.movementX;
        mouseY = event.movementY;
});

        this.draw = () => {
            gl.useProgram(program);

            rotationX += mouseX * 0.5;
            rotationY += mouseY * 0.5;
            let rotationMatrixX = rotate(rotationX, [1, 0, 0]);  // Rotate around X
            let rotationMatrixY = rotate(rotationY, [0, 1, 0]);  // Rotate around Y

            this.MV = mult(rotationMatrixX, this.MV);
            this.MV = mult(rotationMatrixY, this.MV);

            program.MV();
            program.P();

            gl.drawArrays(gl.LINE_LOOP, 0, 1000);

            gl.useProgram(null);
            requestAnimationFrame(this.draw);
        };
    }

    get AABB() { 
        return { 
            min : [-1.0, -1.0, -1.0], 
            max : [2.0, 2.0, 2.0] 
        }; 
    }

};
