import { BBString, BBSubTag } from './structure';

export class Engine {
    public async execute(content: BBString, context: any): Promise<string>;
    public async execute(content: BBString | BBSubTag, context: any): Promise<any>;
    public async execute(content: BBString | BBSubTag, context: any): Promise<any> {

    }
}