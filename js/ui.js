function showImportPanel() {
    const importFileSelect = document.getElementById("file-select_import");
    importFileSelect.value = null;

    const importMeshPosX = document.getElementById("number_import-mesh-translation-x");
    const importMeshPosY = document.getElementById("number_import-mesh-translation-y");
    const importMeshPosZ = document.getElementById("number_import-mesh-translation-z");

    const importMeshSclX = document.getElementById("number_import-mesh-scale-x");
    const importMeshSclY = document.getElementById("number_import-mesh-scale-y");
    const importMeshSclZ = document.getElementById("number_import-mesh-scale-z");

    importMeshPosX.value = importMeshPosY.value = importMeshPosZ.value = 0;

    importMeshSclX.value = importMeshSclY.value = importMeshSclZ.value = 1;

    const importPanel = document.getElementById("import-window");
    importPanel.hidden = false;
}

function hideImportPanel() {
    const importPanel = document.getElementById("import-window");
    importPanel.hidden = true;
}

function refreshTextureList(textures) {
    const selectedMaterialDiffuseMapSelect = document.getElementById("select_selected-material-map-diffuse");
    const selectedMaterialNormalMapSelect = document.getElementById("select_selected-material-map-normal");
    const selectedMaterialSpecularMapSelect = document.getElementById("select_selected-material-map-specular");
    const selectedMaterialOpacityMapSelect = document.getElementById("select_selected-material-map-opacity");

    selectedMaterialDiffuseMapSelect.innerHTML = "";
    selectedMaterialNormalMapSelect.innerHTML = "";
    selectedMaterialSpecularMapSelect.innerHTML = "";
    selectedMaterialOpacityMapSelect.innerHTML = "";

    const newTextureOption = document.createElement("option");
    newTextureOption.value = "";
    newTextureOption.appendChild(document.createTextNode("none"));
    selectedMaterialDiffuseMapSelect.appendChild(newTextureOption);
    selectedMaterialNormalMapSelect.appendChild(newTextureOption.cloneNode(true));
    selectedMaterialSpecularMapSelect.appendChild(newTextureOption.cloneNode(true));
    selectedMaterialOpacityMapSelect.appendChild(newTextureOption.cloneNode(true));

    for (textureId in textures) {
        const newTextureOption = document.createElement("option");
        newTextureOption.value = textureId;
        newTextureOption.appendChild(document.createTextNode(textureId));
        selectedMaterialDiffuseMapSelect.appendChild(newTextureOption);
        selectedMaterialNormalMapSelect.appendChild(newTextureOption.cloneNode(true));
        selectedMaterialSpecularMapSelect.appendChild(newTextureOption.cloneNode(true));
        selectedMaterialOpacityMapSelect.appendChild(newTextureOption.cloneNode(true));
    }
}

function refreshMeshList(meshes) {
    const selectedObjectMeshSelect = document.getElementById("select_selected-object-mesh");
    selectedObjectMeshSelect.innerHTML = "";

    const newMeshOption = document.createElement("option");
    newMeshOption.value = "";
    newMeshOption.appendChild(document.createTextNode("none"));
    selectedObjectMeshSelect.appendChild(newMeshOption);

    for (meshId in meshes) {
        const newMeshOption = document.createElement("option");
        newMeshOption.value = meshId;
        newMeshOption.appendChild(document.createTextNode(meshId));
        selectedObjectMeshSelect.appendChild(newMeshOption);
    }
}

function refreshMaterialList(materials) {
    const materialsList = document.getElementById("material-list");
    materialsList.innerHTML = "";
    
    const selectedObjectMaterialSelect = document.getElementById("select_selected-object-material");
    const newMaterialOption = document.createElement("option");
    newMaterialOption.value = "";
    newMaterialOption.appendChild(document.createTextNode("none"));
    selectedObjectMaterialSelect.appendChild(newMaterialOption);

    for (let materialId in materials) {
        const newListItem = document.createElement("li");
        newListItem.appendChild(document.createTextNode(materialId));
        newListItem.addEventListener("click", function() {
            setSelectedMaterial(state.resources.materials[materialId]);
        });
        materialsList.appendChild(newListItem);
        
        const newMaterialOption = document.createElement("option");
        newMaterialOption.value = materialId;
        newMaterialOption.appendChild(document.createTextNode(materialId));
        selectedObjectMaterialSelect.appendChild(newMaterialOption);
    }
}

