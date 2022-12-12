import bwipjs from 'bwip-js'

export const generateBarcode = async (code) => {
  // const canvas = document.createElement('canvas')
  try {
    const options = {
      bcid: 'code128', // Barcode type
      text: code, // Text to encode
      scale: 10, // 3x scaling factor
      height: 10, // Bar height, in millimeters
      includetext: true, // Show human-readable text
      textxalign: 'center', // Always good to set this
      textsize: 10,
      textyoffset: 2
    }
    // const buf = await gs1_128(options)
    // console.log('buf.toString() :', buf.toString())
    // return buf.toString()
    const buffer = await bwipjs.toBuffer(options)
    return 'data:image/png;base64,' + buffer.toString('base64')
    // bwipjs.toCanvas(canvas, {
    //   bcid: 'code128', // Barcode type
    //   text: code, // Text to encode
    //   scale: 10, // 3x scaling factor
    //   height: 10, // Bar height, in millimeters
    //   includetext: true, // Show human-readable text
    //   textxalign: 'center', // Always good to set this
    //   textsize: 10,
    //   textyoffset: 2
    // })
    // return canvas.toDataURL('image/png')
  } catch (e) {
    console.log('error in generate barcode :', e.message)
  }
}
