import { page } from '$app/state';

export const getReferrer = () => {
   const url = page.url;

   const referrer = usePrevious(url);

   return referrer;
};


const usePrevious = <T>(value: T) => {
    let current = $state<T>(value);
    let previous = $state<T | null>(null);

  if (value !== current) {
    previous = current;
    current = value;
  }

  return previous;
}