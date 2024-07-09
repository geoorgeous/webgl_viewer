function gl_shader_create(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function gl_buffer_create(gl, bufferTarget, bufferData) {
    let newBuffer = {
        glBuffer: gl.createBuffer(),
        length: bufferData.length
    };
    
    gl.bindBuffer(bufferTarget, newBuffer.glBuffer);
    gl.bufferData(bufferTarget, bufferData, gl.STATIC_DRAW);

    return newBuffer;
}

function gl_texture_create_from_url(gl, imageSrc) {
    const texture = {
        glTexture: gl.createTexture(),
        width: 1,
        height: 1
    }

    gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);

    // temporary 1x1 texture until async image load is done
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([128, 128, 128, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    };
    image.src = imageSrc;

    return texture;
}

function gl_texture_bind_to_sampler(gl, texture, textureUnit, textureType, uniformLocation) {
    gl.activeTexture(textureUnit);
    gl.bindTexture(textureType, texture);
    gl.uniform1i(uniformLocation, textureUnit - gl.TEXTURE0);
}

function gl_framebuffer_create(gl, width, height, numColorAttachments, hasDepthAttachment) {
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    
    const result = {
        glFramebuffer: framebuffer,
        glColorAttachments: [],
        glDepthAttachment: undefined,
        width: width,
        height: height
    }

    const colorAttachments = [];

    for (let idx = 0; idx < numColorAttachments; ++idx) {
        result.glColorAttachments[idx] = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, result.glColorAttachments[idx]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + idx, gl.TEXTURE_2D, result.glColorAttachments[idx], 0);
        colorAttachments.push(gl.COLOR_ATTACHMENT0 + idx);
    }

    if (hasDepthAttachment) {
        result.glDepthAttachment = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, result.glDepthAttachment);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, result.glDepthAttachment, 0);
    }

    return result;
}

function createMesh(gl, vertexBufferData, indexBufferData) {
    var mesh = {
        vertexBuffer: gl_buffer_create(gl, gl.ARRAY_BUFFER, new Float32Array(vertexBufferData)),
        indexBuffer: gl_buffer_create(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indexBufferData))
    };

    return mesh;
}

function drawMesh(gl, mesh) {
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer.glBuffer);

    const stride = (3 + 3 + 2) * 4;
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0 * 4);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 3 * 4);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, stride, 6 * 4);

    if (mesh.indexBuffer.length == 0)
    {
        gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexBuffer.length / 8);
    }
    else
    {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer.glBuffer);
        gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.length, gl.UNSIGNED_INT, 0);
    }
}

function createShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = gl_shader_create(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = gl_shader_create(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader)
        return null;

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
        return null;
    }
    return shaderProgram;
}