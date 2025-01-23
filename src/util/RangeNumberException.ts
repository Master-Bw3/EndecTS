class RangeNumberException extends Error {

    n: number;

    lowerBound: number | null; 
    upperBound: number | null

    public constructor(n: number, lowerBound: number | null, upperBound: number | null) {
        super(RangeNumberException.createMsg(n, lowerBound, upperBound));

        this.n = n;

        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
    }

    private static createMsg(n: number, lowerBound: number | null, upperBound: number | null): string {
        let rangeMessage = "";

        if(lowerBound != null) rangeMessage += ", InclusiveMin: " + lowerBound;
        if(upperBound != null) rangeMessage += ", InclusiveMax: " + upperBound;

        return "Number value found to be outside allowed bound! [Value: " + n + (rangeMessage) + "]";
    }
}