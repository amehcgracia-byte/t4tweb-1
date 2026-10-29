import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import concert from '../schemas/concert'
import concertSyncJob from '../schemas/concertSyncJob'
import concertIdentity from '../schemas/concertIdentity'

// Preserve the legacy visual editor's deployed schema and document keys.
// Both Studios share the same dataset and concert definitions.
export default defineConfig({
  name: 't4t-concerts',
  title: 'T4T Concert Management',
  projectId: 'qtpb6qpz',
  dataset: 'production',
  plugins: [structureTool()],
  schema: {types: [concert, concertSyncJob, concertIdentity]},
})
