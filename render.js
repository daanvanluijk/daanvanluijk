let title = document.title;
console.log(title);
let canvas;
let ctx;
let canvasW;
let canvasH;
let image;
let imageW;
let imageH;
let mouseX;
let mouseY;
let spriteW = 640;
let spriteH = 480;
let previousScene;

function init() {
    console.log("INITIALIZING");

    if ('URLSearchParams' in window) {
        let searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('scene')) {
            title = searchParams.get('scene');
            document.title = title;
            console.log(title);
        }
    }

    setSpriteSheetSources();

    image = new Image();
    image.src = scenes[title].imageSource;
    image.onload = draw;
    imageW = image.width;
    imageH = image.height;
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext('2d');

    window.addEventListener('click', onMouseClick);
    window.addEventListener('mousemove', onMouseMove);

    console.log(canvas);
    console.log(ctx);
    console.log("INITIALIZING FINISHED");
}

function reload(cb) {
    console.log("RELOADING");

    document.title = cb.target;
    title = cb.target;

    if ('URLSearchParams' in window) {
        let searchParams = new URLSearchParams(window.location.search);
        searchParams.set("scene", title);
        let newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
        history.pushState(null, '', newRelativePathQuery);
    }

    setSpriteSheetSources();

    image = new Image();
    image.src = scenes[title].imageSource;
    image.onload = draw;
    imageW = image.width;
    imageH = image.height;

    window.addEventListener('click', onMouseClick);
    window.addEventListener('mousemove', onMouseMove);

    console.log("RELOADING FINISHED");
}

function setSpriteSheetSources() {
    for (let i = 0; i < scenes[title].collisionBoxes.length; i++) {
        let cb = scenes[title].collisionBoxes[i];
        if (cb.spriteSheet) {
            cb.spriteSheet.src = cb.spriteSheetSource;
        }
    }
}

function draw() {
    console.log("DRAWING");

    //image.onload = null;
    imageW = image.width;
    imageH = image.height;

    console.log("image size: " + imageW + ", " + imageH);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasW = canvas.width;
    canvasH = canvas.height;

    let newW = canvasW;
    let newH = canvasH;
    if (imageH * (canvasW / imageW) < canvasH) {
        newH = (imageH * (canvasW / imageW));
    } else {
        newW = (imageW * (canvasH / imageH));
    }

    let wDifference = newW - canvasW;
    let hDifference = newH - canvasH;
    ctx.drawImage(image, -wDifference / 2, -hDifference / 2, newW, newH);

    /*ctx.fillStyle = "#FF0000";
    for (let i = 0; i < scenes[title].collisionBoxes.length; i++) {
        let cb = scenes[title].collisionBoxes[i];
        ctx.fillRect(newW * cb.x - wDifference / 2, newH * cb.y - hDifference / 2,
            newW * cb.w, newH * cb.h);
    }*/
}

function onMouseClick() {
    window.removeEventListener('click', onMouseClick);
    window.removeEventListener('mousemove', onMouseMove);
    canvas.style.cursor = 'default';

    let newH = (imageH * (canvasW / imageW))
    let difference = newH - canvasH;
    for (let i = 0; i < scenes[title].collisionBoxes.length; i++) {
        let cb = scenes[title].collisionBoxes[i];
        if (checkCollision(cb)) {
            if (cb.targetType !== 'book') {
                playExitAnimation(cb).then(() => reload(cb));
            } else {
                goToBook('bookFarFromGate');
            }
        }
    }
}

function goToBook(name) {
    previousScene = title;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
    document.body.style.height = '100vh';
    window.removeEventListener('resize', draw);
    document.getElementById("content").innerHTML =
        '<iframe src="bookFarFromGate.html" width="100%" height="100%"><\/iframe>';
    document.getElementById("content").style.width = '100%';
    document.getElementById("content").style.height = '100%';
    //document.getElementById("content").document.getElementById("backButton").onclick = leaveBook;

    console.log(document.getElementById("content"));
    console.log('content finished loading');
}

function leaveBook() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasW = canvas.width;
    canvasH = canvas.height;
    document.getElementById("content").innerHTML = "";
    reload()
}

async function playExitAnimation(cb) {
    let newH = (imageH * (canvasW / imageW))
    let difference = newH - canvasH;
    if (cb.spriteSheet) {
        for (let i = 0; i < cb.spriteAmount; i++) {
            ctx.drawImage(cb.spriteSheet, i * spriteW, 0, spriteW, spriteH, 0, -difference / 2, canvasW, newH);
            await sleep(83);
            console.log(i * spriteW);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function onMouseMove() {
    for (let i = 0; i < scenes[title].collisionBoxes.length; i++) {
        let cb = scenes[title].collisionBoxes[i];
        if (checkCollision(cb)) {
            canvas.style.cursor = 'pointer';
            return;
        }
    }
    canvas.style.cursor = 'default';
}

function checkCollision(cb) {
    let newH = (imageH * (canvasW / imageW))
    let difference = newH - canvasH;
    return (mouseX > canvasW * cb.x && mouseX < canvasW * cb.x + canvasW * cb.w
        && mouseY > newH * cb.y - difference / 2 && mouseY < (newH * cb.y - difference / 2) + newH * cb.h)
}

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});
window.addEventListener('resize', draw);

init();