function refreshObjectList(objects) {
    const objectList = document.getElementById("object-list");
    objectList.innerHTML = "";

    for (let object of objects) {
        const newListItem = document.createElement("li");
        newListItem.appendChild(document.createTextNode(object.id));
        newListItem.addEventListener("click", function() {
            setSelectedObject(object);
        });
        objectList.appendChild(newListItem);
    }
}

function setInspectorPanelVisibility(isVisible) {
    const inspectorPanel = document.getElementById("inspector-panel");
    inspectorPanel.hidden = !isVisible;
}

function refreshMaterialInspector(material) {
    const materialInspector = document.getElementById("material-inspector");

    if (!material) {
        materialInspector.hidden = true;
        setInspectorPanelVisibility(false);
        return;
    }
    materialInspector.hidden = false;
    setInspectorPanelVisibility(true);
    
    const ambientR = document.getElementById("number_selected-material-color-ambient-r");
    const ambientG = document.getElementById("number_selected-material-color-ambient-g");
    const ambientB = document.getElementById("number_selected-material-color-ambient-b");

    const diffuseR = document.getElementById("number_selected-material-color-diffuse-r");
    const diffuseG = document.getElementById("number_selected-material-color-diffuse-g");
    const diffuseB = document.getElementById("number_selected-material-color-diffuse-b");

    const specularR = document.getElementById("number_selected-material-color-specular-r");
    const specularG = document.getElementById("number_selected-material-color-specular-g");
    const specularB = document.getElementById("number_selected-material-color-specular-b");
    
    const specularExponent = document.getElementById("number_selected-material-specular-exponent");
    
    const diffuseMap = document.getElementById("select_selected-material-map-diffuse");
    const normalMap = document.getElementById("select_selected-material-map-normal");
    const specularMap = document.getElementById("select_selected-material-map-specular");
    const opacityMap = document.getElementById("select_selected-material-map-opacity");

    ambientR.value = material.ambientColor.r;
    ambientG.value = material.ambientColor.g;
    ambientB.value = material.ambientColor.b;

    diffuseR.value = material.diffuseColor.r;
    diffuseG.value = material.diffuseColor.g;
    diffuseB.value = material.diffuseColor.b;

    specularR.value = material.specularColor.r;
    specularG.value = material.specularColor.g;
    specularB.value = material.specularColor.b;
    
    specularExponent.value = material.specularExponent;

    diffuseMap.value = (material.maps.diffuse) ? material.maps.diffuse : "";
    normalMap.value = (material.maps.normal) ? material.maps.normal : "";
    specularMap.value = (material.maps.specularHighlights) ? material.maps.specularHighlights : "";
    opacityMap.value = (material.maps.opacity) ? material.maps.opacity : "";
}

function refreshObjectInspector(object) {
    const objectInspector = document.getElementById("object-inspector");

    if (!object) {
        objectInspector.hidden = true;
        setInspectorPanelVisibility(false);
        return;
    }
    objectInspector.hidden = false;
    setInspectorPanelVisibility(true);

    const selectedObjectMeshSelect = document.getElementById("select_selected-object-mesh");

    const selectedObjectMaterialSelect = document.getElementById("select_selected-object-material");

    const posx = document.getElementById("number_selected-object-position-x");
    const posy = document.getElementById("number_selected-object-position-y");
    const posz = document.getElementById("number_selected-object-position-z");

    const rotx = document.getElementById("number_selected-object-rotation-x");
    const roty = document.getElementById("number_selected-object-rotation-y");
    const rotz = document.getElementById("number_selected-object-rotation-z");

    const sclx = document.getElementById("number_selected-object-scale-x");
    const scly = document.getElementById("number_selected-object-scale-y");
    const sclz = document.getElementById("number_selected-object-scale-z");
    
    selectedObjectMeshSelect.value = (object.meshId) ? object.meshId : "";

    selectedObjectMaterialSelect.value = (object.materialId) ? object.materialId : "";
    
    posx.value = 0;
    posy.value = 0;
    posz.value = 0;

    rotx.value = 0;
    roty.value = 0;
    rotz.value = 0;

    sclx.value = 1;
    scly.value = 1;
    sclz.value = 1;
}