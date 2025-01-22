export class BlockWriter {
    private result: string = "";
    private blocks: Array<[boolean, string]> = [];

    private indentLevel: number = 0;

    constructor() {}

    write(value: string): BlockWriter {
        this.result += value;

        return this;
    }

    writeln(value?: string): BlockWriter {
        if (value === undefined) {
            this.result += "\n"

            return this;
        } else {
            this.result += (value + "\n" + ("  ".repeat(Math.max(0, this.indentLevel))));

            return this;
        }
        
    }

    startBlock(startDelimiter: string, endDelimiter: string, incrementIndentation: boolean = true): BlockWriter {
        if (incrementIndentation) {
            this.indentLevel++;
            this.writeln(startDelimiter);
        } else {
            this.write(startDelimiter);
        }

        this.blocks.push([incrementIndentation, endDelimiter]);

        return this;
    }


    writeBlock(startDelimiter: string, endDelimiter: string, consumer: (writer: BlockWriter) => void, incrementIndentation = true): BlockWriter {
        this.startBlock(startDelimiter, endDelimiter, incrementIndentation);

        consumer(this);

        this.endBlock();

        return this;
    }

    endBlock(): BlockWriter {
        var endBlockData = this.blocks.pop()!;

        if (endBlockData[0]) {
            this.indentLevel--;
            this.writeln();
        }

        this.write(endBlockData[1]);

        return this;
    }

    buildResult(): string {
        return this.result.toString();
    }
}