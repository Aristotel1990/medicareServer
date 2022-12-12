import fs from 'fs'
import pdf from 'dynamic-html-pdf'
import logger from './logger'

export const generatePDFOrdersTags = async (orders, options, singlePage) => {
  try {
    const html = fs.readFileSync('./src/templates/orderTag.html', 'utf8')

    const opt = options || {
      format: 'A4',
      orientation: 'portrait',
      border: '10mm'
    }

    const document = {
      type: 'buffer', // 'file' or 'buffer'
      template: html,
      context: {
        orders: orders,
        inSinglePage: singlePage
      }
      // path: './output.pdf' // it is not required if type is buffer
    }
    if (opt.height && opt.width) {
      document.context.height = opt.height
      document.context.width = opt.width
    }

    const result = await pdf.create(document, opt)
    return result
  } catch (e) {
    logger.error('error in generatePDFOrdersTags', { error: e.message })
  }
}
