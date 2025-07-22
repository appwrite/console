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

import Tables from './tables.svelte';
export const TablesPanel: SubPanel = {
    name: 'Tables',
    component: Tables
};

import CreateColumn from './createColumn.svelte';
export const CreateColumnPanel: SubPanel = {
    name: 'Create Column',
    component: CreateColumn
};

import Users from './users.svelte';
export const UsersPanel: SubPanel = {
    name: 'Users',
    component: Users
};

import Teams from './teams.svelte';
export const TeamsPanel: SubPanel = {
    name: 'Teams',
    component: Teams
};

import Functions from './functions.svelte';
export const FunctionsPanel: SubPanel = {
    name: 'Functions',
    component: Functions
};

import Buckets from './buckets.svelte';
export const BucketsPanel: SubPanel = {
    name: 'Buckets',
    component: Buckets
};

import Files from './files.svelte';
export const FilesPanel: SubPanel = {
    name: 'Files',
    component: Files
};

import CreateMessage from './createMessage.svelte';
export const CreateMessagePanel: SubPanel = {
    name: 'Create Message',
    component: CreateMessage
};
