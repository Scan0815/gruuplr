import { RouterDirection } from '@ionic/core';

export const RouterNavigate = async (path: string, direction: RouterDirection = 'forward') => {
  const ionRouterElement: HTMLIonRouterElement | null = document.querySelector('ion-router');
  if (ionRouterElement !== null) {
    return ionRouterElement.push(path, direction);
  } else {
    location.href = path;
    return Promise.resolve(null);
  }
};