import { XmlElement } from '@rgrove/parse-xml';
export * from './xmlParser';

// Memperluas prototype XmlElement untuk menambahkan method "find"
(XmlElement.prototype as any).find = function (tagName: string) {
    // Misalnya, mencari anak elemen dengan nama tag yang sesuai
    // const found = this.children.filter((child: any) => {
    //     return child instanceof XmlElement && child.name === tagName;
    // });
    // return found;
    return tagName + '-foo';
};


export { XmlElement };
// Sekarang, method find() otomatis tersedia pada semua instance XmlElement
// const element = new XmlElement('root');
// const child1 = new XmlElement('div');
// const child2 = new XmlElement('span');

// element.append(child1);
// element.append(child2);

// const foundElements = element.find('div');
// console.log(foundElements); // Output: [child1]

// export XmlElement;