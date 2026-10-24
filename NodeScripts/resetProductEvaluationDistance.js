
const cuttingPoint = 29000;
const markingPoint = 25400;
const markingNode = Ua.findNode("markingNode");
const nokLength = 800;

const distanceMarkingToCuttingPoint = cuttingPoint - markingPoint; //3800
let isTraceInitialized = false;
let lengthAlreadyAfterMarkingPoint = distanceMarkingToCuttingPoint % nokLength; //600
if(!isTraceInitialized){
    markingNode.result.value = lengthAlreadyAfterMarkingPoint;
}