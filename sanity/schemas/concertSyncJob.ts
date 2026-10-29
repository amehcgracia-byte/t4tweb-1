import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'concertSyncJob',
  title: 'Concert publication status',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({name:'concertId', type:'string'}),
    defineField({name:'platform', type:'string', options:{list:['bandsintown','songkick']}}),
    defineField({name:'status', type:'string', options:{list:['pending','running','verified','failed','blocked']}}),
    defineField({name:'fingerprint', type:'string'}),
    defineField({name:'payload', title:'Public concert snapshot (JSON)', type:'text'}),
    defineField({name:'attempts', type:'number'}),
    defineField({name:'externalId', type:'string'}),
    defineField({name:'nextAttemptAt', type:'datetime'}),
    defineField({name:'checkedAt', type:'datetime'}),
    defineField({name:'reason', type:'string'}),
    defineField({name:'worker', type:'string'}),
    defineField({name:'leaseId', type:'string', hidden:true}),
    defineField({name:'leaseExpiresAt', type:'datetime'}),
  ],
  preview:{select:{title:'platform',subtitle:'status'}},
})
