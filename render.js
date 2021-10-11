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

function init() {
    console.log("INITIALIZING");

    if ('URLSearchParams' in window) {
        let searchParams = new URLSearchParams(window.location.search);
        title = searchParams.get('scene');
        document.title = title;
        console.log(title);
    }

    for (let i = 0; i < scenes[title].collisionBoxes.length; i++) {
        let cb = scenes[title].collisionBoxes[i];
        if (cb.spriteSheet) {
            cb.spriteSheet.src = cb.spriteSheetSource;
        }
    }

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

    for (let i = 0; i < scenes[title].collisionBoxes.length; i++) {
        let cb = scenes[title].collisionBoxes[i];
        if (cb.spriteSheet) {
            cb.spriteSheet.src = cb.spriteSheetSource;
        }
    }

    image = new Image();
    image.src = scenes[title].imageSource;
    image.onload = draw;
    imageW = image.width;
    imageH = image.height;

    window.addEventListener('click', onMouseClick);
    window.addEventListener('mousemove', onMouseMove);

    console.log("RELOADING FINISHED");
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

    let newH = (imageH * (canvasW / imageW))
    let difference = newH - canvasH;
    ctx.drawImage(image, 0, -difference / 2, canvasW, newH);

    /*ctx.fillStyle = "#FF0000";
    for (let i = 0; i < scenes[title].collisionBoxes.length; i++) {
        let cb = scenes[title].collisionBoxes[i];
        ctx.fillRect(canvasW * cb.x, newH * cb.y - difference / 2,
            canvasW * cb.w, newH * cb.h);
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
            playExitAnimation(cb).then(() => reload(cb));
        }
    }
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