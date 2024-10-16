import { XmlNode, XmlElement as GroveXmlElement, JsonObject } from '@rgrove/parse-xml';

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
    numberAttribute(name:string):number {
        return Number(this.attributes[name]);
    }
    override toJSON(): JsonObject {
        const {type, ...rest} = super.toJSON();
        return {type, ...{line: this.line|| undefined,column: this.column|| undefined}, ...rest};
    }
}

export class XmlDocument extends XmlElement {
    constructor () {
        super('sequence', {values: 'BIPENDAWROYGUSKFZ', MX:'15',MY:'15', MZ:'1'});
    }
    override get type() {
        return XmlNode.TYPE_DOCUMENT;
    }
}