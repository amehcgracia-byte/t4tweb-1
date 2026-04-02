import { defineField, defineType } from 'sanity'
import { StarIcon } from '@sanity/icons'

export default defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'titleHighlight', title: 'Title Highlight Text', type: 'string', description: 'The highlighted part (e.g. "funk, soul and world music")' }),
    defineField({ name: 'subtitle', title: 'Subtitle', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'logo', title: 'Logo', type: 'image' }),
    defineField({ name: 'backgroundImage', title: 'Background Image', type: 'image' }),
    defineField({
      name: 'ctaButtons',
      title: 'CTA Buttons',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Label', type: 'string' }),
          defineField({ name: 'href', title: 'Link', type: 'string' }),
          defineField({ name: 'variant', title: 'Variant', type: 'string', options: { list: [{ title: 'Primary', value: 'primary' }, { title: 'Secondary', value: 'secondary' }] } }),
        ],
      }],
    }),
  ],
  // Presentation configuration for visual editing
  preview: {
    select: {
      title: 'title',
      backgroundImage: 'backgroundImage',
      logo: 'logo',
    },
    prepare(selection) {
      const {title, backgroundImage, logo} = selection
      return {
        title: title || 'Hero Section',
        subtitle: 'Hero Section',
        media: logo || backgroundImage,
      }
    }
  }
})
