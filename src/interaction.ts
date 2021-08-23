import { mouse, raycaster, render, scene, ccamera } from "./app";

const raycast = (event: any, mousex?: number, mousey?: number) => {
    const touchlist = event.changedTouches;

    // can be simplified
    if (touchlist) {
        mouse.x = mousex || (touchlist[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = mousey || -(touchlist[0].clientY / window.innerHeight) * 2 + 1;
    } else {
        mouse.x = mousex || (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = mousey || -(event.clientY / window.innerHeight) * 2 + 1;
    }

    render();
    raycaster.setFromCamera(mouse, ccamera);
    const intersectingElements = raycaster.intersectObjects(scene.children, true);

    console.log(intersectingElements[0]);

    return intersectingElements[0];
}

const checkShowDetailsFunction = () => {
    try {
        if (showDetailsAbout) return true;
    } catch (_) {
        return false;
    }
}

export const mouseMove = (event: any) => {
    const intersected = raycast(event);
    const canvas = document.querySelector("canvas");

    canvas.style.cursor = "grab";

    if (!checkShowDetailsFunction()) return;
    if (intersected) canvas.style.cursor = "pointer";
}

export const mouseClick = (event: any) => {
    const intersected = raycast(event);

    if (!checkShowDetailsFunction()) return;
    if (intersected) showDetailsAbout(intersected.object.name);
}

const abstractifyName = (objectName: string) => {
    switch (objectName) {
        case "RadVL":
        case "RadVR":
        case "RadHL":
        case "RadHR":
            return "Rad";
        case "FlgVM":
        case "FlgVMS":
            return "FlgVM"
        case "FlgVL":
        case "FlgVR":
            return "FlgV"
        case "FlgHL":
        case "FlgHR":
            return "FlgH";
        case "FeV":
        case "FeH":
        case "TehV":
        case "TehH":
            return "Fe";
        case "SkML":
        case "SkMR":
        case "NmcL":
        case "NmcR":
            return "SkM";
        case "SkHL":
        case "SkHR":
            return "SkH";
        case "LogoL":
        case "LogoR":
            return "Chassis"
        default:
            return objectName;
    }
}

let json;

const loadInformation = () => {
    const _xobj = new XMLHttpRequest();

    _xobj.overrideMimeType("application/json");
    _xobj.open("GET", "public/model-1.yml", true);
    _xobj.onreadystatechange = () => {
        if (_xobj.readyState == 4 && _xobj.status == 200) {
            json = JSON.parse(_xobj.responseText);
        }
    };

    _xobj.send(null);
}

const showDetailsAbout = (objectName) => {
    const details = document.querySelector(".details");

    details.innerHTML = json[abstractifyName(objectName)];
}

loadInformation();

function camera(mouse: THREE.Vector2, camera: any) {
    throw new Error("Function not implemented.");
}
