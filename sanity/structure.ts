import { type StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Tales for the Tillerman')
    .items([
      S.documentTypeListItem('siteSettings').title('Site Settings').title('Site Settings'),
      S.divider(),
      S.documentTypeListItem('heroSection').title('Hero Section'),
      S.documentTypeListItem('aboutSection').title('About Section'),
      S.documentTypeListItem('bandMember').title('Band Members'),
      S.documentTypeListItem('latestRelease').title('Latest Release'),
      S.divider(),
      S.documentTypeListItem('concert').title('Concerts'),
      S.documentTypeListItem('pressKitSection').title('Press Kit'),
      S.documentTypeListItem('contactSection').title('Contact Section'),
      S.divider(),
      S.documentTypeListItem('navigation').title('Navigation'),
    ])