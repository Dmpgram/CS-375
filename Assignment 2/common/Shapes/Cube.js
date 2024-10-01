'use strict';

class Cube {
    constructor(gl, vertexShader, fragmentShader) {
        
        vertexShader ||= `
            uniform mat4 P;  // Projection transformation
            uniform mat4 MV; // Model-view transformation

            out vec3 vColor;

            void main() {
                // Cube vertex positions are predefined for each face.
                // Cube has 6 faces, 2 triangles per face, 6 vertices per face.
                vec4 vertices[8];
                vertices[0] = vec4(-0.5, -0.5,  0.5, 1.0);  // Front bottom-left
                vertices[1] = vec4( 0.5, -0.5,  0.5, 1.0);  // Front bottom-right
                vertices[2] = vec4( 0.5,  0.5,  0.5, 1.0);  // Front top-right
                vertices[3] = vec4(-0.5,  0.5,  0.5, 1.0);  // Front top-left
                vertices[4] = vec4(-0.5, -0.5, -0.5, 1.0);  // Back bottom-left
                vertices[5] = vec4( 0.5, -0.5, -0.5, 1.0);  // Back bottom-right
                vertices[6] = vec4( 0.5,  0.5, -0.5, 1.0);  // Back top-right
                vertices[7] = vec4(-0.5,  0.5, -0.5, 1.0);  // Back top-left

                // Get the current vertex from gl_VertexID
                vec4 v = vertices[gl_VertexID % 8];

                // Assign vertex color based on gl_VertexID
                vColor = vec3(v.x + 0.5, v.y + 0.5, v.z + 0.5);  // Color based on position

                // Set the final position by applying model-view and projection matrices
                gl_Position = P * MV * v;
            }
        `;

        fragmentShader ||= `
            in vec3 vColor;
            out vec4 fColor;

            void main() {
                // Simple fragment shader coloring based on the interpolated color from vertex shader
                fColor = vec4(vColor, -1.0);  // Set the color
            }
        `;

        // Initialize the shader program
        let program = initShaders(gl, vertexShader, fragmentShader);
        gl.useProgram(program);

        // Set up uniform handling
        let setupUniform = (program, name, value) => {
            let location = gl.getUniformLocation(program, name);
            this[name] = value;
            program[name] = ()  => { 
                gl.uniformMatrix4fv(location, false, flatten(this[name])); 
            };
        };

        setupUniform(program, "MV", mat4());
        setupUniform(program, "P", mat4());

        // Cube's vertex buffer
        const vertices = new Float32Array([
            // Front face
            -0.5, -0.5,  0.5,
             0.5, -0.5,  0.5,
             0.5,  0.5,  0.5,
            -0.5,  0.5,  0.5,

            // Back face
            -0.5, -0.5, -0.5,
            -0.5,  0.5, -0.5,
             0.5,  0.5, -0.5,
             0.5, -0.5, -0.5,

            // Top face
            -0.5,  0.5, -0.5,
            -0.5,  0.5,  0.5,
             0.5,  0.5,  0.5,
             0.5,  0.5, -0.5,

            // Bottom face
            -0.5, -0.5, -0.5,
             0.5, -0.5, -0.5,
             0.5, -0.5,  0.5,
            -0.5, -0.5,  0.5,

            // Right face
             0.5, -0.5, -0.5,
             0.5,  0.5, -0.5,
             0.5,  0.5,  0.5,
             0.5, -0.5,  0.5,

            // Left face
            -0.5, -0.5, -0.5,
            -0.5, -0.5,  0.5,
            -0.5,  0.5,  0.5,
            -0.5,  0.5, -0.5
        ]);

        // Create buffer for the cube vertices
        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Draw function
        this.draw = () => {
            gl.useProgram(program);

            program.MV();
            program.P();

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(0);

            // Draw the cube using triangle strips (connect vertices to form faces)
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 24);  // 24 vertices (6 faces)

            gl.useProgram(null);  // Unbind the shader program
        };
    }

    // Optional: define Axis-Aligned Bounding Box for the cube
    get AABB() { 
        return { 
            min : [-0.5, -0.5, -0.5], 
            max : [0.5, 0.5, 0.5] 
        }; 
    }
};
