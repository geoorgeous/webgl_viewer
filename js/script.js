// todo: hook number inputs up

// todo: object selection:
// - render outline for selected object

// todo: gizmos
// - render selected object gizmos
//   - transform
//   - scale
//   - rotate

// todo: scene tree
// - imported meshes import as mesh groups in assets
// - scene objects support grouping and parenting
// - add object to scene
// - remove objecy from scene

// todo: free camera

function drawSceneObjectIds(gl, camera) {
    gl.useProgram(state.shaders.objectId.program);
    
    gl.uniformMatrix4fv(state.shaders.objectId.uniformLocations.projectionMatrix, false, camera.projectionMatrix);
    gl.uniformMatrix4fv(state.shaders.objectId.uniformLocations.viewMatrix, false, camera.viewMatrix);

    for (let idx = 0; idx < state.scene.objects.length; ++idx) {
        if (!state.scene.objects[idx].meshId)
            continue;

        const id = idx + 1;
        state.gl.uniform4fv(state.shaders.objectId.uniformLocations.objectId, [
            ((id >>  0) & 0xFF) / 0xFF,
            ((id >>  8) & 0xFF) / 0xFF,
            ((id >> 16) & 0xFF) / 0xFF,
            ((id >> 24) & 0xFF) / 0xFF
        ]);
        state.gl.uniformMatrix4fv(state.shaders.objectId.uniformLocations.modelMatrix, false, state.scene.objects[idx].transform);

        drawMesh(state.gl, state.resources.meshes[state.scene.objects[idx].meshId]);
    }

    const pixelX = state.lastMouseX * gl.canvas.width / gl.canvas.clientWidth;
    const pixelY = gl.canvas.height - state.lastMouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
    const data = new Uint8Array(4);
    gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
    const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);

    state.objectUnderMouseIdx = id - 1;
}

function drawGrid(gl, camera) {
    gl.useProgram(state.shaders.grid.program);

    gl.uniformMatrix4fv(state.shaders.grid.uniformLocations.projectionMatrix, false, camera.projectionMatrix);
    gl.uniformMatrix4fv(state.shaders.grid.uniformLocations.viewMatrix, false, camera.viewMatrix);
    
    gl.drawArrays(gl.TRIANGLES, 0, gl.FLOAT, 0);
}

function drawGizmo() {
    
}

function drawSceneGeometry(gl, camera) {
    gl.useProgram(state.shaders.object.program);

    gl.uniformMatrix4fv(state.shaders.object.uniformLocations.projectionMatrix, false, camera.projectionMatrix);
    gl.uniformMatrix4fv(state.shaders.object.uniformLocations.viewMatrix, false, camera.viewMatrix);
    gl.uniform3fv(state.shaders.object.uniformLocations.viewPos, camera.pos);
    gl.uniform3fv(state.shaders.object.uniformLocations.lightDir, [-1, -3, -2]);

    for (object of state.scene.objects) {   
        if (!object.meshId)
            continue;

        state.gl.uniformMatrix4fv(state.shaders.object.uniformLocations.modelMatrix, false, object.transform);

        let diffuseMapId = "default.png";
        let normalMapId = "default.png";
        let specularMapId = "default.png";
        let opacityMapId = "default.png";
        let materialAmbient = [0.15, 0.15, 0.15];
        let materialDiffuse = [0.5, 0.5, 0.5];
        let materialSpecular = [0.1, 0.1, 0.1, 32];
        
        if (object.materialId && state.resources.materials[object.materialId]) {
            const material = state.resources.materials[object.materialId];
            if (material.maps.diffuse && state.resources.textures[material.maps.diffuse]) {
                diffuseMapId = material.maps.diffuse;
            }
            if (material.maps.normal && state.resources.textures[material.maps.normal]) {
                normalMapId = state.resources.materials[object.materialId].maps.normal;
            }
            if (material.maps.specularHighlights && state.resources.textures[material.maps.specularHighlights]) {
                specularMapId = material.maps.specularHighlights;
            }
            if (material.maps.opacity && state.resources.textures[material.maps.opacity]) {
                opacityMapId = material.maps.opacity;
            }
            materialAmbient = [material.ambientColor.r, material.ambientColor.g, material.ambientColor.b];
            materialDiffuse = [material.diffuseColor.r, material.diffuseColor.g, material.diffuseColor.b];
            materialSpecular = [material.specularColor.r, material.specularColor.g, material.specularColor.b, material.specularExponent];
        }

        gl_texture_bind_to_sampler(state.gl, state.resources.textures[diffuseMapId].glTexture, state.gl.TEXTURE0, state.gl.TEXTURE_2D, state.shaders.object.uniformLocations.diffuseMap);
        gl_texture_bind_to_sampler(state.gl, state.resources.textures[normalMapId].glTexture, state.gl.TEXTURE1, state.gl.TEXTURE_2D, state.shaders.object.uniformLocations.normalMap);
        gl_texture_bind_to_sampler(state.gl, state.resources.textures[specularMapId].glTexture, state.gl.TEXTURE2, state.gl.TEXTURE_2D, state.shaders.object.uniformLocations.specularMap);
        gl_texture_bind_to_sampler(state.gl, state.resources.textures[opacityMapId].glTexture, state.gl.TEXTURE3, state.gl.TEXTURE_2D, state.shaders.object.uniformLocations.opacityMap);
        state.gl.uniform3fv(state.shaders.object.uniformLocations.materialAmbient, materialAmbient);
        state.gl.uniform3fv(state.shaders.object.uniformLocations.materialDiffuse, materialDiffuse);
        state.gl.uniform4fv(state.shaders.object.uniformLocations.materialSpecular, materialSpecular);

        drawMesh(state.gl, state.resources.meshes[object.meshId]);
    }
}

