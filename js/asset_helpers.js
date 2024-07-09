function createMesh_Plane(gl, sizeX, sizeY) {
    if (!sizeX) sizeX = 1.0;
    if (!sizeY) sizeY = sizeX;

    const hsx = sizeX * 0.5;
    const hsy = sizeY * 0.5;

    const vertexBufferData = [
         hsx,  hsy, 0,    0, 0, 1,    1, 1,
        -hsx,  hsy, 0,    0, 0, 1,    0, 1,
         hsx, -hsy, 0,    0, 0, 1,    1, 0,
        -hsx, -hsy, 0,    0, 0, 1,    0, 0,
    ];

    const indexBufferData = [
        0, 1, 2,
        2, 1, 3
    ];

    return createMesh(gl, vertexBufferData, indexBufferData);
}

function createMesh_Box(gl, sizeX, sizeY, sizeZ) {
    if (!sizeX) sizeX = 1.0;
    if (!sizeY) sizeY = sizeX;
    if (!sizeZ) sizeZ = sizeX;

    const hsx = sizeX * 0.5;
    const hsy = sizeY * 0.5;
    const hsz = sizeZ * 0.5;

    const vertexBufferData = [
         hsx,  hsy,  hsz,   1,  0,  0,  0, 1,
         hsx, -hsy,  hsz,   1,  0,  0,  0, 0,
         hsx,  hsy, -hsz,   1,  0,  0,  1, 1,
         hsx, -hsy, -hsz,   1,  0,  0,  1, 0,

        -hsx,  hsy, -hsz,  -1,  0,  0,  0, 1,
        -hsx, -hsy, -hsz,  -1,  0,  0,  0, 0,
        -hsx,  hsy,  hsz,  -1,  0,  0,  1, 1,
        -hsx, -hsy,  hsz,  -1,  0,  0,  1, 0,

         hsx,  hsy,  hsz,   0,  1,  0,  1, 0,
         hsx,  hsy, -hsz,   0,  1,  0,  1, 1,
        -hsx,  hsy,  hsz,   0,  1,  0,  0, 0,
        -hsx,  hsy, -hsz,   0,  1,  0,  0, 1,

        -hsx, -hsy,  hsz,   0, -1,  0,  0, 1,
        -hsx, -hsy, -hsz,   0, -1,  0,  0, 0,
         hsx, -hsy,  hsz,   0, -1,  0,  1, 1,
         hsx, -hsy, -hsz,   0, -1,  0,  1, 0,

         hsx,  hsy,  hsz,   0,  0,  1,  1, 1,
        -hsx,  hsy,  hsz,   0,  0,  1,  0, 1,
         hsx, -hsy,  hsz,   0,  0,  1,  1, 0,
        -hsx, -hsy,  hsz,   0,  0,  1,  0, 0,

         hsx, -hsy, -hsz,   0,  0, -1,  0, 0,
        -hsx, -hsy, -hsz,   0,  0, -1,  1, 0,
         hsx,  hsy, -hsz,   0,  0, -1,  0, 1,
        -hsx,  hsy, -hsz,   0,  0, -1,  1, 1,
    ];

    const indexBufferData = [
        0,  1,  2,
        2,  1,  3,
        4,  5,  6,
        6,  5,  7,
        8,  9,  10,
        10, 9,  11,
        12, 13, 14,
        14, 13, 15,
        16, 17, 18,
        18, 17, 19,
        20, 21, 22,
        22, 21, 23
    ];

    return createMesh(gl, vertexBufferData, indexBufferData);
}

function getFilenameFromPath(filepath) {
    return filepath.replace(/^.*[\\/]/, '');
}

