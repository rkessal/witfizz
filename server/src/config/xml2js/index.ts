import xml2js from 'xml2js'

export function parseXMLtoJSON(xml: string): Promise<any> {
  console.log(xml)
  return new Promise((resolve, reject) => {
    if (typeof xml !== 'string') {
      reject('XML must be passed as a string')
    }

    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}