function drawScene(gl, camera) {
}

function drawScreenQuad(gl, colorTexture, normalTexture, depthTexture, textureWidth, textureHeight) {
    gl.useProgram(state.shaders.screenQuad.program);
    gl_texture_bind_to_sampler(gl, colorTexture, gl.TEXTURE0, gl.TEXTURE_2D, state.shaders.screenQuad.uniformLocations.colorTexture);
    gl_texture_bind_to_sampler(gl, normalTexture, gl.TEXTURE1, gl.TEXTURE_2D, state.shaders.screenQuad.uniformLocations.normalTexture);
    gl_texture_bind_to_sampler(gl, depthTexture, gl.TEXTURE2, gl.TEXTURE_2D, state.shaders.screenQuad.uniformLocations.depthTexture);
    gl.uniform2fv(state.shaders.screenQuad.uniformLocations.textureSize, [textureWidth, textureHeight]);
    gl.drawArrays(gl.TRIANGLES, 0, gl.FLOAT, 0);
}

function draw(gl, camera) {
    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = state.framebuffer.width / state.framebuffer.height;
    mat4.perspective(state.camera.projectionMatrix, fieldOfView, aspect, state.camera.zNear, state.camera.zFar);

    mat4.lookAt(state.camera.viewMatrix, [0, 0, state.camera.dolly], [0, 0, 0], [0, 1, 0]);

    const yawRotation = mat4.create();
    const pitchRotation = mat4.create();
    const combinedRotation = mat4.create();
    
    mat4.fromYRotation(yawRotation, state.camera.yaw);
    mat4.fromXRotation(pitchRotation, state.camera.pitch);
    mat4.multiply(combinedRotation, pitchRotation, yawRotation);
    mat4.multiply(state.camera.viewMatrix, state.camera.viewMatrix, combinedRotation);

    const inverseViewMatrix = mat4.create();
    mat4.invert(inverseViewMatrix, state.camera.viewMatrix);
    camera.pos = [inverseViewMatrix[12], inverseViewMatrix[13], inverseViewMatrix[14]];
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, state.framebuffer.glFramebuffer);
    gl.viewport(0, 0, state.framebuffer.width, state.framebuffer.height);

    // ------------------

    // Clear main buffers
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Disable blend - we don't want object IDs at different depth blending - we only care about the top-level object.
    // Only providing output to first color attachment.
    gl.disable(state.gl.BLEND);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.NONE]);
    drawSceneObjectIds(gl, camera);

    // Re-enable blend.
    // Clear the color output from object IDs pass - we have what we needed. todo: use glClearBuffer?
    gl.enable(state.gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw scene geometry to all attachments.  
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    drawSceneGeometry(gl, camera);

    if (state.showGrid) {
        // Draw grid to main color attachment only
        gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.NONE]);
        drawGrid(gl, camera);
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawScreenQuad(gl, state.framebuffer.glColorAttachments[0], state.framebuffer.glColorAttachments[1], state.framebuffer.glDepthAttachment, state.framebuffer.width, state.framebuffer.height);

    window.requestAnimationFrame(function() {
        draw(gl, camera);
    });
}