async function import_mtl(mtlBuffer) {
    const materials = {};

    let material = {};
    
    const lines = mtlBuffer.split('\n');
    for (const line of lines) {
        const sanitisedLine = line.replace(/(\r\n|\n|\r)/gm, "").trim();
        const words = sanitisedLine.split(/\s+/);

        if (words.length === 0)
            continue;

        const id = words[0];
        if (id == "newmtl") {
            if (material.name) {
                materials[material.name] = material;
            }
            material = {};
            material.name = words[1];
            material.model = 2;
            material.ambientColor = { r: 0, g: 0, b: 0 };
            material.diffuseColor = { r: 0, g: 0, b: 0 };
            material.specularColor = { r: 0, g: 0, b: 0 };
            material.specularExponent = 1;
            material.maps = {};
        } else if (id == "illum") {
            material.model = Number(words[1]);
        } else if (id == "Ka") {
            material.ambientColor = {
                r: Number(words[1]),
                g: Number(words[2]),
                b: Number(words[3])
            };
        } else if (id == "Kd") {
            material.diffuseColor = {
                r: Number(words[1]),
                g: Number(words[2]),
                b: Number(words[3])
            };
        } else if (id == "Ks") {
            material.specularColor = {
                r: Number(words[1]),
                g: Number(words[2]),
                b: Number(words[3])
            };
        } else if (id == "Ns") {
            material.specularExponent = Number(words[1]);
        } else if (id == "d") {
            material.opacity = Number(words[1]);
        } else if (id == "Tr") {
            material.opacity = 1.0 - Number(words[1]);
        } else if (id == "Ni") {
            material.refractionIndex = Number(words[1]);
        } else if (id == "map_Ka") {
            material.maps.ambient = getFilenameFromPath(words[1]);
        } else if (id == "map_Kd") {
            material.maps.diffuse = getFilenameFromPath(words[1]);
        } else if (id == "map_Ks") {
            material.maps.specularColor = getFilenameFromPath(words[1]);
        } else if (id == "map_Ns") {
            material.maps.specularHighlights = getFilenameFromPath(words[1]);
        } else if (id == "map_d") {
            material.maps.opacity = getFilenameFromPath(words[1]);
        } else if (id == "map_bump" || id == "bump") {
            material.maps.normal = getFilenameFromPath(words[1]);
        }
    }

    if (material.name)
        materials[material.name] = material;

    return materials;
}

