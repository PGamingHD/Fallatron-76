import {TextType} from "../@types/Command";

export class Text {
    constructor(textOptions: TextType) {
        Object.assign(this, textOptions);
    }
}