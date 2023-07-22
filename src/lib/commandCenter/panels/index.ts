import type { SubPanel } from '../subPanels';
export { default as Template } from './template.svelte';

import Root from './root.svelte';
export const RootPanel: SubPanel = {
    name: 'root',
    component: Root
};

import AI from './ai.svelte';
export const AIPanel: SubPanel = {
    name: 'Ask the AI',
    component: AI
};

import Projects from './projects.svelte';
export const ProjectsPanel: SubPanel = {
    name: 'Projects',
    component: Projects
};

import Organizations from './organizations.svelte';
export const OrganizationsPanel: SubPanel = {
    name: 'Organizations',
    component: Organizations
};

import Platforms from './platforms.svelte';
export const PlatformsPanel: SubPanel = {
    name: 'Platforms',
    component: Platforms
};

import Databases from './databases.svelte';
export const DatabasesPanel: SubPanel = {
    name: 'Databases',
    component: Databases
};

import Collections from './collections.svelte';
export const CollectionsPanel: SubPanel = {
    name: 'Collections',
    component: Collections
};
