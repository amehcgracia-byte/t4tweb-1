import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemas } from './schemas'
import { structure } from './structure'

export default defineConfig({
  name: 't4t-studio',
  title: 'Tales for the Tillerman CMS',
  projectId: 'qtpb6qpz',
  dataset: 'production',
  basePath: '/studio',
  plugins: [
    structureTool({ structure }),
    visionTool(),
  ],
  schema: { types: schemas },
  shortcuts: [
    { keys: ['mod', 'c'], action: 'copy' },
    { keys: ['mod', 'v'], action: 'paste' },
    { keys: ['mod', 'x'], action: 'cut' },
    { keys: ['mod', 'z'], action: 'undo' },
    { keys: ['mod', 'shift', 'z'], action: 'redo' },
    { keys: ['mod', 's'], action: 'save' },
    { keys: ['mod', 'shift', 'e'], action: 'publish' },
    { keys: ['del'], action: 'delete' },
    { keys: ['mod', 'a'], action: 'selectAll' },
    { keys: ['mod', 'd'], action: 'deselect' },
  ],
})