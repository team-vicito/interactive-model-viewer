import * as THREE from "three";
import * as yaml from "js-yaml";

import { mouse, raycaster, render, scene, camera } from "./app";

const raycast = (event: any, mousex?: number, mousey?: number): THREE.Intersection => {
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
    raycaster.setFromCamera(mouse, camera);
    const intersectingElements = raycaster.intersectObjects(scene.children, true);

    return intersectingElements[0];
}

const checkShowDetailsFunction = (): boolean => {
    try {
        if (showDetailsAbout) return true;
    } catch (_) {
        return false;
    }
}

export const mouseClick = (event: any): void => {
    const intersected = raycast(event);

    if (!checkShowDetailsFunction()) return;
    if (intersected) showDetailsAbout(intersected.object.name);
}

let information: unknown;

export const loadInformation = (configPath: string): void => {
    const _xobj = new XMLHttpRequest();

    _xobj.overrideMimeType("application/json");
    _xobj.open("GET", configPath, true);
    _xobj.onreadystatechange = () => {
        if (_xobj.readyState == 4 && _xobj.status == 200) {
            information = yaml.load(_xobj.responseText);
        }
    };

    _xobj.send(null);
}

const showDetailsAbout = (objectName: string): void => {
    const details = document.querySelector(".details");

    details.innerHTML = information[objectName];
}
