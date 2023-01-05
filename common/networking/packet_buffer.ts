export class PacketBuffer {
    private obj: { [key: string]: any } = {};

    write(key: string, value: any) : void {
        this.obj[key] = value;
    }

    read(key: string) : any {
        return this.obj[key];
    }

    contains(key: string) : boolean {
        return this.obj[key] !== undefined;
    }

    json(): string {
        return JSON.stringify(this.obj);
    }

    static fromJSON(json: string): PacketBuffer
    {
        let obj = JSON.parse(json);
        let buffer = new PacketBuffer();
        for(const key in obj)
        {
            buffer.write(key, obj[key]);
        }
        return buffer;
    }
}
