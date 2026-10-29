import {defineField, defineType} from 'sanity'

export default defineType({
  name:'concertIdentity', title:'Concert identity reservation', type:'document', readOnly:true,
  fields:[defineField({name:'concertId',type:'string'})],
})
