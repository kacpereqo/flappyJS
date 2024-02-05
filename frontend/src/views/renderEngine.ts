interface RenderLayer{
    renderFunction: CallableFunction;
    zIndex: number;
    key: string;
    callOnce?: boolean;
}

export class RenderEngine{
    layers: RenderLayer[];
    canvas: HTMLCanvasElement;
    i:number;

    constructor( canvas: HTMLCanvasElement){
        this.layers = []
        this.canvas = canvas
        this.i = 0

        const ctx = this.canvas.getContext('2d')
        ctx?.translate(this.canvas.width/2, this.canvas.height/2)
    }

    render(){
        const ctx = this.canvas.getContext('2d')
        if (!ctx || !this.canvas) return;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(this.canvas.width/2, this.canvas.height/2);

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.layers.sort((a, b) => a.zIndex - b.zIndex).forEach(layer => {
            layer.renderFunction()
            if (layer.callOnce){
                this.removeLayer(layer.key)
            }
        })
    }

    addLayer(layer: RenderLayer){
        this.layers.push(layer)
    }

    removeLayer(key: string){
        this.layers = this.layers.filter(layer => layer.key !== key)
    }    
}