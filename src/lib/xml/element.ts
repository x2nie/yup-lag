import { XmlElement as GroveXmlElement } from '@rgrove/parse-xml';

export class XmlElement extends GroveXmlElement {

    get tagName(): string {
        return this.name;
    }

    find(tagName: string):string {
        // Misalnya, mencari anak elemen dengan nama tag yang sesuai
        // const found = this.children.filter((child: any) => {
        //     return child instanceof XmlElement && child.name === tagName;
        // });
        // return found;
        return tagName + '-ungrove';
    }

    setAttribute(name: string, value:string) {
        this.attributes[name] = value;
    }
    getAttribute(name:string):string {
        return this.attributes[name];
    }
    
}

export class XmlDocument extends XmlElement {
    constructor () {
        super('sequence', {values: 'BIPENDAWROYGUSKFZ'});
    }
}