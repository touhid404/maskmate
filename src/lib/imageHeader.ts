/** Reads common image headers before decoding to reject decompression bombs early. */
export function headerDimensions(bytes: Uint8Array): {width:number;height:number} | null {
  const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength)
  if(bytes.length>=24&&v.getUint32(0)===0x89504e47&&v.getUint32(4)===0x0d0a1a0a)return {width:v.getUint32(16),height:v.getUint32(20)}
  if(bytes.length>=30&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'){
    const type=String.fromCharCode(...bytes.slice(12,16))
    if(type==='VP8X')return {width:1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16),height:1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16)}
    if(type==='VP8 '&&bytes[23]===0x9d&&bytes[24]===1&&bytes[25]===0x2a)return {width:v.getUint16(26,true)&0x3fff,height:v.getUint16(28,true)&0x3fff}
    if(type==='VP8L'&&bytes[20]===0x2f)return {width:1+bytes[21]+((bytes[22]&0x3f)<<8),height:1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10)}
  }
  if(bytes.length>4&&bytes[0]===0xff&&bytes[1]===0xd8){
    let i=2
    while(i+8<bytes.length){if(bytes[i]!==0xff){i++;continue}const marker=bytes[i+1];if(marker===0xff){i++;continue}if(marker===0xda||marker===0xd9)break
      if(marker===0x01||marker>=0xd0&&marker<=0xd8){i+=2;continue}
      const length=v.getUint16(i+2);if(length<2)break
      if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))return {width:v.getUint16(i+7),height:v.getUint16(i+5)}
      i+=length+2
    }
  }
  return null
}
