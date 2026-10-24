let ini = call("ini")
let utils = call("lib.utils")
let settings = call("lib.settings")
let database = new ODBCClient()
database.source = ini.digiMasterDB
let response;
const MEASUREMENT_TOLERANCE = 100;
const productLength = 2400;
const scrapLength = 800;
const SCRAP_EVALUATION = 2;
const OK_EVALUATION = 1;

let evaluationDistance;
try {
    if (database.open()) {
        // save Already Evaluated OK length so you don't have to query it every time ORDER BY id DESC LIMIT 1 select alreadyEval...
        let selectEvaluatedProductSegmentsStatement = `SELECT id, isEndOfProduct, length
                                                       FROM ProductSegment
                                                       ORDER BY id DESC;`
        let evaluatedProductSegments = database.query(selectEvaluatedProductSegmentsStatement)
            .map(row => ({id: row[0], isEndOfProduct: Boolean(row[1]), length: row[2]}));
        let alreadyEvaluatedOKLength = 0;
        for (const segment of evaluatedProductSegments) {
            if (segment.isEndOfProduct) {
                break;
            }
            alreadyEvaluatedOKLength += segment.length;
        }
        let isEndOfProduct = false;
        let lengthLeftToBeEvaluatedOK = productLength - alreadyEvaluatedOKLength;
        if (lengthLeftToBeEvaluatedOK > scrapLength) {
            evaluationDistance = scrapLength;
        } else {
            isEndOfProduct = true;
        }
        let evaluationStartPoint = markingPoint - evaluationDistance;
        let selectLineSegmentsStatement = `SELECT id, evaluation
                                           FROM LineSegment
                                           WHERE endPositon > ${evaluationStartPoint}
                                             AND startPositon < ${markingPoint};`;
        let lineSegments = database.query(selectLineSegmentsStatement).map(row => ({
            id: row[0],
            isEndOfProduct: Boolean(row[1])
        }));
        let productSegmentEvaluation = OK_EVALUATION;
        if (lineSegments.some(lineSegment => lineSegment.evaluation === SCRAP_EVALUATION)) {
            productSegmentEvaluation = SCRAP_EVALUATION;
            isEndOfProduct = true;
        }
        database.query(`INSERT INTO ProductSegment(evaluation, isEndOfProduct)
                        VALUES (${productSegmentEvaluation}, ${isEndOfProduct});`);

    }
    database.close()
} catch (error) {
    database.close()
}
return response