const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main(){
  await prisma.ticket.create({ data: { title: 'Initial IT Ticket', status: 'Open', priority: 'High' } })
  await prisma.asset.create({ data: { name: 'Router', type: 'Networking', status: 'Online', location: 'Data Center' } })
  await prisma.user.create({ data: { name: 'IT Admin', email: 'itadmin@example.com', role: 'admin' } })
  await prisma.itService.create({ data: { name: 'Sample IT Service', description: 'Sample', price: 'From QAR 40' } })
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })
