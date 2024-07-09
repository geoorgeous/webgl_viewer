// The method the grid shader is from here: http://asliceofrendering.com/scene%20helper/2020/01/05/InfiniteGrid/
// but modified from a vulkan-purposed shader to an OpenGL ES 2.0 one.
// Note: Vulkan depth from 0...1, OpenGL depth from -1...1
// 0.6 in vulkan = 0.2 in openg
// 0.6 * 2 - 1 = 0.2
// 0.2 * 2 - 1 = -0.6
const shader_source = {
    grid_vertex: `#version 300 es
        precision highp float;

        uniform mat4 uProjectionMatrix;
        uniform mat4 uViewMatrix;
        
        out vec3 nearPoint;
        out vec3 farPoint;
        out mat4 fragView;
        out mat4 fragProj;
        
        // Grid position are in clipped space
        vec3 gridPlane[6] = vec3[] (
            vec3(-1, 1, 0), vec3(-1, -1, 0), vec3(1, 1, 0),
            vec3(1, -1, 0), vec3(1, 1, 0), vec3(-1, -1, 0)
        );
        
        vec3 UnprojectPoint(float x, float y, float z, mat4 view, mat4 projection) {
            mat4 viewInv = inverse(view);
            mat4 projInv = inverse(projection);
            vec4 unprojectedPoint =  viewInv * projInv * vec4(x, y, z, 1.0);
            return unprojectedPoint.xyz / unprojectedPoint.w;
        }
        
        void main() {
            vec3 p = gridPlane[gl_VertexID].xyz;
            nearPoint = UnprojectPoint(p.x, p.y, 0.0, uViewMatrix, uProjectionMatrix).xyz; // unprojecting on the near plane
            farPoint = UnprojectPoint(p.x, p.y, 1.0, uViewMatrix, uProjectionMatrix).xyz; // unprojecting on the far plane
            fragView = uViewMatrix;
            fragProj = uProjectionMatrix;
            gl_Position = vec4(p, 1.0); // using directly the clipped coordinates
        }
    `,

    grid_fragment: `#version 300 es
        precision highp float;

        const float near = 0.01;
        const float far = 100.0;
        in vec3 nearPoint;
        in vec3 farPoint;
        in mat4 fragView;
        in mat4 fragProj;

        out vec4 outColor;

        vec4 grid(vec3 fragPos3D, float scale, vec3 color) {
            vec2 coord = fragPos3D.xz * scale;
            vec2 derivative = fwidth(coord);
            vec2 grid = abs(fract(coord - 0.5) - 0.5) / derivative;
            float line = min(grid.x, grid.y);
            float minimumz = min(derivative.y * (7.0 / scale), 1.0);
            float minimumx = min(derivative.x * (7.0 / scale), 1.0);
            vec4 result = vec4(color, (0.5 - min(line, 0.5)) / scale);
            // z axis
            if(fragPos3D.x > -0.06 * minimumx && fragPos3D.x < 0.06 * minimumx)
                result = vec4(0.0, 0.0, 1.0, 1.0);
            // x axis
            if(fragPos3D.z > -0.06 * minimumz && fragPos3D.z < 0.06 * minimumz)
                result = vec4(1.0, 0.0, 0.0, 1.0);
            return result;
        }

        float computeDepth(vec3 pos) {
            vec4 clip_space_pos = fragProj * fragView * vec4(pos.xyz, 1.0);
            return ((clip_space_pos.z / clip_space_pos.w) + 1.0) * 0.5;
        }

        float computeLinearDepth(vec3 pos) {
            float clip_space_depth = computeDepth(pos); // put back between -1 and 1
            float linearDepth = (2.0 * near * far) / (far + near - clip_space_depth * (far - near)); // get linear value between 0.01 and 100
            return linearDepth / far; // normalize
        }

        void main() {
            float t = -nearPoint.y / (farPoint.y - nearPoint.y);
            vec3 fragPos3D = nearPoint + t * (farPoint - nearPoint);
            
            float linearDepth = computeLinearDepth(fragPos3D);
            float fading = max(0.0, (0.5 - linearDepth));
            
            outColor = (grid(fragPos3D, 1.0, vec3(0.33)) + grid(fragPos3D, 10.0, vec3(0.33))) * float(t > 0.0);
            outColor.a *= 1.0 - (length(fragPos3D) / 25.0);

            if (outColor.a <= 0.0)
                discard;

            gl_FragDepth = computeDepth(fragPos3D);
        }
    `,

    objectid_vertex: `#version 300 es
        precision mediump float;

        layout(location=0) in vec3 aPosition;

        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;

        void main() {
            gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
        }
    `,

    objectid_fragment: `#version 300 es
        precision mediump float;

        uniform vec4 uObjectId;

        out vec4 outColor;

        void main() {
            outColor = uObjectId;
        }
    `,

    gizmo_vertex: `
    `,

    gizmo_fragment: `
    `,

    object_vertex: `#version 300 es
        precision highp float;

        layout(location=0) in vec3 a_position;
        layout(location=1) in vec3 a_normal;
        layout(location=2) in vec2 a_textureCoords;

        uniform mat4 u_modelMatrix;
        uniform mat4 u_viewMatrix;
        uniform mat4 u_projectionMatrix;

        out vec3 fi_fragmentPosition;
        out vec3 fi_vertexNormal;
        out vec2 fi_textureCoords;

        void main() {
            fi_fragmentPosition = vec3(u_modelMatrix * vec4(a_position, 1.0));
            fi_vertexNormal = mat3(transpose(inverse(u_modelMatrix))) * a_normal;  
            fi_textureCoords = a_textureCoords;
            
            gl_Position = u_projectionMatrix * u_viewMatrix * vec4(fi_fragmentPosition, 1.0);
        }
    `,

    object_fragment: `#version 300 es
        precision highp float;

        uniform sampler2D u_diffuseMap;
        uniform sampler2D u_normalMap;
        uniform sampler2D u_specularMap;
        uniform sampler2D u_opacityMap;
        uniform vec3 u_materialAmbient;
        uniform vec3 u_materialDiffuse;
        uniform vec4 u_materialSpecular;

        uniform vec3 u_viewPosition;
        uniform vec3 u_lightDirection;

        in vec3 fi_fragmentPosition;
        in vec3 fi_vertexNormal;
        in vec2 fi_textureCoords;

        layout(location=0) out vec4 fo_color;
        layout(location=1) out vec4 fo_normal;

        void main() {
            vec3 lightColor = vec3(1.0);
            vec3 lightDirection = -normalize(u_lightDirection);

            // Ambient lighting color component
            vec3 ambientColor = lightColor * u_materialAmbient * texture(u_diffuseMap, fi_textureCoords).rgb;
            
            // Diffuse lighting color component 
            vec3 fragmentNormal = normalize(fi_vertexNormal);
            float diffuseStrength = max(dot(fragmentNormal, lightDirection), 0.0);
            vec3 diffuseColor = lightColor * u_materialDiffuse * texture(u_diffuseMap, fi_textureCoords).rgb * diffuseStrength;
            
            vec3 fragmentToViewDirection = normalize(u_viewPosition - fi_fragmentPosition);
            vec3 reflectDirection = reflect(-lightDirection, fragmentNormal);
            float specularStrength = pow(max(dot(fragmentToViewDirection, reflectDirection), 0.0), u_materialSpecular.w);
            vec3 specularColor = lightColor * u_materialSpecular.xyz * specularStrength;  
            
            vec3 blinnPhongColor = (ambientColor + diffuseColor + specularColor);
            fo_color = vec4(blinnPhongColor, texture(u_opacityMap, fi_textureCoords).a);
            fo_normal = vec4(fragmentNormal, 1.0);
        }
    `,

    screenquad_vertex: `#version 300 es
        out vec2 fi_uv;

        void main() {
            const vec2 vertices[3] = vec2[3](vec2(-1, -1), vec2(3, -1), vec2(-1, 3));

            gl_Position = vec4(vertices[gl_VertexID], 0, 1);
            fi_uv = 0.5 * gl_Position.xy + vec2(0.5);
        }
    `,
    screenquad_fragment: `#version 300 es
        precision highp float;

        uniform sampler2D u_colorTexture;
        uniform sampler2D u_normalTexture;
        uniform sampler2D u_depthTexture;
        uniform vec2 u_textureSize;

        in vec2 fi_uv;

        out vec4 fo_color;

        float readDepth(sampler2D depthSampler, vec2 uv) {
            float d = texture(depthSampler, uv).x;
            float f = 100.0; //far plane
            float n = 0.01; //near plane
            float z = (2.0 * n) / (f + n - d * (f - n));
            return z;

            //float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
            //return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
        }
        
        float getPixelDepth(int x, int y) {
            return readDepth(u_depthTexture, fi_uv + vec2(x, y) / u_textureSize.xy);
        }

        void main() {
            // float depth = getPixelDepth(0, 0);                           
            
            // int radius = 2;                       
            // float depthDiff = 0.0;                    
            // for (int rx = -radius; rx < radius; ++rx) { 
            //     for (int ry = -radius; ry < radius; ++ry) { 
            //         float neighbourFragmentDistanceSq = float(rx * rx + ry * ry);
            //         float outlineRadiusSq = float(radius * radius + radius * radius);
            //         float difference = max(float(outlineRadiusSq - neighbourFragmentDistanceSq), 0.0);
            //         float dd = max(abs(depth - getPixelDepth(rx,  ry)) * (difference / outlineRadiusSq), 0.0);

            //         depthDiff += dd;
            //     }
            // }

            // depthDiff = depthDiff * 20.0;
            // depthDiff = clamp(depthDiff, 0.0, 1.0);
            // depthDiff = pow(depthDiff, 1.7);
            
            // vec3 outlineColor = vec3(1.0, 0.5, 0.0);

            // fo_color = mix(texture(u_colorTexture, fi_uv), vec4(outlineColor, 1.0), depthDiff);

            fo_color = texture(u_colorTexture, fi_uv);

            // fo_color = texture(u_normalTexture, fi_uv);

            // float f = 10.0; //far plane
            // float n = 0.01; //near plane
            // float z = (2.0 * n) / (f + n - texture(u_depthTexture, fi_uv).x * (f - n));

            // fo_color = vec4(vec3(1.0 - z), 1.0);
        }
    `
}