async function import_obj(gl, objBuffer, importOptions) {
    if (!importOptions)
        importOptions = {
            combineMeshes: true,
            generateNormals: false
        };

    if (!importOptions.transformTranslation)
        importOptions.transformTranslation = { x: 0, y: 0, z: 0 };
    if (!importOptions.transformScale)
        importOptions.transformScale = { x: 1, y: 1, z: 1 };

    const objPositions = [];
    const objNormals = [];
    const objTextureCoordinates = [];
    const meshData = {};

    let meshGroupId = "";

    const lines = objBuffer.split('\n');
    for (const line of lines) {
        const sanitisedLine = line.replace(/(\r\n|\n|\r)/gm, "").trim();
        const words = sanitisedLine.split(/\s+/);

        if (words.length=== 0)
            continue;

        const id = words[0];
        if (id == "o" || id == "g" && !importOptions.combineMeshes) {
            meshGroupId = words[1];

            if (meshData[meshGroupId] == undefined) {
                meshData[meshGroupId] = {
                    existingVertices: new Map(),
                    vertexBufferData: [],
                    indexBufferData: [],
                    numElements: 0
                }
            }
        } else if (id == "usemtl") {
            if (meshData[meshGroupId] == undefined) {
                meshGroupId = `mesh_${Object.keys(meshData).length}`;
                meshData[meshGroupId] = {
                    existingVertices: new Map(),
                    vertexBufferData: [],
                    indexBufferData: [],
                    numElements: 0
                }
            }
            meshData[meshGroupId].materialId = words[1];
        } else if (id == "v") {
            objPositions.push({
                x: Number(words[1]),
                y: Number(words[2]),
                z: Number(words[3])});
        } else if (id == "vn") {
            objNormals.push({
                x: Number(words[1]),
                y: Number(words[2]),
                z: Number(words[3])});
        } else if (id == "vt") {
            objTextureCoordinates.push({
                x: Number(words[1]),
                y: Number(words[2])});
        } else if (id == "f") {
            function processFace(faceIndices) {
                for (let idx = 0; idx < 3; ++idx) {
                    const faceVertexIndices = faceIndices[idx];

                    if (meshData[meshGroupId].existingVertices.has(faceVertexIndices)) {
                       meshData[meshGroupId].indexBufferData.push(meshData[meshGroupId].existingVertices.get(faceVertexIndices));
                    } else {
                        const vertexIndices = faceVertexIndices.split('/');

                        let vposIdx = Number(vertexIndices[0]);
                        vposIdx = (vposIdx < 0) ? vposIdx + objPositions.length : vposIdx - 1;
                        const pos = objPositions[vposIdx];

                        let nor;
                        if (vertexIndices[2]) {
                            let vnorIdx = Number(vertexIndices[2]);
                            vnorIdx = (vnorIdx < 0) ? vnorIdx + objNormals.length : vnorIdx - 1;
                            nor = objNormals[vnorIdx];
                        } else {
                            nor = { x:0, y:0, z:0 };
                        }
                        
                        let tex;
                        if (vertexIndices[1]) {
                            let vtexIdx = Number(vertexIndices[1]);
                            vtexIdx = (vtexIdx < 0) ? vtexIdx + objTextureCoordinates.length : vtexIdx - 1;
                            tex = objTextureCoordinates[vtexIdx];
                        } else {
                            tex = { x:0, y:0 };
                        }
                        
                        meshData[meshGroupId].vertexBufferData.push(
                            (pos.x + importOptions.transformTranslation.x) * importOptions.transformScale.x,
                            (pos.y + importOptions.transformTranslation.y) * importOptions.transformScale.y,
                            (pos.z + importOptions.transformTranslation.z) * importOptions.transformScale.z,
                            nor.x, nor.y, nor.z, tex.x, tex.y);
                        meshData[meshGroupId].indexBufferData.push(meshData[meshGroupId].numElements);

                        meshData[meshGroupId].existingVertices.set(faceVertexIndices, meshData[meshGroupId].numElements++);
                    }
                }
                
                if (importOptions.generateNormals || objNormals.length == 0)
                {
                    const vertexBufferData = meshData[meshGroupId].vertexBufferData;
                    const indexBufferData = meshData[meshGroupId].indexBufferData;

                    let aIdx = indexBufferData[indexBufferData.length - 3] * 8;
                    let bIdx = indexBufferData[indexBufferData.length - 2] * 8;
                    let cIdx = indexBufferData[indexBufferData.length - 1] * 8;
                    let a = gvec3.create(vertexBufferData[aIdx], vertexBufferData[aIdx + 1], vertexBufferData[aIdx + 2]);
                    let b = gvec3.create(vertexBufferData[bIdx], vertexBufferData[bIdx + 1], vertexBufferData[bIdx + 2]);
                    let c = gvec3.create(vertexBufferData[cIdx], vertexBufferData[cIdx + 1], vertexBufferData[cIdx + 2]);

                    let bSubA = gvec3.subtract(b, a);
                    let cSubA = gvec3.subtract(c, a);
                    let normal = gvec3.normalise(gvec3.cross(bSubA, cSubA));
                    
                    vertexBufferData[aIdx + 3] = vertexBufferData[bIdx + 3] = vertexBufferData[cIdx + 3] = normal.x;
                    vertexBufferData[aIdx + 4] = vertexBufferData[bIdx + 4] = vertexBufferData[cIdx + 4] = normal.y;
                    vertexBufferData[aIdx + 5] = vertexBufferData[bIdx + 5] = vertexBufferData[cIdx + 5] = normal.z;
                }
            }

            processFace([words[1], words[2], words[3]]);
            if (words.length >= 5) {
                processFace([words[1], words[3], words[4]]);
            }
        }
    }

    const result = {
        meshes: {},
        objects: []
    }

    for (let meshId in meshData) {
        result.meshes[meshId] = createMesh(gl, meshData[meshId].vertexBufferData, meshData[meshId].indexBufferData);
        result.objects.push({
            id: meshId,
            transform: mat4.create(),
            meshId: meshId,
            materialId: meshData[meshId].materialId
        });
    }

    return result;
}