function setSelectedMaterial(material) {
    state.scene.selectedObject = undefined;
    refreshObjectInspector(undefined);
    state.scene.selectedMaterial = material;
    refreshMaterialInspector(material);
}

function setSelectedObject(object) {
    state.scene.selectedMaterial = undefined;
    refreshMaterialInspector(undefined);
    state.scene.selectedObject = object;
    refreshObjectInspector(object);
}

const state = {
    gl: null,
    camera: {
        zNear: 0.01,
        zFar: 100.0,
        dolly: 10,
        yaw: -0.2,
        pitch: 0.4,
        pos: [0, 0, 0],
        projectionMatrix: null,
        viewMatrix: null,
    },
    shaders: {},
    resources: {},
    scene: {
        selectedObject: null,
        objects: []
    },
    showGrid: true
};

function init() {
    const canvas = document.getElementById("canvas");

    state.gl = canvas.getContext("webgl2", { antialias: true });
    
    window.addEventListener("resize", function() {
        state.gl.canvas.width = window.innerWidth;
        state.gl.canvas.height = window.innerHeight;
        state.framebuffer = gl_framebuffer_create(state.gl, state.gl.canvas.width, state.gl.canvas.height, 1, true);
    });

    canvas.addEventListener("wheel", function(event) {
        state.camera.dolly += event.deltaY * 0.01;
        state.camera.dolly = Math.min(Math.max(state.camera.dolly, 0.1), 100)
        event.stopPropagation();
    });
    
    canvas.addEventListener("mousemove", function(event) {
        if (event.buttons === 1) {
            console.log("dragging");
            state.camera.yaw += glMatrix.toRadian(event.movementX);
            state.camera.pitch -= glMatrix.toRadian(event.movementY);
        }
        state.lastMouseX = event.clientX;
        state.lastMouseY = event.clientY;
    });

    canvas.addEventListener("click", function() {
        setSelectedObject(state.scene.objects[state.objectUnderMouseIdx]);
    });

    const showImportPanelButton = document.getElementById("show-import-window-button");
    showImportPanelButton.addEventListener("click", showImportPanel);

    const cancelImportButton = document.getElementById("button_import-cancel");
    cancelImportButton.addEventListener("click", hideImportPanel);

    const confirmImportButton = document.getElementById("button_import-confirm");
    confirmImportButton.addEventListener("click", () => {
        hideImportPanel();

        const importFileSelect = document.getElementById("file-select_import");

        if (importFileSelect.files.length === 0)
            return;

        for (file of importFileSelect.files) {
            const reader = new FileReader();
            
            const ext = file.name.split('.').pop().toLowerCase();

            if (ext == "png" || ext == "jpg" || ext == "webp" || ext == "jpeg" || ext == "bmp") {
                reader.addEventListener('load', (function(file) {
                    return function(event) {
                        const result = event.target.result;
                        const texture = gl_texture_create_from_url(state.gl, result);
                        state.resources.textures[file.name] = texture;
                        refreshTextureList(state.resources.textures);
                    }
                })(file));
                
                reader.readAsDataURL(file);
            } else if(ext == "obj") {
                reader.addEventListener('load', (function(file) {
                    return function(event) {
                        const result = event.target.result;
                        const importOptions = {
                            transformTranslation: {
                                x: Number(document.getElementById("number_import-mesh-translation-x").value),
                                y: Number(document.getElementById("number_import-mesh-translation-y").value),
                                z: Number(document.getElementById("number_import-mesh-translation-z").value)
                            },
                            transformScale: {
                                x: Number(document.getElementById("number_import-mesh-scale-x").value),
                                y: Number(document.getElementById("number_import-mesh-scale-y").value),
                                z: Number(document.getElementById("number_import-mesh-scale-z").value)
                            },
                            combineMeshes: false,
                            generateNormals: false
                        };
                        import_obj(state.gl, result, importOptions).then((data) => {
                            Object.assign(state.resources.meshes, data.meshes);
                            refreshMeshList(state.resources.meshes);
                            state.scene.objects = data.objects;
                            refreshObjectList(state.scene.objects);
                            setSelectedObject();
                        });
                    }
                })(file));
                
                reader.readAsText(file);
            } else if(ext == "mtl") {
                reader.addEventListener('load', (function(file) {
                    return function(event) {
                        const result = event.target.result;
                        import_mtl(result).then((materials) => {
                            Object.assign(state.resources.materials, materials);
                            refreshMaterialList(state.resources.materials);
                            setSelectedMaterial();
                        });
                    }
                })(file));
                
                reader.readAsText(file);
            } else {
                console.warn(`Filetype '${ext}' not support.`);
            }
        }
    });

    const showGridCheckbox = document.getElementById("checkbox_show-grid");
    showGridCheckbox.addEventListener("change", function(event) {
        state.showGrid = event.target.checked;
    });

    const selectedMaterialDiffuseMapSelect = document.getElementById("select_selected-material-map-diffuse");
    selectedMaterialDiffuseMapSelect.addEventListener("change", function(event) {
        state.scene.selectedMaterial.maps.diffuse = event.target.value;
    });

    const selectedMaterialNormalMapSelect = document.getElementById("select_selected-material-map-normal");
    selectedMaterialNormalMapSelect.addEventListener("change", function(event) {
        state.scene.selectedMaterial.maps.normal = event.target.value;
    });

    const selectedMaterialSpecularMapSelect = document.getElementById("select_selected-material-map-specular");
    selectedMaterialSpecularMapSelect.addEventListener("change", function(event) {
        state.scene.selectedMaterial.maps.specularHighlights = event.target.value;
    });

    const selectedMaterialOpacityMapSelect = document.getElementById("select_selected-material-map-opacity");
    selectedMaterialOpacityMapSelect.addEventListener("change", function(event) {
        state.scene.selectedMaterial.maps.opacity = event.target.value;
    });

    const selectedObjectMeshSelect = document.getElementById("select_selected-object-mesh");
    selectedObjectMeshSelect.addEventListener("change", function(event) {
        state.scene.selectedObject.meshId = event.target.value;
    });

    const selectedObjectMaterialSelect = document.getElementById("select_selected-object-material");
    selectedObjectMaterialSelect.addEventListener("change", function(event) {
        state.scene.selectedObject.materialId = event.target.value;
    });
    
    if (state.gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }
    
    state.gl.canvas.width = window.innerWidth;
    state.gl.canvas.height = window.innerHeight;
    state.gl.pixelStorei(state.gl.UNPACK_FLIP_Y_WEBGL, true);
    state.gl.enable(state.gl.CULL_FACE);
    state.gl.enable(state.gl.DEPTH_TEST);
    state.gl.depthFunc(state.gl.LEQUAL);
    state.gl.enable(state.gl.BLEND);
    state.gl.blendFuncSeparate(state.gl.SRC_ALPHA, state.gl.ONE_MINUS_SRC_ALPHA, state.gl.ONE, state.gl.ONE);
    state.gl.clearColor(0.1, 0.1, 0.125, 1.0);
    state.gl.clearDepth(1.0);

    let gridShaderProgram = createShaderProgram(state.gl, shader_source.grid_vertex, shader_source.grid_fragment);
    if (!gridShaderProgram)
        return;

    state.shaders.grid = {
        program: gridShaderProgram,
        uniformLocations: {
            projectionMatrix: state.gl.getUniformLocation(gridShaderProgram, "uProjectionMatrix"),
            viewMatrix: state.gl.getUniformLocation(gridShaderProgram, "uViewMatrix")
        },
    }

    let objectIdShaderProgram = createShaderProgram(state.gl, shader_source.objectid_vertex, shader_source.objectid_fragment);
    if (!objectIdShaderProgram)
        return;

    state.shaders.objectId = {
        program: objectIdShaderProgram,
        uniformLocations: {
            projectionMatrix: state.gl.getUniformLocation(objectIdShaderProgram, "uProjectionMatrix"),
            viewMatrix: state.gl.getUniformLocation(objectIdShaderProgram, "uViewMatrix"),
            modelMatrix: state.gl.getUniformLocation(objectIdShaderProgram, "uModelMatrix"),
            objectId: state.gl.getUniformLocation(objectIdShaderProgram, "uObjectId")
        }
    };

    let objectShaderProgram = createShaderProgram(state.gl, shader_source.object_vertex, shader_source.object_fragment);
    if (!objectShaderProgram)
        return;

    state.shaders.object = {
        program: objectShaderProgram,
        uniformLocations: {
            projectionMatrix: state.gl.getUniformLocation(objectShaderProgram, "u_projectionMatrix"),
            viewMatrix: state.gl.getUniformLocation(objectShaderProgram, "u_viewMatrix"),
            modelMatrix: state.gl.getUniformLocation(objectShaderProgram, "u_modelMatrix"),
            diffuseMap: state.gl.getUniformLocation(objectShaderProgram, "u_diffuseMap"),
            normalMap: state.gl.getUniformLocation(objectShaderProgram, "u_normalMap"),
            specularMap: state.gl.getUniformLocation(objectShaderProgram, "u_specularMap"),
            opacityMap: state.gl.getUniformLocation(objectShaderProgram, "u_opacityMap"),
            materialAmbient: state.gl.getUniformLocation(objectShaderProgram, "u_materialAmbient"),
            materialDiffuse: state.gl.getUniformLocation(objectShaderProgram, "u_materialDiffuse"),
            materialSpecular: state.gl.getUniformLocation(objectShaderProgram, "u_materialSpecular"),
            viewPos: state.gl.getUniformLocation(objectShaderProgram, "u_viewPosition"),
            lightDir: state.gl.getUniformLocation(objectShaderProgram, "u_lightDirection"),
        },
    }

    let screenQuadShaderProgram = createShaderProgram(state.gl, shader_source.screenquad_vertex, shader_source.screenquad_fragment);
    if (!screenQuadShaderProgram)
        return;

    state.shaders.screenQuad = {
        program: screenQuadShaderProgram,
        uniformLocations: {
            colorTexture: state.gl.getUniformLocation(screenQuadShaderProgram, "u_colorTexture"),
            normalTexture: state.gl.getUniformLocation(screenQuadShaderProgram, "u_normalTexture"),
            depthTexture: state.gl.getUniformLocation(screenQuadShaderProgram, "u_depthTexture"),
            textureSize: state.gl.getUniformLocation(screenQuadShaderProgram, "u_textureSize"),
            outlineRadius: state.gl.getUniformLocation(screenQuadShaderProgram, "u_outlineRadius")
        }
    };

    state.framebuffer = gl_framebuffer_create(state.gl, state.gl.canvas.width, state.gl.canvas.height, 2, true);

    state.resources.textures = {};
    state.resources.materials = {};
    state.resources.meshes = {};

    state.resources.textures["default.png"] = gl_texture_create_from_url(state.gl, "default.png");

    state.resources.meshes["plane"] = createMesh_Plane(state.gl);
    state.resources.meshes["cube"] = createMesh_Box(state.gl);
    
    state.scene.objects.push({
        id: "cube",
        transform: mat4.identity(mat4.create()),
        meshId: "cube"
    });


    hideImportPanel();
    setSelectedObject(state.selectedObject);
    refreshTextureList(state.resources.textures);
    refreshMaterialList(state.resources.materials);
    refreshMeshList(state.resources.meshes);
    refreshObjectList(state.scene.objects);

    state.camera.projectionMatrix = mat4.create();
    state.camera.viewMatrix = mat4.create();

    draw(state.gl, state.camera);
}

document.addEventListener("DOMContentLoaded", init);