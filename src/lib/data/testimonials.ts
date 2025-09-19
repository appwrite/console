import DevKind from '$lib/images/testimonials/hassan.png';
import LangX from '$lib/images/testimonials/xue.webp';
import KCollect from '$lib/images/testimonials/ryan-oconner-testimonial.png';
import Phil from '$lib/images/testimonials/phil.jpg';

export interface Testimonial {
    id: string;
    logo: string;
    headline: string;
    blurb: string;
    name: string;
    title: string;
    avatar: string;
}

export const testimonials: Testimonial[] = [
    {
        id: 'hassan-devkind',
        logo: DevKind,
        headline: 'DevKind reduced development time by 60% and lowered server costs by 40%',
        blurb: 'A special thanks to Appwrite for providing robust features and seamless functionality.',
        name: 'Hassan Ahmed',
        title: 'Engineer at DevKind',
        avatar: DevKind
    },
    {
        id: 'xue-langx',
        logo: LangX,
        headline: 'LangX handled millions of requests using Appwrite',
        blurb: 'With its comprehensive suite of services, Appwrite emerged as an ideal choice for my needs.',
        name: 'Xue',
        title: 'Founder at LangX',
        avatar: LangX
    },
    {
        id: 'ryan-kcollect',
        logo: KCollect,
        headline: 'K-Collect reduced infrastructure costs by 700%',
        blurb: 'A major impact that Appwrite made was the amount of time and stress saved.',
        name: "Ryan O'Connor",
        title: 'Founder at K-Collect',
        avatar: KCollect
    },
    {
        id: 'phil-majikkids',
        logo: Phil,
        headline: 'Just like a Swiss Army Knife - choose and use the tools you need',
        blurb: 'Just like a Swiss Army Knife you can choose and use the tools that you need with Appwrite.',
        name: 'Phil McCluskey',
        title: 'App Manager, Majik Kids',
        avatar: Phil
    }
];

export function getRandomTestimonial(): Testimonial {
    const randomIndex = Math.floor(Math.random() * testimonials.length);
    return testimonials[randomIndex];
}
