import {modalController} from "@ionic/core";
import { v4 as uuidv4 } from 'uuid';
import { RemoveFocusFromActiveElement } from '../utilities/RouterNavigate';

export class ModalServiceController {

  async openModal(component:Function | HTMLElement | string | null,
                  componentProps?:any,
                  cssClass?: string,
                  backdropDismiss = true,
                  showBackdrop = true,
                  keyboardClose = true,
                  modalOptions: any = {}): Promise<any> {

    return new Promise<any>(async (resolve) => {

      RemoveFocusFromActiveElement();

      const id = uuidv4();

      window.history.pushState({component: component, modal: true}, "");

      const modal = await modalController.create(Object.assign({
        component,
        cssClass: cssClass,
        backdropDismiss,
        showBackdrop,
        id,
        presentingElement: document.querySelector('ion-nav'),
        keyboardClose,
        mode: 'md'
      },modalOptions));
      modal.componentProps = componentProps;
      modal.onDidDismiss().then((data) => {
        if (data?.data || data?.role) {
          resolve(data);
        } else {
          resolve(null);
        }
      });

      modal.onWillDismiss().then(data => {
        if (window?.history?.state?.modal
          && data?.role !== "closeHistory") {
          history.back();
        }
      });

      await modal.present().then(() => {
        //PageProcessService.stop();
      });
    });
  }

  async closeModal(data?:any, role?:any) {
    const modals = document.querySelectorAll('ion-modal.show-modal:not(.dirty)');
    const index = (modals.length - 1);
    const modal: any = modals.item(index);
    if (modal) {
      await modal.dismiss(data, role);
    }
  }

}

export const ModalService = new ModalServiceController();
