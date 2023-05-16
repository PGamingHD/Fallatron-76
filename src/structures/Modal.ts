import { ModalType } from '../@types/Command';

export class Modal {
    constructor(modalOptions: ModalType) {
        Object.assign(this, modalOptions);
    }
}