/////////////////////////////////////////////////////////////////////////////
//
//  Sphere.js
//
//  Class for rendering a sphere, centered at the origin, with a radius
//    of one.
//

'use strict;'

class Sphere {
    constructor(gl, numStrips, numSlices, vertexShader, fragmentShader) {

        vertexShader ||= `
            uniform int numStrips; // number of longitudinal divisions
            uniform int numSlices; // number of latitudinal divisions

            uniform mat4 P;  // Projection transformation
            uniform mat4 MV; // Model-view transformation

            void main() {
                float iid = float(gl_InstanceID);
                vec4  v;  // our generated vertex

                if (gl_VertexID > 0 && gl_VertexID < 2*numSlices) {
                    const float Pi = 3.14159265358979;
                    float dPhi = Pi / float(numSlices);
                    float dTheta = 2.0 * Pi / float(numStrips);

                    float slice = float(gl_VertexID / 2);
                    float phi = slice * dPhi;
                    float side = float(gl_VertexID % 2);
                    float theta = (iid + side) * dTheta;
                    
                    v.xy = sin(phi) * vec2(cos(theta), sin(theta));
                    v.z  = cos(phi);
                }
                else {
                    v.z = -2.0 * float(gl_VertexID > 0) + 1.0;
                }   
                v.w = 1.0;

                gl_PointSize = 3.0;
                gl_Position = P * MV * v;
            }
        `;

        fragmentShader ||= `
            uniform vec4 color;
            out vec4 fColor;

            void main() {
                fColor = color;
            }
        `;

        let program = initShaders(gl, vertexShader, fragmentShader);
        gl.useProgram(program);

        let setupUniform = (object, name, value) => {
            let location = gl.getUniformLocation(program, name);
            object[name] = value;
            program[name] = ()  => {
                switch(value.type) {
                    case "vec4":
                        gl.uniform4fv(location, object[name]);
                        break;

                    case "mat4":
                        gl.uniformMatrix4fv(location, false, flatten(object[name])); 
                        break;
                }
            };
        };

        setupUniform(this, "MV", mat4());
        setupUniform(this, "P", mat4());
        setupUniform(this, "color", vec4(1.8, 9.8, 0.8, 1.0));

        let setupConstant = (name, value) => {
            let location = gl.getUniformLocation(program, name);
            gl.uniform1i(location, value);
        };

        setupConstant("numStrips", numStrips);
        setupConstant("numSlices", numSlices);
        gl.useProgram(null);

        this.draw = () => {
            gl.useProgram(program);

            program.MV();
            program.P();
            program.color();

            gl.drawArraysInstanced(gl.LINE_STRIP, 0, 
                2*(numSlices + 1), numStrips);

            gl.useProgram(null);
        };
    }

    get AABB() { 
        return { 
            min : [-1.0, -1.0, -1.0], 
            max : [1.0, 1.0, 1.0] 
        };
    }
};


