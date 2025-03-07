import { RouterDirection } from '@ionic/core';

export const RouterNavigate = async (path: string, direction: RouterDirection = 'forward') => {
  const ionRouterElement: HTMLIonRouterElement | null = document.querySelector('ion-router');
  if (ionRouterElement !== null) {
    console.log('Router found, navigating to', path);
    return ionRouterElement.push(path, direction);
  } else {
    console.log('Router not found, redirecting to', path);
    location.href = path;
    return Promise.resolve(false);
  }
};