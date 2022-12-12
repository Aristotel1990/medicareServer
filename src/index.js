/* eslint-disable no-unused-vars */
import 'dotenv/config'
import app from './server'
import { init as initDB } from './connections/sequelize'
import { PORT } from './config/env'
import logger from './lib/logger'

const init = async () => {
  const db = await initDB()

  app.server.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${app.server.address().port}`
    )
  })

  process.on('SIGINT', async () => {
    await app.server.close(async () => {
      await db.sequelize.close()
      logger.info('Closing server')
    })
  })

  process.on('SIGTERM', async () => {
    await app.server.close(async () => {
      await db.sequelize.close()
      console.log('Process terminated')
    })
  })
}
init().then()
