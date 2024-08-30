

const { dia, shapes } = joint;

// Paper

const paperContainer = document.getElementById("paper-container");

const graph = new dia.Graph({}, { cellNamespace: shapes });
const paper = new dia.Paper({
  model: graph,
  cellViewNamespace: shapes,
  width: "100%",
  height: "100%",
  async: true,
  sorting: dia.Paper.sorting.APPROX,
  background: { color: "#F3F7F6" },
  snapLabels: true,
  interactive: {
    linkMove: false    
  },
  defaultConnectionPoint: { name: 'boundary' },
  defaultRouter: { name: 'orthogonal', args: { padding: 5 }
}
});

paperContainer.appendChild(paper.el);

const fontAttributes = {
    fontFamily: 'sans-serif',
    fontSize: 15,
    fill: '#fff',
};

const startColor = '#ff9580';
const flowColor = '#48cba4';
const stepColor = '#4a7bcb';
const decisionColor = '#80aaff';

function createStart(x, y, text) {
    return new shapes.standard.Rectangle({
        position: { x: x + 10, y: y + 5 },
        size: { width: 80, height: 50 },
        z: 1,
        attrs: {
            body: {
                rx: 25,
                ry: 25,
                fill: startColor,
                stroke: 'none'
            },
            label: {
                ...fontAttributes,
                text
            }
        }
    });
}

function createStep(x, y, text) {
    return new shapes.standard.Rectangle({
        position: { x, y },
        size: { width: 100, height: 60 },
        z: 1,
        attrs: {
            label: {
                ...fontAttributes,
                text,
                textWrap: {
                    width: -10,
                    height: -10
                }
            },
            body: {
                fill: stepColor,
                stroke: 'none'
            }
        }
    });
}

function createDecision(x, y, text) {
    return new shapes.standard.Path({
        position: { x: x - 30, y: y - 10 },
        size: { width: 160, height: 80 },
        z: 1,
        attrs: {
            body: {
                d: 'M 0 calc(0.5 * h) calc(0.5 * w) 0 calc(w) calc(0.5 * h) calc(0.5 * w) calc(h) Z',
                fill: decisionColor,
                stroke: 'none'
            },
            label: {
                ...fontAttributes,
                text
            }
        }
    });
}

function createFlow(source, target) {
    return new shapes.standard.Link({
        source: { id: source.id },
        target: { id: target.id },
        z: 2,
        attrs: {
            line: {
                stroke: flowColor
            }
        },
        defaultLabel: {
            attrs: {
                labelBody: {
                    ref: 'labelText',
                    x: 'calc(x - 8)',
                    y: 'calc(y - 8)',
                    width: 'calc(w + 16)',
                    height: 'calc(h + 16)',
                    fill: flowColor,
                    stroke: 'none',
                    rx: 5,
                    ry: 5
                },
                labelText: {
                    ...fontAttributes,
                    textAnchor: 'middle',
                    textVerticalAnchor: 'middle'
                }
            },
            markup: [
                {
                    tagName: 'rect',
                    selector: 'labelBody'
                }, {
                    tagName: 'text',
                    selector: 'labelText'
                }
            ],
        }
    });
}

const start = createStart(50, 50, 'Start');
const addToCart = createStep(200, 50, 'Add to Cart');
const checkoutItems = createStep(350, 50, 'Checkout Items');
const addShippingInfo = createStep(500, 50, 'Add Shipping Info');
const addPaymentInfo = createStep(500, 150, 'Add Payment Info');
const validPayment = createDecision(500, 250, 'Valid Payment?');
const presentErrorMessage = createStep(750, 250, 'Present Error Message');
const sendOrderToWarehouse = createStep(200, 250, 'Send Order to Warehouse');
const packOrder = createStep(200, 350, 'Pack Order');
const qualityCheck = createDecision(200, 450, 'Quality Check?');
const shipItemsToCustomer = createStep(500, 450, 'Ship Items to Customer');

graph.addCells([
    start,
    addToCart,
    checkoutItems,
    addShippingInfo,
    addPaymentInfo,
    validPayment,
    presentErrorMessage,
    sendOrderToWarehouse,
    packOrder,
    qualityCheck,
    shipItemsToCustomer,
    createFlow(start, addToCart),
    createFlow(addToCart, checkoutItems),
    createFlow(checkoutItems, addShippingInfo),
    createFlow(addShippingInfo, addPaymentInfo),
    createFlow(addPaymentInfo, validPayment),
    createFlow(validPayment, presentErrorMessage)
        .labels([{ attrs: { labelText: { text: 'No' }}}]),
    createFlow(presentErrorMessage, addPaymentInfo)
        .vertices([{ x: 800, y: 180 }]),
    createFlow(validPayment, sendOrderToWarehouse)
        .labels([{ attrs: { labelText: { text: 'Yes' }}}]),
    createFlow(sendOrderToWarehouse, packOrder),
    createFlow(packOrder, qualityCheck),
    createFlow(qualityCheck, shipItemsToCustomer)
        .labels([{ attrs: { labelText: { text: 'Ok' }}}]),
    createFlow(qualityCheck, sendOrderToWarehouse)
        .labels([{ attrs: { labelText: { text: 'Not Ok' }}}])
        .vertices([{ x: 100, y: 480 }, { x: 100, y: 280 }]),
]);

const graphBBox = graph.getBBox();

function scaleToFit() {
    paper.scaleContentToFit({
        padding: 40,
        contentArea: graphBBox,
    });
    const sy = paper.scale().sy;
    paper.translate(0, (paper.getArea().height / 2 - graphBBox.y - graphBBox.height / 2) * sy);
}

window.addEventListener('resize', () => scaleToFit());
scaleToFit();