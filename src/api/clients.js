// import { Router } from 'express'
// import { permit } from '../middleware/pemrissions'
// import {
//   getClients,
//   getOneClient,
//   editClient,
//   createClient
// } from '../controllers/clients'

// export const clients = () => {
//   const clients = Router()

//   clients.post('/', permit('companyAdmin'), getClients)
//   clients.post('/add', permit('companyAdmin'), createClient)
//   clients.get('/:id(\\d+)', permit('companyAdmin'), getOneClient)
//   clients.put('/:id(\\d+)', permit('companyAdmin'), editClient)

//   return clients
// }
